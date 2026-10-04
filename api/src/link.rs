use crate::validators;
use garde::Validate;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Clone, Serialize, Deserialize, Validate, ToSchema)]
pub struct Link {
    #[garde(length(chars, min = 1, max = 50))]
    pub name: String,
    #[garde(custom(validators::https_url))]
    pub url: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_name() {
        let link = Link {
            name: "".to_string(),
            url: "https://something.com".to_string(),
        };

        assert!(link.validate().is_err());
    }

    #[test]
    fn good_link() {
        let link = Link {
            name: "Name!".to_string(),
            url: "https://google.com".to_string(),
        };

        assert!(link.validate().is_ok());
    }

    #[test]
    fn bad_url() {
        let link = Link {
            name: "Bad url BTW!".to_string(),
            url: "http://w.xyz".to_string(),
        };

        assert!(link.validate().is_err());
    }
}
