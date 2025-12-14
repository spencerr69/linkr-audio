use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize)]
struct RawSearchResponse {
    pub data: Vec<RawReleaseResponse>,
    links: HashMap<String, String>,
}

#[derive(Serialize, Deserialize)]
struct RawReleaseResponse {
    id: String,
    r#type: String,
    pub attributes: TidalRelease,
    relationships: Relationships,
}
#[derive(Serialize, Deserialize, Default)]
#[allow(non_snake_case)]
pub struct TidalRelease {
    title: String,
    barcodeId: String,
    numberOfVolumes: u32,
    numberOfItems: u32,
    duration: String,
    explicit: bool,
    releaseDate: String,
    copyright: HashMap<String, String>,
    popularity: f64,
    accessType: String,
    availability: Vec<String>,
    mediaTags: Vec<String>,
    pub externalLinks: Vec<ExternalLinks>,
    r#type: String,
}

#[derive(Serialize, Deserialize, Default)]
pub struct ExternalLinks {
    pub href: String,
    meta: HashMap<String, String>,
}

#[derive(Serialize, Deserialize)]
struct Links {
    links: HashMap<String, String>,
}

#[derive(Serialize, Deserialize)]
#[allow(non_snake_case)]
struct Relationships {
    artists: Links,
    coverArt: Links,
    genres: Links,
    items: Links,
    owners: Links,
    providers: Links,
    similarAlbums: Links,
    suggestedCoverArts: Links,
}

pub struct TidalClient {
    client: reqwest::Client,
    access_token: String,
}

impl TidalClient {
    pub async fn new(client_id: &str, secret: &str) -> Result<Self, Box<dyn std::error::Error>> {
        #[derive(Serialize, Deserialize)]
        struct TokenResponse {
            pub access_token: String,
            pub token_type: String,
            pub expires_in: u32,
        }

        let client = reqwest::Client::new();

        let resp = client
            .post("https://auth.tidal.com/v1/oauth2/token")
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
    ) -> Result<TidalRelease, Box<dyn std::error::Error>> {
        let resp = self
            .client
            .get(format!(
                "https://openapi.tidal.com/v2/albums?countryCode=US&filter%5BbarcodeId%5D={upc}"
            ))
            .header("Authorization", &self.access_token)
            .header("accept", "application/vnd.api+json")
            .send()
            .await?
            .json::<RawSearchResponse>()
            .await?;

        if let Some(album) = resp.data.into_iter().nth(0) {
            Ok(album.attributes)
        } else {
            Ok(TidalRelease::default())
        }
    }
}
