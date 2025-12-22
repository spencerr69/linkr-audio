use crate::auth::authenticated;
use serde::{Deserialize, Serialize};
use worker::wasm_bindgen::JsValue;
use worker::{Request, Response, RouteContext};
use crate::releases::Link;

/// Handles POST request to create a new artist account.
///
/// ### Request Body:
/// ```ignore
/// {
///     id: String,
///     artist_name: String,
///     pw: String
/// }
/// ```
pub async fn post_create_artist(
    mut req: Request,
    ctx: RouteContext<()>,
) -> worker::Result<Response> {
    #[derive(Serialize, Deserialize, Debug)]
    struct CreateArtistJson {
        pub id: String,
        pub artist_name: String,
        pub pw: String,
    }

    let d1 = ctx.d1("prod_sr_db")?;

    if !authenticated(req.headers(), d1, Some("sr")).await {
        return Response::error("Unauthorized", 401);
    }

    let Ok(body) = req.json::<CreateArtistJson>().await else {
        return Response::error("Invalid request body", 400);
    };

    let pw_hash = crate::auth::salt_and_hash(&body.pw, &body.id);

    let d1 = ctx.d1("prod_sr_db")?;

    let statement = d1.prepare(
        "REPLACE INTO Artists (artist_id, master_artist_name, styling, pw_hash)
VALUES (?1, ?2, null, ?3);",
    );

    let query = statement.bind(&[
        JsValue::from(body.id),
        JsValue::from(body.artist_name),
        JsValue::from(pw_hash),
    ])?;

    let result = query.run().await?;
    if result.success() {
        return Response::ok("boots");
    }

    Response::error("Internal Server Error", 500)
}

pub async fn get_artist(_req: Request, ctx: RouteContext<()>) -> worker::Result<Response> {
    #[derive(Deserialize, Serialize)]
    struct GetArtistResponse {
        pub artist_id: String,
        pub master_artist_name: String,
        pub links: Vec<Link>,
        pub styling: Option<String>,
    }

    impl From<DbSchema> for GetArtistResponse {
        fn from(value: DbSchema) -> Self {
            let links = serde_json::from_str(&value.links).unwrap_or(vec![]);

            Self {
                styling: value.styling,
                artist_id: value.artist_id,
                master_artist_name: value.master_artist_name,
                links
            }
        }
    }

    #[derive(Deserialize, Serialize)]
    struct DbSchema {
        pub artist_id: String,
        pub master_artist_name: String,
        pub links: String,
        pub styling: Option<String>,
    }

    let Some(id) = ctx.param("id") else {
        return Response::error("Invalid artist ID", 400);
    };

    let d1 = ctx.d1("prod_sr_db")?;

    let statement = d1
        .prepare("SELECT artist_id, master_artist_name, styling FROM Artists WHERE artist_id = ?1");

    let binded = statement.bind(&[JsValue::from(id)])?;

    let Some(result): Option<DbSchema> = binded.first(None).await? else {
        return Response::error("Artist not found", 404);
    };

    let result = GetArtistResponse::from(result);

    Response::from_json(&result)
}

pub async fn post_edit_artist(mut req: Request, ctx: RouteContext<()>) -> worker::Result<Response> {
    #[derive(Deserialize, Serialize)]
    struct EditArtistRequest {
        pub master_artist_name: String,
        pub links: Vec<Link>,
        pub styling: Option<String>,
    }

    let Some(id) = ctx.param("id") else {
        return Response::error("Invalid artist ID", 400);
    };

    let d1 = ctx.d1("prod_sr_db")?;

    if !authenticated(req.headers(), d1, Some(id)).await {
        return Response::error("Unauthorized", 401)
    }

    let request = req.json::<EditArtistRequest>().await?;

    let d1 = ctx.d1("prod_sr_db")?;

    let statement = d1.prepare("UPDATE Artists SET (master_artist_name, links, styling) = (?1, \
    ?2, ?3) WHERE artist_id = ?4");

    let binded = statement.bind(&[
        JsValue::from(request.master_artist_name),
        JsValue::from(serde_json::to_string(&request.links)?),
        JsValue::from(request.styling)
    ])?;

    let result = binded.run().await?;

    if !result.success() {
        return Response::error("Failed to update artist", 500);
    }

    Response::ok("Artist updated successfully")
}
