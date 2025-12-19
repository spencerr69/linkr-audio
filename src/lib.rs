mod artists;
mod auth;
mod links;
mod releases;

use crate::links::get_links_by_upc;
use worker::{Context, Env, Request, Response, Router};

use crate::artists::{get_artist, post_create_artist};
use crate::auth::login;
use crate::releases::{get_release, get_releases_for_artist, post_edit_release, post_new_release};
use worker_macros::event;

#[event(fetch)]
async fn fetch(req: Request, env: Env, _ctx: Context) -> worker::Result<Response> {
    let router = Router::new();

    router
        .get_async("/auth/login", login)
        .get_async("/links/:upc", get_links_by_upc)
        .get_async("/artists/:id", get_artist)
        .post_async("/artists", post_create_artist)
        .get_async("/releases/:id/:slug", get_release)
        .get_async("/releases/:id", get_releases_for_artist)
        .post_async("/releases/:id", post_new_release)
        .post_async("/releases/:id/:slug", post_edit_release)
        .run(req, env)
        .await
}
