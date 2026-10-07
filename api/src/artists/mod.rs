use crate::artists::row::Role;
use crate::auth::password::Password;
use crate::error::ErrorBody;
use crate::link::Link;
use crate::state::AppState;
use crate::validators;
use axum::extract::{Path, State};
use garde::Validate;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

pub mod queries;
pub mod row;

#[derive(Validate, ToSchema, Serialize, Deserialize)]
#[garde(transparent)]
pub struct HexCode(#[garde(custom(validators::hex_colour))] String);

#[derive(ToSchema, Serialize, Deserialize, Validate)]
pub struct Colours {
    #[garde(dive)]
    pub background: Option<HexCode>,
    #[garde(dive)]
    pub foreground: Option<HexCode>,
    #[garde(dive)]
    pub accent: Option<HexCode>,
}

#[derive(ToSchema, Serialize, Deserialize, Validate)]
pub struct Styling {
    #[garde(dive)]
    pub colours: Option<Colours>,
}

#[derive(ToSchema, Serialize)]
pub struct Artist {
    pub handle: String,
    pub name: String,
    pub links: Vec<Link>,
    pub styling: Option<Styling>,
    pub role: Role,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Deserialize, Validate)]
pub struct CreateArtist {
    #[garde(custom(validators::handle))]
    pub handle: String,
    #[garde(length(min = 1, max = 200))]
    pub name: String,
    #[garde(dive)]
    pub password: Password,
}

#[derive(Deserialize, Validate)]
pub struct EditArtist {
    #[garde(length(min = 1, max = 200))]
    pub name: String,
    #[garde(dive)]
    pub links: Vec<Link>,
    #[garde(dive)]
    pub styling: Option<Styling>,
}

#[derive(Deserialize, Validate)]
pub struct ChangePassword {
    #[garde(dive)]
    pub current_password: Password,
    #[garde(dive)]
    pub new_password: Password,
}

#[utoipa::path(get, path = "/artists/{handle}", tag = "artists", responses(
    (status = 200, description = "Artist retrieved", body = Artist),
    (status = 404, description = "Artist not found", body = ErrorBody),))]
#[worker::send]
pub async fn get_artist(
    State(state): State<AppState>,
    Path(handle): Path<String>,
) -> crate::Result<Artist> {
    Ok(queries::get_artist(&state.db, &handle).await?.into())
}
