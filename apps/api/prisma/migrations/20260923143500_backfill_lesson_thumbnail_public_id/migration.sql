UPDATE "lessons"
SET "thumbnail_public_id" = regexp_replace(
  "thumbnail_url",
  '^.*/upload/(?:v[0-9]+/)?(.+)\.[^.]+$',
  '\1'
)
WHERE "thumbnail_public_id" IS NULL
  AND "thumbnail_url" LIKE '%res.cloudinary.com/%/upload/%';
