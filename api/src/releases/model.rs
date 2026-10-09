use crate::link::Link;
use crate::releases::row::ReleaseStatus;
use serde::Serialize;
use utoipa::ToSchema;

#[derive(Debug, Serialize, ToSchema)]
pub struct Release {
    pub artist_handle: String,
    pub slug: String,
    pub title: String,
    pub artist_credit: Option<String>,
    pub artist_name: String,
    pub upc: Option<String>,
    pub release_date: String,
    pub track_count: u32,
    pub artwork_key: Option<String>,
    pub artwork: Option<String>,
    pub links: Vec<Link>,
    pub status: ReleaseStatus,
    pub self_url: String, // https://{artist_handle}.{BASE_URL}/{slug}
    pub created_at: String,
    pub updated_at: String,
}
