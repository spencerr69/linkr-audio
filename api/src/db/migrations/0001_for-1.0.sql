-- Migration number: 0001 	 2026-02-01T06:33:47.608Z
ALTER TABLE Releases
    ADD COLUMN active boolean
        DEFAULT true;

