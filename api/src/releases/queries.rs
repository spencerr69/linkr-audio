use crate::Result;
use crate::artists::row::ArtistRowIden;
use crate::db::prepare;
use crate::error::ApiError;
use crate::releases::routes::write::{EditRelease, NewRelease};
use crate::releases::row::{
    RELEASE_COLUMNS, ReleaseRow, ReleaseRowIden, ReleaseStatus, ReleaseWithArtistRow,
};
use sea_query::{Expr, ExprTrait, OnConflict, Order, Query, SelectStatement};
use worker::D1Database;

#[must_use]
pub fn select_with_artist() -> SelectStatement {
    Query::select()
        .columns(RELEASE_COLUMNS)
        .from(ReleaseRowIden::Table)
        .inner_join(
            ArtistRowIden::Table,
            Expr::col((ArtistRowIden::Table, ArtistRowIden::Id))
                .eq(Expr::col((ReleaseRowIden::Table, ReleaseRowIden::ArtistId))),
        )
        .expr_as(
            Expr::col((ArtistRowIden::Table, ArtistRowIden::Handle)),
            "artist_handle",
        )
        .expr_as(
            Expr::col((ArtistRowIden::Table, ArtistRowIden::Name)),
            "artist_name",
        )
        .to_owned()
}

pub async fn list_recent_releases(
    db: &D1Database,
    limit: u32,
) -> Result<Vec<ReleaseWithArtistRow>> {
    let results = prepare(
        db,
        select_with_artist()
            .and_where(Expr::col(ReleaseRowIden::Status).eq(ReleaseStatus::Public))
            .order_by(ReleaseRowIden::ReleaseDate, Order::Desc)
            .limit(limit.into()),
    )?
    .all()
    .await?
    .results::<ReleaseWithArtistRow>()?;

    Ok(results)
}

pub async fn list_for_artist(
    db: &D1Database,
    handle: &str,
    limit: u32,
    offset: u32,
    include_private: bool,
) -> Result<Vec<ReleaseWithArtistRow>> {
    let results = prepare(
        db,
        select_with_artist()
            .and_where(Expr::col(ArtistRowIden::Handle).eq(handle))
            .and_where_option(
                (!include_private)
                    .then_some(Expr::col(ReleaseRowIden::Status).eq(ReleaseStatus::Public)),
            )
            .limit(limit.into())
            .offset(offset.into())
            .order_by(
                (ReleaseRowIden::Table, ReleaseRowIden::ReleaseDate),
                Order::Desc,
            ),
    )?
    .all()
    .await?
    .results::<ReleaseWithArtistRow>()?;

    Ok(results)
}

pub async fn get_release(
    db: &D1Database,
    handle: &str,
    slug: &str,
    allow_private: bool,
) -> Result<ReleaseWithArtistRow> {
    let result = prepare(
        db,
        select_with_artist()
            .and_where(Expr::and(
                Expr::col(ArtistRowIden::Handle).eq(handle),
                Expr::col(ReleaseRowIden::Slug).eq(slug),
            ))
            .and_where_option(
                (!allow_private).then_some(
                    Expr::col(ReleaseRowIden::Status)
                        .eq(ReleaseStatus::Public)
                        .or(Expr::col(ReleaseRowIden::Status).eq(ReleaseStatus::Unlisted)),
                ),
            ),
    )?
    .first::<ReleaseWithArtistRow>(None)
    .await?;

    result.ok_or(ApiError::NotFound("release"))
}

pub async fn create_release(
    db: &D1Database,
    release: NewRelease,
    artist_id: i64,
) -> Result<ReleaseRow> {
    let row = prepare(
        db,
        Query::insert()
            .into_table(ReleaseRowIden::Table)
            .columns([
                ReleaseRowIden::Slug,
                ReleaseRowIden::Title,
                ReleaseRowIden::ArtistCredit,
                ReleaseRowIden::Upc,
                ReleaseRowIden::ReleaseDate,
                ReleaseRowIden::TrackCount,
                ReleaseRowIden::ArtworkKey,
                ReleaseRowIden::Links,
                ReleaseRowIden::Status,
                ReleaseRowIden::ArtistId,
            ])
            .values_panic([
                release.slug.into(),
                release.title.into(),
                release.artist_credit.into(),
                release.upc.into(),
                release.release_date.into(),
                release.track_count.into(),
                release.artwork_key.into(),
                serde_json::to_string(&release.links)?.into(),
                release.status.into(),
                artist_id.into(),
            ])
            .on_conflict(
                OnConflict::columns([ReleaseRowIden::ArtistId, ReleaseRowIden::Slug])
                    .do_nothing()
                    .to_owned(),
            )
            .returning_all(),
    )?
    .first::<ReleaseRow>(None)
    .await?;

    row.ok_or(ApiError::Conflict("release"))
}
pub async fn edit_release(
    db: &D1Database,
    release: EditRelease,
    artist_id: i64,
    slug: &str,
) -> Result<ReleaseRow> {
    let row = prepare(
        db,
        Query::update()
            .table(ReleaseRowIden::Table)
            .values([
                (ReleaseRowIden::Title, release.title.into()),
                (ReleaseRowIden::ArtistCredit, release.artist_credit.into()),
                (ReleaseRowIden::Upc, release.upc.into()),
                (ReleaseRowIden::ReleaseDate, release.release_date.into()),
                (ReleaseRowIden::TrackCount, release.track_count.into()),
                (ReleaseRowIden::ArtworkKey, release.artwork_key.into()),
                (
                    ReleaseRowIden::Links,
                    serde_json::to_string(&release.links)?.into(),
                ),
                (ReleaseRowIden::Status, release.status.into()),
            ])
            .and_where(
                Expr::col(ReleaseRowIden::ArtistId)
                    .eq(artist_id)
                    .and(Expr::col(ReleaseRowIden::Slug).eq(slug)),
            )
            .returning_all(),
    )?
    .first::<ReleaseRow>(None)
    .await?;

    row.ok_or(ApiError::NotFound("release"))
}

pub async fn delete_release(db: &D1Database, artist_id: i64, slug: &str) -> Result<()> {
    let query = prepare(
        db,
        Query::delete().from_table(ReleaseRowIden::Table).and_where(
            Expr::col(ReleaseRowIden::ArtistId)
                .eq(artist_id)
                .and(Expr::col(ReleaseRowIden::Slug).eq(slug)),
        ),
    )?;
    let meta = query
        .run()
        .await?
        .meta()?
        .ok_or(ApiError::NotFound("release"))?;
    if meta.changes.unwrap_or(0) < 1 {
        return Err(ApiError::NotFound("release"));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use sea_query::SqliteQueryBuilder;

    fn sql() -> String {
        let (sql, _) = select_with_artist().build(SqliteQueryBuilder);
        sql
    }

    #[test]
    fn joins_artists_with_aliases() {
        let sql = sql();
        assert!(sql.contains(r#"INNER JOIN "artists""#), "{sql}");
        assert!(sql.contains(r#"AS "artist_handle""#), "{sql}");
        assert!(sql.contains(r#"AS "artist_name""#), "{sql}");
    }

    #[test]
    fn release_columns_are_qualified() {
        let sql = sql();
        let columns = [
            "id",
            "artist_id",
            "slug",
            "title",
            "artist_credit",
            "upc",
            "release_date",
            "track_count",
            "artwork_key",
            "links",
            "status",
            "created_at",
            "updated_at",
        ];
        for column in columns {
            let qualified = format!(r#""releases"."{column}""#);
            assert!(sql.contains(&qualified), "missing {qualified} in {sql}");
        }
    }

    #[test]
    fn no_hash_and_no_wildcard() {
        let sql = sql();
        assert!(!sql.contains("password_hash"), "{sql}");
        assert!(!sql.contains('*'), "{sql}");
    }
}
