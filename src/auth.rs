use sha2::Digest;

pub fn salt_and_hash(raw_pw: &str, raw_id: &str) -> String {
    let mut hasher = sha2::Sha256::default();
    hasher.update((raw_pw.to_owned() + raw_id).as_bytes());
    let out = hasher.finalize();
    format!("{:x}", out)
}
