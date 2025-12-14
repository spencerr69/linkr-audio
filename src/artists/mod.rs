use crate::authenticated_request;
use serde::{Deserialize, Serialize};
use worker::wasm_bindgen::JsValue;
use worker::{Request, Response, RouteContext};

pub async fn post_create_artist(
    mut req: Request,
    ctx: RouteContext<()>,
) -> worker::Result<Response> {
    if !authenticated_request(req.headers()) {
        return Response::error("Unauthorized", 401);
    }
    #[derive(Serialize, Deserialize, Debug)]
    struct CreateArtistJson {
        pub id: String,
        pub artist_name: String,
        pub pw: String,
    }

    let Ok(body) = req.json::<CreateArtistJson>().await else {
        return Response::error("Invalid request body", 400);
    };

    let pw_hash = crate::auth::salt_and_hash(&body.pw, &body.id);

    let d1 = ctx.d1("prod_sr_db")?;

    let statement = d1.prepare(
        "INSERT INTO Artists (artist_id, master_artist_name, styling, pw_hash)
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
    };

    Response::error("Internal Server Error", 500)
}
