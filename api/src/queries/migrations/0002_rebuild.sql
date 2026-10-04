-- Migration number: 0002 	 2026-10-04T06:11:43.358Z
CREATE TABLE artists_new
(
    id            INTEGER PRIMARY KEY,
    handle        TEXT NOT NULL UNIQUE
        CHECK (length(handle) BETWEEN 1 AND 63 AND handle NOT GLOB '*[^a-z0-9-]*'),
    name          TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 200),
    links         TEXT NOT NULL DEFAULT '[]'
        CHECK (json_valid(links) AND json_type(links) = 'array'),
    styling       TEXT CHECK (styling IS NULL OR (json_valid(styling) AND json_type(styling) = 'object')),
    role          TEXT NOT NULL DEFAULT 'artist' CHECK (role IN ('artist', 'admin')),
    password_hash TEXT,
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT INTO artists_new (handle, name, links, styling, role, password_hash)
SELECT artist_id,
       master_artist_name,
       COALESCE((SELECT json_group_array(json(value))
                 FROM json_each(Artists.links)
                 WHERE json_extract(value, '$.url') <> ''), '[]'),
       NULLIF(styling, ''),
       CASE WHEN artist_id = 'sr' THEN 'admin' ELSE 'artist' END,
       NULL
FROM Artists;

CREATE TABLE releases_new
(
    id            INTEGER PRIMARY KEY,
    artist_id     INTEGER NOT NULL REFERENCES artists_new (id) ON DELETE RESTRICT,
    slug          TEXT    NOT NULL
        CHECK (length(slug) BETWEEN 1 AND 63 AND slug NOT GLOB '*[^a-z0-9-]*'),
    title         TEXT    NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
    artist_credit TEXT CHECK (artist_credit IS NULL OR length(artist_credit) BETWEEN 1 AND 200),
    upc           TEXT CHECK (upc IS NULL OR (length(upc) > 0 AND upc NOT GLOB '*[^0-9]*')),
    release_date  TEXT    NOT NULL
        CHECK (release_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
            AND date(release_date) = release_date),
    track_count   INTEGER NOT NULL CHECK (track_count BETWEEN 1 AND 999),
    artwork_key   TEXT CHECK (artwork_key IS NULL OR
                              (length(artwork_key) > 0 AND artwork_key NOT GLOB '*[^A-Za-z0-9._/-]*')),
    links         TEXT    NOT NULL DEFAULT '[]'
        CHECK (json_valid(links) AND json_type(links) = 'array'),
    status        TEXT    NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'unlisted', 'public')),
    created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (artist_id, slug)
);

INSERT INTO releases_new (artist_id, slug, title, artist_credit, upc, release_date, track_count, artwork_key, links,
                          status)
SELECT a.id,
       r.slug,
       r.title,
       NULLIF(r.artist_name, a.name),
       NULLIF(r.upc, ''),
       r.release_date,
       r.track_count,
       CASE
           WHEN r.artwork LIKE 'https://linkr.audio/images?image=%'
               THEN substr(r.artwork, length('https://linkr.audio/images?image=') + 1)
           ELSE r.artwork END,
       COALESCE(r.links, '[]'),
       CASE WHEN r.active = 1 THEN 'public' ELSE 'unlisted' END
FROM Releases r
         JOIN artists_new a ON a.handle = r.artist_id;

DROP TABLE Releases;
DROP TABLE Artists;
ALTER TABLE artists_new
    RENAME TO artists;
ALTER TABLE releases_new
    RENAME TO releases;

CREATE INDEX releases_public_by_date ON releases (release_date DESC) WHERE status = 'public';
CREATE INDEX releases_by_artist_date ON releases (artist_id, release_date DESC);

CREATE TRIGGER artists_touch_updated_at
    AFTER UPDATE
    ON artists
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE artists SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER releases_touch_updated_at
    AFTER UPDATE
    ON releases
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE releases SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;
