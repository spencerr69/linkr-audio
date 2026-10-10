use crate::ApiResult;
use crate::auth::extract::{OptionalAuthArtist, is_authed_with_handle};
use crate::error::ErrorBody;
use crate::extract::{ApiPath, ApiQuery};
use crate::releases::model::Release;
use crate::state::AppState;
use axum::Json;
use axum::extract::State;
use axum::http::StatusCode;
use serde::Deserialize;
use utoipa::IntoParams;

#[derive(Deserialize, IntoParams)]
pub struct ListQuery {
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

#[utoipa::path(get, path = "/releases", tag = "releases", params(ListQuery),
responses(
    (status = 200, description = "Release returned", body = Release),
))]
#[worker::send]
pub async fn list_recent_releases(
    State(state): State<AppState>,
    ApiQuery(query): ApiQuery<ListQuery>,
) -> ApiResult<Vec<Release>> {
    let limit = query.limit.unwrap_or(10).min(50);

    let results = super::super::queries::list_recent_releases(&state.db, limit).await?;

    Ok((
        StatusCode::OK,
        Json(results.into_iter().map(|i| i.to_release(&state)).collect()),
    ))
}

#[utoipa::path(get, path = "/releases/{handle}", tag = "releases", params(ListQuery),
    responses(
    (status = 200, description = "Releases returned", body = Vec<Release>),
    ))]
#[worker::send]
pub async fn list_for_artist(
    State(state): State<AppState>,
    ApiPath(handle): ApiPath<String>,
    ApiQuery(query): ApiQuery<ListQuery>,
    OptionalAuthArtist(optional_artist): OptionalAuthArtist,
) -> ApiResult<Vec<Release>> {
    let limit = query.limit.unwrap_or(10).max(50);
    let offset = query.offset.unwrap_or(0);

    let include_private = is_authed_with_handle(&optional_artist, &handle);

    let results =
        super::super::queries::list_for_artist(&state.db, &handle, limit, offset, include_private)
            .await?;

    Ok((
        StatusCode::OK,
        Json(results.into_iter().map(|i| i.to_release(&state)).collect()),
    ))
}

#[utoipa::path(get, path = "/releases/{handle}/{slug}", tag = "releases",
    responses(
    (status = 200, description = "Release returned", body = Release),
    (status = 404, description = "Release not found", body = ErrorBody),
    ))]
#[worker::send]
pub async fn get_release(
    State(state): State<AppState>,
    ApiPath((handle, slug)): ApiPath<(String, String)>,
    OptionalAuthArtist(optional_artist): OptionalAuthArtist,
) -> ApiResult<Release> {
    let allow_private = is_authed_with_handle(&optional_artist, &handle);

    let result =
        super::super::queries::get_release(&state.db, &handle, &slug, allow_private).await?;

    Ok((StatusCode::OK, Json(result.to_release(&state))))
}
