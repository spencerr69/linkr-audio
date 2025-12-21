DROP TABLE IF EXISTS Releases;
CREATE TABLE IF NOT EXISTS Releases
(
    slug         TEXT PRIMARY KEY,
    upc          TEXT    not null,
    title        TEXT    not null,
    artist_name  TEXT    not null,
    artist_id    TEXT    not null,
    artwork      TEXT,
    links        TEXT,
    track_count  INTEGER not null,
    release_date TEXT    not null,
    FOREIGN KEY (artist_id) REFERENCES Artists (artist_id)
);

DROP TABLE IF EXISTS Artists;
CREATE TABLE IF NOT EXISTS Artists
(
    artist_id          TEXT NOT NULL PRIMARY KEY,
    master_artist_name TEXT NOT NULL,
    styling            TEXT,
    pw_hash            TEXT
);
INSERT INTO Artists (artist_id, master_artist_name, styling, pw_hash)
VALUES ('sr', 'Spencer Raymond', null, '1a8db61ffa4484cd0174da464a69e4a1c5585d50fa2dad9055b1b24b49578508');


