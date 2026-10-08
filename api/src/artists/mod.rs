use crate::artists::row::Role;
use crate::auth::extract::AuthArtist;
use crate::auth::password::{Password, hash, verify};
use crate::auth::queries::get_artist_auth;
use crate::error::{ApiError, ErrorBody, internal};
use crate::extract::ValidJson;
use crate::link::Link;
use crate::state::AppState;
use crate::validators;
use crate::{ApiResult, ApiResultEmpty};
use axum::Json;
use axum::extract::{Path, State};
use axum::http::StatusCode;
use garde::Validate;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

pub mod queries;
pub mod row;

#[derive(Validate, ToSchema, Serialize, Deserialize)]
#[garde(transparent)]
pub struct HexCode(#[garde(custom(validators::hex_colour))] String);

#[derive(ToSchema, Serialize, Deserialize, Validate, Default)]
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

impl Styling {
    fn empty() -> Self {
        Self {
            colours: Some(Colours::default()),
        }
    }
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

#[derive(Deserialize, Validate, ToSchema)]
pub struct CreateArtist {
    #[garde(custom(validators::handle))]
    pub handle: String,
    #[garde(length(min = 1, max = 200))]
    pub name: String,
    #[garde(dive)]
    pub password: Password,
}

#[derive(Deserialize, Validate, ToSchema)]
pub struct EditArtist {
    #[garde(length(min = 1, max = 200))]
    pub name: String,
    #[garde(dive, length(max = 20))]
    pub links: Vec<Link>,
    #[garde(dive)]
    pub styling: Option<Styling>,
}

#[derive(Deserialize, Validate, ToSchema)]
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
) -> ApiResult<Artist> {
    Ok((
        StatusCode::OK,
        Json(queries::get_artist(&state.db, &handle).await?.into()),
    ))
}

#[utoipa::path(post, path = "/artists", request_body = CreateArtist, tag = "artists", security(("bearer" = ["admin"])),
responses(
    (status = 201, description = "Artist created", body = Artist),
    (status = 401, description = "Unauthorized", body = ErrorBody),
    (status = 403, description = "Forbidden", body = ErrorBody),
))]
#[worker::send]
pub async fn create_artist(
    State(state): State<AppState>,
    auth: AuthArtist,
    ValidJson(new_artist): ValidJson<CreateArtist>,
) -> ApiResult<Artist> {
    auth.require_admin()?;

    Ok((
        StatusCode::CREATED,
        Json(queries::create_artist(&state.db, &new_artist).await?.into()),
    ))
}

#[utoipa::path(post, path = "/artists/{handle}", request_body = EditArtist, tag = "artists", security(("bearer" = [])),
responses(
    (status = 204, description = "Artist edited"),
))]
#[worker::send]
pub async fn edit_artist(
    State(state): State<AppState>,
    auth: AuthArtist,
    Path(handle): Path<String>,
    ValidJson(edit_artist): ValidJson<EditArtist>,
) -> ApiResultEmpty {
    auth.require_owner(&handle)?;
    queries::edit_artist(&state.db, &handle, &edit_artist).await?;

    Ok((StatusCode::NO_CONTENT, ()))
}
#[utoipa::path(post, path = "/artists/{handle}/password", request_body = ChangePassword, tag = "artists", security(
("bearer" = [])), responses(
    (status = 204, description = "Password changed"),
    (status = 401, description = "Unauthorized", body = ErrorBody),
    (status = 403, description = "Forbidden", body = ErrorBody),
    (status = 404, description = "Artist not found", body = ErrorBody),
))]
#[worker::send]
pub async fn change_password(
    State(state): State<AppState>,
    auth: AuthArtist,
    Path(handle): Path<String>,
    ValidJson(change_password): ValidJson<ChangePassword>,
) -> ApiResultEmpty {
    auth.require_owner(&handle)?;

    let current_row = get_artist_auth(&state.db, &handle).await?;
    let Some(current_hash) = current_row.password_hash else {
        return Err(internal!("{handle} has no password"));
    };

    verify(&change_password.current_password, &current_hash).ok_or(ApiError::Forbidden)?;

    let new_hash = hash(&change_password.new_password)?;

    crate::auth::queries::change_password(&state.db, &handle, &new_hash).await?;

    Ok((StatusCode::NO_CONTENT, ()))
}

#[cfg(test)]
mod tests {
    use super::row::{ArtistRow, Role};
    use super::*;
    use crate::link::Link;
    use garde::Validate;
    fn row() -> ArtistRow {
        ArtistRow {
            id: 1,
            handle: "sr".into(),
            name: "SR".into(),
            links: r#"[{"name":"Spotify","url":"https://open.spotify.com/artist/x"}]"#.into(),
            styling: Some(
                r##"{"colours":{"background":"#000000","foreground":null,"accent":"#ff0066"}}"##
                    .into(),
            ),
            role: Role::Admin,
            password_hash: None,
            created_at: "2026-10-01 10:00:00".into(),
            updated_at: "2026-10-02 11:00:00".into(),
        }
    }
    fn link() -> Link {
        Link {
            name: "Spotify".into(),
            url: "https://open.spotify.com/artist/x".into(),
        }
    }
    fn create() -> CreateArtist {
        CreateArtist {
            handle: "bruh".into(),
            name: "Bruh".into(),
            password: Password("long enough".into()),
        }
    }
    fn edit() -> EditArtist {
        EditArtist {
            name: "SR".into(),
            links: vec![link()],
            styling: Some(Styling {
                colours: Some(Colours {
                    background: Some(HexCode("#112233".into())),
                    foreground: None,
                    accent: Some(HexCode("#abc123".into())),
                }),
            }),
        }
    }
    fn change() -> ChangePassword {
        ChangePassword {
            current_password: Password("old one  bitch".into()),
            new_password: Password("new and long".into()),
        }
    }
    fn failing_paths<T: Validate<Context = ()>>(value: &T) -> Vec<String> {
        match value.validate() {
            Ok(()) => vec![],
            Err(report) => report.iter().map(|(path, _)| path.to_string()).collect(),
        }
    }
    #[test]
    fn row_comes_through_parsed() {
        let artist: Artist = row().into();
        assert_eq!(artist.handle, "sr");
        assert_eq!(artist.name, "SR");
        assert_eq!(artist.links.len(), 1);
        assert_eq!(artist.links[0].url, "https://open.spotify.com/artist/x");
        let colours = artist
            .styling
            .and_then(|s| s.colours)
            .expect("colours parsed");
        assert_eq!(colours.background.unwrap().0, "#000000");
        assert!(colours.foreground.is_none());
        assert_eq!(colours.accent.unwrap().0, "#ff0066");
        assert_eq!(artist.role, Role::Admin);
        assert_eq!(artist.created_at, "2026-10-01 10:00:00");
        assert_eq!(artist.updated_at, "2026-10-02 11:00:00");
    }
    #[test]
    fn garbage_links_read_as_empty() {
        let artist: Artist = ArtistRow {
            links: "not json".into(),
            ..row()
        }
        .into();
        assert!(artist.links.is_empty());
    }

    #[test]
    fn missing_or_garbage_styling_has_no_colours() {
        // Colours should not be sent as none, each colour should be sent as null.
        for styling in [None, Some("not json".to_string())] {
            let artist: Artist = ArtistRow {
                styling: styling.clone(),
                ..row()
            }
            .into();
            let styling_out = artist
                .styling
                .expect("a styling, even when the column is unusable");
            assert!(styling_out.colours.is_some(), "styling {styling:?}");
        }
    }

    #[test]
    fn fixtures_are_valid() {
        assert!(failing_paths(&create()).is_empty());
        assert!(failing_paths(&edit()).is_empty());
        assert!(failing_paths(&change()).is_empty());
    }
    #[test]
    fn create_rules() {
        assert_eq!(
            failing_paths(&CreateArtist {
                handle: "www".into(),
                ..create()
            }),
            ["handle"]
        );
        assert_eq!(
            failing_paths(&CreateArtist {
                password: Password("1234567".into()),
                ..create()
            }),
            ["password"]
        );
    }
    #[test]
    fn too_many_links() {
        assert_eq!(
            failing_paths(&EditArtist {
                links: vec![link(); 21],
                ..edit()
            }),
            ["links"]
        );
    }
    #[test]
    fn link_url_must_be_https() {
        let links = vec![Link {
            url: "http://x".into(),
            ..link()
        }];
        assert_eq!(
            failing_paths(&EditArtist { links, ..edit() }),
            ["links[0].url"]
        );
    }
    #[test]
    fn bad_colour() {
        let styling = Some(Styling {
            colours: Some(Colours {
                background: Some(HexCode("#ggg".into())),
                foreground: None,
                accent: None,
            }),
        });
        let paths = failing_paths(&EditArtist { styling, ..edit() });
        assert_eq!(paths.len(), 1, "{paths:?}");
        assert!(paths[0].ends_with("background"), "{paths:?}");
    }
    #[test]
    fn new_password_too_short() {
        let body = ChangePassword {
            new_password: Password("1234567".into()),
            ..change()
        };
        assert_eq!(failing_paths(&body), ["new_password"]);
    }
}
