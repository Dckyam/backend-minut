# Init DB - PostgreSQL Initialization Scripts

## Cara Kerja

File SQL di folder ini akan **otomatis dijalankan** saat pertama kali PostgreSQL container dibuat.

## File yang Ada

### schema.sql
Berisi struktur tabel database (CREATE TABLE, INDEX, CONSTRAINT, dll).

**Tabel yang dibuat:**
- `benefit_pasien_admedika`
- `coverage_type_admedika`
- `document_types_admedika`
- `menu_access`
- `registrasi_pasien_admedika`
- `response_api_admedika`
- `transaksi_pasien_admedika`
- `upload_document_admedika`

## Kapan Script Dijalankan?

Script SQL akan dijalankan **HANYA** saat:
1. Pertama kali container PostgreSQL dibuat
2. Database belum ada
3. Atau setelah volume dihapus (`docker-compose down -v`)

## Untuk Restore Data (Opsional)

Jika ingin restore data dari backup:

1. Letakkan file backup SQL di folder ini dengan nama: `data.sql` atau `backup.sql`
2. File akan dijalankan secara alfabetis:
   - `schema.sql` (struktur tabel)
   - `data.sql` (data/insert)

## Notes

- Script dijalankan oleh user `postgres`
- Script harus valid PostgreSQL SQL
- Jika ada error, container akan gagal start (cek logs)
- Setelah berhasil, script tidak akan dijalankan lagi kecuali volume dihapus
