/* =========================================================
   //* FILE: js/14-laporan.js
   //* FUNGSI: Mengelola Menu Laporan Keuangan:
   //*         - Total Omset (Penjualan / Terjual)
   //*         - Total Pembelian Limbah (Modal)
   //*         - Laba Bersih (Net Profit) & Margin (%)
   //*         - Leaderboard Material Best Seller
   //*         - Tabel Arsip Transaksi + Tombol Struk / Karcis Nota
   ========================================================= */

//* FUNGSI: Mengubah filter tabel laporan ('Semua', 'JUAL', 'BELI')
function setLaporanFilter(filterType) {
  appState.reportFilter = filterType;
  renderLaporan();
}

//* FUNGSI: Merender seluruh metrik, grafik, Best Seller, dan tabel pada Menu Laporan
function renderLaporan() {
  const tableBody = document.getElementById('lap-table-body');
  if (!tableBody) return;

  const salesTrx = appState.transactions.filter(t => (t.type || 'JUAL') === 'JUAL');
  const buyTrx = appState.transactions.filter(t => t.type === 'BELI');

  const totalOmset = salesTrx.reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalPembelian = buyTrx.reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalFeePlatform = appState.transactions.reduce((s, t) => s + Number(t.transactionFee || 0), 0);
  const totalOngkir = appState.transactions.reduce((s, t) => s + Number(t.logisticsFee || 0), 0);
  const totalBiaya = totalFeePlatform + totalOngkir;
  const labaBersih = totalOmset - totalPembelian - totalBiaya;
  const marginPct = totalOmset > 0 ? ((labaBersih / totalOmset) * 100).toFixed(1) : '0.0';

  const kgTerjual = salesTrx.reduce((s, t) => s + Number(t.weightKg || 0), 0);
  const kgTerbeli = buyTrx.reduce((s, t) => s + Number(t.weightKg || 0), 0);

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt('lap-omset', 'Rp ' + totalOmset.toLocaleString('id-ID'));
  setTxt('lap-omset-meta', `${salesTrx.length} Transaksi Terjual · ${kgTerjual.toLocaleString('id-ID')} KG`);
  setTxt('lap-pembelian', 'Rp ' + totalPembelian.toLocaleString('id-ID'));
  setTxt('lap-pembelian-meta', `${buyTrx.length} Transaksi Beli · ${kgTerbeli.toLocaleString('id-ID')} KG`);
  setTxt('lap-laba-bersih', (labaBersih < 0 ? '-Rp ' : 'Rp ') + Math.abs(labaBersih).toLocaleString('id-ID'));
  setTxt('lap-laba-margin', `Margin ${marginPct}% · Fee & Ongkir Rp ${totalBiaya.toLocaleString('id-ID')}`);
  setTxt('lap-total-kg', `${(kgTerjual + kgTerbeli).toLocaleString('id-ID')} KG`);
  setTxt('lap-total-nota', `${appState.transactions.length} Struk & Karcis Tercatat`);

  //* Visualisasi Bar Perbandingan Omset vs Pembelian vs Laba Bersih
  const visualBars = document.getElementById('lap-visual-bars');
  if (visualBars) {
    const maxVal = Math.max(totalOmset, totalPembelian, Math.abs(labaBersih), 1000000);
    const items = [
      { label: 'Omset Penjualan (Material Terjual)', val: totalOmset, color: 'from-auGreen to-auLime' },
      { label: 'Total Pembelian Limbah (Modal)', val: totalPembelian, color: 'from-sky-500 to-cyan-400' },
      { label: 'Biaya Platform & Ongkir (Lalamove / Deliveree)', val: totalBiaya, color: 'from-amber-500 to-orange-400' },
      { label: 'Laba Bersih (Net Profit)', val: Math.max(0, labaBersih), color: 'from-emerald-600 to-emerald-400' }
    ];
    visualBars.innerHTML = items.map(it => {
      const pct = Math.min(100, Math.round((it.val / maxVal) * 100));
      return `
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs font-semibold">
            <span class="text-auDark">${it.label}</span>
            <span class="font-extrabold text-auGreen">Rp ${it.val.toLocaleString('id-ID')}</span>
          </div>
          <div class="w-full h-3 bg-emerald-100/70 rounded-full overflow-hidden">
            <div class="chart-bar-fill h-full rounded-full bg-gradient-to-r ${it.color}" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  //* Daftar Best Seller di Menu Laporan
  const bsList = document.getElementById('lap-bestseller-list');
  if (bsList) {
    const topItems = [...appState.listings]
      .sort((a, b) => Number(b.soldCount || 0) - Number(a.soldCount || 0))
      .slice(0, 5);
    bsList.innerHTML = topItems.map((it, idx) => `
      <div class="py-2.5 flex items-center justify-between gap-2 text-xs">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-6 h-6 rounded-full ${idx < 3 ? 'bestseller-badge' : 'bg-emerald-100 text-auDark font-extrabold'} flex items-center justify-center text-[10px] shrink-0">#${idx + 1}</span>
          <div class="min-w-0">
            <p class="font-bold text-auDark truncate">${it.name}</p>
            <p class="text-[11px] text-gray-500">${(it.totalKgSold || 0).toLocaleString('id-ID')} KG · ${it.segment}</p>
          </div>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 font-extrabold text-[10px] shrink-0">🔥 ${it.soldCount || 0}x</span>
      </div>
    `).join('');
  }

  //* Tombol Filter Laporan
  const filterWrap = document.getElementById('lap-filter-btns');
  const activeFilter = appState.reportFilter || 'Semua';
  if (filterWrap) {
    const opts = [
      { key: 'Semua', label: `Semua (${appState.transactions.length})` },
      { key: 'JUAL', label: `💰 Penjualan / Terjual (${salesTrx.length})` },
      { key: 'BELI', label: `🛒 Pembelian (${buyTrx.length})` }
    ];
    filterWrap.innerHTML = opts.map(o => `
      <button onclick="setLaporanFilter('${o.key}')" class="px-3.5 py-1.5 rounded-full text-xs transition ${activeFilter === o.key ? 'font-extrabold bg-auDark text-auLime' : 'font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}">${o.label}</button>
    `).join('');
  }

  //* Tabel Rincian Transaksi Laporan
  const rows = appState.transactions.filter(t => activeFilter === 'Semua' || (t.type || 'JUAL') === activeFilter);
  if (rows.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-xs text-gray-500">Belum ada transaksi untuk filter ini.</td></tr>';
    return;
  }

  tableBody.innerHTML = rows.map(t => {
    const isBuy = t.type === 'BELI';
    return `
      <tr class="border-b border-gray-100 hover:bg-emerald-50/40 transition text-xs">
        <td class="py-3 px-3 font-extrabold text-auDark whitespace-nowrap">
          ${t.code}
          <div class="text-[10px] text-gray-400 font-normal">${t.date || ''}</div>
        </td>
        <td class="py-3 px-3">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${isBuy ? 'bg-sky-100 text-sky-900' : 'bg-emerald-100 text-auGreen'}">${isBuy ? '🛒 BELI' : '💰 JUAL'}</span>
        </td>
        <td class="py-3 px-3">
          <p class="font-bold text-auDark">${t.material}</p>
          <p class="text-[11px] text-gray-500">${isBuy ? 'Dari: ' + (t.seller || '-') : 'Ke: ' + (t.buyer || '-')}</p>
        </td>
        <td class="py-3 px-3 whitespace-nowrap">
          ${getProviderBadgeHtml(t.provider)}
          <div class="text-[10px] text-gray-500 mt-0.5">${t.vehicle || '-'}</div>
        </td>
        <td class="py-3 px-3 font-extrabold whitespace-nowrap ${isBuy ? 'text-sky-700' : 'text-auGreen'}">
          ${isBuy ? '-' : '+'} Rp ${Number(t.amount).toLocaleString('id-ID')}
          <div class="text-[10px] text-gray-400 font-normal">Fee+Ongkir: Rp ${(Number(t.transactionFee || 0) + Number(t.logisticsFee || 0)).toLocaleString('id-ID')}</div>
        </td>
        <td class="py-3 px-3 text-right whitespace-nowrap">
          <button onclick="openReceiptTicketModal(${t.id})" class="px-3 py-1.5 rounded-full bg-auDark text-auLime font-extrabold text-[11px] hover:opacity-90 transition">
            🧾 ${isBuy ? 'Struk' : 'Karcis/Nota'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}
