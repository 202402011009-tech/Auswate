/* =========================================================
   //* FILE: js/04-loader.js
   //* FUNGSI: Menjalankan Animasi Loading Fullscreen interaktif
   //*         begitu pengguna mengklik "Masuk ke Platform →"
   //*         atau selesai mendaftar akun B2B / B2C.
   ========================================================= */

let loaderTimer = null;

//* FUNGSI: Memicu animasi loading dengan progress 0-100% dan teks status dinamis
function triggerPlatformLoading(targetAction, customTitle = 'Memasuki Platform Terbuka AuWaste') {
  const overlay = document.getElementById('au-loader-overlay');
  const barFill = document.getElementById('loader-progress-fill');
  const percentEl = document.getElementById('loader-percent');
  const statusEl = document.getElementById('loader-status-text');
  const titleEl = document.getElementById('loader-title');
  const stepPills = document.querySelectorAll('.loader-step-pill');

  if (!overlay) {
    if (typeof targetAction === 'function') targetAction();
    return;
  }

  if (loaderTimer) clearInterval(loaderTimer);

  titleEl.textContent = customTitle;
  barFill.style.width = '0%';
  percentEl.textContent = '0%';
  stepPills.forEach(p => p.classList.remove('done'));
  overlay.classList.add('active');

  //* Tahapan status loading sesuai model platform terbuka B2B & B2C
  const stages = [
    { at: 0, text: 'Menginisialisasi Engine AI Klasifikasi Material...', pill: 0 },
    { at: 28, text: 'Memuat Indeks Harga Pasar Limbah B2B & B2C...', pill: 1 },
    { at: 58, text: 'Menghubungkan Masyarakat, UMKM, Bank Sampah & Recycler...', pill: 2 },
    { at: 85, text: 'Menyiapkan Ruang Kerja Interaktif Anda...', pill: 3 }
  ];

  let progress = 0;

  loaderTimer = setInterval(() => {
    const stepIncrement = progress < 65 ? Math.floor(Math.random() * 6) + 4 : Math.floor(Math.random() * 5) + 3;
    progress = Math.min(100, progress + stepIncrement);

    barFill.style.width = progress + '%';
    percentEl.textContent = progress + '%';

    stages.forEach(st => {
      if (progress >= st.at) {
        statusEl.textContent = st.text;
        if (stepPills[st.pill]) stepPills[st.pill].classList.add('done');
      }
    });

    if (progress >= 100) {
      clearInterval(loaderTimer);
      statusEl.textContent = 'Siap! Selamat datang di AuWaste B2B & B2C.';
      setTimeout(() => {
        if (typeof targetAction === 'function') targetAction();
        overlay.classList.remove('active');
      }, 280);
    }
  }, 55);
}

//* FUNGSI: Dipanggil langsung oleh tombol "Masuk ke Platform →" pada Splash Screen
function enterPlatformFromSplash() {
  triggerPlatformLoading(() => {
    switchGlobalScreen('landing');
    showToast('Selamat datang di AuWaste — Platform Terbuka B2B & B2C!', 'success');
  }, 'Memasuki Platform AuWaste');
}
