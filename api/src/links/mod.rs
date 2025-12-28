use crate::auth::authenticated;
use crate::links::apple_music::AppleMusicClient;
use crate::links::spotify::SpotifyClient;
use crate::links::tidal::TidalClient;
use crate::releases::Link;
use futures::try_join;
use serde::{Deserialize, Serialize};
use worker::{Request, Response, RouteContext};

mod apple_music;
mod spotify;
mod tidal;

#[derive(Serialize, Deserialize)]
struct LinkResponse {
   upc: String,
   title: Option<String>,
   artist_name: Option<String>,
   track_count: Option<u32>,
   artwork: Option<String>,
   release_date: Option<String>,
   links: Vec<Link>,
}

pub async fn get_links_by_upc(req: Request, ctx: RouteContext<()>) -> worker::Result<Response> {
   let d1 = ctx.d1("prod_sr_db")?;
   
   if !authenticated(req.headers(), &d1, None, &ctx).await {
      return Response::error("Unauthorized", 401);
   }
   
   let Some(upc) = ctx.param("upc") else {
      return Response::error("Bad Request", 400);
   };
   
   let upc = upc.clone();
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
      return Response::error("ABACUS : Internal Server Error".to_string(), 500);
   };
   
   let Ok((spotify_release, apple_music_release, tidal_release)) = try_join!(
        spotify_client.get_release_by_upc(&upc),
        apple_music_client.get_release_by_upc(&upc),
        tidal_client.get_release_by_upc(&upc)
    ) else {
      return Response::error("BANANA : Internal Server Error".to_string(), 500);
   };
   
   let tidal_link = tidal_release.externalLinks.first().unwrap().href.clone();
   
   // let album_art = apple_music_release.get_album_art_url(750);
   let album_art = spotify_release.clone().images.first().unwrap().url.clone();
   
   let artist = spotify_release
      .clone()
      .artists
      .first()
      .unwrap()
      .name
      .clone();
   
   let mut links = Vec::new();
   
   if !apple_music_release.collectionViewUrl.is_empty() {
      links.push(Link {
         name: "Apple Music".into(),
         url: apple_music_release.collectionViewUrl,
      });
   }
   if !spotify_release.external_urls.spotify.is_empty() {
      links.push(Link {
         name: "Spotify".into(),
         url: spotify_release.external_urls.spotify,
      });
   }
   if !tidal_link.is_empty() {
      links.push(Link {
         name: "Tidal".into(),
         url: tidal_link,
      });
   }
   
   let response = LinkResponse {
      upc,
      title: Some(tidal_release.title),
      track_count: Some(tidal_release.numberOfItems),
      artwork: Some(album_art),
      artist_name: Some(artist),
      release_date: Some(spotify_release.release_date),
      links,
   };
   
   Response::from_json(&response)
}
