use crate::artists::queries::artist_id_for;
use crate::auth::extract::AuthArtist;
use crate::error::ErrorBody;
use crate::extract::{ApiPath, ValidJson};
use crate::link::Link;
use crate::releases::model::Release;
use crate::releases::row::ReleaseStatus;
use crate::state::AppState;
use crate::{ApiResult, ApiResultEmpty, validators};
use axum::Json;
use axum::extract::State;
use axum::http::StatusCode;
use garde::Validate;
use serde::Deserialize;
use utoipa::ToSchema;

#[derive(Deserialize, Validate, ToSchema)]
pub struct NewRelease {
    #[garde(custom(validators::slug))]
    pub slug: String,
    #[garde(length(chars, min = 1, max = 200))]
    pub title: String,
    #[garde(inner(length(chars, max = 200)))]
    pub artist_credit: Option<String>,
    #[garde(inner(custom(validators::upc)))]
    pub upc: Option<String>,
    #[garde(custom(validators::iso_date))]
    pub release_date: String,
    #[garde(range(min = 1, max = 999))]
    pub track_count: u32,
    #[garde(inner(custom(validators::artwork_key)))]
    pub artwork_key: Option<String>,
    #[garde(length(max = 20), dive)]
    pub links: Vec<Link>,
    #[garde(skip)]
    pub status: ReleaseStatus,
}

#[derive(Deserialize, Validate, ToSchema)]
pub struct EditRelease {
    #[garde(length(chars, min = 1, max = 200))]
    pub title: String,
    #[garde(inner(length(chars, max = 200)))]
    pub artist_credit: Option<String>,
    #[garde(inner(custom(validators::upc)))]
    pub upc: Option<String>,
    #[garde(custom(validators::iso_date))]
    pub release_date: String,
    #[garde(range(min = 1, max = 999))]
    pub track_count: u32,
    #[garde(inner(custom(validators::artwork_key)))]
    pub artwork_key: Option<String>,
    #[garde(length(max = 20), dive)]
    pub links: Vec<Link>,
    #[garde(skip)]
    pub status: ReleaseStatus,
}

fn some_empty_string_to_none(input: Option<String>) -> Option<String> {
    input.filter(|s| !s.trim().is_empty())
}
impl NewRelease {
    pub fn normalise(&mut self) {
        self.artist_credit = some_empty_string_to_none(self.artist_credit.clone());
        self.upc = some_empty_string_to_none(self.upc.clone());
    }
}

impl EditRelease {
    pub fn normalise(&mut self) {
        self.artist_credit = some_empty_string_to_none(self.artist_credit.clone());
        self.upc = some_empty_string_to_none(self.upc.clone());
    }
}

#[utoipa::path(post, path = "/releases/{handle}", tag = "releases", security(("bearer" = [])),
    responses(
    (status = 201, description = "Release created", body = Release),
    (status = 401, description = "Unauthorized", body = ErrorBody),
    (status = 403, description = "Forbidden", body = ErrorBody),
    (status = 404, description = "Artist not found", body = ErrorBody)
    ))]
#[worker::send]
pub async fn create_release(
    State(state): State<AppState>,
    ApiPath(handle): ApiPath<String>,
    auth: AuthArtist,
    ValidJson(release): ValidJson<NewRelease>,
) -> ApiResult<Release> {
    auth.require_owner(&handle)?;

    let mut release = release;

    release.normalise();

    let artist_id = artist_id_for(&state.db, &handle).await?;

    let new_release = super::super::queries::create_release(&state.db, release, artist_id).await?;

    let release =
        super::super::queries::get_release(&state.db, &handle, &new_release.slug, true).await?;

    Ok((StatusCode::CREATED, Json(release.to_release(&state))))
}

#[utoipa::path(post, path = "/releases/{handle}/{slug}", tag = "releases", security(("bearer" = [])),
    responses(
    (status = 200, description = "Release edited", body = Release),
    (status = 401, description = "Unauthorized", body = ErrorBody),
    (status = 403, description = "Forbidden", body = ErrorBody),
    (status = 404, description = "Release not found", body = ErrorBody)
    ))]
#[worker::send]
pub async fn edit_release(
    State(state): State<AppState>,
    ApiPath((handle, slug)): ApiPath<(String, String)>,
    auth: AuthArtist,
    ValidJson(release): ValidJson<EditRelease>,
) -> ApiResult<Release> {
    auth.require_owner(&handle)?;

    let mut release = release;

    release.normalise();

    let artist_id = artist_id_for(&state.db, &handle).await?;

    let edited_release =
        super::super::queries::edit_release(&state.db, release, artist_id, &slug).await?;

    let release =
        super::super::queries::get_release(&state.db, &handle, &edited_release.slug, true).await?;

    Ok((StatusCode::OK, Json(release.to_release(&state))))
}
#[utoipa::path(delete, path = "/releases/{handle}/{slug}", tag = "releases", security(("bearer" = [])),
    responses(
    (status = 204, description = "Release deleted"),
    (status = 401, description = "Unauthorized", body = ErrorBody),
    (status = 403, description = "Forbidden", body = ErrorBody),
    (status = 404, description = "Release not found", body = ErrorBody)
    ))]
#[worker::send]
pub async fn delete_release(
    State(state): State<AppState>,
    ApiPath((handle, slug)): ApiPath<(String, String)>,
    auth: AuthArtist,
) -> ApiResultEmpty {
    auth.require_owner(&handle)?;

    let artist_id = artist_id_for(&state.db, &handle).await?;

    super::super::queries::delete_release(&state.db, artist_id, &slug).await?;

    Ok((StatusCode::NO_CONTENT, ()))
}

#[cfg(test)]
mod tests {
    use super::super::super::row::ReleaseStatus;
    use super::*;
    use crate::link::Link;
    use garde::Validate;
    use serde_json::json;
    fn link() -> Link {
        Link {
            name: "Spotify".into(),
            url: "https://open.spotify.com/album/x".into(),
        }
    }
    fn release() -> NewRelease {
        NewRelease {
            slug: "white-hours".into(),
            title: "White Hours".into(),
            artist_credit: None,
            upc: Some("196871234567".into()),
            release_date: "2026-03-14".into(),
            track_count: 9,
            artwork_key: Some("sr/white-hours.png".into()),
            links: vec![link()],
            status: ReleaseStatus::Public,
        }
    }
    fn body() -> serde_json::Value {
        json!({
            "slug": "white-hours",
            "title": "White Hours",
            "artist_credit": null,
            "upc": null,
            "release_date": "2026-03-14",
            "track_count": 9,
            "artwork_key": null,
            "links": [],
            "status": "public"
        })
    }
    fn failing_paths(value: &NewRelease) -> Vec<String> {
        match value.validate() {
            Ok(()) => vec![],
            Err(report) => report.iter().map(|(path, _)| path.to_string()).collect(),
        }
    }
    #[test]
    fn normalise_empties_to_none() {
        let mut r = NewRelease {
            artist_credit: Some(String::new()),
            upc: Some(String::new()),
            ..release()
        };
        r.normalise();
        assert_eq!(r.artist_credit, None);
        assert_eq!(r.upc, None);
    }
    #[test]
    fn normalise_leaves_the_rest() {
        let mut r = NewRelease {
            artist_credit: Some("x".into()),
            upc: None,
            ..release()
        };
        r.normalise();
        assert_eq!(r.artist_credit.as_deref(), Some("x"));
        assert_eq!(r.upc, None);
    }
    #[test]
    fn fixture_is_valid() {
        assert!(failing_paths(&release()).is_empty());
    }
    #[test]
    fn slug_rules() {
        for slug in ["Admin", "api"] {
            assert_eq!(
                failing_paths(&NewRelease {
                    slug: slug.into(),
                    ..release()
                }),
                ["slug"],
                "slug {slug:?}"
            );
        }
    }
    #[test]
    fn impossible_date() {
        let r = NewRelease {
            release_date: "2026-02-30".into(),
            ..release()
        };
        assert_eq!(failing_paths(&r), ["release_date"]);
    }
    #[test]
    fn track_count_range() {
        for track_count in [0, 1000] {
            let r = NewRelease {
                track_count,
                ..release()
            };
            assert_eq!(
                failing_paths(&r),
                ["track_count"],
                "track_count {track_count}"
            );
        }
    }
    #[test]
    fn too_many_links() {
        assert_eq!(
            failing_paths(&NewRelease {
                links: vec![link(); 21],
                ..release()
            }),
            ["links"]
        );
    }
    #[test]
    fn artwork_key_is_not_a_url() {
        let r = NewRelease {
            artwork_key: Some("https://x/y.png".into()),
            ..release()
        };
        assert_eq!(failing_paths(&r), ["artwork_key"]);
    }
    #[test]
    fn active_without_status_is_refused() {
        let mut value = body();
        let object = value.as_object_mut().unwrap();
        object.remove("status");
        object.insert("active".into(), json!(true));
        assert!(serde_json::from_value::<NewRelease>(value).is_err());
    }
    #[test]
    fn read_only_fields_are_dropped() {
        let mut value = body();
        let object = value.as_object_mut().unwrap();
        object.insert("artist_handle".into(), json!("sr"));
        object.insert("artist_name".into(), json!("SR"));
        object.insert(
            "artwork".into(),
            json!("https://linkr.audio/images?image=sr/x.png"),
        );
        object.insert(
            "self_url".into(),
            json!("https://sr.linkr.audio/white-hours"),
        );
        let r = serde_json::from_value::<NewRelease>(value).expect("extra fields ignored");
        assert_eq!(r.slug, "white-hours");
    }
    #[test]
    fn status_and_null_upc() {
        let r = serde_json::from_value::<NewRelease>(body()).unwrap();
        assert_eq!(r.status, ReleaseStatus::Public);
        assert_eq!(r.upc, None);
    }
}
