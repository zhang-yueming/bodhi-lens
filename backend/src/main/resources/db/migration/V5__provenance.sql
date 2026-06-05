CREATE TABLE provenance (
    id         BIGSERIAL PRIMARY KEY,
    item_id    BIGINT  NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    text       TEXT    NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_provenance_item_id ON provenance(item_id);
