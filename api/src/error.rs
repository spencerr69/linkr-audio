use axum::extract::rejection::{JsonRejection, PathRejection, QueryRejection};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde::Serialize;
use utoipa::ToSchema;
use worker::Error;

#[derive(Debug)]
pub enum ApiError {
    Rejected(StatusCode, String),
    Unauthorized,
    Forbidden,
    NotFound(&'static str),
    Conflict(&'static str),
    UnsupportedMediaType(String),
    PayloadTooLarge(usize),
    TooManyRequests,
    Validation(Vec<FieldError>),
    Internal(String),
}

#[derive(Serialize, ToSchema)]
pub struct ErrorBody {
    pub error: String,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub fields: Vec<FieldError>,
}

#[derive(Serialize, Clone, ToSchema, Debug)]
pub struct FieldError {
    pub path: String,
    pub message: String,
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let mut errors = vec![];

        let (status, message) = match self {
            ApiError::Rejected(status, message) => (status, message),
            ApiError::Unauthorized => (StatusCode::UNAUTHORIZED, "Unauthorized".to_string()),
            ApiError::Forbidden => (StatusCode::FORBIDDEN, "Forbidden".to_string()),
            ApiError::NotFound(message) => (StatusCode::NOT_FOUND, format!("{message} not found")),
            ApiError::Conflict(message) => (StatusCode::CONFLICT, message.to_string()),
            ApiError::UnsupportedMediaType(message) => {
                (StatusCode::UNSUPPORTED_MEDIA_TYPE, message)
            }

            ApiError::PayloadTooLarge(size) => (
                StatusCode::PAYLOAD_TOO_LARGE,
                format!("Payload too large, max size is {size} bytes"),
            ),
            ApiError::TooManyRequests => (
                StatusCode::TOO_MANY_REQUESTS,
                "Too many requests".to_string(),
            ),
            ApiError::Validation(fields) => {
                errors = fields;
                (
                    StatusCode::UNPROCESSABLE_ENTITY,
                    "Validation error".to_string(),
                )
            }

            ApiError::Internal(message) => {
                worker::console_error!("{}", message);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Internal error".to_string(),
                )
            }
        };

        (
            status,
            axum::Json(ErrorBody {
                error: message,
                fields: errors,
            }),
        )
            .into_response()
    }
}

impl From<Error> for ApiError {
    fn from(value: Error) -> Self {
        ApiError::Internal(value.to_string())
    }
}

impl From<JsonRejection> for ApiError {
    fn from(value: JsonRejection) -> Self {
        ApiError::Rejected(value.status(), value.body_text())
    }
}

impl From<PathRejection> for ApiError {
    fn from(value: PathRejection) -> Self {
        ApiError::Rejected(value.status(), value.body_text())
    }
}

impl From<QueryRejection> for ApiError {
    fn from(value: QueryRejection) -> Self {
        ApiError::Rejected(value.status(), value.body_text())
    }
}

impl From<garde::Report> for ApiError {
    fn from(value: garde::Report) -> Self {
        ApiError::Validation(
            value
                .iter()
                .map(|val| FieldError {
                    path: val.0.to_string(),
                    message: val.1.to_string(),
                })
                .collect(),
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn into_responses() {
        assert_eq!(
            ApiError::Rejected(StatusCode::BAD_REQUEST, "Invalid request".to_string())
                .into_response()
                .status(),
            StatusCode::BAD_REQUEST
        );
        assert_eq!(
            ApiError::Unauthorized.into_response().status(),
            StatusCode::UNAUTHORIZED
        );
        assert_eq!(
            ApiError::Forbidden.into_response().status(),
            StatusCode::FORBIDDEN
        );
        assert_eq!(
            ApiError::NotFound("route").into_response().status(),
            StatusCode::NOT_FOUND
        );
        assert_eq!(
            ApiError::Conflict("Conflict").into_response().status(),
            StatusCode::CONFLICT
        );
        assert_eq!(
            ApiError::UnsupportedMediaType("Media".to_string())
                .into_response()
                .status(),
            StatusCode::UNSUPPORTED_MEDIA_TYPE
        );
        assert_eq!(
            ApiError::PayloadTooLarge(16).into_response().status(),
            StatusCode::PAYLOAD_TOO_LARGE
        );
        assert_eq!(
            ApiError::TooManyRequests.into_response().status(),
            StatusCode::TOO_MANY_REQUESTS
        );
        assert_eq!(
            ApiError::Validation(vec![]).into_response().status(),
            StatusCode::UNPROCESSABLE_ENTITY
        );
    }
}
