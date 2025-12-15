use crate::auth::authenticated;
use serde::{Deserialize, Serialize};
use worker::wasm_bindgen::JsValue;
use worker::{Request, Response, RouteContext};

#[derive(Serialize, Deserialize)]
pub struct ReleaseBody {
    pub upc: String,
    pub title: String,
    pub artist_name: String,
    pub release_date: String,
    pub artwork: String,
    pub links: Vec<Link>,

    pub track_count: u32,
}

#[derive(Serialize, Deserialize)]
pub struct Link {
    name: String,
    url: String,
}

#[derive(Serialize, Deserialize)]
pub struct DbSchema {
    pub slug: String,
    pub upc: String,
    pub title: String,
    pub artist_name: String,
    pub release_date: String,
    pub artwork: Option<String>,
    pub spotify: Option<String>,
    pub apple_music: Option<String>,
    pub tidal: Option<String>,
    pub bandcamp: Option<String>,
    pub soundcloud: Option<String>,
    pub youtube: Option<String>,
    pub track_count: u32,
}

pub async fn get_release(_req: Request, ctx: RouteContext<()>) -> worker::Result<Response> {
    let (Some(artist_id), Some(slug)) = (ctx.param("id"), ctx.param("slug")) else {
        return Response::error("Missing artist id or slug", 400);
    };

    let d1 = ctx.d1("prod_sr_db")?;

    let query = d1.prepare("SELECT * FROM Releases WHERE artist_id = ?1 AND slug = ?2");
    let binded = query.bind(&[JsValue::from(artist_id), JsValue::from(slug)])?;

    let Some(release): Option<DbSchema> = binded.first(None).await? else {
        return Response::error("Release not found", 404);
    };

    let links = concat_links(&release);

    let out: ReleaseBody = ReleaseBody {
        upc: release.upc,
        title: release.title,
        artist_name: release.artist_name,
        release_date: release.release_date,
        artwork: release.artwork.unwrap_or_default(),
        links,
        track_count: release.track_count,
    };

    Response::from_json(&out)
}

fn concat_links(release: &DbSchema) -> Vec<Link> {
    let mut links = vec![];
    if let Some(spotify) = &release.spotify {
        links.push(Link {
            name: "spotify".to_string(),
            url: spotify.clone(),
        })
    }
    if let Some(apple_music) = &release.apple_music {
        links.push(Link {
            name: "apple_music".to_string(),
            url: apple_music.clone(),
        })
    }
    if let Some(tidal) = &release.tidal {
        links.push(Link {
            name: "tidal".to_string(),
            url: tidal.clone(),
        })
    }
    if let Some(bandcamp) = &release.bandcamp {
        links.push(Link {
            name: "bandcamp".to_string(),
            url: bandcamp.clone(),
        })
    }
    if let Some(soundcloud) = &release.soundcloud {
        links.push(Link {
            name: "soundcloud".to_string(),
            url: soundcloud.clone(),
        })
    }
    if let Some(youtube) = &release.youtube {
        links.push(Link {
            name: "youtube".to_string(),
            url: youtube.clone(),
        })
    }
    links
}

/// Handles POST request to create a new release for an artist
///
/// ### Request Body
/// ```
/// {
///         pub slug: String,
///         pub upc: String,
///         pub title: String,
///         pub artist_name: String,
///         pub artwork: Option<String>,
///         pub spotify: Option<String>,
///         pub apple_music: Option<String>,
///         pub tidal: Option<String>,
///         pub bandcamp: Option<String>,
///         pub soundcloud: Option<String>,
///         pub youtube: Option<String>,
///         pub track_count: u32,
///     }
///```
pub async fn post_new_release(mut req: Request, ctx: RouteContext<()>) -> worker::Result<Response> {
    let Some(artist_id) = ctx.param("id") else {
        return Response::error("No artist id provided", 400);
    };

    let d1 = ctx.d1("prod_sr_db")?;

    if !authenticated(req.headers(), d1, Some(artist_id)).await {
        return Response::error("Unauthorized", 401);
    }

    #[derive(Serialize, Deserialize)]
    struct PostNewReleaseBody {
        pub slug: String,
        pub upc: String,
        pub title: String,
        pub release_date: String,
        pub artist_name: String,
        pub artwork: String,
        pub links: Vec<Link>,
        pub track_count: u32,
    }

    let Ok(new_release) = req.json::<PostNewReleaseBody>().await else {
        return Response::error(
            "JSON incorrectly formatted. Please ensure you meet the schema.",
            400,
        );
    };

    let d1 = ctx.d1("prod_sr_db")?;

    let (spotify, apple_music, tidal, bandcamp, soundcloud, youtube) =
        get_seperate_links(&new_release.links);
    let query =  d1.prepare("INSERT INTO Releases (slug, upc, title, artist_name, artist_id, artwork, spotify, apple_music, tidal, bandcamp, soundcloud, youtube, track_count, release_date) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)");
    let binded = query.bind(&[
        JsValue::from(new_release.slug),
        JsValue::from(new_release.upc),
        JsValue::from(new_release.title),
        JsValue::from(new_release.artist_name),
        JsValue::from(artist_id),
        JsValue::from(new_release.artwork),
        JsValue::from(spotify),
        JsValue::from(apple_music),
        JsValue::from(tidal),
        JsValue::from(bandcamp),
        JsValue::from(soundcloud),
        JsValue::from(youtube),
        JsValue::from(new_release.track_count),
        JsValue::from(new_release.release_date),
    ])?;

    let result = binded.run().await?;

    if result.success() {
        return Response::ok("Release created successfully");
    }

    Response::error("Release not created. Likely already exists.", 500)
}

fn get_seperate_links(
    links: &Vec<Link>,
) -> (
    Option<String>,
    Option<String>,
    Option<String>,
    Option<String>,
    Option<String>,
    Option<String>,
) {
    links.iter().fold(
        (None, None, None, None, None, None),
        |(mut spotify, mut apple_music, mut tidal, mut bandcamp, mut soundcloud, mut youtube),
         link| {
            match link.name.as_str() {
                "spotify" => spotify = Some(link.url.clone()),
                "apple_music" => apple_music = Some(link.url.clone()),
                "tidal" => tidal = Some(link.url.clone()),
                "bandcamp" => bandcamp = Some(link.url.clone()),
                "soundcloud" => soundcloud = Some(link.url.clone()),
                "youtube" => youtube = Some(link.url.clone()),
                _ => {}
            };

            (spotify, apple_music, tidal, bandcamp, soundcloud, youtube)
        },
    )
}

/// Handles POST request to edit a release for an artist
///
/// ### Request Body
/// ```
/// {
///         pub slug: String,
///         pub upc: String,
///         pub title: String,
///         pub artist_name: String,
///         pub artwork: Option<String>,
///         pub spotify: Option<String>,
///         pub apple_music: Option<String>,
///         pub tidal: Option<String>,
///         pub bandcamp: Option<String>,
///         pub soundcloud: Option<String>,
///         pub youtube: Option<String>,
///         pub track_count: u32,
///     }
///```
pub async fn post_edit_release(
    mut req: Request,
    ctx: RouteContext<()>,
) -> worker::Result<Response> {
    let (Some(artist_id), Some(slug)) = (ctx.param("id"), ctx.param("slug")) else {
        return Response::error("No artist id or slug provided", 400);
    };

    let d1 = ctx.d1("prod_sr_db")?;

    if !authenticated(req.headers(), d1, Some(artist_id)).await {
        return Response::error("Unauthorized", 401);
    }

    let Ok(new_release) = req.json::<ReleaseBody>().await else {
        return Response::error(
            "JSON incorrectly formatted. Please ensure you meet the schema.",
            400,
        );
    };

    let (spotify, apple_music, tidal, bandcamp, soundcloud, youtube) =
        get_seperate_links(&new_release.links);

    let d1 = ctx.d1("prod_sr_db")?;
    let query =  d1.prepare("REPLACE INTO Releases (slug, upc, title, artist_name, artist_id, artwork, spotify, apple_music, tidal, bandcamp, soundcloud, youtube, track_count, release_date) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)");
    let binded = query.bind(&[
        JsValue::from(slug),
        JsValue::from(new_release.upc),
        JsValue::from(new_release.title),
        JsValue::from(new_release.artist_name),
        JsValue::from(artist_id),
        JsValue::from(new_release.artwork),
        JsValue::from(spotify),
        JsValue::from(apple_music),
        JsValue::from(tidal),
        JsValue::from(bandcamp),
        JsValue::from(soundcloud),
        JsValue::from(youtube),
        JsValue::from(new_release.track_count),
        JsValue::from(new_release.release_date),
    ])?;

    let result = binded.run().await?;

    if result.success() {
        return Response::ok("Release created successfully");
    }

    Response::error("Release not created. Likely already exists.", 500)
}
