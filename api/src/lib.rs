mod artists;
mod auth;
mod links;
mod releases;

use crate::links::get_links_by_upc;
use worker::{Context, Env, Request, Response, Router};

use crate::artists::{get_artist, post_change_password, post_create_artist, post_edit_artist};
use crate::auth::login;
use crate::releases::{
    delete_release, get_release, get_releases_for_artist, post_edit_release, post_new_release,
};
use worker_macros::event;

#[event(fetch)]
async fn fetch(req: Request, env: Env, _ctx: Context) -> worker::Result<Response> {
    let router = Router::new();

    router
        //Auth
        .get_async("/auth/login", login)
        //Get Links
        .get_async("/links/:upc", get_links_by_upc)
        //Artist Management
        .get_async("/artists/:id", get_artist)
        .post_async("/artists", post_create_artist)
        .post_async("/artists/:id", post_edit_artist)
        .post_async("/artists/:id/password", post_change_password)
        //Release Management
        .get_async("/releases/:id/:slug", get_release)
        .get_async("/releases/:id", get_releases_for_artist)
        .post_async("/releases/:id", post_new_release)
        .post_async("/releases/:id/:slug", post_edit_release)
        .delete_async("/releases/:id/:slug", delete_release)
        .run(req, env)
        .await
}
