use serde::{Deserialize, Serialize};
use worker::{console_log, console_warn};

#[derive(Serialize, Deserialize, Debug)]
struct RawSearchResponse {
    pub albums: RawAlbumsResponse,
}

#[derive(Serialize, Deserialize, Debug)]
struct RawAlbumsResponse {
    pub href: String,
    pub limit: u32,
    pub next: Option<String>,
    pub offset: u32,
    pub previous: Option<String>,
    pub total: u32,
    pub items: Vec<SpotifyRelease>,
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct SpotifyRelease {
    pub album_type: String,
    pub total_tracks: u32,
    pub available_markets: Vec<String>,
    pub external_urls: ExternalUrls,
    pub href: String,
    pub id: String,
    pub images: Vec<ImageResponse>,
    pub name: String,
    pub release_date: String,
    pub release_date_precision: String,
    pub r#type: String,
    pub uri: String,
    pub artists: Vec<SpotifyArtist>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SpotifyArtist {
    pub external_urls: ExternalUrls,
    pub href: String,
    pub id: String,
    pub name: String,
    pub r#type: String,
    pub uri: String,
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct ExternalUrls {
    pub spotify: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ImageResponse {
    pub height: u32,
    pub width: u32,
    pub url: String,
}

pub struct SpotifyClient {
    client: reqwest::Client,
    access_token: String,
}

impl SpotifyClient {
    pub async fn new(client_id: &str, secret: &str) -> Result<Self, Box<dyn std::error::Error>> {
        #[derive(Serialize, Deserialize)]
        struct TokenResponse {
            pub access_token: String,
            pub token_type: String,
            pub expires_in: u32,
        }

        let client = reqwest::Client::new();

        let resp = client
            .post("https://accounts.spotify.com/api/token")
            .header("Content-Type", "application/x-www-form-urlencoded")
            .body(format!(
                "grant_type=client_credentials&client_id={client_id}&client_secret\
            ={secret}"
            ))
            .send()
            .await?
            .json::<TokenResponse>()
            .await?;

        let access_token = format!("{} {}", resp.token_type, resp.access_token);

        Ok(Self {
            client,
            access_token,
        })
    }

    pub async fn get_release_by_upc(
        &self,
        upc: &str,
    ) -> Result<SpotifyRelease, Box<dyn std::error::Error>> {
        let resp = self
            .client
            .get(format!(
                "https://api.spotify\
        .com/v1/search?q=upc%3A{upc}&type=album&limit=1"
            ))
            .header("Authorization", &self.access_token)
            .send()
            .await?;

        let Ok(resp) = resp.json::<RawSearchResponse>().await else {
            console_warn!("Failed to parse Spotify API response for UPC: {upc}");
            return Ok(SpotifyRelease::default());
        };

        if let Some(album) = resp.albums.items.into_iter().nth(0) {
            Ok(album)
        } else {
            console_log!("Couldn't find album for upc: {upc}");
            Ok(SpotifyRelease::default())
        }
    }
}
