use crate::error::ApiError;
use axum::Json;
use axum::extract::{FromRequest, FromRequestParts, Request};
use serde::de::DeserializeOwned;

#[derive(FromRequestParts)]
#[from_request(via(axum::extract::Path), rejection(ApiError))]
pub struct ApiPath<T>(pub T);

#[derive(FromRequestParts)]
#[from_request(via(axum::extract::Query), rejection(ApiError))]
pub struct ApiQuery<T>(pub T);

pub struct ValidJson<T>(pub T);

impl<T: DeserializeOwned + garde::Validate<Context = ()> + Send, S: Send + Sync> FromRequest<S>
    for ValidJson<T>
{
    type Rejection = ApiError;
    async fn from_request(req: Request, state: &S) -> Result<Self, Self::Rejection> {
        let value = Json::<T>::from_request(req, state).await?;
        value.validate()?;

        Ok(ValidJson(value.0))
    }
}
