use serde::Deserialize;
use utoipa::IntoParams;

#[derive(Deserialize, IntoParams)]
pub struct ListQuery {
    limit: Option<u32>,
    offset: Option<u32>,
}
