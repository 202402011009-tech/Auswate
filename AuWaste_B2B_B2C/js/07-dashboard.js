/* =========================================================
   //* FILE: js/07-dashboard.js
   //* FUNGSI: Merender Live Market Price Ticker, ringkasan KPI
   //*         Dashboard (termasuk Omset & Laba Bersih), daftar
   //*         material Best Seller & aktif, serta tab Analytics.
   ========================================================= */

//* FUNGSI: Merender bar Live Market Price Ticker di Landing Page & Dashboard
function renderMarketTickers() {
  const tickerHtml = MARKET_TICKER_DATA.map(item => `
    <span class="inline-flex items-center gap-2 text-xs font-medium text-emerald-100">
      <span class="px-1.5 py-0.5 rounded bg-auLime/20 text-auLime font-bold text-[10px]">${item.code}</span>
      <span>${item.name}:</span>
      <strong class="text-white">Rp ${item.price.toLocaleString('id-ID')}/kg</strong>
      <span class="${item.up ? 'text-auLime' : 'text-rose-400'} font-bold">${item.up ? '▲' : '▼'} ${item.change}</span>
    </span>
  `).join('<span class="text-emerald-700">•</span>');

  const fullLoop = tickerHtml + '<span class="text-emerald-700">•</span>' + tickerHtml;
  document.querySelectorAll('.market-ticker-track').forEach(track => {
    track.innerHTML = fullLoop;
  });
}

//* FUNGSI: Merender KPI Dashboard & listing aktif terbaru dengan badge Best Seller
function renderDashboard() {
  const activeItems = appState.listings.filter(l => l.status === 'Aktif');
  const b2bCount = activeItems.filter(l => l.segment === 'B2B').length;
  const b2cCount = activeItems.filter(l => l.segment === 'B2C').length;
  const totalKg = activeItems.reduce((acc, item) => acc + Number(item.weight), 0);
  const totalCo2 = activeItems.reduce((acc, item) => acc + Number(item.co2Saved || Math.round(item.weight * 1.7)), 0);

  //* Hitung ringkasan Omset & Laba Bersih dari transaksi untuk ditampilkan di Dashboard
  const salesTrx = appState.transactions.filter(t => (t.type || 'JUAL') === 'JUAL');
  const buyTrx = appState.transactions.filter(t => t.type === 'BELI');
  const totalOmset = salesTrx.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalBeli = buyTrx.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalFees = appState.transactions.reduce((sum, t) => sum + Number(t.transactionFee || 0) + Number(t.logisticsFee || 0), 0);
  const labaBersih = totalOmset - totalBeli - totalFees;

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt('dash-total-kg', totalKg.toLocaleString('id-ID') + ' KG');
  setTxt('dash-active-count', `${b2bCount} B2B · ${b2cCount} B2C Aktif`);
  setTxt('dash-est-value', 'Rp ' + totalOmset.toLocaleString('id-ID'));
  setTxt('dash-net-profit', (labaBersih < 0 ? '-Rp ' : 'Rp ') + Math.abs(labaBersih).toLocaleString('id-ID'));
  setTxt('dash-total-co2', (totalCo2 / 1000).toFixed(2) + ' Ton CO₂');

  const container = document.getElementById('dashboard-active-list');
  if (!container) return;

  const sortedActive = [...activeItems].sort((a, b) => Number(b.soldCount || 0) - Number(a.soldCount || 0));

  container.innerHTML = sortedActive.slice(0, 5).map(item => `
    <div onclick="openProductDetailModal(${item.id})" class="py-3.5 flex items-center justify-between cursor-pointer hover:bg-emerald-50/60 dark:hover:bg-white/5 px-3 rounded-2xl transition gap-3">
      <div class="flex items-center gap-3.5 min-w-0">
        <img src="${item.image}" onerror="this.onerror=null;this.src='${item.fallbackImg}'" alt="${item.name}" class="w-14 h-12 rounded-xl object-cover border border-auBorder shrink-0" />
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-1.5">
            <p class="font-bold text-sm text-auDark truncate">${item.name}</p>
            ${isBestSeller(item) ? '<span class="px-2 py-0.5 rounded-full text-[10px] bestseller-badge">🔥 Best Seller</span>' : ''}
            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${getSegmentBadgeClass(item.segment)}">${item.segment}</span>
            ${item.featured ? '<span class="px-2 py-0.5 rounded-full text-[10px] featured-ribbon">⭐ Featured</span>' : ''}
          </div>
          <p class="text-xs text-gray-500 truncate">${item.weight.toLocaleString('id-ID')} KG · Terjual/Terbeli ${item.soldCount || 0}x · ${item.city}</p>
        </div>
      </div>
      <div class="text-right shrink-0">
        <span class="font-extrabold text-sm text-auGreen block">Rp ${item.price.toLocaleString('id-ID')}/kg</span>
        <span class="text-[11px] text-gray-400">🛒 Beli material →</span>
      </div>
    </div>
  `).join('');
}

//* FUNGSI: Merender Analytics Pasar + Simulasi 3 Sumber Pendapatan Platform
function renderAnalytics() {
  const barsContainer = document.getElementById('analytics-material-bars');
  if (!barsContainer) return;

  const totals = {};
  appState.listings.forEach(item => {
    totals[item.code] = (totals[item.code] || 0) + Number(item.weight);
  });

  const maxWeight = Math.max(...Object.values(totals), 1000);
  const labels = {
    PP: 'PP Plastic',
    HD: 'HDPE Regrind',
    PE: 'PET Botol',
    LD: 'LDPE Film',
    AB: 'ABS Elektronik',
    PS: 'PS Foam'
  };

  barsContainer.innerHTML = Object.entries(totals).map(([code, weight]) => {
    const pct = Math.round((weight / maxWeight) * 100);
    return `
      <div class="space-y-1.5">
        <div class="flex justify-between text-xs font-semibold">
          <span class="text-auDark">${labels[code] || code} (${code})</span>
          <span class="text-auGreen font-bold">${weight.toLocaleString('id-ID')} KG</span>
        </div>
        <div class="w-full h-3 bg-emerald-100/70 rounded-full overflow-hidden">
          <div class="chart-bar-fill h-full rounded-full bg-gradient-to-r from-auGreen to-auLime" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');

  const totalGMV = appState.transactions.reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const totalTrxFee = appState.transactions.reduce((acc, t) => acc + Number(t.transactionFee || calculateTransactionFee(t.amount, t.segment)), 0);
  const totalLogFee = appState.transactions.reduce((acc, t) => acc + Number(t.logisticsFee || 0), 0);
  const featuredItemsCount = appState.listings.filter(l => l.featured).length;
  const totalFeaturedFee = featuredItemsCount * PLATFORM_FEE_CONFIG.featuredListingFee;

  const b2bTrx = appState.transactions.filter(t => t.segment === 'B2B').length;
  const b2cTrx = appState.transactions.filter(t => t.segment === 'B2C').length;

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt('analytics-total-revenue', 'Rp ' + totalGMV.toLocaleString('id-ID'));
  setTxt('analytics-trx-split', `${b2bTrx} B2B · ${b2cTrx} B2C`);
  setTxt('rev-transaction-fee', 'Rp ' + totalTrxFee.toLocaleString('id-ID'));
  setTxt('rev-logistics-fee', 'Rp ' + totalLogFee.toLocaleString('id-ID'));
  setTxt('rev-featured-fee', 'Rp ' + totalFeaturedFee.toLocaleString('id-ID'));
  setTxt('rev-featured-count', `${featuredItemsCount} Listing Dipromosikan`);
}
