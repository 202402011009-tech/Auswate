/* =========================================================
   //* FILE: js/09-ai-scanner.js
   //* FUNGSI: Mengelola menu terpisah JUAL MATERIAL (AI Scanner),
   //*         pilihan pengiriman LALAMOVE & DELIVEREE (Motor, Mobil,
   //*         Van, Pick-up, Truk), hitung estimasi omset & dana bersih,
   //*         dan langsung menerbitkan Karcis/Nota + Ucapan Terima Kasih.
   ========================================================= */

let uploadedPreviewDataUrl = null;
let selectedSellProvider = 'Lalamove';

//* FUNGSI: Menjalankan simulasi analisis AI saat jenis plastik dipilih
function runAISimulation() {
  const jenisEl = document.getElementById('input-jenis');
  if (!jenisEl) return;
  const info = AI_PRICE_CATALOG[jenisEl.value] || AI_PRICE_CATALOG.PP;

  document.getElementById('ai-detected-title').textContent = 'Terdeteksi: ' + info.title;
  document.getElementById('ai-price-range').textContent = info.range;
  document.getElementById('ai-purity-val').textContent = info.purity;
  document.getElementById('ai-moisture-val').textContent = info.moisture;

  const hargaInput = document.getElementById('input-harga-jual');
  if (hargaInput) hargaInput.value = info.avg;

  if (!uploadedPreviewDataUrl) {
    const imgEl = document.getElementById('ai-preview-image');
    if (imgEl) {
      imgEl.src = info.image;
      imgEl.onerror = function() { this.onerror = null; this.src = info.fallbackImg; };
    }
  }
  triggerScanLaserAnimation(info.title);
  updateSellSummary();
}

//* FUNGSI: Animasi garis laser hijau di atas preview foto
function triggerScanLaserAnimation(labelName) {
  const frame = document.getElementById('ai-scan-frame');
  const conf = document.getElementById('ai-confidence');
  if (!frame || !conf) return;

  frame.classList.add('scanning');
  conf.textContent = '⚡ AI sedang memindai tekstur & jenis polimer...';

  setTimeout(() => {
    frame.classList.remove('scanning');
    conf.textContent = `✓ Keyakinan 97.4% — ${labelName} terverifikasi siap jual`;
  }, 1100);
}

//* FUNGSI: Membaca foto asli yang diunggah pengguna dari komputer/HP
function simulatePhotoUpload(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function(evt) {
      uploadedPreviewDataUrl = evt.target.result;
      const imgEl = document.getElementById('ai-preview-image');
      if (imgEl) imgEl.src = uploadedPreviewDataUrl;

      document.getElementById('upload-label').textContent = '✓ Foto terpilih: ' + file.name + ' (Terverifikasi AI)';
      triggerScanLaserAnimation(file.name);
      showToast('Foto berhasil dipindai AI Computer Vision!', 'success');
    };
    reader.readAsDataURL(file);
  }
}

//* FUNGSI: Tombol demo 1-klik sampel foto
function useDemoAISample(jenisKey) {
  const jenisEl = document.getElementById('input-jenis');
  if (jenisEl) jenisEl.value = jenisKey;
  uploadedPreviewDataUrl = null;
  runAISimulation();
  document.getElementById('upload-label').textContent = `✓ Sampel Foto ${jenisKey} dimuat & dipindai AI`;
  showToast(`AI mendeteksi material ${jenisKey} dengan akurasi 97%`, 'info');
}

//* FUNGSI: Menyesuaikan contoh berat otomatis saat user memilih segmen B2C vs B2B
function handleSegmentInputChange(val) {
  const beratEl = document.getElementById('input-berat');
  if (!beratEl) return;
  if (val === 'B2C') {
    beratEl.min = 1;
    if (Number(beratEl.value) > 200) beratEl.value = 30;
  } else {
    beratEl.min = 50;
    if (Number(beratEl.value) < 200) beratEl.value = 500;
  }
  updateSellSummary();
}

//* FUNGSI: Memilih provider pengiriman (Lalamove / Deliveree / Mandiri) di Form Jual Material
function selectSellLogisticsProvider(provider) {
  selectedSellProvider = provider;
  ['Lalamove', 'Deliveree', 'Mandiri'].forEach(p => {
    const btn = document.getElementById('sell-provider-' + p);
    if (!btn) return;
    if (p === provider) {
      btn.className = `px-3 py-2 rounded-xl text-xs font-extrabold border transition ${
        p === 'Lalamove' ? 'provider-pill-lalamove' : p === 'Deliveree' ? 'provider-pill-deliveree' : 'provider-pill-self'
      }`;
    } else {
      btn.className = 'px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition';
    }
  });

  const sel = document.getElementById('sell-logistics-select');
  if (sel) {
    const opts = getLogisticsOptionsByProvider(provider);
    sel.innerHTML = opts.map(o =>
      `<option value="${o.id}">${o.icon} ${o.vehicleType} (Maks. ${o.maxKg === 99999 ? 'Bebas' : o.maxKg.toLocaleString('id-ID') + ' KG'}) — Rp ${o.fee.toLocaleString('id-ID')}</option>`
    ).join('');
  }
  updateSellSummary();
}

//* FUNGSI: Menghitung estimasi Omset & Dana Bersih Penjualan secara real-time
function updateSellSummary() {
  const segment = document.getElementById('input-segment')?.value || 'B2B';
  const berat = Math.max(1, Number(document.getElementById('input-berat')?.value) || 0);
  const harga = Math.max(100, Number(document.getElementById('input-harga-jual')?.value) || 8100);
  const logKey = document.getElementById('sell-logistics-select')?.value || 'self';
  const logCfg = PLATFORM_FEE_CONFIG.logisticsOptions[logKey] || PLATFORM_FEE_CONFIG.logisticsOptions.self;

  const omset = berat * harga;
  const fee = calculateTransactionFee(omset, segment);
  const net = Math.max(0, omset - fee - logCfg.fee);

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt('sell-logistics-meta', `${logCfg.icon} ${logCfg.provider} · ${logCfg.vehicleType} · Estimasi jemput: ${logCfg.eta}`);
  setTxt('sell-est-omset', 'Rp ' + omset.toLocaleString('id-ID'));
  setTxt('sell-est-fee', '- Rp ' + fee.toLocaleString('id-ID'));
  setTxt('sell-est-ongkir', logCfg.fee === 0 ? 'Rp 0 (Mandiri)' : '- Rp ' + logCfg.fee.toLocaleString('id-ID'));
  setTxt('sell-est-net', 'Rp ' + net.toLocaleString('id-ID'));
}

//* FUNGSI: Menjual material → Catat Omset & Best Seller → Langsung Arahkan ke Karcis/Nota + Ucapan Terima Kasih
function publishNewListing(e) {
  e.preventDefault();
  const jenis = document.getElementById('input-jenis').value;
  const segment = document.getElementById('input-segment')?.value || 'B2B';
  const sellerType = document.getElementById('input-seller-type')?.value || appState.user.accountCategory;
  const berat = Math.max(1, Number(document.getElementById('input-berat').value) || 100);
  const harga = Math.max(100, Number(document.getElementById('input-harga-jual')?.value) || 8100);
  const buyerTarget = document.getElementById('input-buyer-target')?.value || 'PT Daur Prima Nusantara';
  const kualitas = document.getElementById('input-kualitas').value;
  const lokasiRaw = document.getElementById('input-lokasi').value || 'Surabaya, Jawa Timur';
  const deskripsi = document.getElementById('input-deskripsi').value.trim();
  const isFeatured = Boolean(document.getElementById('input-featured')?.checked);
  const logKey = document.getElementById('sell-logistics-select')?.value || 'self';
  const logCfg = PLATFORM_FEE_CONFIG.logisticsOptions[logKey] || PLATFORM_FEE_CONFIG.logisticsOptions.self;
  const info = AI_PRICE_CATALOG[jenis] || AI_PRICE_CATALOG.PP;

  // Tambah counter Best Seller pada material sejenis atau buat item katalog baru
  const existing = appState.listings.find(l => l.code === info.code && l.segment === segment);
  if (existing) {
    existing.soldCount = Number(existing.soldCount || 0) + 1;
    existing.totalKgSold = Number(existing.totalKgSold || 0) + berat;
    if (isFeatured) existing.featured = true;
  } else {
    appState.listings.unshift({
      id: Date.now(),
      code: info.code,
      segment: segment,
      sellerType: sellerType,
      sellerName: appState.user.company,
      featured: isFeatured,
      soldCount: 1,
      totalKgSold: berat,
      name: `${info.name} (${segment})`,
      weight: berat,
      city: lokasiRaw.split(',')[0].trim(),
      zone: lokasiRaw,
      grade: kualitas,
      price: harga,
      status: 'Aktif',
      aiScore: 97,
      co2Saved: Math.round(berat * info.co2Factor),
      purity: info.purity,
      desc: deskripsi || `Material ${info.title} (${kualitas}) dijual oleh ${appState.user.company}.`,
      image: uploadedPreviewDataUrl || info.image,
      fallbackImg: info.fallbackImg
    });
  }

  const omset = berat * harga;
  const newTrx = createTransactionRecord({
    type: 'JUAL',
    segment: segment,
    buyer: buyerTarget,
    seller: appState.user.company,
    material: `${berat.toLocaleString('id-ID')} KG ${info.name} (${kualitas})`,
    materialCode: info.code,
    weightKg: berat,
    unitPrice: harga,
    amount: omset,
    logisticsCfg: logCfg,
    route: `${lokasiRaw.split(',')[0].trim()} → ${buyerTarget}`
  });

  uploadedPreviewDataUrl = null;
  renderAllViews();
  showToast(`Penjualan ${newTrx.code} berhasil! Karcis / Nota otomatis diterbitkan.`, 'success');

  //* Langsung arahkan ke Karcis / Nota Penjualan & Ucapan Terima Kasih
  openReceiptTicketModal(newTrx.id);
}

//* FUNGSI: Merender riwayat penjualan & karcis nota pada bagian bawah menu Jual Material
function renderMySalesHistory() {
  const container = document.getElementById('my-sales-history-list');
  if (!container) return;

  const sales = appState.transactions.filter(t => (t.type || 'JUAL') === 'JUAL');
  if (sales.length === 0) {
    container.innerHTML = '<p class="text-xs text-gray-500 py-4 text-center">Belum ada transaksi penjualan tercatat.</p>';
    return;
  }

  container.innerHTML = sales.map(t => `
    <div class="py-3 flex flex-wrap items-center justify-between gap-3">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="font-extrabold text-xs text-auDark">${t.code}</span>
          ${getProviderBadgeHtml(t.provider)}
          <span class="text-[10px] text-gray-400">${t.date || ''}</span>
        </div>
        <p class="text-xs font-semibold text-auDark mt-0.5">${t.material} → ${t.buyer}</p>
        <p class="text-[11px] text-gray-500">${t.vehicle || t.truck} · Resi: ${t.resi || '-'}</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="font-extrabold text-sm text-auGreen">Rp ${Number(t.amount).toLocaleString('id-ID')}</span>
        <button onclick="openReceiptTicketModal(${t.id})" class="px-3 py-1.5 rounded-full bg-auDark text-auLime text-[11px] font-extrabold hover:opacity-90 transition">
          🎟️ Karcis / Nota
        </button>
      </div>
    </div>
  `).join('');
}
