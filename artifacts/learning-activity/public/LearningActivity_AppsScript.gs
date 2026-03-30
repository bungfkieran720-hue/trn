/**
 * ============================================================
 *   LEARNING ACTIVITY — Google Apps Script
 *   Template untuk Developer
 * ============================================================
 *
 *  CARA SETUP:
 *  1. Buka Google Sheets baru
 *  2. Klik menu Extensions > Apps Script
 *  3. Hapus semua kode yang ada, paste seluruh kode ini
 *  4. Jalankan fungsi setupSpreadsheet() sekali untuk membuat
 *     semua sheet + contoh data otomatis
 *  5. Klik Deploy > New Deployment > Web App
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  6. Copy URL deployment, paste ke file:
 *     artifacts/learning-activity/src/hooks/use-learning-data.ts
 *     ganti nilai APPS_SCRIPT_URL
 * ============================================================
 */


// ============================================================
//  KONFIGURASI — Edit bagian ini sesuai kebutuhan
// ============================================================

const CONFIG = {
  // Nama sheet untuk data peserta
  SHEET_USERS: "USERS",

  // Nama sheet untuk struktur program & test
  SHEET_PROGRAM: "PROGRAM_STRUCTURE",

  // Skor minimum untuk lulus POST TEST (ubah jika perlu)
  PASSING_SCORE: 75,
};


// ============================================================
//  WEB APP ENDPOINT — Jangan diubah
// ============================================================

/**
 * Handler utama. Dipanggil otomatis saat website request data.
 * Menggabungkan data dari semua sheet Form Responses + USERS + PROGRAM_STRUCTURE.
 */
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Ambil semua sheet Form Responses
  const allSheets = ss.getSheets();
  let allResponses = [];

  allSheets.forEach(function(sheet) {
    const name = sheet.getName();
    // Ambil sheet yang namanya mengandung "Form Responses"
    if (name.indexOf("Form Responses") !== -1) {
      const rows = sheet.getDataRange().getValues();
      // Skip header row (baris pertama)
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0]) { // pastikan baris tidak kosong
          allResponses.push(rows[i]);
        }
      }
    }
  });

  // Ambil data USERS (tanpa header)
  const usersSheet = ss.getSheetByName(CONFIG.SHEET_USERS);
  const usersData = usersSheet
    ? usersSheet.getDataRange().getValues().slice(1)
    : [];

  // Ambil data PROGRAM_STRUCTURE (dengan header di index 0)
  const programSheet = ss.getSheetByName(CONFIG.SHEET_PROGRAM);
  const programData = programSheet
    ? programSheet.getDataRange().getValues()
    : [[]];

  const output = {
    users: usersData,
    program: programData,
    responses: allResponses,
  };

  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}


// ============================================================
//  SETUP OTOMATIS — Jalankan SEKALI untuk membuat struktur sheet
// ============================================================

/**
 * Jalankan fungsi ini SEKALI untuk setup semua sheet.
 * Akan membuat: USERS, PROGRAM_STRUCTURE, Form Responses 1
 * dengan contoh data siap pakai.
 */
function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  createUsersSheet(ss);
  createProgramStructureSheet(ss);
  createFormResponsesSheet(ss);

  SpreadsheetApp.getUi().alert(
    "Setup berhasil!\n\n" +
    "Sheet yang dibuat:\n" +
    "• USERS — data peserta & kode akses\n" +
    "• PROGRAM_STRUCTURE — struktur program & link test\n" +
    "• Form Responses 1 — contoh sheet output Google Form\n\n" +
    "Langkah selanjutnya:\n" +
    "1. Edit data di setiap sheet sesuai kebutuhan\n" +
    "2. Deploy sebagai Web App (Extensions > Apps Script > Deploy)\n" +
    "3. Paste URL deployment ke website"
  );
}


// ============================================================
//  HELPER: Buat Sheet USERS
// ============================================================

function createUsersSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEET_USERS);
  if (sheet) {
    // Tanya apakah mau reset
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      "Sheet USERS sudah ada",
      "Apakah ingin mereset data contoh?",
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;
    sheet.clearContents();
  } else {
    sheet = ss.insertSheet(CONFIG.SHEET_USERS);
  }

  // Header
  const headers = ["username", "access_code", "program_access"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground("#4285F4")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold");

  // Contoh data peserta
  // Kolom program_access: isi nama program dipisah koma, sesuai kolom 'program' di PROGRAM_STRUCTURE
  const exampleUsers = [
    ["Budi",    "B001",   "program1,program2"],
    ["Siti",    "S002",   "program1"],
    ["Ahmad",   "A003",   "program1,program2,program3"],
    ["Dewi",    "D004",   "program2"],
    ["Eko",     "E005",   "program1,program3"],
  ];

  sheet.getRange(2, 1, exampleUsers.length, 3).setValues(exampleUsers);

  // Auto-resize columns
  sheet.autoResizeColumns(1, 3);

  // Freeze header
  sheet.setFrozenRows(1);

  // Tambahkan catatan untuk developer
  const noteCell = sheet.getRange("A1");
  noteCell.setNote(
    "Kolom username: nama pengguna untuk login\n" +
    "Kolom access_code: kode akses/password\n" +
    "Kolom program_access: nama program yang boleh diakses,\n" +
    "pisahkan dengan koma jika lebih dari satu\n" +
    "(contoh: program1,program2)"
  );
}


// ============================================================
//  HELPER: Buat Sheet PROGRAM_STRUCTURE
// ============================================================

function createProgramStructureSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEET_PROGRAM);
  if (sheet) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      "Sheet PROGRAM_STRUCTURE sudah ada",
      "Apakah ingin mereset data contoh?",
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;
    sheet.clearContents();
  } else {
    sheet = ss.insertSheet(CONFIG.SHEET_PROGRAM);
  }

  // Header — JANGAN diubah nama kolomnya
  const headers = ["program", "progress", "test_group", "order", "test_name", "link"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground("#34A853")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold");

  /**
   * PANDUAN PENGISIAN:
   *
   * program    : ID unik program (harus sama persis dengan nilai di kolom program_access di sheet USERS)
   *              Contoh: program1, program2, program3
   *
   * progress   : Nama modul/materi dalam program tersebut
   *              Contoh: Modul 1 - Pengenalan, Modul 2 - Implementasi
   *
   * test_group : Jenis tes. WAJIB isi salah satu:
   *              "pretest"  → muncul di tombol PRE TEST
   *              "posttest" → muncul di tombol POST TEST
   *
   * order      : Urutan tampil (angka). Digunakan untuk sequential lock POST TEST.
   *              POST TEST berikutnya terkunci jika nilai sebelumnya < 75.
   *
   * test_name  : Nama tes yang muncul di tombol. Harus SAMA PERSIS dengan nama
   *              yang ada di kolom TEST_NAME di sheet Form Responses.
   *
   * link       : URL Google Form untuk tes ini. Copy dari tombol "Send" di Google Form.
   */

  // Contoh data: 2 program, masing-masing 2 progress, masing-masing punya pre & post test
  const exampleData = [
    // Program 1 — Progress 1
    ["program1", "Modul 1 - Pengenalan K3",       "pretest",  1, "PRE TEST K3",              "https://forms.gle/contohLink1"],
    ["program1", "Modul 1 - Pengenalan K3",       "posttest", 1, "POST TEST K3 Sesi 1",      "https://forms.gle/contohLink2"],
    ["program1", "Modul 1 - Pengenalan K3",       "posttest", 2, "POST TEST K3 Sesi 2",      "https://forms.gle/contohLink3"],

    // Program 1 — Progress 2
    ["program1", "Modul 2 - Implementasi 5S",     "pretest",  1, "PRE TEST 5S",              "https://forms.gle/contohLink4"],
    ["program1", "Modul 2 - Implementasi 5S",     "posttest", 1, "POST TEST 5S Bagian 1",    "https://forms.gle/contohLink5"],
    ["program1", "Modul 2 - Implementasi 5S",     "posttest", 2, "POST TEST 5S Bagian 2",    "https://forms.gle/contohLink6"],

    // Program 2 — Progress 1
    ["program2", "Modul 1 - Dasar Manajemen",     "pretest",  1, "PRE TEST Manajemen",       "https://forms.gle/contohLink7"],
    ["program2", "Modul 1 - Dasar Manajemen",     "posttest", 1, "POST TEST Manajemen",      "https://forms.gle/contohLink8"],

    // Program 2 — Progress 2
    ["program2", "Modul 2 - Leadership",          "pretest",  1, "PRE TEST Leadership",      "https://forms.gle/contohLink9"],
    ["program2", "Modul 2 - Leadership",          "posttest", 1, "POST TEST Leadership Sesi 1", "https://forms.gle/contohLink10"],
    ["program2", "Modul 2 - Leadership",          "posttest", 2, "POST TEST Leadership Sesi 2", "https://forms.gle/contohLink11"],

    // Program 3 — Progress 1
    ["program3", "Modul 1 - Produktivitas",       "pretest",  1, "PRE TEST Produktivitas",   "https://forms.gle/contohLink12"],
    ["program3", "Modul 1 - Produktivitas",       "posttest", 1, "POST TEST Produktivitas",  "https://forms.gle/contohLink13"],
  ];

  sheet.getRange(2, 1, exampleData.length, 6).setValues(exampleData);

  // Warna beda tiap program agar mudah dibaca
  colorizeByProgram(sheet, exampleData);

  // Auto-resize
  sheet.autoResizeColumns(1, 6);
  sheet.setFrozenRows(1);

  // Catatan header
  sheet.getRange("A1").setNote("ID program. Harus sama persis dengan nilai di kolom program_access di sheet USERS.");
  sheet.getRange("B1").setNote("Nama modul/materi. Ini yang tampil sebagai judul progress di website.");
  sheet.getRange("C1").setNote("Jenis tes: ketik 'pretest' atau 'posttest' (huruf kecil semua).");
  sheet.getRange("D1").setNote("Urutan tampil (1, 2, 3, ...). POST TEST dikunci berurutan jika nilai < 75.");
  sheet.getRange("E1").setNote("Nama tes. WAJIB sama persis dengan nama di Form Responses.");
  sheet.getRange("F1").setNote("Link Google Form untuk tes ini. Salin dari tombol Send di Google Form.");
}


// ============================================================
//  HELPER: Buat Sheet Form Responses (contoh)
// ============================================================

function createFormResponsesSheet(ss) {
  const sheetName = "Form Responses 1";
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      "Sheet '" + sheetName + "' sudah ada",
      "Apakah ingin mereset data contoh?",
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;
    sheet.clearContents();
  } else {
    sheet = ss.insertSheet(sheetName);
  }

  /**
   * Format sheet Form Responses:
   * Kolom A: Timestamp (otomatis dari Google Form)
   * Kolom B: Score / Nilai (angka 0–100)
   * Kolom C: TEST_NAME — nama tes, harus sama persis dengan kolom test_name di PROGRAM_STRUCTURE
   * Kolom D: NIP/ID peserta (opsional)
   * Kolom E: Username peserta — harus sama persis dengan kolom username di sheet USERS
   *
   * CATATAN PENTING:
   * Saat membuat Google Form, pastikan ada kolom untuk:
   *   1. Score/Nilai (diisi manual atau auto-grade)
   *   2. TEST_NAME (bisa dari hidden field atau dropdown)
   *   3. Username peserta
   * Posisi kolom di spreadsheet harus sesuai urutan di atas.
   */

  const headers = ["Timestamp", "Score", "TEST_NAME", "NIP/ID", "Username"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground("#EA4335")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold");

  // Contoh data respons
  const today = new Date();
  const exampleResponses = [
    [new Date(today - 7*86400000), 80,  "PRE TEST K3",              "EMP001", "Budi"],
    [new Date(today - 6*86400000), 90,  "POST TEST K3 Sesi 1",      "EMP001", "Budi"],
    [new Date(today - 5*86400000), 78,  "POST TEST K3 Sesi 2",      "EMP001", "Budi"],
    [new Date(today - 4*86400000), 65,  "PRE TEST 5S",              "EMP001", "Budi"],
    [new Date(today - 7*86400000), 70,  "PRE TEST K3",              "EMP002", "Siti"],
    [new Date(today - 6*86400000), 85,  "POST TEST K3 Sesi 1",      "EMP002", "Siti"],
    [new Date(today - 5*86400000), 60,  "POST TEST K3 Sesi 2",      "EMP002", "Siti"],
    [new Date(today - 4*86400000), 60,  "POST TEST K3 Sesi 2",      "EMP002", "Siti"],
    [new Date(today - 3*86400000), 80,  "POST TEST K3 Sesi 2",      "EMP002", "Siti"],
    [new Date(today - 2*86400000), 75,  "PRE TEST Manajemen",       "EMP003", "Ahmad"],
    [new Date(today - 1*86400000), 88,  "POST TEST Manajemen",      "EMP003", "Ahmad"],
  ];

  sheet.getRange(2, 1, exampleResponses.length, 5).setValues(exampleResponses);

  // Format timestamp
  sheet.getRange(2, 1, exampleResponses.length, 1).setNumberFormat("dd/MM/yyyy HH:mm:ss");

  sheet.autoResizeColumns(1, 5);
  sheet.setFrozenRows(1);

  sheet.getRange("A1").setNote("Terisi otomatis saat peserta submit form.");
  sheet.getRange("B1").setNote("Nilai/skor peserta (0-100). Nilai >= 75 dianggap LULUS.");
  sheet.getRange("C1").setNote("Nama tes. Harus IDENTIK dengan kolom test_name di PROGRAM_STRUCTURE.");
  sheet.getRange("D1").setNote("NIP atau ID peserta (opsional).");
  sheet.getRange("E1").setNote("Username peserta. Harus IDENTIK dengan kolom username di sheet USERS.");
}


// ============================================================
//  HELPER: Warnai baris berdasarkan program
// ============================================================

function colorizeByProgram(sheet, data) {
  const programColors = {
    "program1": "#E8F5E9",
    "program2": "#E3F2FD",
    "program3": "#FFF3E0",
    "program4": "#FCE4EC",
    "program5": "#F3E5F5",
  };

  data.forEach(function(row, idx) {
    const color = programColors[row[0]] || "#FFFFFF";
    sheet.getRange(idx + 2, 1, 1, 6).setBackground(color);
  });
}


// ============================================================
//  UTILITY: Tampilkan URL Web App saat ini
// ============================================================

function showWebAppUrl() {
  const url = ScriptApp.getService().getUrl();
  if (url) {
    SpreadsheetApp.getUi().alert(
      "URL Web App Anda:\n\n" + url + "\n\n" +
      "Copy URL ini dan paste ke file:\n" +
      "artifacts/learning-activity/src/hooks/use-learning-data.ts\n" +
      "pada variabel APPS_SCRIPT_URL"
    );
  } else {
    SpreadsheetApp.getUi().alert(
      "Web App belum di-deploy.\n\n" +
      "Cara deploy:\n" +
      "1. Klik Deploy > New Deployment\n" +
      "2. Pilih type: Web App\n" +
      "3. Execute as: Me\n" +
      "4. Who has access: Anyone\n" +
      "5. Klik Deploy"
    );
  }
}


// ============================================================
//  UTILITY: Tambah peserta baru dengan cepat
// ============================================================

/**
 * Untuk menambah peserta, langsung edit sheet USERS saja.
 * Atau gunakan fungsi ini jika ingin lewat dialog.
 */
function addNewUser() {
  const ui = SpreadsheetApp.getUi();

  const usernameResult = ui.prompt("Tambah Peserta Baru", "Masukkan USERNAME:", ui.ButtonSet.OK_CANCEL);
  if (usernameResult.getSelectedButton() !== ui.Button.OK) return;

  const codeResult = ui.prompt("Tambah Peserta Baru", "Masukkan KODE AKSES:", ui.ButtonSet.OK_CANCEL);
  if (codeResult.getSelectedButton() !== ui.Button.OK) return;

  const programResult = ui.prompt(
    "Tambah Peserta Baru",
    "Program yang bisa diakses (pisah koma, contoh: program1,program2):",
    ui.ButtonSet.OK_CANCEL
  );
  if (programResult.getSelectedButton() !== ui.Button.OK) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_USERS);
  if (!sheet) {
    ui.alert("Sheet USERS tidak ditemukan. Jalankan setupSpreadsheet() terlebih dahulu.");
    return;
  }

  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, 1, 3).setValues([
    [usernameResult.getResponseText(), codeResult.getResponseText(), programResult.getResponseText()]
  ]);

  ui.alert("Peserta berhasil ditambahkan!\n\nUsername: " + usernameResult.getResponseText());
}


// ============================================================
//  CUSTOM MENU — Muncul di toolbar Google Sheets
// ============================================================

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("📚 Learning Activity")
    .addItem("🔧 Setup Spreadsheet (jalankan pertama kali)", "setupSpreadsheet")
    .addSeparator()
    .addItem("👤 Tambah Peserta Baru", "addNewUser")
    .addSeparator()
    .addItem("🔗 Lihat URL Web App", "showWebAppUrl")
    .addToUi();
}
