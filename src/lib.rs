mod apple_music;

use crate::apple_music::AppleMusicClient;
use serde::{Deserialize, Serialize};
use worker::{Context, Env, Request, Response, Router};
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
            }

            if let Some(upc) = ctx.param("upc") {
                let upc = upc.to_string();
                let apple_music_client = AppleMusicClient::new();

                let album = match apple_music_client.get_album_by_upc(&upc).await {
                    Ok(album) => album,
                    Err(e) => return Response::error(e.to_string(), 404),
                };

                let album_art = album.get_album_art_url(750);

                let response = LinkResponse {
                    upc,
                    apple_music: Some(album.collectionViewUrl),
                    title: Some(album.collectionName),
                    track_count: Some(album.trackCount),
                    image_url: Some(album_art),
                    artist_name: Some(album.artistName),
                    spotify: None,
                    tidal: None,
                };

                return Response::from_json(&response);
            }

            Response::error("Bad Request", 400)
        })
        .run(req, env)
        .await
}
