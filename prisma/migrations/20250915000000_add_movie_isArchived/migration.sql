-- Focused migration to add isArchived boolean column to Movie
-- This migration avoids resetting the dev database and preserves data
BEGIN;
ALTER TABLE "Movie"
ADD COLUMN "isArchived" boolean DEFAULT false;
COMMIT;
