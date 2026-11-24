/* =========================================================
   //* FILE: js/03-toast.js
   //* FUNGSI: Menampilkan notifikasi melayang (Toast) yang modern
   //*         dan otomatis menghilang sebagai pengganti alert().
   ========================================================= */

//* FUNGSI: Membuat dan menampilkan notifikasi Toast di pojok kanan bawah
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const styles = {
    success: { icon: '✓', border: '#b8e94b', badgeBg: 'bg-auLime text-auDark' },
    info: { icon: 'i', border: '#38bdf8', badgeBg: 'bg-sky-400 text-slate-900' },
    warning: { icon: '!', border: '#fbbf24', badgeBg: 'bg-amber-400 text-slate-900' }
  };
  const cfg = styles[type] || styles.success;

  const toast = document.createElement('div');
  toast.className = 'au-toast';
  toast.style.borderLeftColor = cfg.border;
  toast.innerHTML = `
    <span class="w-6 h-6 rounded-full ${cfg.badgeBg} font-extrabold text-xs flex items-center justify-center shrink-0">${cfg.icon}</span>
    <span class="leading-snug font-medium">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(24px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 320);
  }, 3400);
}
