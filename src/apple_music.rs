use serde::{Deserialize, Serialize};

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Default)]
pub struct AppleMusicAlbum {
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

impl AppleMusicAlbum {
    pub fn get_album_art_url(&self, size: u32) -> String {
        self.artworkUrl100
            .replace("100x100", &format!("{size}x{size}"))
    }
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
struct RawSearchResponse {
    pub resultCount: u32,
    pub results: Vec<AppleMusicAlbum>,
}

pub struct AppleMusicClient {}

impl AppleMusicClient {
    pub fn new() -> Self {
        AppleMusicClient {}
    }

    pub async fn get_album_by_upc(
        &self,
        upc: &str,
    ) -> Result<AppleMusicAlbum, Box<dyn std::error::Error>> {
        let resp = reqwest::get(format!("https://itunes.apple.com/lookup?upc={upc}"))
            .await?
            .json::<RawSearchResponse>()
            .await?;

        let Some(album) = resp.results.into_iter().nth(0) else {
            return Ok(AppleMusicAlbum::default());
        };

        Ok(album)
    }
}
