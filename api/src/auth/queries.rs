use crate::Result;
use crate::artists::row::{ArtistRowIden, Role};
use crate::db::prepare;
use crate::error::ApiError;
use sea_query::{Expr, ExprTrait, Query};
use serde::Deserialize;
use worker::D1Database;

#[derive(Deserialize, Clone)]
pub struct GetArtistAuthQueryResponse {
    pub role: Role,
    pub password_hash: Option<String>,
}

pub async fn get_artist_auth(db: &D1Database, handle: &str) -> Result<GetArtistAuthQueryResponse> {
    let query_response = prepare(
        db,
        Query::select()
            .columns([ArtistRowIden::Role, ArtistRowIden::PasswordHash])
            .from(ArtistRowIden::Table)
            .and_where(Expr::col(ArtistRowIden::Handle).eq(handle)),
    )?
    .first::<GetArtistAuthQueryResponse>(None)
    .await?;

    query_response.ok_or(ApiError::NotFound("artist"))
}

pub async fn change_password(db: &D1Database, handle: &str, new_hash: &str) -> Result<()> {
    #[derive(Deserialize)]
    struct HandleResponse {
        handle: String,
    }

    let updated_handle = prepare(
        db,
        Query::update()
            .table(ArtistRowIden::Table)
            .and_where(Expr::col(ArtistRowIden::Handle).eq(handle))
            .value(ArtistRowIden::PasswordHash, new_hash)
            .returning_col(ArtistRowIden::Handle),
    )?
    .first::<HandleResponse>(None)
    .await?;

    let Some(_) = updated_handle else {
        return Err(ApiError::Forbidden);
    };

    Ok(())
}
