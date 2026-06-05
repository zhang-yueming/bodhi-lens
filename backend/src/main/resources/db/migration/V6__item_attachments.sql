CREATE TABLE item_attachments (
    id           BIGSERIAL PRIMARY KEY,
    item_id      BIGINT REFERENCES items(id) ON DELETE CASCADE,
    s3_key       VARCHAR(500) NOT NULL,
    filename     VARCHAR(500) NOT NULL,
    content_type VARCHAR(200),
    file_size    BIGINT,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_item_attachments_item_id ON item_attachments(item_id);
