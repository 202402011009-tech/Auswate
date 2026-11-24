/* =========================================================
   //* FILE: js/05-navigation.js
   //* FUNGSI: Mengatur perpindahan antar 4 layar utama (Splash,
   //*         Landing, Auth Terbuka, Dashboard App), tab sidebar
   //*         (termasuk menu terpisah Beli Material, Jual Material,
   //*         dan Laporan Keuangan), menu mobile, & Dark/Light Mode.
   ========================================================= */

//* FUNGSI: Menampilkan salah satu layar global dan menyembunyikan lainnya
function switchGlobalScreen(screen) {
  const screens = ['splash', 'landing', 'auth', 'app'];
  screens.forEach(s => {
    const el = document.getElementById('screen-' + s);
    if (el) el.classList.add('hidden');
  });

  const target = document.getElementById('screen-' + screen);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('.top-nav-btn').forEach(btn => {
    btn.classList.remove('ring-2', 'ring-auLime');
  });
  const activeTop = document.getElementById('top-btn-' + screen);
  if (activeTop) activeTop.classList.add('ring-2', 'ring-auLime');
}

//* FUNGSI: Membuka tab tertentu di dalam Dashboard App
//* Catatan: 'listing' otomatis diarahkan ke 'beli-material', dan 'add-listing' ke 'jual-material'
function openAppTab(tabName) {
  const aliasMap = {
    'listing': 'beli-material',
    'add-listing': 'jual-material'
  };
  const resolvedTab = aliasMap[tabName] || tabName;

  switchGlobalScreen('app');

  document.querySelectorAll('.app-tab').forEach(el => el.classList.add('hidden'));
  const activeTab = document.getElementById('tab-' + resolvedTab);
  if (activeTab) activeTab.classList.remove('hidden');

  document.querySelectorAll('.app-nav').forEach(btn => {
    btn.className = 'app-nav w-full text-left px-4 py-2.5 rounded-xl text-emerald-100/80 hover:bg-white/10 flex items-center gap-3 transition';
  });

  const activeBtn = document.getElementById('nav-' + resolvedTab);
  if (activeBtn) {
    activeBtn.className = 'app-nav w-full text-left px-4 py-2.5 rounded-xl font-semibold bg-auGreen text-white shadow-md flex items-center gap-3 transition';
  }

  const sidebar = document.getElementById('app-sidebar');
  if (sidebar && window.innerWidth < 768) {
    sidebar.classList.add('hidden');
  }

  renderAllViews();
}

//* FUNGSI: Membuka/menutup Sidebar pada tampilan layar ponsel (Mobile)
function toggleMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar) sidebar.classList.toggle('hidden');
}

//* FUNGSI: Mengaktifkan atau menonaktifkan Dark Mode di seluruh halaman
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('auwaste_dark_mode', isDark ? '1' : '0');

  const btn = document.getElementById('btn-theme-toggle');
  if (btn) btn.textContent = isDark ? '☀ Mode Terang' : '🌙 Mode Gelap';
  showToast(isDark ? 'Mode Gelap diaktifkan' : 'Mode Terang diaktifkan', 'info');
}

//* FUNGSI: Memulihkan preferensi tema Dark/Light saat halaman pertama dibuka
function initThemePreference() {
  const savedDark = localStorage.getItem('auwaste_dark_mode') === '1';
  if (savedDark) {
    document.body.classList.add('dark-mode');
    const btn = document.getElementById('btn-theme-toggle');
    if (btn) btn.textContent = '☀ Mode Terang';
  }
}
