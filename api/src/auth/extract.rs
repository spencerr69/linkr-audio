use crate::Result;
use crate::artists::row::Role;
use crate::error::ApiError;
use crate::state::AppState;
use axum::extract::FromRequestParts;
use axum::http::header::AUTHORIZATION;
use axum::http::request::Parts;

pub struct AuthArtist {
    pub handle: String,
    pub role: Role,
}

impl AuthArtist {
    pub fn require_owner(&self, handle: &str) -> Result<()> {
        if self.handle != handle {
            return Err(ApiError::Forbidden);
        }
        Ok(())
    }

    pub fn require_admin(&self) -> Result<()> {
        if self.role != Role::Admin {
            return Err(ApiError::Forbidden);
        }
        Ok(())
    }
}

pub struct OptionalAuthArtist(pub Option<AuthArtist>);

fn parts_to_auth(parts: &Parts, state: &AppState) -> Result<Option<AuthArtist>> {
    let auth = parts.headers.get(AUTHORIZATION);

    if auth.is_none() {
        return Ok(None);
    }

    let claims = auth
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.strip_prefix("Bearer "))
        .and_then(|value| crate::auth::token::verify(value, &state.session_secret))
        .ok_or(ApiError::Unauthorized)?;

    Ok(Some(AuthArtist {
        handle: claims.sub,
        role: claims.role,
    }))
}

impl FromRequestParts<AppState> for AuthArtist {
    type Rejection = ApiError;
    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> std::result::Result<Self, Self::Rejection> {
        let auth = parts_to_auth(parts, state)?;
        auth.ok_or(ApiError::Unauthorized)
    }
}

impl FromRequestParts<AppState> for OptionalAuthArtist {
    type Rejection = ApiError;
    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> std::result::Result<Self, Self::Rejection> {
        Ok(Self(parts_to_auth(parts, state)?))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn correct_owner_accepted() {
        let artist = AuthArtist {
            handle: "test".to_string(),
            role: Role::Artist,
        };
        assert!(artist.require_owner("test").is_ok());
    }
    #[test]
    fn correct_role_accepted() {
        let artist = AuthArtist {
            handle: "test".to_string(),
            role: Role::Admin,
        };
        assert!(artist.require_admin().is_ok());
    }

    #[test]
    fn incorrect_owner_rejected() {
        let artist = AuthArtist {
            handle: "test".to_string(),
            role: Role::Artist,
        };
        assert!(artist.require_owner("test2").is_err());
    }
    #[test]
    fn incorrect_role_rejected() {
        let artist = AuthArtist {
            handle: "test".to_string(),
            role: Role::Artist,
        };
        assert!(artist.require_admin().is_err());
    }
}
