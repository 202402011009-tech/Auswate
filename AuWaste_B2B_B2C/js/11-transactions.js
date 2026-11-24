/* =========================================================
   //* FILE: js/11-transactions.js
   //* FUNGSI: Mengelola transaksi 5 tahap (Offer, Order, Pickup,
   //*         Delivery, Selesai), pencatatan transaksi BELI & JUAL
   //*         dengan armada Lalamove / Deliveree, peta tracking,
   //*         Modal Struk/Karcis + Ucapan Terima Kasih, Bukti Serah
   //*         Terima Digital, dan Pelaporan Kendala.
   ========================================================= */

//* FUNGSI INTI: Mencatat transaksi BELI atau JUAL lengkap dengan resi Lalamove / Deliveree
function createTransactionRecord({ type, segment, buyer, seller, material, materialCode, weightKg, unitPrice, amount, logisticsCfg, route }) {
  const nextId = (appState.transactions[0]?.id || 36) + 1;
  const prefix = type === 'BELI' ? 'STR-BELI-00' : 'KRC-JUAL-00';
  const code = prefix + nextId;
  const trxFee = calculateTransactionFee(amount, segment);
  const logCfg = logisticsCfg || PLATFORM_FEE_CONFIG.logisticsOptions.lalamove_pickup;
  const resi = generateLogisticsResi(logCfg.provider, nextId);

  const trx = {
    id: nextId,
    code: code,
    type: type, // 'BELI' atau 'JUAL'
    date: getCurrentWIBTimestamp(),
    segment: segment || 'B2B',
    buyer: buyer,
    seller: seller,
    material: material,
    materialCode: materialCode || 'PP',
    weightKg: weightKg || 100,
    unitPrice: unitPrice || 8000,
    amount: amount,
    transactionFee: trxFee,
    logisticsFee: logCfg.fee,
    provider: logCfg.provider,
    vehicle: logCfg.vehicleType,
    logisticsMode: logCfg.label,
    resi: resi,
    detail: `${material} · Rp ${amount.toLocaleString('id-ID')} · ${segment}`,
    status: 'Pickup',
    truck: logCfg.fleet,
    driver: logCfg.driver,
    route: route || 'Surabaya → Mitra Tujuan'
  };

  appState.transactions.unshift(trx);
  appState.activeTrxStep = 3;
  saveState();
  return trx;
}

//* FUNGSI: Membuat transaksi penjualan dari Smart Match / Chat Nego → langsung buka Karcis/Nota
function createDealFromMatch(buyerName, totalRupiah, materialLabel = '1.000 KG PP', segment = 'B2B', customLogistics = null) {
  const logCfg = customLogistics || (
    segment === 'B2C'
      ? PLATFORM_FEE_CONFIG.logisticsOptions.lalamove_sedan
      : PLATFORM_FEE_CONFIG.logisticsOptions.deliveree_engkel
  );

  const parsedWeight = parseInt(String(materialLabel).replace(/\./g, '').replace(/\D/g, ''), 10) || 500;
  const unitPrice = Math.max(100, Math.round(totalRupiah / parsedWeight));

  const trx = createTransactionRecord({
    type: 'JUAL',
    segment: segment,
    buyer: buyerName,
    seller: appState.user.company,
    material: materialLabel,
    materialCode: 'PP',
    weightKg: parsedWeight,
    unitPrice: unitPrice,
    amount: totalRupiah,
    logisticsCfg: logCfg,
    route: `${appState.user.company} → ${buyerName}`
  });

  renderAllViews();
  showToast(`Deal ${trx.code} (${segment}) berhasil! Karcis/Nota otomatis diterbitkan.`, 'success');
  openReceiptTicketModal(trx.id);
}

//* FUNGSI: Merender stepper 5 tahap, rincian biaya aktif, peta armada, & riwayat transaksi
function renderTransactions() {
  const steps = ['Offer', 'Order', 'Pickup', 'Delivery', 'Selesai'];
  const stepperEl = document.getElementById('trx-stepper');
  const historyEl = document.getElementById('transaction-history-list');
  if (!stepperEl || !historyEl) return;

  stepperEl.innerHTML = steps.map((label, idx) => {
    const stepNum = idx + 1;
    let circleClass = 'bg-gray-100 text-gray-500';
    let content = stepNum;

    if (stepNum < appState.activeTrxStep) {
      circleClass = 'bg-auGreen text-white';
      content = '✓';
    } else if (stepNum === appState.activeTrxStep) {
      circleClass = 'bg-auLime text-auDark ring-4 ring-auLime/35 scale-110';
    }

    return `
      <div class="flex flex-col items-center gap-1.5 z-10">
        <div class="w-10 h-10 rounded-full font-extrabold text-xs flex items-center justify-center transition-all ${circleClass}">${content}</div>
        <span class="text-xs ${stepNum === appState.activeTrxStep ? 'font-extrabold text-auDark' : 'text-gray-500'}">${label}</span>
      </div>
    `;
  }).join('');

  const activeTrx = appState.transactions[0];
  if (activeTrx) {
    const typeLabel = activeTrx.type === 'BELI' ? 'PEMBELIAN' : 'PENJUALAN';
    document.getElementById('active-trx-title').textContent = `${activeTrx.code} (${typeLabel} · ${activeTrx.segment || 'B2B'}) · ${activeTrx.material}`;
    const metaEl = document.getElementById('active-trx-fleet-meta');
    if (metaEl) {
      metaEl.textContent = `${activeTrx.provider || 'Logistik'}: ${activeTrx.truck} · Driver: ${activeTrx.driver} · Resi: ${activeTrx.resi || '-'} · Rute: ${activeTrx.route}`;
    }

    const feeBox = document.getElementById('active-trx-fee-summary');
    if (feeBox) {
      const tFee = activeTrx.transactionFee ?? calculateTransactionFee(activeTrx.amount, activeTrx.segment);
      const lFee = activeTrx.logisticsFee ?? 0;
      const isBuy = activeTrx.type === 'BELI';
      const finalVal = isBuy ? (Number(activeTrx.amount) + Number(tFee) + Number(lFee)) : Math.max(0, Number(activeTrx.amount) - Number(tFee) - Number(lFee));

      feeBox.innerHTML = `
        <div class="grid sm:grid-cols-4 gap-3 text-xs">
          <div class="bg-auBg p-3 rounded-xl">
            <p class="text-[10px] text-gray-500">${isBuy ? 'Nilai Pembelian Material' : 'Omset Penjualan'}</p>
            <p class="font-extrabold text-auDark mt-0.5">Rp ${Number(activeTrx.amount).toLocaleString('id-ID')}</p>
          </div>
          <div class="bg-auBg p-3 rounded-xl">
            <p class="text-[10px] text-gray-500">Transaction Fee (Transparan)</p>
            <p class="font-extrabold text-auGreen mt-0.5">Rp ${Number(tFee).toLocaleString('id-ID')}</p>
          </div>
          <div class="bg-auBg p-3 rounded-xl">
            <p class="text-[10px] text-gray-500">Pengiriman (${activeTrx.provider || 'Mandiri'})</p>
            <p class="font-extrabold text-auDark mt-0.5">${lFee === 0 ? 'Rp 0 (Mandiri)' : 'Rp ' + Number(lFee).toLocaleString('id-ID')}</p>
          </div>
          <div class="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
            <p class="text-[10px] text-auGreen font-bold">${isBuy ? 'Total Bayar' : 'Estimasi Diterima Bersih'}</p>
            <p class="font-black text-auGreen mt-0.5">Rp ${finalVal.toLocaleString('id-ID')}</p>
          </div>
        </div>
      `;
    }
  }

  const truckPositions = { 1: 8, 2: 26, 3: 48, 4: 74, 5: 90 };
  const statusMessages = {
    1: 'Penawaran harga & armada pengiriman (Lalamove/Deliveree) sedang dikonfirmasi.',
    2: 'Pesanan disepakati. Driver mitra sedang menuju titik penjemputan.',
    3: 'Proses penimbangan, muat barang, & verifikasi serah terima sedang berlangsung.',
    4: 'Armada dalam perjalanan menuju lokasi tujuan (terpantau real-time).',
    5: 'Serah terima selesai! Struk / Karcis & bukti serah terima telah tercatat di Laporan.'
  };

  const truckMarker = document.getElementById('fleet-truck-marker');
  const routeProgress = document.getElementById('fleet-route-progress');
  const liveStatusText = document.getElementById('fleet-live-status');

  const pos = truckPositions[appState.activeTrxStep] || 48;
  if (truckMarker) truckMarker.style.left = `calc(${pos}% - 20px)`;
  if (routeProgress) routeProgress.style.width = `${pos}%`;
  if (liveStatusText) liveStatusText.textContent = statusMessages[appState.activeTrxStep];

  historyEl.innerHTML = appState.transactions.map(t => {
    const isBuy = t.type === 'BELI';
    return `
      <div class="py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3.5 min-w-0">
          <span class="w-10 h-10 rounded-xl ${isBuy ? 'bg-sky-100 text-sky-900' : 'bg-emerald-100 text-auDark'} font-extrabold text-xs flex items-center justify-center shrink-0">${isBuy ? 'BELI' : 'JUAL'}</span>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-1.5">
              <p class="font-bold text-sm text-auDark truncate">${t.code} · ${isBuy ? 'Dari ' + (t.seller || '-') : 'Ke ' + (t.buyer || '-')}</p>
              ${getProviderBadgeHtml(t.provider)}
              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full ${getSegmentBadgeClass(t.segment || 'B2B')}">${t.segment || 'B2B'}</span>
            </div>
            <p class="text-xs text-gray-500 truncate">${t.material} · Rp ${Number(t.amount).toLocaleString('id-ID')} · ${t.vehicle || t.truck}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="px-2.5 py-1 rounded-full text-xs font-extrabold ${t.status === 'Selesai' ? 'bg-emerald-100 text-auGreen' : t.status === 'Pickup' || t.status === 'Delivery' ? 'bg-auLime/40 text-auDark' : 'bg-amber-100 text-amber-800'}">${t.status}</span>
          <button onclick="openReceiptTicketModal(${t.id})" class="px-3 py-1 rounded-full bg-auDark text-auLime text-[11px] font-extrabold hover:opacity-90 transition">
            🧾 ${isBuy ? 'Struk' : 'Karcis/Nota'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

//* FUNGSI: Memajukan tahap simulasi transaksi (Offer -> Order -> Pickup -> Delivery -> Selesai)
function advanceTransactionStep() {
  const steps = ['Offer', 'Order', 'Pickup', 'Delivery', 'Selesai'];
  appState.activeTrxStep = appState.activeTrxStep < 5 ? appState.activeTrxStep + 1 : 1;
  const newStatus = steps[appState.activeTrxStep - 1];

  if (appState.transactions[0]) {
    appState.transactions[0].status = newStatus;
  }
  saveState();
  renderAllViews();
  showToast(`Status transaksi diperbarui ke tahap: ${newStatus}`, 'info');
}

//* FUNGSI: Membuka Modal Struk Pembelian (BELI) atau Karcis/Nota Penjualan (JUAL) + Ucapan Terima Kasih
function openReceiptTicketModal(trxId) {
  const trx = appState.transactions.find(t => t.id === trxId) || appState.transactions[0];
  if (!trx) return;

  const isBuy = trx.type === 'BELI';
  const tFee = Number(trx.transactionFee || 0);
  const lFee = Number(trx.logisticsFee || 0);
  const grandTotal = isBuy
    ? (Number(trx.amount) + tFee + lFee)
    : Math.max(0, Number(trx.amount) - tFee - lFee);

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setTxt('ticket-badge', isBuy ? '✅ STRUK PEMBELIAN LIMBAH RESMI' : '🎟️ KARCIS / NOTA PENJUALAN MATERIAL');
  setTxt('ticket-heading', isBuy ? 'Struk Pembelian Material' : 'Karcis & Nota Penjualan');
  setTxt('ticket-code', trx.code);
  setTxt('ticket-date', trx.date || getCurrentWIBTimestamp());
  setTxt('ticket-seller', trx.seller || appState.user.company);
  setTxt('ticket-buyer', trx.buyer || '-');
  setTxt('ticket-material', trx.material);
  setTxt('ticket-qty-price', `${Number(trx.weightKg || 0).toLocaleString('id-ID')} KG × Rp ${Number(trx.unitPrice || 0).toLocaleString('id-ID')}/kg`);

  const provEl = document.getElementById('ticket-provider-badge');
  if (provEl) provEl.innerHTML = getProviderBadgeHtml(trx.provider);
  setTxt('ticket-vehicle', `${trx.vehicle || trx.truck} (${trx.driver || '-'})`);
  setTxt('ticket-resi', trx.resi || '-');

  setTxt('ticket-subtotal-label', isBuy ? 'Subtotal Pembelian Material' : 'Total Omset Penjualan');
  setTxt('ticket-subtotal', 'Rp ' + Number(trx.amount).toLocaleString('id-ID'));
  setTxt('ticket-fee', (isBuy ? '+ ' : '- ') + 'Rp ' + tFee.toLocaleString('id-ID'));
  setTxt('ticket-ongkir', lFee === 0 ? 'Rp 0 (Mandiri)' : `${isBuy ? '+ ' : '- '}Rp ${lFee.toLocaleString('id-ID')} (${trx.provider})`);
  setTxt('ticket-grand-label', isBuy ? 'TOTAL PEMBAYARAN' : 'ESTIMASI DANA DITERIMA BERSIH');
  setTxt('ticket-grand-total', 'Rp ' + grandTotal.toLocaleString('id-ID'));

  setTxt('ticket-thankyou-title', isBuy
    ? '🙏 Terima Kasih Atas Pembelian Anda di AuWaste!'
    : '🎉 Terima Kasih Telah Menjual Material di AuWaste!');
  setTxt('ticket-thankyou-msg', isBuy
    ? `Pembelian material Anda melalui pengiriman ${trx.provider} (${trx.vehicle}) telah tercatat otomatis di Menu Laporan Keuangan. Terima kasih telah mendukung ekonomi sirkular!`
    : `Penjualan Anda telah diterbitkan karcis/notanya dengan pengiriman ${trx.provider} (${trx.vehicle}). Omset & Laba Bersih telah otomatis diperbarui di Menu Laporan Keuangan.`);

  document.getElementById('modal-receipt-ticket').classList.add('open');
}

function closeReceiptTicketModal() {
  document.getElementById('modal-receipt-ticket').classList.remove('open');
}

//* FUNGSI: Membuka Modal Bukti Serah Terima Digital (Keamanan & Kepercayaan)
function openHandoverReceiptModal() {
  const trx = appState.transactions[0];
  if (!trx) return;

  const tFee = trx.transactionFee ?? calculateTransactionFee(trx.amount, trx.segment);
  const lFee = trx.logisticsFee ?? 0;

  document.getElementById('receipt-code').textContent = `${trx.code} (${trx.segment || 'B2B'})`;
  document.getElementById('receipt-parties').textContent = `${trx.seller || appState.user.company} ↔ ${trx.buyer}`;
  document.getElementById('receipt-material').textContent = trx.material;
  document.getElementById('receipt-logistics').textContent = `${trx.provider || ''} · ${trx.vehicle || trx.truck} (${trx.resi || '-'})`;
  document.getElementById('receipt-amount').textContent = 'Rp ' + Number(trx.amount).toLocaleString('id-ID');
  document.getElementById('receipt-fees').textContent = `Transaction Fee Rp ${Number(tFee).toLocaleString('id-ID')} · Ongkir Rp ${Number(lFee).toLocaleString('id-ID')}`;
  document.getElementById('receipt-status').textContent = trx.status;

  document.getElementById('modal-handover-receipt').classList.add('open');
}

function closeHandoverReceiptModal() {
  document.getElementById('modal-handover-receipt').classList.remove('open');
}

function openReportIssueModal() {
  document.getElementById('modal-report-issue').classList.add('open');
}

function closeReportIssueModal() {
  document.getElementById('modal-report-issue').classList.remove('open');
}

function submitReportIssue(e) {
  e.preventDefault();
  const reason = document.getElementById('report-reason').value;
  closeReportIssueModal();
  showToast(`Laporan "${reason}" tercatat (#TKT-2026). Tim bantuan AuWaste segera menindaklanjuti.`, 'warning');
}
