use crate::artists::row::ArtistRowIden;
use crate::releases::row::{RELEASE_COLUMNS, ReleaseRowIden};
use sea_query::{Expr, ExprTrait, Query, SelectStatement};

#[must_use]
pub fn select_with_artist() -> SelectStatement {
    Query::select()
        .columns(RELEASE_COLUMNS)
        .from(ReleaseRowIden::Table)
        .inner_join(
            ArtistRowIden::Table,
            Expr::col(ArtistRowIden::Id).eq(Expr::col(ReleaseRowIden::ArtistId)),
        )
        .columns([ArtistRowIden::Name])
        .to_owned()
}
