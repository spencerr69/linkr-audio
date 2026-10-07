use crate::Result;
use crate::artists::row::Role;
use crate::error::ApiError;
use jsonwebtoken::{Algorithm, DecodingKey, EncodingKey, Validation, get_current_timestamp};
use serde::{Deserialize, Serialize};

pub const TOKEN_TTL_SECS: u64 = 7 * 24 * 60 * 60;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // artist handle
    pub role: Role,
    pub iat: u64, // issued at
    pub exp: u64, // expires at
}

pub fn sign(handle: &str, role: Role, secret: &str) -> Result<String> {
    let key = EncodingKey::from_secret(secret.as_ref());

    let iat = get_current_timestamp();
    let exp = iat + TOKEN_TTL_SECS;

    let claims = Claims {
        sub: handle.to_string(),
        role,
        iat,
        exp,
    };

    jsonwebtoken::encode(&jsonwebtoken::Header::default(), &claims, &key)
        .map_err(|err| ApiError::Internal(format!("Could not sign token: {err}")))
}

#[must_use]
pub fn verify(token: &str, secret: &str) -> Option<Claims> {
    let mut validation = Validation::new(Algorithm::HS256);
    validation.leeway = 0;
    validation.set_required_spec_claims(&["exp", "sub"]);

    jsonwebtoken::decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_ref()),
        &validation,
    )
    .ok()
    .map(|data| data.claims)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trip() {
        let token = sign("test", Role::Artist, "secret").unwrap();
        let claims = verify(&token, "secret").unwrap();
        assert_eq!(claims.sub, "test");
        assert_eq!(claims.exp - claims.iat, TOKEN_TTL_SECS);
        assert_eq!(claims.role, Role::Artist);
        assert!(verify(&token, "secr3t").is_none());
    }

    #[test]
    fn expired_is_refused() {
        let now = get_current_timestamp();
        let stale =
            serde_json::json!({"sub": "sr", "role": "admin", "iat": now -1000, "exp": now - 10});
        let token = jsonwebtoken::encode(
            &jsonwebtoken::Header::default(),
            &stale,
            &EncodingKey::from_secret("secret".as_ref()),
        )
        .unwrap();
        assert!(verify(&token, "secret").is_none());
    }

    #[test]
    fn missing_role_is_refused() {
        let now = get_current_timestamp();
        let stale = serde_json::json!({"sub": "sr", "iat": now -1000, "exp": now + 100});
        let token = jsonwebtoken::encode(
            &jsonwebtoken::Header::default(),
            &stale,
            &EncodingKey::from_secret("secret".as_ref()),
        )
        .unwrap();
        assert!(verify(&token, "secret").is_none());
    }
}
