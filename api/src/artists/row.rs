use sea_query::{Value, enum_def};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "lowercase")]
pub enum Role {
    Artist,
    Admin,
}
impl From<Role> for Value {
    fn from(role: Role) -> Self {
        match role {
            Role::Artist => Value::String(Some("artist".to_string())),
            Role::Admin => Value::String(Some("admin".to_string())),
        }
    }
}

#[enum_def(table_name = "artists")]
#[derive(Debug, Deserialize)]
pub struct ArtistRow {
    pub id: i64,
    pub handle: String,
    pub name: String,
    pub links: String,           // stored as json array
    pub styling: Option<String>, // stored as json object
    pub role: Role,
    pub password_hash: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

pub const ARTIST_COLUMNS: [ArtistRowIden; 8] = [
    ArtistRowIden::Id,
    ArtistRowIden::Handle,
    ArtistRowIden::Name,
    ArtistRowIden::Links,
    ArtistRowIden::Styling,
    ArtistRowIden::Role,
    ArtistRowIden::CreatedAt,
    ArtistRowIden::UpdatedAt,
];

#[cfg(test)]
mod tests {
    use super::*;
    use sea_query::{Query, SqliteQueryBuilder};

    #[test]
    fn role_conversion() {
        assert_eq!(
            Value::String(Some("artist".to_string())),
            Role::Artist.into()
        );
        assert_eq!(Value::String(Some("admin".to_string())), Role::Admin.into());
        assert_ne!(Value::String(Some("Admin".to_string())), Role::Admin.into());
    }

    #[test]
    fn password_hidden() {
        let (query, _) = Query::select()
            .columns(ARTIST_COLUMNS)
            .from(ArtistRowIden::Table)
            .build(SqliteQueryBuilder);
        assert!(query.contains("handle"));
        assert!(!query.contains("password_hash"));
    }
}
