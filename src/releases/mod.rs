use crate::auth::authenticated;
use serde::{Deserialize, Serialize};
use worker::wasm_bindgen::JsValue;
use worker::{Request, Response, RouteContext};

#[derive(Serialize, Deserialize)]
pub struct ReleaseBody {
    pub upc: String,
    pub title: String,
    pub artist_name: String,
    pub release_date: String,
    pub artwork: Option<String>,
    pub links: Vec<Link>,

    pub artist_id: String,
    pub slug: String,

    pub track_count: u32,
}

impl From<DbSchema> for ReleaseBody {
    fn from(db_schema: DbSchema) -> Self {
        let new_links = serde_json::from_str(&db_schema.links).unwrap_or(vec![]);

        Self {
            upc: db_schema.upc,
            title: db_schema.title,
            artwork: db_schema.artwork,
            links: new_links,
            track_count: db_schema.track_count,
            slug: db_schema.slug,
            artist_id: db_schema.artist_id,
            artist_name: db_schema.artist_name,
            release_date: db_schema.release_date,
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Link {
    pub name: String,
    pub url: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct DbSchema {
    pub slug: String,
    pub artist_id: String,
    pub upc: String,
    pub title: String,
    pub artist_name: String,
    pub release_date: String,
    pub artwork: Option<String>,
    pub links: String,
    pub track_count: u32,
}

pub async fn get_releases_for_artist(
    _req: Request,
    ctx: RouteContext<()>,
) -> worker::Result<Response> {
    let Some(artist_id) = ctx.param("id") else {
        return Response::error("No artist id provided", 400);
    };

    let d1 = ctx.d1("prod_sr_db")?;
    let query =
        d1.prepare("SELECT * FROM Releases WHERE artist_id = ?1 ORDER BY release_date DESC");
    let binded = query.bind(&[JsValue::from(artist_id)])?;
    let result = binded.run().await?;
    let Ok(out): worker::Result<Vec<DbSchema>> = result.results() else {
        return Response::error("No releases found for artist", 404);
    };

    let out = out
        .into_iter()
        .map(ReleaseBody::from)
        .collect::<Vec<ReleaseBody>>();

    Response::from_json(&out)
}

pub async fn get_release(_req: Request, ctx: RouteContext<()>) -> worker::Result<Response> {
    let (Some(artist_id), Some(slug)) = (ctx.param("id"), ctx.param("slug")) else {
        return Response::error("Missing artist id or slug", 400);
    };

    let d1 = ctx.d1("prod_sr_db")?;

    let query = d1.prepare("SELECT * FROM Releases WHERE artist_id = ?1 AND slug = ?2");
    let binded = query.bind(&[JsValue::from(artist_id), JsValue::from(slug)])?;

    let Some(release): Option<DbSchema> = binded.first(None).await? else {
        return Response::error("Release not found", 404);
    };

    let out = ReleaseBody::from(release);

    Response::from_json(&out)
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

    let Ok(new_release) = req.json::<ReleaseBody>().await else {
        return Response::error(
            "JSON incorrectly formatted. Please ensure you meet the schema.",
            400,
        );
    };

    let d1 = ctx.d1("prod_sr_db")?;

    let query = d1.prepare(
        "INSERT INTO Releases (slug, upc, title, artist_name, artist_id, \
    artwork, links, track_count, release_date) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
    );

    let binded = query.bind(&[
        JsValue::from(new_release.slug),
        JsValue::from(new_release.upc),
        JsValue::from(new_release.title),
        JsValue::from(new_release.artist_name),
        JsValue::from(artist_id),
        JsValue::from(new_release.artwork),
        JsValue::from(serde_json::to_string(&new_release.links)?),
        JsValue::from(new_release.track_count),
        JsValue::from(new_release.release_date),
    ])?;

    let result = binded.run().await?;

    if result.success() {
        return Response::ok("Release created successfully");
    }

    Response::error("Release not created. Likely already exists.", 500)
}

/// Handles POST request to edit a release for an artist
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
    let query = d1.prepare(
        "REPLACE INTO Releases (slug, upc, title, artist_name, artist_id, \
    artwork, links, track_count, release_date) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
    );
    let binded = query.bind(&[
        JsValue::from(slug),
        JsValue::from(new_release.upc),
        JsValue::from(new_release.title),
        JsValue::from(new_release.artist_name),
        JsValue::from(artist_id),
        JsValue::from(new_release.artwork),
        JsValue::from(serde_json::to_string(&new_release.links)?),
        JsValue::from(new_release.track_count),
        JsValue::from(new_release.release_date),
    ])?;

    let result = binded.run().await?;

    if result.success() {
        return Response::ok("Release created successfully");
    }

    Response::error("Release not created. Likely already exists.", 500)
}
