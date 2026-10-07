use crate::error::ApiError;
use std::sync::Arc;
use worker::{D1Database, Env};

const DB_NAME: &str = "prod_sr_db";
const SESSION_SECRET: &str = "SESSION_SECRET";
const PUBLIC_HOST: &str = "PUBLIC_HOST";
const ARTWORK_URL_PREFIX: &str = "ARTWORK_URL_PREFIX";
const LOGIN_LIMITER: &str = "LOGIN_LIMITER";

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<D1Database>,
    pub session_secret: Arc<str>,
    pub public_host: Arc<str>,
    pub artwork_url_prefix: Arc<str>,
    pub login_limiter: Arc<worker::RateLimiter>,
}

impl AppState {
    pub fn from_env(env: &Env) -> Result<Self, ApiError> {
        Ok(Self {
            db: Arc::new(env.d1(DB_NAME)?),
            session_secret: Arc::from(env.var(SESSION_SECRET)?.to_string()),
            public_host: Arc::from(env.var(PUBLIC_HOST)?.to_string()),
            artwork_url_prefix: Arc::from(env.var(ARTWORK_URL_PREFIX)?.to_string()),
            login_limiter: Arc::new(env.rate_limiter(LOGIN_LIMITER)?),
        })
    }
}
