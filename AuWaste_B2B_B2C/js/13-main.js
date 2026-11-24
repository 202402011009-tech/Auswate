/* =========================================================
   //* FILE: js/13-main.js
   //* FUNGSI: Titik masuk utama (Entry Point) platform terbuka
   //*         AuWaste B2B & B2C. Menyatukan seluruh modul termasuk
   //*         Beli/Jual Terpisah, Laporan, Lalamove/Deliveree, & Struk.
   ========================================================= */

//* FUNGSI: Merender ulang seluruh komponen dinamis di semua layar agar selalu sinkron
function renderAllViews() {
  updateUserProfileUI();
  renderMarketTickers();
  renderLandingCatalog();
  renderDashboard();
  renderListings();
  renderSmartMatching();
  renderTransactions();
  renderAnalytics();
  renderLaporan();
  renderMySalesHistory();
  updateESGCalculator();
}

//* FUNGSI: Inisialisasi otomatis saat struktur HTML selesai dimuat browser
document.addEventListener('DOMContentLoaded', () => {
  initThemePreference();
  renderAllViews();
  runAISimulation();
  selectSellLogisticsProvider('Lalamove');

  //* Mulai langsung dari Layar 1: Splash Screen
  switchGlobalScreen('splash');

  //* Tutup modal apabila pengguna menekan tombol ESC
  document.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape') {
      closeProductDetailModal();
      closeNegotiationChat();
      closeESGCertificateModal();
      closeHandoverReceiptModal();
      closeReportIssueModal();
      closeReceiptTicketModal();
    }
  });
});
