use axum::extract::rejection::{JsonRejection, PathRejection, QueryRejection};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde::Serialize;
use utoipa::ToSchema;
use worker::Error;

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

#[derive(Serialize, Clone, ToSchema)]
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
            ApiError::NotFound(message) => (StatusCode::NOT_FOUND, message.to_string()),
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

impl From<worker::Error> for ApiError {
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
