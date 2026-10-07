use crate::Result;
use crate::artists::row::{ArtistRowIden, Role};
use crate::auth::password::verify;
use crate::auth::token::sign;
use crate::db::prepare;
use crate::error::{ApiError, ErrorBody};
use crate::extract::ValidJson;
use crate::state::AppState;
use axum::Json;
use axum::extract::State;
use axum::http::{HeaderMap, HeaderValue, StatusCode};
use garde::Validate;
use sea_query::{Expr, Query};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Deserialize, Validate, ToSchema)]
pub struct LoginRequest {
    #[garde(length(chars, min = 1, max = 63))]
    pub handle: String,
    #[garde(length(chars, min = 8, max = 128))]
    pub password: String,
}

#[derive(Serialize, ToSchema)]
pub struct LoginResponse {
    pub token: String,
}

#[derive(Deserialize, Clone)]
struct QueryResponse {
    role: Role,
    password_hash: Option<String>,
}

#[utoipa::path(post, path = "/auth/login", tag = "auth", request_body = LoginRequest, responses(
    (status = 200, description = "Login successful", body = LoginResponse),
    (status = 400, description = "Invalid request", body = ErrorBody),
    (status = 401, description = "Invalid credentials", body = ErrorBody),
    (status = 429, description = "Too many requests", body = ErrorBody),
    (status = 422, description = "Input improperly formed", body = ErrorBody),
))]
#[worker::send]
pub async fn login(
    State(state): State<AppState>,
    headers: HeaderMap,
    ValidJson(body): ValidJson<LoginRequest>,
) -> Result<(StatusCode, Json<LoginResponse>)> {
    let unknown_header = HeaderValue::from_static("unknown");

    let limiter_key = headers
        .get("CF-Connecting-IP")
        .unwrap_or(&unknown_header)
        .to_str()
        .map_err(|_| ApiError::Internal("Unable to parse CF-Connecting-IP".to_string()))?;

    let limited = !state
        .login_limiter
        .limit(limiter_key.to_string())
        .await?
        .success;

    if limited {
        return Err(ApiError::TooManyRequests);
    }

    let artist_row = get_artist_row(&state, &body).await?;

    let is_password_correct = verify(
        &body.password,
        artist_row.password_hash.as_ref().unwrap_or(&String::new()),
    );

    if !is_password_correct {
        return Err(ApiError::Unauthorized);
    }

    let token = sign(&body.handle, artist_row.role, &state.session_secret)?;

    Ok((StatusCode::OK, Json(LoginResponse { token })))
}

async fn get_artist_row(state: &AppState, body: &LoginRequest) -> Result<QueryResponse, ApiError> {
    let query_response = prepare(
        &state.db,
        Query::select()
            .from(ArtistRowIden::Table)
            .columns([ArtistRowIden::Role, ArtistRowIden::PasswordHash])
            .and_where(Expr::value(
                Expr::col(ArtistRowIden::Handle).eq(&Expr::value(&body.handle)),
            )),
    )?
    .await?
    .results::<QueryResponse>()?;

    let artist_row = query_response.first().ok_or(ApiError::Unauthorized)?;
    Ok(artist_row.clone())
}
