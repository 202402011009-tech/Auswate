/* =========================================================
   //* FILE: js/02-state.js
   //* FUNGSI: Mengelola state (data aktif) aplikasi, menyimpan
   //*         otomatis ke LocalStorage (v5 — Beli/Jual Terpisah,
   //*         Laporan Omset/Laba Bersih, Lalamove & Deliveree,
   //*         Best Seller, & Struk/Karcis Otomatis).
   ========================================================= */

//* Kunci versi v5 agar data baru (Lalamove/Deliveree, Best Seller, Laporan) otomatis termuat
const STORAGE_KEY = 'auwaste_open_b2b_b2c_v5';

let appState = loadInitialState();

//* FUNGSI: Memuat data awal dengan aman dari LocalStorage
function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.listings) && Array.isArray(parsed.transactions)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Gagal membaca LocalStorage, memakai data bawaan:', err);
  }
  return JSON.parse(JSON.stringify(DEFAULT_APP_DATA));
}

//* FUNGSI: Menyimpan perubahan state terbaru ke LocalStorage
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (err) {
    console.warn('Gagal menyimpan state:', err);
  }
}

//* FUNGSI: Mereset seluruh data demo ke kondisi awal B2B & B2C
function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY);
  appState = JSON.parse(JSON.stringify(DEFAULT_APP_DATA));
  renderAllViews();
  showToast('Data demo AuWaste (Beli/Jual, Laporan, Lalamove/Deliveree) berhasil di-reset!', 'info');
}

//* FUNGSI: Mengembalikan kelas warna badge sesuai kode jenis material plastik
function getMaterialBadgeClass(code) {
  if (code === 'PP') return 'bg-emerald-100 text-auDark';
  if (code === 'HD') return 'bg-blue-100 text-blue-900';
  if (code === 'PE') return 'bg-amber-100 text-amber-900';
  if (code === 'AB') return 'bg-purple-100 text-purple-900';
  if (code === 'LD') return 'bg-slate-200 text-slate-800';
  return 'bg-gray-100 text-gray-700';
}

//* FUNGSI: Mengembalikan kelas warna badge segmen B2B vs B2C
function getSegmentBadgeClass(segment) {
  return segment === 'B2C'
    ? 'bg-teal-100 text-teal-900 border border-teal-300'
    : 'bg-indigo-100 text-indigo-900 border border-indigo-300';
}

//* FUNGSI: Menentukan apakah material termasuk Best Seller (banyak terbeli/terjual >= 15 kali)
function isBestSeller(item) {
  return Number(item.soldCount || 0) >= 15;
}

//* FUNGSI: Mengembalikan badge HTML untuk provider pengiriman Lalamove / Deliveree / Mandiri
function getProviderBadgeHtml(provider) {
  if (provider === 'Lalamove') {
    return '<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold badge-lalamove">🟠 LALAMOVE</span>';
  }
  if (provider === 'Deliveree') {
    return '<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold badge-deliveree">🟢 DELIVEREE</span>';
  }
  return '<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold badge-mandiri">🏠 MANDIRI</span>';
}

//* FUNGSI: Membuat nomor resi simulasi berdasarkan media pengiriman
function generateLogisticsResi(provider, trxId) {
  const rand = Math.floor(100 + Math.random() * 899);
  if (provider === 'Lalamove') return `LLM-${rand}${trxId}`;
  if (provider === 'Deliveree') return `DLV-${rand}${trxId}`;
  return `MDR-${rand}${trxId}`;
}

//* FUNGSI: Memformat tanggal & jam transaksi saat ini dalam format WIB
function getCurrentWIBTimestamp() {
  const now = new Date();
  const datePart = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timePart = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  }).replace('.', ':');
  return `${datePart} · ${timePart} WIB`;
}

//* FUNGSI: Menghitung Transaction Fee secara transparan berdasarkan segmen B2B atau B2C
function calculateTransactionFee(amount, segment = 'B2B') {
  const rate = segment === 'B2C'
    ? PLATFORM_FEE_CONFIG.b2cTransactionRate
    : PLATFORM_FEE_CONFIG.b2bTransactionRate;
  return Math.round(amount * rate);
}

//* FUNGSI: Mengambil daftar opsi kendaraan berdasarkan provider ('Lalamove', 'Deliveree', 'Mandiri')
function getLogisticsOptionsByProvider(provider) {
  return Object.values(PLATFORM_FEE_CONFIG.logisticsOptions).filter(opt => opt.provider === provider);
}
