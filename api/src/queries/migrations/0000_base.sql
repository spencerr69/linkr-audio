CREATE TABLE IF NOT EXISTS Artists
(
    artist_id          TEXT NOT NULL PRIMARY KEY,
    master_artist_name TEXT NOT NULL,
    styling            TEXT,
    links              TEXT,
    pw_hash            TEXT
);

CREATE TABLE IF NOT EXISTS Releases
(
    slug         TEXT PRIMARY KEY,
    upc          TEXT    NOT NULL,
    title        TEXT    NOT NULL,
    artist_name  TEXT    NOT NULL,
    artist_id    TEXT    NOT NULL,
    artwork      TEXT,
    links        TEXT,
    track_count  INTEGER NOT NULL,
    release_date TEXT    NOT NULL,
    FOREIGN KEY (artist_id) REFERENCES Artists (artist_id)
);