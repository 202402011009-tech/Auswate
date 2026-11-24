/* =========================================================
   //* FILE: js/08-marketplace.js
   //* FUNGSI: Mengelola menu khusus BELI MATERIAL (terpisah dari Jual),
   //*         strip & lencana Best Seller, filter segmen/status/pencarian,
   //*         pilihan pengiriman LALAMOVE & DELIVEREE (Motor, Mobil, Van,
   //*         Pick-up, Truk), serta penerbitan Struk Pembelian otomatis.
   ========================================================= */

let selectedProductId = null;
let selectedBuyProvider = 'Lalamove';

//* FUNGSI: Merender 4 katalog unggulan di Landing Page (terlaris & Best Seller di depan)
function renderLandingCatalog() {
  const container = document.getElementById('landing-featured-catalog');
  if (!container) return;

  const active = appState.listings
    .filter(i => i.status === 'Aktif')
    .sort((a, b) => Number(b.soldCount || 0) - Number(a.soldCount || 0))
    .slice(0, 4);

  container.innerHTML = active.map(item => `
    <div onclick="openProductDetailModal(${item.id})" class="product-card theme-card theme-card-hover ${item.featured ? 'featured-listing-card' : ''} rounded-2xl border border-auBorder overflow-hidden cursor-pointer flex flex-col">
      <div class="product-card-img-wrap">
        <img src="${item.image}" onerror="this.onerror=null;this.src='${item.fallbackImg}'" alt="${item.name}" loading="lazy" />
        <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
          ${isBestSeller(item) ? '<span class="bestseller-badge text-[10px] px-2.5 py-1 rounded-full">🔥 BEST SELLER</span>' : ''}
          ${item.featured ? '<span class="featured-ribbon text-[10px] px-2.5 py-1 rounded-full shadow">⭐ FEATURED</span>' : ''}
        </div>
        <span class="absolute bottom-3 left-3 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow ${getSegmentBadgeClass(item.segment)}">
          ${item.segment} · ${item.sellerType}
        </span>
        <span class="absolute bottom-3 right-3 bg-black/70 backdrop-blur text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
          ${item.weight.toLocaleString('id-ID')} KG
        </span>
      </div>
      <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-md ${getMaterialBadgeClass(item.code)}">${item.code} · ${item.grade}</span>
            <span class="text-[11px] text-orange-600 font-bold">🔥 Terjual ${item.soldCount || 0}x</span>
          </div>
          <h4 class="font-extrabold text-base text-auDark leading-snug">${item.name}</h4>
          <p class="text-xs text-gray-500 line-clamp-2 mt-1">${item.desc || 'Material terpilah siap dimanfaatkan kembali.'}</p>
        </div>
        <div class="pt-2.5 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p class="text-[10px] text-gray-400 uppercase font-semibold">Harga Material</p>
            <p class="font-extrabold text-sm text-auGreen">Rp ${item.price.toLocaleString('id-ID')} <span class="text-xs font-normal text-gray-500">/kg</span></p>
          </div>
          <span class="text-xs font-bold bg-auGreen text-white px-3.5 py-1.5 rounded-full">🛒 Beli →</span>
        </div>
      </div>
    </div>
  `).join('');
}

//* FUNGSI: Merender Top 3 Best Seller di bagian atas menu Beli Material
function renderBestSellerStrip() {
  const box = document.getElementById('bestseller-showcase');
  if (!box) return;

  const top3 = [...appState.listings]
    .filter(i => i.status === 'Aktif')
    .sort((a, b) => Number(b.soldCount || 0) - Number(a.soldCount || 0))
    .slice(0, 3);

  box.innerHTML = top3.map((item, idx) => `
    <div onclick="openProductDetailModal(${item.id})" class="theme-card theme-card-hover p-3.5 rounded-2xl border-2 border-orange-200 cursor-pointer flex items-center gap-3">
      <div class="relative shrink-0">
        <img src="${item.image}" onerror="this.onerror=null;this.src='${item.fallbackImg}'" alt="${item.name}" class="w-16 h-14 rounded-xl object-cover border border-orange-200" />
        <span class="absolute -top-2 -left-2 w-6 h-6 rounded-full bestseller-badge text-[10px] flex items-center justify-center">#${idx + 1}</span>
      </div>
      <div class="min-w-0 flex-1">
        <span class="text-[10px] font-extrabold text-orange-600">🔥 BEST SELLER · ${item.soldCount || 0}x Transaksi</span>
        <p class="font-extrabold text-xs text-auDark truncate">${item.name}</p>
        <p class="text-[11px] font-bold text-auGreen">Rp ${item.price.toLocaleString('id-ID')}/kg · ${(item.totalKgSold || 0).toLocaleString('id-ID')} KG terjual</p>
      </div>
    </div>
  `).join('');
}

function filterListings(status) { appState.currentFilter = status; renderListings(); }
function filterBySegment(segment) { appState.currentSegment = segment; renderListings(); }
function toggleBestSellerFilter() { appState.bestSellerOnly = !appState.bestSellerOnly; renderListings(); }
function handleListingSearch(val) { appState.searchQuery = val.toLowerCase().trim(); renderListings(); }
function handleListingSort(val) { appState.sortBy = val; renderListings(); }
function setListingViewMode(mode) { appState.viewMode = mode; renderListings(); }

//* FUNGSI: Merender seluruh katalog pembelian limbah pada menu Beli Material
function renderListings() {
  renderBestSellerStrip();
  const filterContainer = document.getElementById('listing-filters');
  const segmentContainer = document.getElementById('listing-segment-filters');
  const listContainer = document.getElementById('full-waste-list');
  const bsBtn = document.getElementById('btn-filter-bestseller');
  if (!filterContainer || !listContainer) return;

  if (bsBtn) {
    bsBtn.className = appState.bestSellerOnly
      ? 'px-3.5 py-1.5 rounded-full text-xs font-extrabold bestseller-badge transition'
      : 'px-3.5 py-1.5 rounded-full text-xs font-bold bg-orange-50 border border-orange-300 text-orange-700 hover:bg-orange-100 transition';
  }

  const counts = {
    Semua: appState.listings.length,
    Aktif: appState.listings.filter(i => i.status === 'Aktif').length,
    Draft: appState.listings.filter(i => i.status === 'Draft').length,
    Terjual: appState.listings.filter(i => i.status === 'Terjual').length
  };

  filterContainer.innerHTML = ['Semua', 'Aktif', 'Draft', 'Terjual'].map(tab => {
    const active = appState.currentFilter === tab;
    return `<button onclick="filterListings('${tab}')" class="px-3.5 py-1.5 rounded-full text-xs transition ${active ? 'font-bold bg-emerald-100 border border-auGreen text-auDark' : 'font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}">${tab} (${counts[tab]})</button>`;
  }).join('');

  if (segmentContainer) {
    const segCounts = {
      Semua: appState.listings.length,
      B2B: appState.listings.filter(i => i.segment === 'B2B').length,
      B2C: appState.listings.filter(i => i.segment === 'B2C').length
    };
    const segLabels = {
      Semua: `Semua Segmen (${segCounts.Semua})`,
      B2B: `🏭 B2B Industri (${segCounts.B2B})`,
      B2C: `🏠 B2C Individu/UMKM (${segCounts.B2C})`
    };
    segmentContainer.innerHTML = ['Semua', 'B2B', 'B2C'].map(seg => {
      const active = (appState.currentSegment || 'Semua') === seg;
      return `<button onclick="filterBySegment('${seg}')" class="px-3.5 py-1.5 rounded-full text-xs transition ${active ? 'font-extrabold bg-auDark text-auLime shadow-sm' : 'font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}">${segLabels[seg]}</button>`;
    }).join('');
  }

  let filtered = appState.listings.filter(item => {
    const matchStatus = appState.currentFilter === 'Semua' || item.status === appState.currentFilter;
    const matchSegment = (appState.currentSegment || 'Semua') === 'Semua' || item.segment === appState.currentSegment;
    const matchBest = !appState.bestSellerOnly || isBestSeller(item);
    const q = appState.searchQuery || '';
    const matchSearch = !q ||
      item.name.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      (item.sellerType || '').toLowerCase().includes(q) ||
      (item.segment || '').toLowerCase().includes(q);
    return matchStatus && matchSegment && matchBest && matchSearch;
  });

  if (appState.sortBy === 'terlaris') {
    filtered = [...filtered].sort((a, b) => Number(b.soldCount || 0) - Number(a.soldCount || 0));
  } else if (appState.sortBy === 'featured') {
    filtered = [...filtered].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  } else if (appState.sortBy === 'harga-tinggi') {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  } else if (appState.sortBy === 'berat-besar') {
    filtered = [...filtered].sort((a, b) => b.weight - a.weight);
  } else if (appState.sortBy === 'berat-kecil') {
    filtered = [...filtered].sort((a, b) => a.weight - b.weight);
  }

  if (filtered.length === 0) {
    listContainer.className = 'py-12 text-center text-sm text-gray-500';
    listContainer.innerHTML = 'Tidak ada material yang cocok dengan filter saat ini.';
    return;
  }

  if (appState.viewMode === 'grid') {
    listContainer.className = 'grid sm:grid-cols-2 xl:grid-cols-3 gap-5';
    listContainer.innerHTML = filtered.map(item => `
      <div onclick="openProductDetailModal(${item.id})" class="product-card theme-card theme-card-hover ${item.featured ? 'featured-listing-card' : ''} rounded-2xl border border-auBorder overflow-hidden cursor-pointer flex flex-col">
        <div class="product-card-img-wrap">
          <img src="${item.image}" onerror="this.onerror=null;this.src='${item.fallbackImg}'" alt="${item.name}" loading="lazy" />
          <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
            ${isBestSeller(item) ? '<span class="bestseller-badge text-[10px] px-2.5 py-1 rounded-full">🔥 BEST SELLER</span>' : ''}
            ${item.featured ? '<span class="featured-ribbon text-[10px] px-2.5 py-1 rounded-full shadow">⭐ FEATURED</span>' : ''}
          </div>
          <span class="absolute top-3 right-3 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            🔥 ${item.soldCount || 0}x Terbeli
          </span>
          <span class="absolute bottom-3 left-3 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow ${getSegmentBadgeClass(item.segment)}">
            ${item.segment} · ${item.sellerType}
          </span>
        </div>
        <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center justify-between text-[11px] mb-1">
              <span class="font-bold px-2 py-0.5 rounded ${getMaterialBadgeClass(item.code)}">${item.code} · ${item.grade}</span>
              <span class="text-gray-500">📍 ${item.city}</span>
            </div>
            <h4 class="font-extrabold text-base text-auDark">${item.name}</h4>
            <p class="text-xs text-gray-500 mt-1 line-clamp-2">${item.desc || 'Material terpilah siap daur ulang.'}</p>
          </div>
          <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p class="text-[11px] text-gray-500">Stok ${item.weight.toLocaleString('id-ID')} KG · ${(item.totalKgSold || 0).toLocaleString('id-ID')} KG terjual</p>
              <p class="font-extrabold text-sm text-auGreen">
                ${item.status === 'Draft' ? 'Menunggu Publikasi' : 'Rp ' + item.price.toLocaleString('id-ID') + ' / kg'}
              </p>
            </div>
            <button type="button" class="px-4 py-1.5 rounded-full bg-auGreen text-white text-xs font-bold hover:bg-auDark transition">🛒 Beli</button>
          </div>
        </div>
      </div>
    `).join('');
  } else {
    listContainer.className = 'divide-y divide-gray-100 bg-white rounded-2xl border border-auBorder px-4';
    listContainer.innerHTML = filtered.map(item => `
      <div onclick="openProductDetailModal(${item.id})" class="py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-emerald-50/50 px-2 rounded-xl transition">
        <div class="flex items-center gap-3.5 min-w-0">
          <img src="${item.image}" onerror="this.onerror=null;this.src='${item.fallbackImg}'" alt="${item.name}" class="w-16 h-12 rounded-xl object-cover border border-auBorder shrink-0" />
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-1.5">
              <p class="font-bold text-sm text-auDark truncate">${item.name}</p>
              ${isBestSeller(item) ? '<span class="text-[10px] px-2 py-0.5 rounded-full bestseller-badge">🔥 Best Seller</span>' : ''}
              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full ${getSegmentBadgeClass(item.segment)}">${item.segment}</span>
              ${item.featured ? '<span class="text-[10px] px-2 py-0.5 rounded-full featured-ribbon">⭐ Featured</span>' : ''}
            </div>
            <p class="text-xs text-gray-500 truncate">${item.weight.toLocaleString('id-ID')} KG · Terbeli ${item.soldCount || 0}x · ${item.city} · ${item.grade}</p>
          </div>
        </div>
        <span class="font-extrabold text-sm text-auGreen shrink-0">
          ${item.status === 'Draft' ? 'Draft' : 'Rp ' + item.price.toLocaleString('id-ID') + '/kg'}
        </span>
      </div>
    `).join('');
  }
}

//* FUNGSI: Memilih provider pengiriman (Lalamove / Deliveree / Mandiri) pada Modal Pembelian
function selectBuyLogisticsProvider(provider) {
  selectedBuyProvider = provider;
  ['Lalamove', 'Deliveree', 'Mandiri'].forEach(p => {
    const btn = document.getElementById('modal-provider-' + p);
    if (!btn) return;
    if (p === provider) {
      btn.className = `px-3 py-2 rounded-xl text-xs font-extrabold border transition ${
        p === 'Lalamove' ? 'provider-pill-lalamove' : p === 'Deliveree' ? 'provider-pill-deliveree' : 'provider-pill-self'
      }`;
    } else {
      btn.className = 'px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition';
    }
  });

  const sel = document.getElementById('modal-logistics-select');
  if (sel) {
    const opts = getLogisticsOptionsByProvider(provider);
    sel.innerHTML = opts.map(o =>
      `<option value="${o.id}">${o.icon} ${o.vehicleType} (Maks. ${o.maxKg === 99999 ? 'Bebas' : o.maxKg.toLocaleString('id-ID') + ' KG'}) — Rp ${o.fee.toLocaleString('id-ID')}</option>`
    ).join('');
  }
  updateModalCostBreakdown();
}

//* FUNGSI: Membuka Modal Beli Material lengkap dengan jumlah KG & pilihan Lalamove/Deliveree
function openProductDetailModal(id) {
  const item = appState.listings.find(l => l.id === id);
  if (!item) return;

  selectedProductId = id;

  document.getElementById('modal-prod-img').src = item.image;
  document.getElementById('modal-prod-img').onerror = function() { this.onerror = null; this.src = item.fallbackImg; };
  document.getElementById('modal-prod-badge').textContent = `${isBestSeller(item) ? '🔥 BEST SELLER · ' : ''}${item.segment} · ${item.code} · ${item.grade}`;
  document.getElementById('modal-prod-title').textContent = item.name;
  document.getElementById('modal-prod-zone').textContent = `📍 ${item.zone || item.city} · Penjual: ${item.sellerName || item.sellerType} · Terjual ${item.soldCount || 0}x`;
  document.getElementById('modal-prod-desc').textContent = item.desc || 'Material siap dimanfaatkan kembali.';
  document.getElementById('modal-prod-weight').textContent = item.weight.toLocaleString('id-ID') + ' KG';
  document.getElementById('modal-prod-price').textContent = 'Rp ' + item.price.toLocaleString('id-ID') + ' / kg';
  document.getElementById('modal-prod-purity').textContent = item.purity || '96.0%';
  document.getElementById('modal-prod-co2').textContent = (item.co2Saved || Math.round(item.weight * 1.7)).toLocaleString('id-ID') + ' kg CO₂';

  const qtyInput = document.getElementById('modal-buy-qty');
  if (qtyInput) {
    qtyInput.max = Math.max(1, item.weight);
    qtyInput.value = item.weight;
  }

  selectBuyLogisticsProvider(item.segment === 'B2C' ? 'Lalamove' : 'Deliveree');
  document.getElementById('modal-product-detail').classList.add('open');
}

//* FUNGSI: Menghitung ulang subtotal, Transaction Fee, & ongkir Lalamove/Deliveree secara real-time
function updateModalCostBreakdown() {
  const item = appState.listings.find(l => l.id === selectedProductId);
  if (!item) return;

  const qty = Math.max(1, Number(document.getElementById('modal-buy-qty')?.value) || item.weight);
  const subtotal = qty * Number(item.price);
  const trxFee = calculateTransactionFee(subtotal, item.segment);
  const ratePct = item.segment === 'B2C' ? '2.5%' : '1.5%';

  const logKey = document.getElementById('modal-logistics-select')?.value || 'self';
  const logCfg = PLATFORM_FEE_CONFIG.logisticsOptions[logKey] || PLATFORM_FEE_CONFIG.logisticsOptions.self;
  const grandTotal = subtotal + trxFee + logCfg.fee;

  const metaEl = document.getElementById('modal-logistics-meta');
  if (metaEl) metaEl.textContent = `${logCfg.icon} ${logCfg.provider} · ${logCfg.vehicleType} · Estimasi tiba: ${logCfg.eta}`;

  document.getElementById('modal-fee-subtotal').textContent = `Rp ${subtotal.toLocaleString('id-ID')} (${qty.toLocaleString('id-ID')} KG)`;
  document.getElementById('modal-fee-trx-label').textContent = `Transaction Fee (${item.segment} · ${ratePct})`;
  document.getElementById('modal-fee-trx').textContent = 'Rp ' + trxFee.toLocaleString('id-ID');
  document.getElementById('modal-fee-logistics').textContent = logCfg.fee === 0 ? 'Rp 0 (Mandiri)' : `Rp ${logCfg.fee.toLocaleString('id-ID')} (${logCfg.provider})`;
  document.getElementById('modal-prod-total').textContent = 'Rp ' + grandTotal.toLocaleString('id-ID');
}

function closeProductDetailModal() {
  document.getElementById('modal-product-detail').classList.remove('open');
}

//* FUNGSI: Proses Beli Material → Update Best Seller → Otomatis Muncul Struk Pembelian + Ucapan Terima Kasih
function createQuickOrderFromModal() {
  const item = appState.listings.find(l => l.id === selectedProductId);
  if (!item) return;

  const qty = Math.max(1, Number(document.getElementById('modal-buy-qty')?.value) || item.weight);
  const subtotal = qty * Number(item.price);
  const logKey = document.getElementById('modal-logistics-select')?.value || 'self';
  const logCfg = PLATFORM_FEE_CONFIG.logisticsOptions[logKey] || PLATFORM_FEE_CONFIG.logisticsOptions.self;

  // Perbarui jumlah terbeli untuk indikator Best Seller
  item.soldCount = Number(item.soldCount || 0) + 1;
  item.totalKgSold = Number(item.totalKgSold || 0) + qty;

  closeProductDetailModal();

  const newTrx = createTransactionRecord({
    type: 'BELI',
    segment: item.segment,
    buyer: appState.user.company,
    seller: item.sellerName || item.sellerType,
    material: `${qty.toLocaleString('id-ID')} KG ${item.name}`,
    materialCode: item.code,
    weightKg: qty,
    unitPrice: item.price,
    amount: subtotal,
    logisticsCfg: logCfg,
    route: `${item.city} → Lokasi ${appState.user.company}`
  });

  renderAllViews();
  showToast(`Pembelian ${newTrx.code} berhasil! Struk otomatis diterbitkan.`, 'success');
  openReceiptTicketModal(newTrx.id);
}
