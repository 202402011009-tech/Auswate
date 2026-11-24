/* =========================================================
   //* FILE: js/06-auth.js
   //* FUNGSI: Mengatur pendaftaran TERBUKA (tanpa kode undangan)
   //*         untuk 5 kelompok target pasar B2B & B2C: Individu,
   //*         UMKM, Pengepul/Bank Sampah, Pabrik, & Recycler,
   //*         serta fleksibilitas peran Supplier maupun Buyer.
   ========================================================= */

//* FUNGSI: Memilih kategori akun (Individu/UMKM/Bank Sampah/Pabrik/Recycler)
function selectAccountCategory(category, segment) {
  appState.user.accountCategory = category;
  appState.user.segment = segment;
  saveState();

  //* Perbarui warna tombol kategori yang sedang aktif
  document.querySelectorAll('.category-btn').forEach(btn => {
    if (btn.dataset.category === category) {
      btn.className = 'category-btn px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 border border-auGreen text-auDark transition';
    } else {
      btn.className = 'category-btn px-3.5 py-1.5 rounded-full text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition';
    }
  });

  //* Sesuaikan label kolom Nama Perusahaan / Komunitas secara otomatis (Individu tidak wajib PT)
  const compLabel = document.getElementById('auth-company-label');
  const compInput = document.getElementById('auth-company');
  if (compLabel && compInput) {
    if (category.includes('Individu')) {
      compLabel.textContent = 'Nama Rumah Tangga / Komunitas (Opsional)';
      compInput.required = false;
      compInput.placeholder = 'Contoh: Warga RW 04 Ngagel / Pribadi';
      compInput.value = 'Akun Individu · Surabaya';
    } else if (category.includes('UMKM')) {
      compLabel.textContent = 'Nama Usaha / UMKM';
      compInput.required = true;
      compInput.placeholder = 'Contoh: Kedai / Usaha Daur Ulang...';
      compInput.value = 'UMKM Berkah Polimer Surabaya';
    } else if (category.includes('Bank Sampah')) {
      compLabel.textContent = 'Nama Bank Sampah / Pengepul / Komunitas';
      compInput.required = true;
      compInput.placeholder = 'Contoh: Bank Sampah RW 04...';
      compInput.value = 'Bank Sampah RW 04 Ngagel Rejo';
    } else {
      compLabel.textContent = 'Nama Perusahaan / Pabrik / Recycler';
      compInput.required = true;
      compInput.placeholder = 'PT / CV ...';
      compInput.value = 'PT Polimer Jaya Surabaya';
    }
  }
}

//* FUNGSI: Memilih peran utama pengguna (Supplier, Buyer, atau Keduanya)
function selectRole(role) {
  appState.user.role = role;
  saveState();

  document.querySelectorAll('.role-btn').forEach(btn => {
    if (btn.textContent.trim() === role) {
      btn.className = 'role-btn px-4 py-1.5 rounded-full text-xs font-bold bg-auLime/60 border border-auGreen text-auDark transition';
    } else {
      btn.className = 'role-btn px-4 py-1.5 rounded-full text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition';
    }
  });
}

//* FUNGSI: Mengganti tab form antara "Masuk" (Login) dan "Daftar" (Register)
function toggleAuthMode(mode) {
  const isLogin = mode === 'login';
  document.getElementById('auth-title').textContent = isLogin ? 'Masuk ke AuWaste' : 'Daftar Gratis — Terbuka untuk Umum & Bisnis';
  document.getElementById('register-fields').style.display = isLogin ? 'none' : 'grid';
  document.getElementById('register-category-wrap').style.display = isLogin ? 'none' : 'block';

  document.getElementById('btn-mode-login').className = isLogin
    ? 'py-2 rounded-full text-sm font-semibold bg-auGreen text-white transition'
    : 'py-2 rounded-full text-sm font-semibold text-gray-600 transition';
  document.getElementById('btn-mode-register').className = !isLogin
    ? 'py-2 rounded-full text-sm font-semibold bg-auGreen text-white transition'
    : 'py-2 rounded-full text-sm font-semibold text-gray-600 transition';
}

//* FUNGSI: Memproses pendaftaran terbuka (tanpa kode undangan) & masuk ke Dashboard
function handleAuthSubmit(e) {
  e.preventDefault();
  const comp = document.getElementById('auth-company').value.trim();
  const name = document.getElementById('auth-name').value.trim();

  if (name) appState.user.name = name;
  appState.user.company = comp || name || 'Pengguna AuWaste';
  saveState();

  updateUserProfileUI();

  triggerPlatformLoading(() => {
    openAppTab('dashboard');
    showToast(`Selamat datang, ${appState.user.company} (${appState.user.accountCategory})!`, 'success');
  }, `Menyiapkan Akun ${appState.user.segment} Anda`);
}

//* FUNGSI: Menyinkronkan profil akun (Individu/UMKM/Perusahaan) ke Sidebar & Dashboard
function updateUserProfileUI() {
  const compEl = document.getElementById('sidebar-company');
  const roleEl = document.getElementById('sidebar-user-role');
  const catEl = document.getElementById('sidebar-user-category');
  const welcomeEl = document.getElementById('dash-welcome-name');

  if (compEl) compEl.textContent = appState.user.company;
  if (roleEl) roleEl.textContent = `${appState.user.role} · ${appState.user.segment}`;
  if (catEl) catEl.textContent = appState.user.accountCategory;
  if (welcomeEl) welcomeEl.textContent = appState.user.company;
}
