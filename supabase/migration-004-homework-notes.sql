-- Migration 004: Add notes column to homework
-- Allows users to add personal notes to homework assignments

ALTER TABLE public.homework ADD COLUMN notes text;
