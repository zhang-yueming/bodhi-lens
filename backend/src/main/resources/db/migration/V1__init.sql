CREATE TABLE items (
    id         BIGSERIAL PRIMARY KEY,
    material   VARCHAR(20)    NOT NULL,
    period     VARCHAR(100),
    length_cm  NUMERIC(10, 2),
    width_cm   NUMERIC(10, 2),
    height_cm  NUMERIC(10, 2),
    source     VARCHAR(500),
    remarks    TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE item_images (
    id         BIGSERIAL PRIMARY KEY,
    item_id    BIGINT REFERENCES items (id) ON DELETE CASCADE,
    s3_key     VARCHAR(500) NOT NULL,
    is_main    BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order INTEGER      NOT NULL DEFAULT 0,
    created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_items_material ON items (material);
CREATE INDEX idx_items_period ON items (period);
CREATE INDEX idx_items_source ON items (source);
CREATE INDEX idx_item_images_item_id ON item_images (item_id);
