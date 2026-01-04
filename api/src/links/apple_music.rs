use serde::{Deserialize, Serialize};
use worker::{console_log, console_warn};

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Default)]
pub struct AppleMusicRelease {
    pub wrapperType: String,
    pub collectionType: String,
    pub artistId: u128,
    pub collectionId: u128,
    pub artistName: String,
    pub collectionName: String,
    pub collectionCensoredName: String,
    pub artistViewUrl: String,
    pub collectionViewUrl: String,
    pub artworkUrl60: String,
    pub artworkUrl100: String,
    pub collectionPrice: f64,
    pub collectionExplicitness: String,
    pub contentAdvisoryRating: Option<String>,
    pub trackCount: u32,
    pub copyright: String,
    pub country: String,
    pub currency: String,
    pub releaseDate: String,
    pub primaryGenreName: String,
}

// impl AppleMusicRelease {
//     pub fn get_album_art_url(&self, size: u32) -> String {
//         self.artworkUrl100
//             .replace("100x100", &format!("{size}x{size}"))
//     }
// }

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
struct RawSearchResponse {
    pub resultCount: u32,
    pub results: Vec<AppleMusicRelease>,
}

pub struct AppleMusicClient {
    client: reqwest::Client,
}

impl AppleMusicClient {
    pub fn new() -> Self {
        AppleMusicClient {
            client: reqwest::Client::new(),
        }
    }

    pub async fn get_release_by_upc(
        &self,
        upc: &str,
    ) -> Result<AppleMusicRelease, Box<dyn std::error::Error>> {
        let resp = self
            .client
            .get(format!("https://itunes.apple.com/lookup?upc={upc}"))
            .send()
            .await?;

        let Ok(resp) = resp.json::<RawSearchResponse>().await else {
            console_warn!("Apple Music: Failed to parse Apple Music API response for UPC: {upc}");
            return Ok(AppleMusicRelease::default());
        };

        let Some(album) = resp.results.into_iter().nth(0) else {
            console_log!("Apple Music: No album found for UPC: {upc}");
            return Ok(AppleMusicRelease::default());
        };

        Ok(album)
    }
}
