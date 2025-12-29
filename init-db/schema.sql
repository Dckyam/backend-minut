--
-- PostgreSQL database dump
--

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: benefit_pasien_admedika; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.benefit_pasien_admedika (
    id integer NOT NULL,
    no_registrasi character varying(50),
    no_claim integer,
    benefit_id integer,
    benefit_name character varying(100),
    avail_limit character varying(50),
    freq_desc character varying(50),
    limit_desc character varying(50)
);


ALTER TABLE public.benefit_pasien_admedika OWNER TO postgres;

--
-- Name: benefit_pasien_admedika_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.benefit_pasien_admedika_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.benefit_pasien_admedika_id_seq OWNER TO postgres;

--
-- Name: benefit_pasien_admedika_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.benefit_pasien_admedika_id_seq OWNED BY public.benefit_pasien_admedika.id;


--
-- Name: coverage_type_admedika; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coverage_type_admedika (
    coverage_id character varying(2) NOT NULL,
    coverage_code character varying(10) NOT NULL,
    description character varying(100) NOT NULL
);


ALTER TABLE public.coverage_type_admedika OWNER TO postgres;

--
-- Name: document_types_admedika; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_types_admedika (
    id integer NOT NULL,
    doc_code character varying(50) NOT NULL,
    doc_name character varying(255) NOT NULL,
    category character varying(50) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.document_types_admedika OWNER TO postgres;

--
-- Name: TABLE document_types_admedika; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.document_types_admedika IS 'Master table for Admedika document types (eForms and Edocs)';


--
-- Name: COLUMN document_types_admedika.doc_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.document_types_admedika.doc_code IS 'Document code sent to Admedika API (e.g., LABORATORIUM, RADIOLOGI)';


--
-- Name: COLUMN document_types_admedika.doc_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.document_types_admedika.doc_name IS 'Display name shown in dropdown';


--
-- Name: COLUMN document_types_admedika.category; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.document_types_admedika.category IS 'Category: eForms or Edocs';


--
-- Name: document_types_admedika_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.document_types_admedika_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.document_types_admedika_id_seq OWNER TO postgres;

--
-- Name: document_types_admedika_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.document_types_admedika_id_seq OWNED BY public.document_types_admedika.id;


--
-- Name: menu_access; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_access (
    id integer NOT NULL,
    nama character varying(255) NOT NULL,
    is_active smallint DEFAULT 1,
    menu text[] DEFAULT '{}'::text[],
    submenu text[] DEFAULT '{}'::text[],
    created_by character varying(100),
    created_date timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by character varying(100),
    updated_date timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.menu_access OWNER TO postgres;

--
-- Name: menu_access_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menu_access_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.menu_access_id_seq OWNER TO postgres;

--
-- Name: menu_access_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_access_id_seq OWNED BY public.menu_access.id;


--
-- Name: registrasi_pasien_admedika; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registrasi_pasien_admedika (
    id integer NOT NULL,
    tanggal_registrasi date,
    no_registrasi character varying(50),
    no_mr character varying(50),
    no_claim integer,
    coverage_id integer,
    coverage_code character varying(20),
    coverage_desc character varying(100),
    nama_pasien character varying(100),
    tanggal_lahir character varying(20),
    nama_layanan character varying(100),
    dokter character varying(100),
    penjamin character varying(100),
    no_kartu character varying(50),
    claim_status integer,
    claim_desc character varying(100),
    icd10 character varying(50),
    amount numeric(18,2),
    acc_amount numeric(18,2),
    decline_amount numeric(18,2),
    created_by character varying(50),
    created_date timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    is_void integer DEFAULT 0,
    void_by character varying(50),
    void_date timestamp(6) without time zone,
    void_remarks text,
    is_claim integer DEFAULT 0,
    claim_by character varying(50),
    claim_date timestamp(6) without time zone
);


ALTER TABLE public.registrasi_pasien_admedika OWNER TO postgres;

--
-- Name: registrasi_pasien_admedika_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registrasi_pasien_admedika_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.registrasi_pasien_admedika_id_seq OWNER TO postgres;

--
-- Name: registrasi_pasien_admedika_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registrasi_pasien_admedika_id_seq OWNED BY public.registrasi_pasien_admedika.id;


--
-- Name: response_api_admedika; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.response_api_admedika (
    id integer NOT NULL,
    no_mr character varying(50),
    no_registrasi character varying(50),
    no_claim integer,
    json_response jsonb,
    is_eligibility integer DEFAULT 0,
    is_claim integer DEFAULT 0
);


ALTER TABLE public.response_api_admedika OWNER TO postgres;

--
-- Name: response_api_admedika_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.response_api_admedika_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.response_api_admedika_id_seq OWNER TO postgres;

--
-- Name: response_api_admedika_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.response_api_admedika_id_seq OWNED BY public.response_api_admedika.id;


--
-- Name: transaksi_pasien_admedika; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transaksi_pasien_admedika (
    id integer NOT NULL,
    no_registrasi character varying(50),
    no_claim integer,
    benefit_id integer,
    benefit_name character varying(100),
    kode_item character varying(50),
    nama_item character varying(100),
    qty integer,
    total_amount numeric(18,2)
);


ALTER TABLE public.transaksi_pasien_admedika OWNER TO postgres;

--
-- Name: transaksi_pasien_admedika_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transaksi_pasien_admedika_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.transaksi_pasien_admedika_id_seq OWNER TO postgres;

--
-- Name: transaksi_pasien_admedika_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transaksi_pasien_admedika_id_seq OWNED BY public.transaksi_pasien_admedika.id;


--
-- Name: upload_document_admedika; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.upload_document_admedika (
    id integer NOT NULL,
    no_registrasi character varying(50) NOT NULL,
    no_mr character varying(50) NOT NULL,
    no_kartu character varying(50) NOT NULL,
    no_claim character varying(50) NOT NULL,
    doc_type character varying(100) NOT NULL,
    remarks text,
    file_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size bigint,
    api_response jsonb,
    uploaded_by character varying(100),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.upload_document_admedika OWNER TO postgres;

--
-- Name: upload_document_admedika_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.upload_document_admedika_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.upload_document_admedika_id_seq OWNER TO postgres;

--
-- Name: upload_document_admedika_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.upload_document_admedika_id_seq OWNED BY public.upload_document_admedika.id;


--
-- Name: benefit_pasien_admedika id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.benefit_pasien_admedika ALTER COLUMN id SET DEFAULT nextval('public.benefit_pasien_admedika_id_seq'::regclass);


--
-- Name: document_types_admedika id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_types_admedika ALTER COLUMN id SET DEFAULT nextval('public.document_types_admedika_id_seq'::regclass);


--
-- Name: menu_access id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_access ALTER COLUMN id SET DEFAULT nextval('public.menu_access_id_seq'::regclass);


--
-- Name: registrasi_pasien_admedika id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrasi_pasien_admedika ALTER COLUMN id SET DEFAULT nextval('public.registrasi_pasien_admedika_id_seq'::regclass);


--
-- Name: response_api_admedika id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.response_api_admedika ALTER COLUMN id SET DEFAULT nextval('public.response_api_admedika_id_seq'::regclass);


--
-- Name: transaksi_pasien_admedika id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaksi_pasien_admedika ALTER COLUMN id SET DEFAULT nextval('public.transaksi_pasien_admedika_id_seq'::regclass);


--
-- Name: upload_document_admedika id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_document_admedika ALTER COLUMN id SET DEFAULT nextval('public.upload_document_admedika_id_seq'::regclass);


--
-- Name: benefit_pasien_admedika benefit_pasien_admedika_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.benefit_pasien_admedika
    ADD CONSTRAINT benefit_pasien_admedika_pkey PRIMARY KEY (id);


--
-- Name: coverage_type_admedika coverage_type_admedika_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coverage_type_admedika
    ADD CONSTRAINT coverage_type_admedika_pkey PRIMARY KEY (coverage_id);


--
-- Name: document_types_admedika document_types_admedika_doc_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_types_admedika
    ADD CONSTRAINT document_types_admedika_doc_code_key UNIQUE (doc_code);


--
-- Name: document_types_admedika document_types_admedika_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_types_admedika
    ADD CONSTRAINT document_types_admedika_pkey PRIMARY KEY (id);


--
-- Name: menu_access menu_access_nama_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_access
    ADD CONSTRAINT menu_access_nama_key UNIQUE (nama);


--
-- Name: menu_access menu_access_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_access
    ADD CONSTRAINT menu_access_pkey PRIMARY KEY (id);


--
-- Name: registrasi_pasien_admedika registrasi_pasien_admedika_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrasi_pasien_admedika
    ADD CONSTRAINT registrasi_pasien_admedika_pkey PRIMARY KEY (id);


--
-- Name: response_api_admedika response_api_admedika_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.response_api_admedika
    ADD CONSTRAINT response_api_admedika_pkey PRIMARY KEY (id);


--
-- Name: transaksi_pasien_admedika transaksi_pasien_admedika_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaksi_pasien_admedika
    ADD CONSTRAINT transaksi_pasien_admedika_pkey PRIMARY KEY (id);


--
-- Name: upload_document_admedika upload_document_admedika_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_document_admedika
    ADD CONSTRAINT upload_document_admedika_pkey PRIMARY KEY (id);


--
-- Name: idx_benefit_no_claim; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_benefit_no_claim ON public.benefit_pasien_admedika USING btree (no_claim);


--
-- Name: idx_benefit_no_registrasi; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_benefit_no_registrasi ON public.benefit_pasien_admedika USING btree (no_registrasi);


--
-- Name: idx_document_types_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_document_types_active ON public.document_types_admedika USING btree (is_active);


--
-- Name: idx_document_types_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_document_types_category ON public.document_types_admedika USING btree (category);


--
-- Name: idx_registrasi_no_claim; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registrasi_no_claim ON public.registrasi_pasien_admedika USING btree (no_claim);


--
-- Name: idx_registrasi_no_registrasi; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registrasi_no_registrasi ON public.registrasi_pasien_admedika USING btree (no_registrasi);


--
--
-- Data for Name: coverage_type_admedika; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.coverage_type_admedika (coverage_id, coverage_code, description) VALUES
('01', 'HNS', 'RAWAT INAP'),
('02', 'GP', 'RAWAT JALAN'),
('03', 'SP', 'PRE & POST'),
('04', 'OP', 'KACAMATA'),
('05', 'DENTAL', 'RAWAT GIGI'),
('06', 'MAT', 'PERSALINAN'),
('07', 'LAB', 'LABORATORY'),
('08', 'PHAR', 'PHARMACY/APOTEK');


---- Data for Name: document_types_admedika; Type: TABLE DATA; Schema: public; Owner: postgres--INSERT INTO public.document_types_admedika (id, doc_code, doc_name, category, description, is_active, sort_order, created_at, updated_at) VALUES(1, 'AL', 'Surat Pernyataan (Authorization Letter)', 'eForms', 'Authorization Letter', true, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(2, 'AP', 'Formulir Penjaminan Biaya (Approved Procedure Form)', 'eForms', 'Approved Procedure Form', true, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(3, 'CL', 'Surat Konfirmasi Medis (Perkembangan, Lanjutan & Konsul)', 'eForms', 'Medical Confirmation Letter', true, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(4, 'DL', 'Surat Penolakan Jaminan Biaya (Decline Letter)', 'eForms', 'Decline Letter', true, 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(5, 'FTDF', 'Fast Track Discharge Form', 'eForms', 'Fast Track Discharge Form', true, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(6, 'GL', 'Surat Jaminan Biaya (Guarantee Letter)', 'eForms', 'Guarantee Letter', true, 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(7, 'LMA', 'Laporan Medis Awal', 'eForms', 'Initial Medical Report', true, 70, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(8, 'PREADMISSION', 'Surat Pre-admission (Pre-Authorization Form)', 'eForms', 'Pre-Authorization Form', true, 80, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(9, 'LABORATORIUM', 'Hasil Pemeriksaan Laboratorium', 'Edocs', 'Laboratory Test Results', true, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(10, 'RADIOLOGI', 'Hasil Pemeriksaan Radiology', 'Edocs', 'Radiology Results', true, 110, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(11, 'INVOICE', 'Perincian Biaya - Pengobatan', 'Edocs', 'Invoice/Treatment Cost Details', true, 120, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(12, 'BILLING', 'Billing Akhir - Jaminan Akhir Rawat Inap (Final Bill)', 'Edocs', 'Final Billing', true, 130, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(13, 'SURAT PERNYATAAN', 'Surat Pernyataan/Persetujuan Tindakan', 'Edocs', 'Action Consent Letter', true, 140, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(14, 'LEMBAR MEDIS AWAL', 'Resume Medis / Lembar Medis Awal', 'Edocs', 'Initial Medical Resume', true, 150, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(15, 'LEMBAR MEDIS LANJUTAN', 'Lembar Medis Lanjutan', 'Edocs', 'Follow-up Medical Report', true, 160, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(16, 'ADCARD', 'Kartu Asuransi (AdMedika Card)', 'Edocs', 'Insurance Card', true, 200, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(17, 'IDCARD', 'Kartu Identitas (Identification Card)', 'Edocs', 'Identification Card', true, 210, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(18, 'KRONO', 'Surat Kronologis Kecelakaan', 'Edocs', 'Accident Chronology Letter', true, 300, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(19, 'SUKETKMR', 'Surat Keterangan Kelas Kamar', 'Edocs', 'Room Class Certificate', true, 310, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(20, 'RESUMEMEDIS', 'Resume Medis', 'Edocs', 'Medical Resume', true, 320, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(21, 'SPTBEDAH', 'Surat Persetujuan Tindakan Bedah', 'Edocs', 'Surgery Consent', true, 400, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(22, 'SPTOBAT', 'Surat Persetujuan Therapy', 'Edocs', 'Therapy Consent', true, 410, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(23, 'SPTLAB', 'Surat Persetujuan Tindakan (Laboratorium)', 'Edocs', 'Laboratory Consent', true, 420, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(24, 'SPTRAD', 'Surat Persetujuan Tindakan (Radiology)', 'Edocs', 'Radiology Consent', true, 430, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(25, 'SPTKONSUL', 'Konsultasi Dokter (Surat Persetujuan Tindakan)', 'Edocs', 'Doctor Consultation Consent', true, 440, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(26, 'SPTFISIO', 'Surat Persetujuan Tindakan (Fisiotherapy)', 'Edocs', 'Physiotherapy Consent', true, 450, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(27, 'BILLSEM', 'Billing Sementara - Perkiraan Biaya RI Sementara (Interim Bill)', 'Edocs', 'Interim Billing', true, 600, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(28, 'BILLAKHIR', 'Billing Akhir - Jaminan Akhir Rawat Inap (Final Bill)', 'Edocs', 'Final Billing', true, 610, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(29, 'BIAYA_PENGOBATAN', 'Perincian Biaya - Pengobatan', 'Edocs', 'Treatment Cost Details', true, 620, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(30, 'OBAT_RACIKAN', 'Perincian Obat Obatan - Termasuk Racikan', 'Edocs', 'Medicine Details (Including Formulation)', true, 630, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(31, 'LOA_LOC', 'LOA / LOC (Printout Admedika)', 'Edocs', 'LOA/LOC Printout', true, 700, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(32, 'FORM_CLAIM', 'Formulir Klaim - Diisi Lengkap oleh Dokter', 'Edocs', 'Claim Form', true, 710, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),(33, 'OTHERS', 'Other Related Documents', 'Edocs', 'Other documents not listed above', true, 9999, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);-- Set sequence to continue from highest IDSELECT setval('public.document_types_admedika_id_seq', 33, true);
-- PostgreSQL database dump complete
--