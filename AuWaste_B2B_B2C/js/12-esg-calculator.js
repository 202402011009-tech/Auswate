/* =========================================================
   //* FILE: js/12-esg-calculator.js
   //* FUNGSI: Menghitung dampak lingkungan (ESG) baik untuk
   //*         skala individu/UMKM (mulai 10 KG) maupun pabrik
   //*         (hingga 10.000 KG), serta menerbitkan Sertifikat.
   ========================================================= */

//* FUNGSI: Menghitung ulang metrik dampak lingkungan & estimasi nilai saat slider digeser
function updateESGCalculator() {
  const typeEl = document.getElementById('esg-material-select');
  const weightEl = document.getElementById('esg-weight-slider');
  if (!typeEl || !weightEl) return;

  const info = AI_PRICE_CATALOG[typeEl.value] || AI_PRICE_CATALOG.PP;
  const weightKg = Number(weightEl.value) || 500;

  const estIncome = weightKg * info.avg;
  const co2SavedKg = Math.round(weightKg * info.co2Factor);
  const treesEq = Math.max(1, Math.round(co2SavedKg / 21));
  const energyKwh = Math.round(weightKg * 5.7);

  document.getElementById('esg-weight-label').textContent = weightKg.toLocaleString('id-ID') + ' KG';
  document.getElementById('esg-res-income').textContent = 'Rp ' + estIncome.toLocaleString('id-ID');
  document.getElementById('esg-res-co2').textContent = co2SavedKg.toLocaleString('id-ID') + ' kg CO₂e';
  document.getElementById('esg-res-trees').textContent = treesEq.toLocaleString('id-ID') + ' Pohon';
  document.getElementById('esg-res-energy').textContent = energyKwh.toLocaleString('id-ID') + ' kWh';
}

//* FUNGSI: Menampilkan Modal Sertifikat Kontribusi Ekonomi Sirkular siap cetak
function openESGCertificateModal() {
  const typeEl = document.getElementById('esg-material-select');
  const weightEl = document.getElementById('esg-weight-slider');
  const info = AI_PRICE_CATALOG[typeEl?.value || 'PP'] || AI_PRICE_CATALOG.PP;
  const weightKg = Number(weightEl?.value || 500);
  const co2SavedKg = Math.round(weightKg * info.co2Factor);

  document.getElementById('cert-company-name').textContent = appState.user.company;
  document.getElementById('cert-material-summary').textContent = `${weightKg.toLocaleString('id-ID')} KG ${info.title}`;
  document.getElementById('cert-co2-total').textContent = `${co2SavedKg.toLocaleString('id-ID')} kg CO₂e`;
  document.getElementById('cert-date').textContent = new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  document.getElementById('modal-esg-cert').classList.add('open');
  showToast('Sertifikat Dampak Ekonomi Sirkular berhasil diterbitkan!', 'success');
}

//* FUNGSI: Menutup Modal Sertifikat ESG Digital
function closeESGCertificateModal() {
  document.getElementById('modal-esg-cert').classList.remove('open');
}
