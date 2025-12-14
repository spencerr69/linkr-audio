use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct RawSearchResponse {
    albums: RawAlbumsResponse,
}

#[derive(Serialize, Deserialize, Debug)]
struct RawAlbumsResponse {
    href: String,
    limit: u32,
    next: Option<String>,
    offset: u32,
    previous: Option<String>,
    total: u32,
    items: Vec<SpotifyRelease>,
}

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct SpotifyRelease {
    album_type: String,
    pub total_tracks: u32,
    available_markets: Vec<String>,
    pub external_urls: ExternalUrls,
    href: String,
    id: String,
    images: Vec<ImageResponse>,
    pub name: String,
    pub release_date: String,
    release_date_precision: String,
    r#type: String,
    uri: String,
    pub artists: Vec<SpotifyArtist>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SpotifyArtist {
    pub external_urls: ExternalUrls,
    href: String,
    id: String,
    pub name: String,
    r#type: String,
    uri: String,
}

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct ExternalUrls {
    pub spotify: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct ImageResponse {
    height: u32,
    width: u32,
    url: String,
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
            .await?
            .json::<RawSearchResponse>()
            .await?;

        if let Some(album) = resp.albums.items.into_iter().nth(0) {
            Ok(album)
        } else {
            Ok(SpotifyRelease::default())
        }
    }
}
