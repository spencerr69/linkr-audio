use crate::artists::row::{ARTIST_COLUMNS, ArtistRow, ArtistRowIden, Role};
use crate::artists::{CreateArtist, EditArtist};
use crate::db::prepare;
use crate::error::ApiError;
use crate::{Result, auth};
use sea_query::{Expr, ExprTrait, OnConflict, Query};
use worker::D1Database;

pub async fn get_artist(db: &D1Database, artist_handle: &str) -> Result<ArtistRow> {
    let row = prepare(
        db,
        Query::select()
            .columns(ARTIST_COLUMNS)
            .from(ArtistRowIden::Table)
            .and_where(Expr::col(ArtistRowIden::Handle).eq(artist_handle)),
    )?
    .first::<ArtistRow>(None)
    .await?;

    row.ok_or(ApiError::NotFound("artist"))
}

pub async fn create_artist(db: &D1Database, new_artist: &CreateArtist) -> Result<ArtistRow> {
    let hash = auth::password::hash(&new_artist.password)?;

    let row = prepare(
        db,
        Query::insert()
            .into_table(ArtistRowIden::Table)
            .columns([
                ArtistRowIden::Handle,
                ArtistRowIden::Name,
                ArtistRowIden::PasswordHash,
                ArtistRowIden::Role,
            ])
            .values_panic([
                new_artist.handle.clone().into(),
                new_artist.name.clone().into(),
                hash.into(),
                Role::Artist.into(),
            ])
            .on_conflict(
                OnConflict::column(ArtistRowIden::Handle)
                    .do_nothing()
                    .to_owned(),
            )
            .returning_all(),
    )?
    .first::<ArtistRow>(None)
    .await?;

    row.ok_or(ApiError::Conflict("artist"))
}

pub async fn edit_artist(
    db: &D1Database,
    handle: &str,
    edit_artist: &EditArtist,
) -> Result<ArtistRow> {
    let links_string = serde_json::to_string(&edit_artist.links)?;

    let styling = edit_artist
        .styling
        .as_ref()
        .map(serde_json::to_string)
        .transpose()?;

    let values: Vec<(ArtistRowIden, Expr)> = vec![
        (ArtistRowIden::Name, edit_artist.name.clone().into()),
        (ArtistRowIden::Links, links_string.into()),
        (
            ArtistRowIden::Styling,
            if let Some(styling_string) = styling {
                styling_string.into()
            } else {
                Expr::null()
            },
        ),
    ];

    let row = prepare(
        db,
        Query::update()
            .table(ArtistRowIden::Table)
            .and_where(Expr::col(ArtistRowIden::Handle).eq(handle))
            .values(values)
            .returning_all(),
    )?
    .first::<ArtistRow>(None)
    .await?;

    row.ok_or(ApiError::NotFound("artist"))
}
