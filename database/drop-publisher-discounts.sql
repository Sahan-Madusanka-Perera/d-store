-- Remove the publisher discount system.
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor).
--
-- Superseded by two things that between them cover what it was for: quantity_discounts
-- for category-wide rules, and the per-product discount_eligible flag for the
-- "3 or more eligible items" bundle. The table held no rows when it was removed, so
-- nothing is being discarded — but this is still a DROP, so take the backup Supabase
-- offers before running it if you want the option of changing your mind.
--
-- The application code no longer references this table. Running this is optional
-- housekeeping; leaving the table in place is harmless.

DROP TABLE IF EXISTS public.publisher_discounts;
