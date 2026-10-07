# api.linkr.audio

api for getting music links, storing them as releases under artists. This is a cloudflare worker written in Rust
using worker-rs.

run the below command to get the hash to manually change a password via SQL

```bash
cargo run --features cli --bin hash-password <password>
```

then run it against the database with

```bash
npx wrangler d1 execute <db-name> (--local|--remote) --file set-password.sql
```