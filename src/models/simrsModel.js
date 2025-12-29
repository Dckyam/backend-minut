const dbSimrs = require('../database/dbSimrs');

class SimrsModel {
  /**
   * Get data transaksi SIMRS by no_registrasi
   */
  async getTransaksiByNoReg(noReg) {
    const query = `
      SELECT
        td.kode_trans,
        b.regpid,
        b.no_reg,
        format_rm(b.pid) AS mrn,
        (CASE WHEN b.pid = 0 THEN b.nama_bebas ELSE c.name_real END) as nama_pasien,
        TO_CHAR(a.input_date, 'DD-MM-YYYY HH24:MI:SS') as tgl_transaksi,
        COALESCE(COALESCE(COALESCE(COALESCE(COALESCE(COALESCE(COALESCE(e.tdkcode,eq.shortname),
          oj.nama),
          lp.lpid::VARCHAR),
          rs.rsid::VARCHAR),
          mb.kode_brg),
          dt.dtvid::VARCHAR),
          ht.htid::VARCHAR)
         AS item_code,
        CASE
            WHEN a.description = 'RACIKAN' THEN (
                'RACIKAN - ' ||
                (
                    SELECT string_agg(
                               regexp_replace(tp2.nama_barang, '^.*-', ''),
                               ', '
                               ORDER BY tp2.nama_barang
                           )
                    FROM transaksi_d td2
                    JOIN transaksi_puyer_d tp2
                         ON tp2.kode_trans = td2.kode_trans
                        AND tp2.kode_trans_d = td2.kode_trans_d
                    WHERE td2.kode_trans_d = td.kode_trans_d
                )
            )
            ELSE a.description
        END AS item,
        CASE
          WHEN g.hdrname='Biaya Obat - Obatan' THEN  a.title
          WHEN g.hdrname='Biaya Laboratorium' THEN  'Lab'
          WHEN g.hdrname='Biaya Radiologi' THEN  'Radiologi'
          WHEN g.hdrname='Biaya Visite' THEN  'Konsultasi/Visit'
          WHEN g.hdrname='Biaya Tindakan' AND a.description LIKE '%Konsultasi%' THEN  'Konsultasi/Visit'
          WHEN g.hdrname='Biaya Tindakan' THEN  'Tindakan'
          WHEN g.hdrname='Biaya Pemakaian Peralatan' THEN  'Peralatan'
          WHEN g.hdrname LIKE '%Biaya Kamar%' THEN  'Kamar'
          WHEN g.hdrname LIKE '%Biaya Operasi%' THEN  'Operasi'
          WHEN g.hdrname LIKE '%Administrasi%' THEN  'Admin'
               ELSE ''
        END AS jenis_layanan,
        COALESCE(j.hcid,'0') AS kode_kelas,
        COALESCE(j.class_name,'Rawat Jalan') AS kelas,
        round((COALESCE(a.amount,0)+COALESCE(a.potongan,0)+COALESCE(a.discount,0))/(a.numcount),2) as harga_awal,
        a.numcount as jml,
        COALESCE(a.discount,0) as diskon,
        COALESCE(a.amount,0)+COALESCE(a.potongan,0) as tot_harga
      FROM bill_patient_row a
              LEFT JOIN regpatient b ON (a.regpid=b.regpid)
              LEFT JOIN person c ON (b.pid = c.pid)
              LEFT JOIN person d ON d.pid=b.doctor_id
              LEFT JOIN poly_tdk_list e ON (e.ptiid=a.base_id)
              LEFT JOIN mst_barang mb ON (mb.mbid=a.base_id)
              LEFT JOIN radiologi_setup rs ON (rs.rsid=a.base_id)
              LEFT JOIN laboratory_param lp ON (lp.lpid=a.base_id)
              LEFT JOIN equipment eq ON (eq.eqid=a.base_id)
              LEFT JOIN or_tindakan op ON (op.otdkid=a.base_id)
              LEFT JOIN or_jenis oj ON (op.orjid = oj.orjid)
              LEFT JOIN ob_room ob ON (ob.obrid=a.base_id)
              LEFT JOIN insurance_firm f ON (b.ifirm_id = f.ifirm_id)
              LEFT JOIN bill_patient_header g ON (a.bphid = g.bphid)
              LEFT JOIN doctor_tarif_visite dt ON (dt.pid=a.base_id AND dt.hcid=a.hcid AND dt.periode_id='4' AND dt.fgid=a.fgid)
              LEFT JOIN hotel_tarif ht ON (ht.hcid=a.hcid AND ht.periode_id='4' AND ht.fgid=a.fgid)
              LEFT JOIN bill_patient h ON (a.bpid = h.bpid)
              LEFT JOIN department i ON (b.current_dept_nr = i.did)
              LEFT JOIN vhotel_allbed j ON (b.current_bed_nr = j.hbid)
              LEFT JOIN laboratory_order_chem_detail loc ON loc.lodid=a.bill_id AND g.hdrname='Biaya Laboratorium'
              LEFT JOIN radiologi_order ro ON ro.roid=a.bill_id AND g.hdrname='Biaya Radiologi'
              LEFT JOIN transaksi_d td ON td.kode_trans_d=a.bill_id AND g.hdrname='Biaya Obat - Obatan'
              LEFT JOIN transaksi t ON t.kode_trans=td.kode_trans
      WHERE 1=1 AND b.no_reg = $1
      ORDER BY a.input_date ASC
    `;

    const result = await dbSimrs.query(query, [noReg]);
    return result.rows;
  }

  /**
   * Get summary data transaksi by no_registrasi
   */
  async getSummaryByNoReg(noReg) {
    const query = `
      SELECT
        b.regpid,
        b.no_reg,
        format_rm(b.pid) AS mrn,
        (CASE WHEN b.pid = 0 THEN b.nama_bebas ELSE c.name_real END) as nama_pasien,
        COUNT(*) as total_items,
        SUM(COALESCE(a.amount,0)+COALESCE(a.potongan,0)) as total_biaya,
        SUM(COALESCE(a.discount,0)) as total_diskon
      FROM bill_patient_row a
        LEFT JOIN regpatient b ON (a.regpid=b.regpid)
        LEFT JOIN person c ON (b.pid = c.pid)
      WHERE b.no_reg = $1
      GROUP BY b.regpid, b.no_reg, b.pid, b.nama_bebas, c.name_real
    `;

    const result = await dbSimrs.query(query, [noReg]);
    return result.rows[0];
  }

  /**
   * Get ICD10 data
   */
  async getICD10() {
    const query = `
      SELECT
        icdid,
        kode,
        nama
      FROM icd10
      WHERE is_aktif = 't'
      ORDER BY kode ASC
    `;

    const result = await dbSimrs.query(query);
    return result.rows;
  }
}

module.exports = new SimrsModel();
