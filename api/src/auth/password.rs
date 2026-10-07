use crate::Result;
use crate::error::ApiError;
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use garde::Validate;
use serde::Deserialize;
use utoipa::ToSchema;

#[derive(Validate, Deserialize, ToSchema)]
#[garde(transparent)]
pub struct Password(#[garde(length(min = 8, max = 128))] pub String);

pub fn hash(password: &Password) -> Result<String> {
    Argon2::default()
        .hash_password(password.0.as_bytes())
        .map(|hash| hash.to_string())
        .map_err(move |err| ApiError::Internal(format!("Couldn't hash password: {err}")))
}

#[must_use]
pub fn verify(password: &Password, phc: &str) -> bool {
    let Ok(parsed) = PasswordHash::new(phc) else {
        return false;
    };

    Argon2::default()
        .verify_password(password.0.as_bytes(), &parsed)
        .is_ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn verify_returns_true_for_correct_password() {
        let password = Password("password".into());
        let hash = hash(&password).unwrap();
        assert!(verify(&password, &hash));
    }

    #[test]
    fn verify_returns_false_for_incorrect_password() {
        let password = Password("password".into());
        let hash = hash(&password).unwrap();
        assert!(!verify(&Password("wrong_password".into()), &hash));
    }

    #[test]
    fn verify_returns_false_for_incorrect_hash() {
        let password = Password("password".into());
        assert!(!verify(&password, "wrong_hash"));
    }

    #[test]
    fn verify_returns_false_for_incorrect_password_and_hash() {
        assert!(!verify(&Password("wrong_password".into()), "wrong_hash"));
    }

    #[test]
    fn same_password_twice() {
        let password = Password("password".into());
        let hash1 = hash(&password).unwrap();
        let hash2 = hash(&password).unwrap();
        assert_ne!(hash1, hash2);
        assert!(verify(&password, &hash1));
        assert!(verify(&password, &hash2));
    }
}
