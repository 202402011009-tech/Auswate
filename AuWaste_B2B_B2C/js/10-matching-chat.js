/* =========================================================
   //* FILE: js/10-matching-chat.js
   //* FUNGSI: Merender rekomendasi Smart Matching untuk mitra
   //*         B2B (Recycler/Pabrik) maupun B2C (Bank Sampah,
   //*         Pengepul, UMKM) lengkap dengan Live Chat Nego.
   ========================================================= */

let activeChatBuyer = null;

//* FUNGSI: Merender kartu mitra Buyer/Pengepul/Bank Sampah/Recycler pada tab Smart Match
function renderSmartMatching() {
  const container = document.getElementById('smart-match-list');
  if (!container) return;

  container.innerHTML = BUYER_MATCHES_DATA.map(b => {
    const estFee = calculateTransactionFee(b.totalExample, b.segment);
    return `
      <div class="theme-card theme-card-hover rounded-2xl border border-auBorder p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-2xl ${b.badgeClass} font-extrabold text-base flex items-center justify-center shrink-0 shadow-sm">
            ${b.initial}
          </div>
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <h4 class="font-extrabold text-base text-auDark">${b.name}</h4>
              <span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${getSegmentBadgeClass(b.segment)}">${b.segment} · ${b.buyerType}</span>
              <span class="bg-auLime/40 text-auDark text-[10px] font-bold px-2 py-0.5 rounded-full">✓ Akun Terverifikasi</span>
            </div>
            <p class="text-xs text-gray-500">📍 ${b.city} · Kapasitas: ${b.capacity} · Estimasi: ${b.etaPickup}</p>
            <p class="text-xs text-gray-600">${b.reason}</p>
            <div class="pt-1 flex items-center gap-2">
              <div class="w-36 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-auGreen to-auLime rounded-full" style="width: ${b.score}%"></div>
              </div>
              <span class="text-xs font-extrabold text-auGreen">Match Score ${b.score}%</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
          <div class="text-left lg:text-right mr-2">
            <p class="text-[11px] text-gray-400">Simulasi ${b.exampleWeight.toLocaleString('id-ID')} KG</p>
            <p class="font-extrabold text-lg text-auGreen">Rp ${b.totalExample.toLocaleString('id-ID')}</p>
            <p class="text-[10px] text-gray-500">Rp ${b.offerPrice.toLocaleString('id-ID')}/kg · Fee Rp ${estFee.toLocaleString('id-ID')}</p>
          </div>
          <button onclick="openNegotiationChat('${b.id}')" class="px-4 py-2.5 rounded-full border border-auGreen text-auGreen font-bold text-xs hover:bg-emerald-50 transition">
            💬 Chat / Nego
          </button>
          <button onclick="createDealFromMatch('${b.shortName}', ${b.totalExample}, '${b.exampleWeight.toLocaleString('id-ID')} KG Material', '${b.segment}')" class="px-5 py-2.5 rounded-full bg-auGreen text-white font-bold text-xs hover:bg-auDark transition shadow">
            Buat Deal →
          </button>
        </div>
      </div>
    `;
  }).join('');
}

//* FUNGSI: Membuka Modal Live Chat Negosiasi (mendukung B2B maupun B2C)
function openNegotiationChat(buyerId) {
  const buyer = BUYER_MATCHES_DATA.find(b => b.id === buyerId);
  if (!buyer) return;

  activeChatBuyer = buyer;
  document.getElementById('chat-buyer-name').textContent = buyer.name;
  document.getElementById('chat-buyer-meta').textContent = `${buyer.segment} · Match ${buyer.score}% · Tawaran awal Rp ${buyer.offerPrice.toLocaleString('id-ID')}/kg`;

  const chatBody = document.getElementById('chat-messages-box');
  chatBody.innerHTML = `
    <div class="chat-bubble-buyer p-3 text-xs max-w-[85%]">
      <p class="font-bold mb-0.5">${buyer.shortName}</p>
      <p>Halo ${appState.user.company}! Kami siap menerima material Anda (${buyer.capacity}) dengan penawaran <strong>Rp ${buyer.offerPrice.toLocaleString('id-ID')}/kg</strong>. Anda bisa antar sendiri atau pakai Partner Logistik AuWaste (${buyer.etaPickup}).</p>
    </div>
  `;

  document.getElementById('modal-chat-nego').classList.add('open');
}

//* FUNGSI: Menutup Modal Chat Negosiasi
function closeNegotiationChat() {
  document.getElementById('modal-chat-nego').classList.remove('open');
}

//* FUNGSI: Mengirim pesan negosiasi dan memicu balasan otomatis dari mitra
function sendNegotiationMessage(e) {
  e.preventDefault();
  const input = document.getElementById('chat-input-field');
  const text = input.value.trim();
  if (!text || !activeChatBuyer) return;

  const chatBody = document.getElementById('chat-messages-box');

  chatBody.innerHTML += `
    <div class="flex justify-end">
      <div class="chat-bubble-user p-3 text-xs max-w-[85%]">
        <p>${text}</p>
      </div>
    </div>
  `;
  input.value = '';
  chatBody.scrollTop = chatBody.scrollHeight;

  setTimeout(() => {
    const bumpedPrice = activeChatBuyer.offerPrice + 150;
    const reply = text.match(/\d{4}/)
      ? `Cocok! Karena material sudah terpilah & terverifikasi AI, kami naikkan ke <strong>Rp ${bumpedPrice.toLocaleString('id-ID')}/kg</strong>. Rincian biaya layanan transparan akan tampil saat Deal dibuat.`
      : `Siap, pembayaran & bukti serah terima digital tercatat langsung di sistem AuWaste agar aman bagi kedua pihak. Silakan klik Sepakati Deal di bawah!`;

    chatBody.innerHTML += `
      <div class="chat-bubble-buyer p-3 text-xs max-w-[85%]">
        <p class="font-bold mb-0.5">${activeChatBuyer.shortName}</p>
        <p>${reply}</p>
      </div>
    `;
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 600);
}

//* FUNGSI: Mengubah kesepakatan chat langsung menjadi transaksi baru
function finalizeDealFromChat() {
  if (!activeChatBuyer) return;
  const buyerName = activeChatBuyer.shortName;
  const totalRp = (activeChatBuyer.offerPrice + 150) * activeChatBuyer.exampleWeight;
  const seg = activeChatBuyer.segment;
  const label = `${activeChatBuyer.exampleWeight.toLocaleString('id-ID')} KG (Hasil Nego)`;
  closeNegotiationChat();
  createDealFromMatch(buyerName, totalRp, label, seg);
}
