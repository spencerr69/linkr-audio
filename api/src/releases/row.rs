use crate::link::Link;
use crate::releases::model::Release;
use crate::state::AppState;
use sea_query::{Value, enum_def};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "lowercase")]
pub enum ReleaseStatus {
    Draft,
    Unlisted,
    Public,
}

impl From<ReleaseStatus> for Value {
    fn from(value: ReleaseStatus) -> Self {
        match value {
            ReleaseStatus::Draft => Value::String(Some("draft".to_string())),
            ReleaseStatus::Unlisted => Value::String(Some("unlisted".to_string())),
            ReleaseStatus::Public => Value::String(Some("public".to_string())),
        }
    }
}

#[enum_def(table_name = "releases")]
#[derive(Debug, Deserialize)]
pub struct ReleaseRow {
    pub id: i64,
    pub artist_id: i64,
    pub slug: String,
    pub title: String,
    pub artist_credit: Option<String>,
    pub upc: Option<String>,
    pub release_date: String,
    pub track_count: u32,
    pub artwork_key: Option<String>,
    pub links: String, // stored as json array
    pub status: ReleaseStatus,
    pub created_at: String,
    pub updated_at: String,
}

pub const RELEASE_COLUMNS: [ReleaseRowIden; 13] = [
    ReleaseRowIden::Id,
    ReleaseRowIden::ArtistId,
    ReleaseRowIden::Slug,
    ReleaseRowIden::Title,
    ReleaseRowIden::ArtistCredit,
    ReleaseRowIden::Upc,
    ReleaseRowIden::ReleaseDate,
    ReleaseRowIden::TrackCount,
    ReleaseRowIden::ArtworkKey,
    ReleaseRowIden::Links,
    ReleaseRowIden::Status,
    ReleaseRowIden::CreatedAt,
    ReleaseRowIden::UpdatedAt,
];

#[derive(Debug, Deserialize)]
pub struct ReleaseWithArtistRow {
    pub id: i64,
    pub artist_id: i64,
    pub slug: String,
    pub title: String,
    pub artist_credit: Option<String>,
    pub upc: Option<String>,
    pub release_date: String,
    pub track_count: u32,
    pub artwork_key: Option<String>,
    pub links: String, // stored as json array
    pub status: ReleaseStatus,
    pub created_at: String,
    pub updated_at: String,
    pub artist_handle: String,
    pub artist_name: String,
}

impl ReleaseWithArtistRow {
    fn to_release(&self, state: &AppState) -> Release {
        let artwork = self
            .artwork_key
            .clone()
            .map(|key| format!("{}/{}", state.artwork_url_prefix, key));

        let links: Vec<Link> = serde_json::from_str(&self.links).unwrap_or_default();

        Release {
            slug: self.slug.clone(),
            title: self.title.clone(),
            artist_credit: self.artist_credit.clone(),
            upc: self.upc.clone(),
            release_date: self.release_date.clone(),
            track_count: self.track_count,
            artwork_key: self.artwork_key.clone(),
            artwork,
            links,
            status: self.status,
            created_at: self.created_at.clone(),
            updated_at: self.updated_at.clone(),
            artist_handle: self.artist_handle.clone(),
            artist_name: self.artist_name.clone(),
            self_url: format!(
                "https://{}.{}/{}",
                self.artist_handle, state.public_host, self.slug
            ),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn status_conversion() {
        assert_eq!(
            Value::String(Some("draft".to_string())),
            ReleaseStatus::Draft.into()
        );
        assert_eq!(
            Value::String(Some("public".to_string())),
            ReleaseStatus::Public.into()
        );
        assert_eq!(
            Value::String(Some("unlisted".to_string())),
            ReleaseStatus::Unlisted.into()
        );
        assert_ne!(
            Value::String(Some("Draft".to_string())),
            ReleaseStatus::Draft.into()
        );
    }
}
