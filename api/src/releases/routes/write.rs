use crate::link::Link;
use crate::releases::row::ReleaseStatus;
use crate::validators;
use garde::Validate;
use serde::Deserialize;
use utoipa::ToSchema;

#[derive(Deserialize, Validate, ToSchema)]
pub struct NewRelease {
    #[garde(custom(validators::slug))]
    pub slug: String,
    #[garde(length(chars, min = 1, max = 200))]
    pub title: String,
    #[garde(inner(length(chars, max = 200)))]
    pub artist_credit: Option<String>,
    #[garde(inner(custom(validators::upc)))]
    pub upc: Option<String>,
    #[garde(custom(validators::iso_date))]
    pub release_date: String,
    #[garde(range(min = 1, max = 999))]
    pub track_count: u32,
    #[garde(inner(custom(validators::artwork_key)))]
    pub artwork_key: Option<String>,
    #[garde(length(max = 20), dive)]
    pub links: Vec<Link>,
    #[garde(skip)]
    pub status: ReleaseStatus,
}

#[derive(Deserialize, Validate, ToSchema)]
pub struct EditRelease {
    #[garde(length(chars, min = 1, max = 200))]
    pub title: String,
    #[garde(inner(length(chars, max = 200)))]
    pub artist_credit: Option<String>,
    #[garde(inner(custom(validators::upc)))]
    pub upc: Option<String>,
    #[garde(custom(validators::iso_date))]
    pub release_date: String,
    #[garde(range(min = 1, max = 999))]
    pub track_count: u32,
    #[garde(inner(custom(validators::artwork_key)))]
    pub artwork_key: Option<String>,
    #[garde(length(max = 20), dive)]
    pub links: Vec<Link>,
    #[garde(skip)]
    pub status: ReleaseStatus,
}
