use base64::Engine;
use serde::{Deserialize, Serialize};
use sha2::Digest;
use worker::wasm_bindgen::JsValue;
use worker::{D1Database, Headers, Request, Response, RouteContext};

pub fn salt_and_hash(raw_pw: &str, raw_id: &str) -> String {
    let mut hasher = sha2::Sha256::default();
    hasher.update((raw_pw.to_owned() + raw_id).as_bytes());
    let out = hasher.finalize();
    format!("{:x}", out)
}

pub async fn authenticated(headers: &Headers, d1: D1Database, target_id: Option<&str>) -> bool {
    let Some(auth) = headers.get("Authorization").unwrap_or(None) else {
        return false;
    };

    let (auth_type, auth_token) = auth.split_once(" ").unwrap_or(("", ""));

    if auth_type != "Basic" {
        return false;
    }

    let Ok(auth_token) = base64::engine::general_purpose::STANDARD.decode(auth_token) else {
        return false;
    };

    let auth_token = String::from_utf8(auth_token).unwrap_or("".into());

    let Some((id, pass)) = auth_token.split_once(":") else {
        return false;
    };

    if let Some(target_id) = target_id {
        if id != target_id {
            return false;
        }
    }

    let pw_hash = salt_and_hash(pass, id);

    let query =
        d1.prepare("SELECT artist_id, pw_hash FROM Artists where artist_id = ?1 AND pw_hash = ?2");
    let Ok(query) = query.bind(&[JsValue::from(id), JsValue::from(pw_hash)]) else {
        return false;
    };

    #[derive(Serialize, Deserialize)]
    struct QueryResponse {
        artist_id: String,
        pw_hash: String,
    }

    let Ok(Some(_)): worker::Result<Option<QueryResponse>> = query.first(None).await else {
        return false;
    };

    true
}

pub async fn login(req: Request, ctx: RouteContext<()>) -> worker::Result<Response> {
    let d1 = ctx.d1("prod_sr_db")?;
    if !authenticated(req.headers(), d1, None).await {
        return Response::error("Unauthorized", 401);
    }

    Response::ok("Login successful")
}
