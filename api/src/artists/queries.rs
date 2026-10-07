use crate::artists::row::{ARTIST_COLUMNS, ArtistRow, ArtistRowIden};
use crate::db::prepare;
use crate::error::ApiError;
use sea_query::{Expr, ExprTrait, Query};
use worker::D1Database;

pub async fn get_artist(db: &D1Database, artist_handle: &str) -> crate::Result<ArtistRow> {
    let row = prepare(
        db,
        Query::select()
            .columns(ARTIST_COLUMNS)
            .from(ArtistRowIden::Table)
            .and_where(Expr::col(ArtistRowIden::Handle).eq(artist_handle)),
    )?
    .first::<ArtistRow>(None)
    .await?;

    row.ok_or(ApiError::NotFound("Artist"))
}
