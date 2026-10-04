use crate::error::ApiError;
use crate::state::AppState;
use axum::extract::DefaultBodyLimit;
use axum::response::IntoResponse;
use axum::{Json, Router, http, routing::get};
use std::sync::OnceLock;
use tower_service::Service;
use utoipa::openapi::security::{HttpAuthScheme, HttpBuilder, SecurityScheme};
use utoipa::{Modify, OpenApi, openapi};
use utoipa_axum::router::OpenApiRouter;

pub mod db;
pub mod error;
pub mod extract;
pub mod state;

pub mod artists;
pub mod releases;

const BODY_LIMIT: usize = 64 * 1024;

pub type Result<T, E = ApiError> = std::result::Result<T, E>;

#[derive(OpenApi)]
#[openapi(info(title = "linkr.audio API", version = "1.0.0"), modifiers(&BearerAuth), version = "3.2.0")]
pub struct ApiDoc;

pub struct BearerAuth;

impl Modify for BearerAuth {
    fn modify(&self, openapi: &mut openapi::OpenApi) {
        openapi
            .components
            .get_or_insert_default()
            .add_security_scheme(
                "bearer",
                SecurityScheme::Http(
                    HttpBuilder::new()
                        .scheme(HttpAuthScheme::Bearer)
                        .bearer_format("JWT")
                        .build(),
                ),
            );
    }
}

#[must_use]
pub fn api_router() -> OpenApiRouter<AppState> {
    OpenApiRouter::with_openapi(ApiDoc::openapi())
        // routes to go here
        .layer(DefaultBodyLimit::max(BODY_LIMIT))
}

#[must_use]
pub fn openapi() -> openapi::OpenApi {
    api_router().split_for_parts().1
}

static ROUTER: OnceLock<Router<AppState>> = OnceLock::new();

fn router() -> Router<AppState> {
    ROUTER
        .get_or_init(|| {
            let (router, doc) = api_router().split_for_parts();
            let doc = Json(doc);
            router
                .route("/openapi.json", get(doc))
                .fallback(|| async { ApiError::NotFound("route") })
        })
        .clone()
}

#[worker::event(fetch)]
async fn fetch(
    req: worker::HttpRequest,
    env: worker::Env,
    _ctx: worker::Context,
) -> worker::Result<http::Response<axum::body::Body>> {
    let state = match AppState::from_env(&env) {
        Ok(state) => state,
        Err(err) => return Ok(err.into_response()),
    };
    Ok(router().with_state(state).call(req).await?)
}
