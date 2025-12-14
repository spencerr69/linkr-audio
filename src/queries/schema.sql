DROP TABLE IF EXISTS Artists;
CREATE TABLE IF NOT EXISTS Artists
(
    artist_id          TEXT NOT NULL PRIMARY KEY,
    master_artist_name TEXT NOT NULL,
    styling            TEXT,
    pw_hash            TEXT
);
INSERT INTO Artists (artist_id, master_artist_name, styling, pw_hash)
VALUES ('dummy', 'Dummy', null, 'Dummy');


DROP TABLE IF EXISTS Releases;
CREATE TABLE IF NOT EXISTS Releases
(
    upc         TEXT PRIMARY KEY,
    title       TEXT,
    artist_name TEXT,
    artist_id   TEXT not null,
    artwork     TEXT,
    spotify     TEXT,
    apple_music TEXT,
    tidal       TEXT,
    bandcamp    TEXT,
    soundcloud  TEXT,
    youtube     TEXT,
    FOREIGN KEY (artist_id) REFERENCES Artists (artist_id)
);