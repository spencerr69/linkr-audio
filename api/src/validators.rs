use worker::Url;

pub const RESERVED_SLUGS: &[&str] = &["api", "site", "images", "admin", "_next", "cdn-cgi"];
pub const RESERVED_HANDLES: &[&str] = &["www", "api", "b", "admin", "recent"];

pub fn slug(value: &str, _: &()) -> garde::Result {
    if RESERVED_SLUGS.contains(&value) {
        return Err(garde::Error::new("slug is reserved"));
    }

    if value.len() > 64 {
        return Err(garde::Error::new("slug must be less than 64 characters"));
    }
    if value.is_empty() {
        return Err(garde::Error::new("slug must be at least 1 character"));
    }

    let valid = value.chars().all(|c| c.is_alphanumeric() || c == '-')
        && value.chars().next().unwrap_or('-') != '-'
        && value.chars().last().unwrap_or('-') != '-';

    if !valid {
        return Err(garde::Error::new(
            "slug must be alphanumeric, and cannot start or end with '-'",
        ));
    }

    Ok(())
}

pub fn handle(value: &str, _: &()) -> garde::Result {
    if RESERVED_HANDLES.contains(&value) {
        return Err(garde::Error::new("handle is reserved"));
    }

    if value.len() > 64 {
        return Err(garde::Error::new("handle must be less than 64 characters"));
    }
    if value.is_empty() {
        return Err(garde::Error::new("handle must be at least 1 character"));
    }

    let valid = value.chars().all(|c| c.is_alphanumeric() || c == '-')
        && value.chars().next().unwrap_or('-') != '-'
        && value.chars().last().unwrap_or('-') != '-';

    if !valid {
        return Err(garde::Error::new("handle must be alphanumeric"));
    }

    Ok(())
}
pub fn https_url(value: &str, _: &()) -> garde::Result {
    let url = Url::parse(value).map_err(|_| garde::Error::new("invalid URL"))?;
    if !url.scheme().eq_ignore_ascii_case("https") {
        return Err(garde::Error::new("URL must use https"));
    }
    if !url.has_host() {
        return Err(garde::Error::new("URL must have a host"));
    }
    Ok(())
}
pub fn hex_colour(value: &str, _: &()) -> garde::Result {
    if value.len() != 7 {
        return Err(garde::Error::new("hex colour must be 7 characters"));
    }
    if !value.starts_with('#') {
        return Err(garde::Error::new("hex colour must start with '#'"));
    }
    if !value[1..].chars().all(|c| c.is_ascii_hexdigit()) {
        return Err(garde::Error::new("hex colour must be hex digits only"));
    }
    Ok(())
}

pub fn upc(value: &str, _: &()) -> garde::Result {
    if value.len() > 24 {
        return Err(garde::Error::new("UPC must be less than 24 characters"));
    }
    if !value.chars().all(|c| c.is_ascii_digit()) {
        return Err(garde::Error::new("UPC must be digits only"));
    }
    Ok(())
}

pub fn iso_date(value: &str, _: &()) -> garde::Result {
    let bytes = value.as_bytes();
    let shape_ok = bytes.len() == 10
        && bytes[4] == b'-'
        && bytes[7] == b'-'
        && bytes
            .iter()
            .enumerate()
            .all(|(i, b)| i == 4 || i == 7 || b.is_ascii_digit());
    if !shape_ok {
        return Err(garde::Error::new("date must be in the format YYYY-MM-DD"));
    }

    let number = |range: std::ops::Range<usize>| {
        bytes[range]
            .iter()
            .fold(0u32, |n, b| n * 10 + u32::from(b - b'0'))
    };
    let year = number(0..4);
    let month = number(5..7);
    let day = number(8..10);

    let leap = (year.is_multiple_of(4) && !year.is_multiple_of(100)) || year.is_multiple_of(400);
    let days_in_month = match month {
        1 | 3 | 5 | 7 | 8 | 10 | 12 => 31,
        4 | 6 | 9 | 11 => 30,
        2 if leap => 29,
        2 => 28,
        _ => return Err(garde::Error::new("date month must be 01-12")),
    };
    if !(1..=days_in_month).contains(&day) {
        return Err(garde::Error::new("date day is not valid for that month"));
    }

    Ok(())
}

pub fn artwork_key(value: &str, _: &()) -> garde::Result {
    if value.is_empty() {
        return Err(garde::Error::new(
            "artwork key must be more than 1 character",
        ));
    }
    if !value
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '.' || c == '_' || c == '/')
    {
        return Err(garde::Error::new(
            "artwork key must be alphanumeric or hyphen",
        ));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn slugs() {
        let table = vec![
            ("hi", true),
            ("abc123", true),
            ("123abc", true),
            ("", false),
            ("$$$", false),
            ("W$GIA", false),
            ("-poop", false),
        ];

        for (input, ok) in table {
            assert_eq!(slug(input, &()).is_ok(), ok);
        }
    }

    #[test]
    fn handles() {
        let table = vec![
            ("hi", true),
            ("abc123", true),
            ("123abc", true),
            ("", false),
            ("$$$", false),
            ("W$GIA", false),
            ("-poop", false),
        ];

        for (input, ok) in table {
            assert_eq!(handle(input, &()).is_ok(), ok);
        }
    }

    #[test]
    fn urls() {
        let table = vec![
            ("https://hi.com", true),
            ("http://hi.com", false),
            ("www.google.com", false),
            ("https://x", true),
            ("https://", false),
        ];

        for (input, ok) in table {
            assert_eq!(https_url(input, &()).is_ok(), ok);
        }
    }

    #[test]
    fn hexes() {
        let table = vec![
            ("#123AAA", true),
            ("#GGGGGG", false),
            ("#", false),
            ("#FF0000", true),
            ("#0101010", false),
        ];

        for (input, ok) in table {
            assert_eq!(hex_colour(input, &()).is_ok(), ok);
        }
    }

    #[test]
    fn upcs() {
        let table = vec![
            ("01928476932924", true),
            ("0060248017294587", true),
            ("#", false),
            ("1", true),
            ("", true),
        ];

        for (input, ok) in table {
            assert_eq!(upc(input, &()).is_ok(), ok);
        }
    }

    #[test]
    fn dates() {
        let table = vec![
            ("2026-02-30", false),
            ("2023-02-29", false),
            ("2004-03-17", true),
            ("1900-02-29", false),
            ("2026-13-01", false),
            ("2026-1-1", false),
        ];

        for (input, ok) in table {
            assert_eq!(iso_date(input, &()).is_ok(), ok);
        }
    }

    #[test]
    fn artwork_keys() {
        let table = vec![
            ("are/asjdklghalksdjflkalsdg.jpg", true),
            ("sr/ciodsjagh.png", true),
            ("2004**03-17", false),
            ("1900-02-29", true),
            ("\\\\\\\\", false),
            ("Fuck", true),
        ];

        for (input, ok) in table {
            assert_eq!(artwork_key(input, &()).is_ok(), ok);
        }
    }
}
