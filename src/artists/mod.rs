use crate::auth::authenticated;
use serde::{Deserialize, Serialize};
use worker::wasm_bindgen::JsValue;
use worker::{Request, Response, RouteContext};

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

    if !authenticated(req.headers(), d1, None).await {
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
        pub styling: Option<String>,
    }

    let Some(id) = ctx.param("id") else {
        return Response::error("Invalid artist ID", 400);
    };

    let d1 = ctx.d1("prod_sr_db")?;

    let statement = d1
        .prepare("SELECT artist_id, master_artist_name, styling FROM Artists WHERE artist_id = ?1");

    let binded = statement.bind(&[JsValue::from(id)])?;

    let Some(result): Option<GetArtistResponse> = binded.first(None).await? else {
        return Response::error("Artist not found", 404);
    };

    Response::from_json(&result)
}
