mod apple_music;
mod spotify;
mod tidal;

use crate::apple_music::AppleMusicClient;
use crate::spotify::SpotifyClient;
use futures::try_join;
use serde::{Deserialize, Serialize};
use worker::{Context, Env, Request, Response, Router};

use crate::tidal::TidalClient;
use worker_macros::event;

#[event(fetch)]
async fn fetch(req: Request, env: Env, _ctx: Context) -> worker::Result<Response> {
    let router = Router::new();

    router
        .get_async("/links/:upc", |_req, ctx| async move {
            #[derive(Serialize, Deserialize)]
            struct LinkResponse {
                upc: String,
                title: Option<String>,
                artist_name: Option<String>,
                track_count: Option<u32>,
                image_url: Option<String>,
                spotify: Option<String>,
                apple_music: Option<String>,
                tidal: Option<String>,
                soundcloud: Option<String>,
                bandcamp: Option<String>,
                youtube: Option<String>,
            }

            if let Some(upc) = ctx.param("upc") {
                let upc = upc.to_string();
                let apple_music_client = AppleMusicClient::new();

                let spotify_client_id = ctx
                    .secret("SPOTIFY_CLIENT_ID")
                    .expect("No spotify client ID.")
                    .to_string();

                let spotify_client_secret = ctx
                    .secret("SPOTIFY_CLIENT_SECRET")
                    .expect("No spotify client secret.")
                    .to_string();

                let tidal_client_id = ctx
                    .secret("TIDAL_CLIENT_ID")
                    .expect("No tidal client ID")
                    .to_string();

                let tidal_client_secret = ctx
                    .secret("TIDAL_CLIENT_SECRET")
                    .expect("No tidal client secret")
                    .to_string();

                let Ok((spotify_client, tidal_client)) = try_join!(
                    SpotifyClient::new(&spotify_client_id, &spotify_client_secret),
                    TidalClient::new(&tidal_client_id, &tidal_client_secret)
                ) else {
                    return Response::error("Internal Server Error".to_string(), 500);
                };

                let Ok((spotify_release, apple_music_release, tidal_release)) = try_join!(
                    spotify_client.get_release_by_upc(&upc),
                    apple_music_client.get_release_by_upc(&upc),
                    tidal_client.get_release_by_upc(&upc)
                ) else {
                    return Response::error("Internal Server Error".to_string(), 500);
                };

                let tidal_link = tidal_release.externalLinks.get(0).unwrap().href.clone();

                let album_art = apple_music_release.get_album_art_url(750);

                let response = LinkResponse {
                    upc,
                    apple_music: Some(apple_music_release.collectionViewUrl),
                    title: Some(apple_music_release.collectionName),
                    track_count: Some(apple_music_release.trackCount),
                    image_url: Some(album_art),
                    artist_name: Some(apple_music_release.artistName),
                    spotify: Some(spotify_release.external_urls.spotify),
                    tidal: Some(tidal_link),
                    bandcamp: None,
                    youtube: None,
                    soundcloud: None,
                };

                return Response::from_json(&response);
            }

            Response::error("Bad Request", 400)
        })
        .run(req, env)
        .await
}
