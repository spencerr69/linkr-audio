use base64::Engine;
use hmac::digest::InvalidLength;
use hmac::{Hmac, Mac};
use jwt::VerifyWithKey;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use worker::wasm_bindgen::JsValue;
use worker::{D1Database, Headers, Request, Response, RouteContext};

pub fn salt_and_hash(raw_pw: &str, raw_id: &str) -> String {
    let mut hasher = Sha256::default();
    hasher.update((raw_pw.to_owned() + raw_id).as_bytes());
    let out = hasher.finalize();
    format!("{out:x}")
}

pub async fn authenticated(
    headers: &Headers,
    d1: &D1Database,
    target_id: Option<&str>,
    ctx: &RouteContext<()>,
) -> bool {
    #[derive(Serialize, Deserialize)]
    struct QueryResponse {
        artist_id: String,
        pw_hash: String,
    }

    let Some(auth) = headers.get("Authorization").unwrap_or(None) else {
        return false;
    };

    let (auth_type, auth_token) = auth.split_once(' ').unwrap_or(("", ""));

    match auth_type {
        "Basic" => {
            let Ok(auth_token) = base64::engine::general_purpose::STANDARD.decode(auth_token)
            else {
                return false;
            };

            let auth_token = String::from_utf8(auth_token).unwrap_or_default();

            let Some((id, pass)) = auth_token.split_once(':') else {
                return false;
            };

            if let Some(target_id) = target_id
                && id != target_id
            {
                return false;
            }

            let pw_hash = salt_and_hash(pass, id);

            let query = d1.prepare(
                "SELECT artist_id, pw_hash FROM Artists where artist_id = ?1 AND pw_hash = ?2",
            );
            let Ok(query) = query.bind(&[JsValue::from(id), JsValue::from(pw_hash)]) else {
                return false;
            };

            let Ok(Some(_)): worker::Result<Option<QueryResponse>> = query.first(None).await else {
                return false;
            };

            true
        }
        "Bearer" => {
            let Ok(secret): Result<Hmac<Sha256>, InvalidLength> = Hmac::new_from_slice(
                &ctx.secret("SESSION_SECRET")
                    .expect("No session secret")
                    .to_string()
                    .into_bytes(),
            ) else {
                return false;
            };
            let Ok(jwt): Result<JWTPayload, jwt::error::Error> =
                auth_token.verify_with_key(&secret)
            else {
                return false;
            };

            if let Some(id) = target_id {
                return jwt.artistId == id;
            }

            true
        }
        _ => false,
    }
}

#[derive(Serialize, Deserialize)]
#[allow(non_snake_case)]
struct JWTPayload {
    pub artistId: String,
}

pub async fn login(req: Request, ctx: RouteContext<()>) -> worker::Result<Response> {
    let d1 = ctx.d1("prod_sr_db")?;
    if !authenticated(req.headers(), &d1, None, &ctx).await {
        return Response::error("Unauthorized", 401);
    }

    Response::ok("Login successful")
}
