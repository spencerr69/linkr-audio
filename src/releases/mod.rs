use crate::auth::authenticated;
use serde::{Deserialize, Serialize};
use worker::wasm_bindgen::JsValue;
use worker::{Request, Response, RouteContext};

#[derive(Serialize, Deserialize)]
pub struct ReleaseBody {
    pub upc: String,
    pub title: String,
    pub artist_name: String,
    pub artwork: String,
    pub spotify: String,
    pub apple_music: String,
    pub tidal: String,
    pub bandcamp: String,
    pub soundcloud: String,
    pub youtube: String,
    pub track_count: u32,
}

pub async fn get_release(_req: Request, ctx: RouteContext<()>) -> worker::Result<Response> {
    let (Some(artist_id), Some(slug)) = (ctx.param("id"), ctx.param("slug")) else {
        return Response::error("Missing artist id or slug", 400);
    };

    let d1 = ctx.d1("prod_sr_db")?;

    let query = d1.prepare("SELECT * FROM Releases WHERE artist_id = ?1 AND slug = ?2");
    let binded = query.bind(&[JsValue::from(artist_id), JsValue::from(slug)])?;

    let Some(release): Option<ReleaseBody> = binded.first(None).await? else {
        return Response::error("Release not found", 404);
    };

    Response::from_json(&release)
}

/// Handles POST request to create a new release for an artist
///
/// ### Request Body
/// ```
/// {
///         pub slug: String,
///         pub upc: String,
///         pub title: String,
///         pub artist_name: String,
///         pub artwork: Option<String>,
///         pub spotify: Option<String>,
///         pub apple_music: Option<String>,
///         pub tidal: Option<String>,
///         pub bandcamp: Option<String>,
///         pub soundcloud: Option<String>,
///         pub youtube: Option<String>,
///         pub track_count: u32,
///     }
///```
pub async fn post_new_release(mut req: Request, ctx: RouteContext<()>) -> worker::Result<Response> {
    let Some(artist_id) = ctx.param("id") else {
        return Response::error("No artist id provided", 400);
    };

    let d1 = ctx.d1("prod_sr_db")?;

    if !authenticated(req.headers(), d1, Some(artist_id)).await {
        return Response::error("Unauthorized", 401);
    }

    #[derive(Serialize, Deserialize)]
    struct PostNewReleaseBody {
        pub slug: String,
        pub upc: String,
        pub title: String,
        pub artist_name: String,
        pub artwork: String,
        pub spotify: String,
        pub apple_music: String,
        pub tidal: String,
        pub bandcamp: String,
        pub soundcloud: String,
        pub youtube: String,
        pub track_count: u32,
    }

    let Ok(new_release) = req.json::<PostNewReleaseBody>().await else {
        return Response::error(
            "JSON incorrectly formatted. Please ensure you meet the schema.",
            400,
        );
    };

    let d1 = ctx.d1("prod_sr_db")?;
    let query =  d1.prepare("INSERT INTO Releases (slug, upc, title, artist_name, artist_id, artwork, spotify, apple_music, tidal, bandcamp, soundcloud, youtube, track_count) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)");
    let binded = query.bind(&[
        JsValue::from(new_release.slug),
        JsValue::from(new_release.upc),
        JsValue::from(new_release.title),
        JsValue::from(new_release.artist_name),
        JsValue::from(artist_id),
        JsValue::from(new_release.artwork),
        JsValue::from(new_release.spotify),
        JsValue::from(new_release.apple_music),
        JsValue::from(new_release.tidal),
        JsValue::from(new_release.bandcamp),
        JsValue::from(new_release.soundcloud),
        JsValue::from(new_release.youtube),
        JsValue::from(new_release.track_count),
    ])?;

    let result = binded.run().await?;

    if result.success() {
        return Response::ok("Release created successfully");
    }

    Response::error("Release not created. Likely already exists.", 500)
}

/// Handles POST request to edit a release for an artist
///
/// ### Request Body
/// ```
/// {
///         pub slug: String,
///         pub upc: String,
///         pub title: String,
///         pub artist_name: String,
///         pub artwork: Option<String>,
///         pub spotify: Option<String>,
///         pub apple_music: Option<String>,
///         pub tidal: Option<String>,
///         pub bandcamp: Option<String>,
///         pub soundcloud: Option<String>,
///         pub youtube: Option<String>,
///         pub track_count: u32,
///     }
///```
pub async fn post_edit_release(
    mut req: Request,
    ctx: RouteContext<()>,
) -> worker::Result<Response> {
    let (Some(artist_id), Some(slug)) = (ctx.param("id"), ctx.param("slug")) else {
        return Response::error("No artist id or slug provided", 400);
    };

    let d1 = ctx.d1("prod_sr_db")?;

    if !authenticated(req.headers(), d1, Some(artist_id)).await {
        return Response::error("Unauthorized", 401);
    }

    let Ok(new_release) = req.json::<ReleaseBody>().await else {
        return Response::error(
            "JSON incorrectly formatted. Please ensure you meet the schema.",
            400,
        );
    };

    let d1 = ctx.d1("prod_sr_db")?;
    let query =  d1.prepare("REPLACE INTO Releases (slug, upc, title, artist_name, artist_id, artwork, spotify, apple_music, tidal, bandcamp, soundcloud, youtube, track_count) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)");
    let binded = query.bind(&[
        JsValue::from(slug),
        JsValue::from(new_release.upc),
        JsValue::from(new_release.title),
        JsValue::from(new_release.artist_name),
        JsValue::from(artist_id),
        JsValue::from(new_release.artwork),
        JsValue::from(new_release.spotify),
        JsValue::from(new_release.apple_music),
        JsValue::from(new_release.tidal),
        JsValue::from(new_release.bandcamp),
        JsValue::from(new_release.soundcloud),
        JsValue::from(new_release.youtube),
        JsValue::from(new_release.track_count),
    ])?;

    let result = binded.run().await?;

    if result.success() {
        return Response::ok("Release created successfully");
    }

    Response::error("Release not created. Likely already exists.", 500)
}
