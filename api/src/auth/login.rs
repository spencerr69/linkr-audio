use crate::Result;
use crate::auth::password::{Password, verify};
use crate::auth::queries::get_artist_auth;
use crate::auth::token::sign;
use crate::error::{ApiError, ErrorBody};
use crate::extract::ValidJson;
use crate::state::AppState;
use axum::Json;
use axum::extract::State;
use axum::http::{HeaderMap, HeaderValue, StatusCode};
use garde::Validate;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Deserialize, Validate, ToSchema)]
pub struct LoginRequest {
    #[garde(length(chars, min = 1, max = 63))]
    pub handle: String,
    #[garde(dive)]
    pub password: Password,
}

#[derive(Serialize, ToSchema)]
pub struct LoginResponse {
    pub token: String,
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
    // Handle the rate limiting per the user's IP (CF-Connecting-IP is cloudflare's end user IP header)
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

    // verify password against stored hash
    let artist_row = get_artist_auth(&state.db, &body.handle)
        .await
        .map_err(|_| ApiError::Unauthorized)?;
    let is_password_correct = verify(
        &body.password,
        artist_row.password_hash.as_ref().unwrap_or(&String::new()),
    );
    if !is_password_correct {
        return Err(ApiError::Unauthorized);
    }

    // sign token and return
    let token = sign(&body.handle, artist_row.role, &state.session_secret)?;
    Ok((StatusCode::OK, Json(LoginResponse { token })))
}

#[cfg(test)]
mod tests {
    use super::*;
    use garde::Validate;
    fn request() -> LoginRequest {
        LoginRequest {
            handle: "sr".into(),
            password: Password("correct horse battery".into()),
        }
    }
    fn failing_paths(value: &LoginRequest) -> Vec<String> {
        match value.validate() {
            Ok(()) => vec![],
            Err(report) => report.iter().map(|(path, _)| path.to_string()).collect(),
        }
    }
    #[test]
    fn fixture_is_valid() {
        assert_eq!(failing_paths(&request()), Vec::<String>::new());
    }
    #[test]
    fn malformed_handle_is_not_a_422() {
        // only the length is checked, so a handle that can't exist reaches the handler and gets the same 401
        let body = LoginRequest {
            handle: "not a handle!".into(),
            ..request()
        };
        assert_eq!(failing_paths(&body), Vec::<String>::new());
    }
    #[test]
    fn handle_length() {
        assert_eq!(
            failing_paths(&LoginRequest {
                handle: String::new(),
                ..request()
            }),
            ["handle"]
        );
        assert_eq!(
            failing_paths(&LoginRequest {
                handle: "a".repeat(64),
                ..request()
            }),
            ["handle"]
        );
        assert_eq!(
            failing_paths(&LoginRequest {
                handle: "a".repeat(63),
                ..request()
            }),
            Vec::<String>::new()
        );
    }
    #[test]
    fn password_too_long() {
        let body = LoginRequest {
            password: Password("p".repeat(129)),
            ..request()
        };
        assert_eq!(failing_paths(&body), ["password"]);
    }
}
