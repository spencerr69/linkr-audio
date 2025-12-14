mod artists;
mod auth;
mod links;

use crate::links::get_links_by_upc;
use worker::{Context, Env, Headers, Request, Response, Router};

use crate::artists::post_create_artist;
use worker_macros::event;

#[event(fetch)]
async fn fetch(req: Request, env: Env, _ctx: Context) -> worker::Result<Response> {
    let router = Router::new();

    router
        .get_async("/links/:upc", get_links_by_upc)
        .post_async("/artists", post_create_artist)
        .run(req, env)
        .await
}

pub fn authenticated_request(headers: &Headers) -> bool {
    //TODO: Implement authentication logic maybe... this is really just to make sure no bots can fuck with stuff
    headers.get("check").unwrap_or(None).is_some()
}
