# linkr.audio

linkr.audio is an open-source release link site designed to be simple, customisable, and free.

## Development

To run linkr.audio in development mode, you must run the site and the api at the same time.

In one terminal, run the following:

```aiignore
cd api
npx wrangler dev
# This will start the Rust cloudflare worker.
```

At the same time, run the following in another terminal

```aiignore
cd site
pnpm dev
# This will start the nextjs site in dev mode.
```

