use crate::Result;
use crate::artists::row::ArtistRowIden;
use crate::db::prepare;
use crate::error::ApiError;
use crate::releases::row::{RELEASE_COLUMNS, ReleaseRowIden, ReleaseWithArtistRow};
use sea_query::{Expr, ExprTrait, Order, Query, SelectStatement};
use worker::D1Database;

#[must_use]
pub fn select_with_artist() -> SelectStatement {
    Query::select()
        .columns(RELEASE_COLUMNS)
        .from(ReleaseRowIden::Table)
        .inner_join(
            ArtistRowIden::Table,
            Expr::col(ArtistRowIden::Id).eq(Expr::col(ReleaseRowIden::ArtistId)),
        )
        .columns([
            (ArtistRowIden::Table, ArtistRowIden::Handle),
            (ArtistRowIden::Table, ArtistRowIden::Name),
        ])
        .expr_as(Expr::col(ArtistRowIden::Handle), "artist_handle")
        .expr_as(Expr::col(ArtistRowIden::Name), "artist_name")
        .to_owned()
}

pub async fn list_recent_releases(
    db: &D1Database,
    limit: u32,
) -> Result<Vec<ReleaseWithArtistRow>> {
    let results = prepare(
        db,
        select_with_artist()
            .and_where(Expr::col(ReleaseRowIden::Status).eq("active"))
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
    offset: u32,
    limit: u32,
    include_private: bool,
) -> Result<Vec<ReleaseWithArtistRow>> {
    let results = prepare(
        db,
        select_with_artist()
            .and_where(Expr::col(ArtistRowIden::Handle).eq(handle))
            .and_where_option(
                (!include_private).then_some(Expr::col(ReleaseRowIden::Status).eq("active")),
            )
            .limit(limit.into())
            .offset(offset.into()),
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
                (!allow_private).then_some(Expr::col(ReleaseRowIden::Status).eq("active")),
            ),
    )?
    .first::<ReleaseWithArtistRow>(None)
    .await?;

    result.ok_or(ApiError::NotFound("release"))
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
