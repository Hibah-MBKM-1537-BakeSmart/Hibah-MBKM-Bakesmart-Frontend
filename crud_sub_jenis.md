[6:58 pm, 03/01/2026] Muhammad Annys: itu buat nambahin sub_jenis ke produk bang
[6:58 pm, 03/01/2026] Muhammad Annys: kalau mau crud sub_jenis biasa pake ini
[6:59 pm, 03/01/2026] Muhammad Annys: {
    method: "GET",
    path: "/sub_jenis",
    handler: refSubJenisController.getAllRefSubJenis,
  },
  {
    method: "GET",
    path: "/sub_jenis/{id}",
    handler: refSubJenisController.getRefSubJenisById,
  },
  {
    method: "POST",
    path: "/sub_jenis",
    handler: refSubJenisController.createRefSubJenis,
  },
  {
    method: "PUT",
    path: "/sub_jenis/{id}",
    handler: refSubJenisController.updateRefSubJenis,
  },
  {
    method: "DELETE",
    path: "/sub_jenis/{id}",
    handler: refSubJenisController.deleteRefSubJenis,
  },
[6:59 pm, 03/01/2026] Muhammad Annys: body nya
"nama_id", "nama_en", "jenis_id