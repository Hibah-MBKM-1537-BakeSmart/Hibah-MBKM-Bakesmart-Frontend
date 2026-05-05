const db = require("../db");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const { withHandler, success } = require("./helpers/handler");

const itemName = "Produk";
const table = "products";

exports.getAllProducts = withHandler(
  async (request, h) => {
    const products = await db("products").select("*");
    const gambars = await db("gambars").select("*");

    const attributes = await db("products")
      .join("ref_sub_jenis", "products.ref_sub_jenis_id", "ref_sub_jenis.id")
      .join("sub_jenis_attribute", "ref_sub_jenis.id", "sub_jenis_attribute.ref_sub_jenis_id")
      .join("ref_attributes", "sub_jenis_attribute.ref_attribute_id", "ref_attributes.id")
      .select(
        "products.id as product_id",
        "ref_attributes.id",
        "ref_attributes.nama_id",
        "ref_attributes.nama_en",
        "sub_jenis_attribute.harga"
      );

    const bahans = await db("product_bahan")
      .join("ref_bahans", "product_bahan.ref_bahan_id", "ref_bahans.id")
      .select(
        "product_bahan.product_id",
        "ref_bahans.id",
        "ref_bahans.nama_id",
        "ref_bahans.nama_en",
        "product_bahan.jumlah"
      );

    const subJenisData = await db("products")
      .join("ref_sub_jenis", "products.ref_sub_jenis_id", "ref_sub_jenis.id")
      .leftJoin("ref_jenis", "ref_sub_jenis.ref_jenis_id", "ref_jenis.id")
      .leftJoin("sub_jenis_hari", "ref_sub_jenis.id", "sub_jenis_hari.ref_sub_jenis_id")
      .leftJoin("ref_hari", "sub_jenis_hari.ref_hari_id", "ref_hari.id")
      .select(
        "products.id as product_id",
        "ref_sub_jenis.id as sub_jenis_id",
        "ref_sub_jenis.nama_id as sub_jenis_nama_id",
        "ref_sub_jenis.nama_en as sub_jenis_nama_en",
        "ref_sub_jenis.is_closed",
        "ref_sub_jenis.min_amount",
        "ref_sub_jenis.max_amount",
        "ref_jenis.id as jenis_id",
        "ref_jenis.nama_id as jenis_nama_id",
        "ref_jenis.nama_en as jenis_nama_en",
        "ref_hari.id as hari_id",
        "ref_hari.nama_id as hari_nama_id",
        "ref_hari.nama_en as hari_nama_en"
      );

    const salesTotal = await db("order_product")
      .select("product_id")
      .sum({ total_sales: "jumlah" })
      .sum({ total_revenue: db.raw("jumlah * harga_beli") })
      .groupBy("product_id");

    const salesTotalToday = await db("order_product")
      .join("orders", "order_product.order_id", "orders.id")
      .whereRaw("DATE(orders.created_at) = CURRENT_DATE")
      .select("product_id")
      .sum({ total_sales_today: "jumlah" })
      .sum({ total_revenue_today: db.raw("jumlah * harga_beli") })
      .groupBy("product_id");

    const productMap = new Map();

    for (const p of products) {
      productMap.set(p.id, {
        ...p,
        gambars: [],
        attributes: [],
        bahans: [],
        sub_jenis: null,
        jenis: null,
        hari: [],
      });
    }

    // gambars
    for (const g of gambars) {
      const product = productMap.get(g.product_id);
      if (product) product.gambars.push(g);
    }

    // bahans
    for (const b of bahans) {
      const product = productMap.get(b.product_id);
      if (product) product.bahans.push(b);
    }

    // attributes
    for (const a of attributes) {
      const product = productMap.get(a.product_id);
      if (!product) continue;

      if (!product.attributes.some((attr) => attr.id === a.id)) {
        product.attributes.push({
          id: a.id,
          nama_id: a.nama_id,
          nama_en: a.nama_en,
          harga: a.harga,
        });
      }
    }

    // sub jenis + jenis + hari
    for (const row of subJenisData) {
      const product = productMap.get(row.product_id);
      if (!product) continue;

      if (!product.sub_jenis && row.sub_jenis_id) {
        product.sub_jenis = {
          id: row.sub_jenis_id,
          nama_id: row.sub_jenis_nama_id,
          nama_en: row.sub_jenis_nama_en,
          is_closed: row.is_closed,
          min_amount: row.min_amount,
          max_amount: row.max_amount,
        };
      }

      if (!product.jenis && row.jenis_id) {
        product.jenis = {
          id: row.jenis_id,
          nama_id: row.jenis_nama_id,
          nama_en: row.jenis_nama_en,
        };
      }

      if (
        row.hari_id &&
        !product.hari.some((h) => h.id === row.hari_id)
      ) {
        product.hari.push({
          id: row.hari_id,
          nama_id: row.hari_nama_id,
          nama_en: row.hari_nama_en,
        });
      }

      // sales total
      for (const s of salesTotal) {
        const product = productMap.get(s.product_id);
        if (product) {
          product.sales_total = Number(s.total_sales) || 0;
          product.revenue_total = Number(s.total_revenue) || 0;
        }
      }

      // sales today
      for (const s of salesTotalToday) {
        const product = productMap.get(s.product_id);
        if (product) {
          product.sales_today = Number(s.total_sales_today) || 0;
          product.revenue_today = Number(s.total_revenue_today) || 0;
        }
      }
    }

    const result = Array.from(productMap.values());

    return success(h, "Products retrieved", { data: result });
  },
  itemName,
  `Failed to get ${itemName.toLowerCase()}s`
);

exports.getProductById = withHandler(
  async (request, h) => {
    const { id } = request.params;
    const products = await db("products").where("products.id", id).select("*");
    const gambars = await db("gambars").where("gambars.product_id", id).select("*");

    const attributes = await db("products")
    .where("products.id", id)
    .join("ref_sub_jenis", "products.ref_sub_jenis_id", "ref_sub_jenis.id")
    .join("sub_jenis_attribute", "ref_sub_jenis.id", "sub_jenis_attribute.ref_sub_jenis_id")
    .join("ref_attributes", "sub_jenis_attribute.ref_attribute_id", "ref_attributes.id")
    .select(
      "products.id as product_id",
      "ref_attributes.id",
      "ref_attributes.nama_id",
      "ref_attributes.nama_en",
      "sub_jenis_attribute.harga"
    );

    const bahans = await db("product_bahan")
    .where("product_bahan.product_id", id)
    .join("ref_bahans", "product_bahan.ref_bahan_id", "ref_bahans.id")
    .select(
      "product_bahan.product_id",
      "ref_bahans.id",
      "ref_bahans.nama_id",
      "ref_bahans.nama_en",
      "product_bahan.jumlah"
    );

    const subJenisData = await db("products")
    .where("products.id", id)
    .join("ref_sub_jenis", "products.ref_sub_jenis_id", "ref_sub_jenis.id")
    .leftJoin("ref_jenis", "ref_sub_jenis.ref_jenis_id", "ref_jenis.id")
    .leftJoin("sub_jenis_hari", "ref_sub_jenis.id", "sub_jenis_hari.ref_sub_jenis_id")
    .leftJoin("ref_hari", "sub_jenis_hari.ref_hari_id", "ref_hari.id")
    .select(
      "products.id as product_id",
      "ref_sub_jenis.id as sub_jenis_id",
      "ref_sub_jenis.nama_id as sub_jenis_nama_id",
      "ref_sub_jenis.nama_en as sub_jenis_nama_en",
      "ref_sub_jenis.is_closed",
      "ref_sub_jenis.min_amount",
      "ref_sub_jenis.max_amount",
      "ref_jenis.id as jenis_id",
      "ref_jenis.nama_id as jenis_nama_id",
      "ref_jenis.nama_en as jenis_nama_en",
      "ref_hari.id as hari_id",
      "ref_hari.nama_id as hari_nama_id",
      "ref_hari.nama_en as hari_nama_en"
    );
    
    const productMap = new Map();

    for (const p of products) {
      productMap.set(p.id, {
        ...p,
        gambars: [],
        attributes: [],
        bahans: [],
        sub_jenis: null,
        jenis: null,
        hari: [],
      });
    }

    // gambars
    for (const g of gambars) {
      const product = productMap.get(g.product_id);
      if (product) product.gambars.push(g);
    }

    // bahans
    for (const b of bahans) {
      const product = productMap.get(b.product_id);
      if (product) product.bahans.push(b);
    }

    // attributes
    for (const a of attributes) {
      const product = productMap.get(a.product_id);
      if (!product) continue;

      if (!product.attributes.some((attr) => attr.id === a.id)) {
        product.attributes.push({
          id: a.id,
          nama_id: a.nama_id,
          nama_en: a.nama_en,
          harga: a.harga,
        });
      }
    }

    // sub jenis + jenis + hari
    for (const row of subJenisData) {
      const product = productMap.get(row.product_id);
      if (!product) continue;

      if (!product.sub_jenis && row.sub_jenis_id) {
        product.sub_jenis = {
          id: row.sub_jenis_id,
          nama_id: row.sub_jenis_nama_id,
          nama_en: row.sub_jenis_nama_en,
          is_closed: row.is_closed,
          min_amount: row.min_amount,
          max_amount: row.max_amount,
        };
      }

      if (!product.jenis && row.jenis_id) {
        product.jenis = {
          id: row.jenis_id,
          nama_id: row.jenis_nama_id,
          nama_en: row.jenis_nama_en,
        };
      }

      if (
        row.hari_id &&
        !product.hari.some((h) => h.id === row.hari_id)
      ) {
        product.hari.push({
          id: row.hari_id,
          nama_id: row.hari_nama_id,
          nama_en: row.hari_nama_en,
        });
      }
    }

    const result = Array.from(productMap.values());
    if (!result || result.length === 0) {
      return h.response({ error: `${itemName} not found` }).code(404);
    }

    return success(h, "Products retrieved", { data: result });
  },
  itemName,
  `Failed to get ${itemName.toLowerCase()}`,
);

exports.createProduct = withHandler(
  async (request, h) => {
    const data = request.payload;

    if (!data || Object.keys(data).length === 0) {
      return fail(h, "Request payload is empty", 400);
    }

    // Insert product
    const [inserted] = await db(table).insert(data).returning("*");

    return success(h, `${itemName} created`, { data: inserted }, 201);
  },
  itemName,
  `Failed to create ${itemName.toLowerCase()}`,
);

exports.updateProduct = withHandler(
  async (request, h) => {
    const { id } = request.params;
    const data = request.payload;

    if (!data || Object.keys(data).length === 0) {
      return fail(h, "Request payload is empty", 400);
    }

    const [updated] = await db(table)
      .where({ id })
      .update(data)
      .returning("*");

    if (!updated) {
      return fail(h, `${itemName} not found`, 404);
    }

    return success(h, `${itemName} updated`, { data: updated }, 200);
  },
  itemName,
  `Failed to update ${itemName.toLowerCase()}`
);

exports.updateProductDetails = withHandler(
  async (request, h) => {
    const { id } = request.params;
    const payload = request.payload;

    // 1. Pisahkan data utama product dengan data relasi (array)
    // Kita destructuring agar 'productData' hanya berisi kolom milik tabel 'products'
    const {
      // sub_jenis, // Expecting: Array of objects [{id: 1}, ...] or IDs
      // bahans, // Expecting: Array of objects [{id: 1, jumlah: 100}, ...]
      gambars, // Kita skip gambar (biasanya handle upload terpisah), atau hapus agar tidak error
      jenis, // Skip jika ada (karena derived dari sub_jenis atau tidak diupdate langsung)
      ...productData
    } = payload;

    await db.transaction(async (trx) => {
      // -------------------------------------------
      // A. Update Tabel Utama (products)
      // -------------------------------------------
      if (Object.keys(productData).length > 0) {
        await trx(table).where({ id }).update(productData);
      }

      // -------------------------------------------
      // B. Update Relasi: Sub Jenis
      // Logic: Hapus relasi lama -> Insert relasi baru
      // -------------------------------------------
      // if (Array.isArray(sub_jenis)) {
      //   await trx("product_sub_jenis").where("product_id", id).del();

      //   if (sub_jenis.length > 0) {
      //     const inserts = sub_jenis.map((item) => ({
      //       product_id: id,
      //       // Handle jika payload berupa object {id:..} atau langsung integer ID
      //       ref_sub_jenis_id: item.id !== undefined ? item.id : item,
      //     }));
      //     await trx("product_sub_jenis").insert(inserts);
      //   }
      // }

      // -------------------------------------------
      // E. Update Relasi: Bahan (Ada kolom jumlah)
      // -------------------------------------------
      // if (Array.isArray(bahans)) {
      //   await trx("product_bahan").where("product_id", id).del();

      //   if (bahans.length > 0) {
      //     const inserts = bahans.map((item) => ({
      //       product_id: id,
      //       ref_bahan_id: item.id, // ID bahan
      //       jumlah: item.jumlah || 0, // Kolom tambahan di pivot
      //     }));
      //     await trx("product_bahan").insert(inserts);
      //   }
      // }
    });

    // Opsional: Return data terbaru setelah update
    // Kita panggil ulang logic getProductById atau return success message saja
    return success(h, `${itemName} details updated successfully`, { id });
  },
  itemName,
  `Failed to update ${itemName.toLowerCase()} details`,
);

exports.deleteProduct = withHandler(
  async (request, h) => {
    const { id } = request.params;

    const deleted = await db(table).where({ id }).del();
    if (!deleted)
      return h.response({ error: `${itemName} not found` }).code(404);

    return success(h, `${itemName} deleted`, { id });
  },
  itemName,
  `Failed to delete ${itemName.toLowerCase()}`,
);

//! ==========================
//! ====
//! ====  Product -> Gambar
//! ====
//! ==========================

exports.getProductGambar = withHandler(
  async (request, h) => {
    const { product_id } = request.params;

    const product_gambar = await db("gambars").where("product_id", product_id);

    if (!product_gambar || product_gambar.length === 0) {
      throw new Error("Product_Gambar not found");
    }

    // Convert file_path to full URL
    const baseUrl = `${request.server.info.protocol}://${request.info.host}`;
    const dataWithUrl = product_gambar.map((img) => ({
      ...img,
      url: img.file_path ? `${baseUrl}${img.file_path}` : null,
    }));

    return success(h, `${itemName} retrieved`, {
      data: dataWithUrl,
    });
  },
  itemName,
  `Failed to get ${itemName.toLowerCase()}`,
);

exports.createProductGambar = withHandler(
  async (request, h) => {
    const { product_id } = request.params;
    const { file } = request.payload;

    if (!file || !file.hapi || !file._data) {
      return fail(h, "File is required", 400);
    }

    const uploadDir = path.join(__dirname, "..", "uploads", "products");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.hapi.filename}`;
    const filepath = path.join(uploadDir, filename);

    await new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(filepath);
      file.on("error", (err) => reject(err));
      file.pipe(fileStream);
      fileStream.on("finish", resolve);
      fileStream.on("error", reject);
    });

    const dbPath = `/uploads/products/${filename}`;

    // const [inserted] =
    // await db("gambars").insert({ file_path: dbPath, product_id });
    const [inserted] = await db("gambars").insert({ file_path: dbPath, product_id }).returning("*");
    // .select(["*"]);

    return success(h, `Gambar Added to ${itemName}`, { data: inserted }, 201);
  },
  itemName,
  `Failed to create ${itemName.toLowerCase()}`,
);

exports.deleteProductGambar = withHandler(
  async (request, h) => {
    const { product_id, gambar_id } = request.params;

    const deleted = await db("gambars").where("id", gambar_id).del();
    if (!deleted)
      return h.response({ error: `${itemName} not found` }).code(404);

    return success(h, `${itemName} deleted`, { id });
  },
  itemName,
  `Failed to delete ${itemName.toLowerCase()}`,
);

//! ==========================
//! ====
//! ====  Product -> Bahan
//! ====
//! ==========================

exports.getProductBahan = withHandler(
  async (request, h) => {
    const { product_id } = request.params;

    const product_bahan = await db("product_bahan as pb")
      .join("ref_bahans as rb", "rb.id", "pb.ref_bahan_id")
      .where("pb.product_id", product_id)
      .select(
        "pb.id",
        "pb.product_id",
        "pb.jumlah as jumlah_bahan",
        "rb.id as bahan_id",
        "rb.nama_id as bahan_nama_id",
        "rb.nama_en as bahan_nama_en",
      );

    if (!product_bahan || product_bahan.length === 0) {
      throw new Error("Product_Bahan not found");
    }

    return success(h, `${itemName} retrieved`, {
      data: product_bahan,
    });
  },
  itemName,
  `Failed to get ${itemName.toLowerCase()}`,
);

exports.createProductBahan = withHandler(
  async (request, h) => {
    const { product_id, bahan_id } = request.params;
    const { jumlah } = request.payload;

    // --- CHECK IF ALREADY EXISTS ---
    const existing = await db("product_bahan")
      .where({ product_id, ref_bahan_id: bahan_id })
      .first();

    if (existing) {
      return h
        .response({
          message: "This product already has the assigned bahan_id.",
          product_id,
          bahan_id
        })
        .code(409); // Conflict
    }

    // --- INSERT NEW ITEM ---
    let inserted;
    try {
      inserted = await db("product_bahan")
        .insert({ product_id, ref_bahan_id: bahan_id, jumlah })
        .returning("id");
    } catch (e) {
      // MySQL fallback (returning not supported)
      inserted = await db("product_bahan").insert({
        product_id,
        ref_bahan_id: bahan_id,
        jumlah
      });
    }

    const id = Array.isArray(inserted)
      ? inserted[0]?.id || inserted[0]
      : inserted;

    return { id, product_id, bahan_id, jumlah };
  },
  itemName,
  `Failed to create ${itemName.toLowerCase()}`,
);

exports.deleteProductBahan = withHandler(
  async (request, h) => {
    const { product_id, bahan_id } = request.params;
    const product_bahan = await db("product_bahan")
      .where({ product_id, ref_bahan_id: bahan_id })
      .del();
    if (!product_bahan) throw new Error("Product_Bahan not found");
    return success(h, `${itemName} deleted`, { product_id, bahan_id });
  },
  itemName,
  `Failed to delete ${itemName.toLowerCase()}`,
);

//! ==========================
//! ====
//! ====  Export & Import Product
//! ====
//! ==========================

//! FIX !//

exports.exportProduct = withHandler(
  async (request, h) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Products");

    // HEADER BARU: Memisahkan ID dan EN
    sheet.columns = [
      { header: "Nama ID", key: "nama_id", width: 30 },
      { header: "Nama EN", key: "nama_en", width: 30 },
      { header: "Kategori", key: "kategori", width: 20 },
      { header: "Sub Kategori", key: "sub_kategori", width: 25 },
      { header: "Kalkulasi", key: "kalkulasi", width: 15 },
      { header: "Deskripsi ID", key: "deskripsi_id", width: 40 },
      { header: "Deskripsi EN", key: "deskripsi_en", width: 40 },
      { header: "Ingredients", key: "komposisi", width: 40 },
      { header: "Harga Jual", key: "harga", width: 15 },
    ];

    const products = await db("products")
      .leftJoin(
        "ref_sub_jenis",
        "products.ref_sub_jenis_id",
        "ref_sub_jenis.id",
      )
      .leftJoin("ref_jenis", "ref_sub_jenis.ref_jenis_id", "ref_jenis.id")
      .leftJoin("product_bahan", "products.id", "product_bahan.product_id")
      .leftJoin("ref_bahans", "product_bahan.ref_bahan_id", "ref_bahans.id")
      .select(
        "products.id",
        "products.nama_id",
        "products.nama_en",
        "products.deskripsi_id",
        "products.deskripsi_en",
        "products.calc_count as kalkulasi",
        "products.harga",
        "ref_jenis.nama_id as kategori",
        "ref_sub_jenis.nama_id as sub_kategori",
      )
      .groupBy(
        "products.id",
        "products.nama_id",
        "products.nama_en",
        "products.deskripsi_id",
        "products.deskripsi_en",
        "products.calc_count",
        "products.harga",
        "ref_jenis.nama_id",
        "ref_sub_jenis.nama_id",
      )
      // Agregasi bahan menjadi string
      .select(db.raw("STRING_AGG(ref_bahans.nama_id, ', ') as komposisi"));

    products.forEach((p) => {
      sheet.addRow({
        nama_id: p.nama_id,
        nama_en: p.nama_en,
        kategori: p.kategori || "Uncategorized",
        sub_kategori: p.sub_kategori || "Uncategorized",
        kalkulasi: p.kalkulasi || 1,
        deskripsi_id: p.deskripsi_id || "",
        deskripsi_en: p.deskripsi_en || "",
        komposisi: p.komposisi || "",
        harga: p.harga || 0,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return h
      .response(buffer)
      .header(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      )
      .header("Content-Disposition", "attachment; filename=Products.xlsx");
  },
  "export products",
  "Failed to export products",
);

exports.importProduct = withHandler(
  async (request, h) => {
    const file = request.payload.file;

    if (!file) throw new Error("Excel file is required");

    const buffer = Buffer.isBuffer(file)
      ? file
      : Buffer.isBuffer(file._data)
        ? file._data
        : file._data?.data
          ? Buffer.from(file._data.data)
          : null;

    if (!buffer) {
      throw new Error("Invalid file buffer: unable to load Excel file");
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    // PERBAIKAN: Gunakan worksheets[0] untuk mengambil sheet pertama secara pasti
    // workbook.getWorksheet(1) mencari sheet dengan ID 1, yang mungkin tidak ada
    const sheet = workbook.worksheets[0];
    if (!sheet) {
      throw new Error("Worksheet not found in the file");
    }

    let insertedCount = 0;

    // 1. Deteksi Format Header (Baris 1)
    const headerRow = sheet.getRow(1);
    const firstHeader = headerRow.getCell(1).value
      ? String(headerRow.getCell(1).value).toLowerCase()
      : "";

    // Tentukan Mode Import
    // Jika header pertama mengandung "id" (misal "Nama ID"), asumsi format lengkap (hasil export)
    // Jika tidak (misal "Nama produk:"), asumsi format simple (file contoh user)
    const isFullFormat = firstHeader.includes("id");

    await db.transaction(async (trx) => {
      const rows = sheet.getRows(2, sheet.rowCount - 1) || [];

      for (const row of rows) {
        let nama_id, nama_en, deskripsi_id, deskripsi_en;
        let kategoriNama,
          subKategoriNama,
          kalkulasiRaw,
          ingredientsRaw,
          hargaRaw;

        // MAPPING DATA BERDASARKAN FORMAT
        if (isFullFormat) {
          // FORMAT LENGKAP (Sesuai Export)
          // 1:Nama ID, 2:Nama EN, 3:Kategori, 4:Sub, 5:Kalk, 6:Desk ID, 7:Desk EN, 8:Ingred, 9:Harga
          nama_id = row.getCell(1).value;
          nama_en = row.getCell(2).value;
          kategoriNama = row.getCell(3).value;
          subKategoriNama = row.getCell(4).value;
          kalkulasiRaw = row.getCell(5).value;
          deskripsi_id = row.getCell(6).value;
          deskripsi_en = row.getCell(7).value;
          ingredientsRaw = row.getCell(8).value;
          hargaRaw = row.getCell(9).value;
        } else {
          // FORMAT SIMPLE (Sesuai File Import Terbaru user: 7 Kolom)
          // 1:Nama Produk, 2:Kategori, 3:Sub, 4:Kalk, 5:Penjelasan Roti, 6:Ingred, 7:Harga
          const rawNama = row.getCell(1).value;
          nama_id = rawNama;
          nama_en = rawNama; // Duplicate ke EN

          kategoriNama = row.getCell(2).value;
          subKategoriNama = row.getCell(3).value;
          kalkulasiRaw = row.getCell(4).value;

          const rawDeskripsi = row.getCell(5).value;
          deskripsi_id = rawDeskripsi;
          deskripsi_en = rawDeskripsi; // Duplicate ke EN

          ingredientsRaw = row.getCell(6).value;
          hargaRaw = row.getCell(7).value;
        }

        if (!nama_id) continue;

        // --- Clean & Parse Numbers ---
        let harga = 0;
        let parsedHarga = 0;
        if (typeof hargaRaw === "number") {
          parsedHarga = hargaRaw;
        } else if (typeof hargaRaw === "string") {
          parsedHarga = parseFloat(hargaRaw.replace(/[^0-9.]/g, "")) || 0;
        }
        // PERBAIKAN: Bulatkan harga ke integer karena tipe data database adalah integer
        harga = Math.round(parsedHarga);

        let kalkulasi = 1;
        if (typeof kalkulasiRaw === "number") {
          kalkulasi = kalkulasiRaw;
        } else if (typeof kalkulasiRaw === "string") {
          kalkulasi = parseFloat(kalkulasiRaw) || 1;
        }

        // ---------------------------------------------------------
        // 1. CHECK OR CREATE KATEGORI (ref_jenis)
        // ---------------------------------------------------------
        let jenisId = null;
        if (kategoriNama) {
          const cleanKategori = String(kategoriNama).trim();
          const existingJenis = await trx("ref_jenis")
            .whereRaw("LOWER(nama_id) = ?", [cleanKategori.toLowerCase()])
            .first();

          if (existingJenis) {
            jenisId = existingJenis.id;
          } else {
            const [newJenis] = await trx("ref_jenis")
              .insert({
                nama_id: cleanKategori,
                nama_en: cleanKategori,
                max_amount: 0,
              })
              .returning("id");
            jenisId = newJenis.id || newJenis;
          }
        }

        // ---------------------------------------------------------
        // 2. CHECK OR CREATE SUB KATEGORI (ref_sub_jenis)
        // ---------------------------------------------------------
        let subJenisId = null;
        if (subKategoriNama && jenisId) {
          const cleanSub = String(subKategoriNama).trim();
          const existingSub = await trx("ref_sub_jenis")
            .whereRaw("LOWER(nama_id) = ?", [cleanSub.toLowerCase()])
            .first();

          if (existingSub) {
            subJenisId = existingSub.id;
          } else {
            const [newSub] = await trx("ref_sub_jenis")
              .insert({
                ref_jenis_id: jenisId,
                nama_id: cleanSub,
                nama_en: cleanSub,
                min_amount: 0,
                max_amount: 0,
              })
              .returning("id");
            subJenisId = newSub.id || newSub;
          }
        }

        // ---------------------------------------------------------
        // 3. INSERT PRODUK
        // ---------------------------------------------------------
        const [newProduct] = await trx("products")
          .insert({
            ref_sub_jenis_id: subJenisId,
            nama_id: nama_id,
            nama_en: nama_en,
            deskripsi_id: deskripsi_id,
            deskripsi_en: deskripsi_en,
            calc_count: kalkulasi,
            harga: harga,
          })
          .returning("id");

        const productId = newProduct.id || newProduct;
        insertedCount++;

        // ---------------------------------------------------------
        // 4. INSERT BAHAN (Ingredients) -> ref_bahans & product_bahan
        // ---------------------------------------------------------
        if (ingredientsRaw) {
          // Bersihkan string ingredients dari karakter aneh dan split berdasarkan koma
          const ingredientsList = String(ingredientsRaw)
            .split(",")
            .map((i) => i.trim());

          for (const ingredientName of ingredientsList) {
            if (!ingredientName) continue;

            let bahanId;
            const existingBahan = await trx("ref_bahans")
              .whereRaw("LOWER(nama_id) = ?", [ingredientName.toLowerCase()])
              .first();

            if (existingBahan) {
              bahanId = existingBahan.id;
            } else {
              const [newBahan] = await trx("ref_bahans")
                .insert({
                  nama_id: ingredientName,
                  nama_en: ingredientName,
                })
                .returning("id");
              bahanId = newBahan.id || newBahan;
            }

            const existingRel = await trx("product_bahan")
              .where({ product_id: productId, ref_bahan_id: bahanId })
              .first();

            if (!existingRel) {
              await trx("product_bahan").insert({
                product_id: productId,
                ref_bahan_id: bahanId,
                jumlah: 1,
              });
            }
          }
        }

        // FOTO PRODUK: Tidak diproses sesuai request.
      }
    });

    return success(h, "Products imported successfully", {
      inserted_products: insertedCount,
      format_detected: isFullFormat
        ? "Full (Separated Columns)"
        : "Simple (Merged Columns)",
    });
  },
  "import products",
  "Failed to import products",
);
