-- Drop All Tables and Sequences
-- Execute this query first to clean up database, then execute schema.sql

-- Drop all tables (CASCADE will also drop dependent objects)
DROP TABLE IF EXISTS public.upload_document_admedika CASCADE;
DROP TABLE IF EXISTS public.transaksi_pasien_admedika CASCADE;
DROP TABLE IF EXISTS public.response_api_admedika CASCADE;
DROP TABLE IF EXISTS public.registrasi_pasien_admedika CASCADE;
DROP TABLE IF EXISTS public.menu_access CASCADE;
DROP TABLE IF EXISTS public.document_types_admedika CASCADE;
DROP TABLE IF EXISTS public.coverage_type_admedika CASCADE;
DROP TABLE IF EXISTS public.benefit_pasien_admedika CASCADE;

-- Drop all sequences
DROP SEQUENCE IF EXISTS public.upload_document_admedika_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.transaksi_pasien_admedika_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.response_api_admedika_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.registrasi_pasien_admedika_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.menu_access_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.document_types_admedika_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.benefit_pasien_admedika_id_seq CASCADE;

-- Verify all tables are dropped
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
