fn main() {
    let password = std::env::args().nth(1).expect("password argument required");
    assert!(
        !(password.len() < 8 || password.len() > 128),
        "Password must be between 8 and 128 characters"
    );
    let password_hash = linkr_api::auth::password::hash(&password).unwrap();
    println!("{password_hash}");
}
