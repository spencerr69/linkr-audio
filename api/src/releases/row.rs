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
