# AuWaste — Platform Terbuka B2B & B2C (Update Menu Laporan, Beli/Jual Terpisah, Best Seller, Lalamove & Deliveree)

Proyek ini telah diperbarui dengan struktur modular lengkap (1 `index.html`, 8 file CSS, dan 14 file JavaScript) yang siap langsung dibuka di Visual Studio Code.

## Fitur Baru yang Ditambahkan
1. **Menu Beli & Jual Material Terpisah:**
   - **🛒 Beli Material (`tab-beli-material`):** Khusus membeli limbah dengan pilihan jumlah KG, pengiriman Lalamove/Deliveree, dan otomatis memunculkan **Struk Pembelian + Ucapan Terima Kasih**.
   - **💰 Jual Material (`tab-jual-material`):** Khusus menjual limbah (dengan AI Scanner & estimasi omset bersih) dan otomatis mengarahkan ke **Karcis / Nota Penjualan + Ucapan Terima Kasih**.
2. **📑 Menu Laporan Keuangan (`tab-laporan` & `js/14-laporan.js`):**
   - Menampilkan **Total Omset (Terjual)**, **Total Pembelian (Modal)**, **Laba Bersih (Net Profit) + Margin (%)**, grafik perbandingan, daftar **Best Seller**, filter `Semua / Penjualan / Pembelian`, serta tombol buka ulang **Struk / Karcis Nota**.
3. **🚚 Media Pengiriman Lalamove & Deliveree:**
   - **🟠 Lalamove:** Motor, Mobil/Sedan, MPV/Blind Van, Pick-up Bak/Box, Truk Engkel (CDE), Truk CDD Box.
   - **🟢 Deliveree:** Mobil Ekonomi/City Car, Van/Blind Van, Pick-up Box, Truk Engkel Box (CDE), Truk Double Engkel (CDD), Truk Fuso/Tronton.
   - **🏠 Mandiri (Rp 0):** Tetap tersedia bagi pengguna yang antar/jemput sendiri.
4. **🔥 Indikator & Strip Best Seller:**
   - Menampilkan produk yang paling banyak terbeli/terjual di bagian atas katalog, lencana **🔥 BEST SELLER**, filter cepat **Best Seller Saja**, dan leaderboard Best Seller di Menu Laporan.

## Cara Menjalankan di VS Code
1. Ekstrak file ZIP `AuWaste_B2B_B2C_Lengkap.zip`.
2. Buka folder `AuWaste/AuWaste_B2B_B2C` di Visual Studio Code.
3. Klik kanan `index.html` → **Open with Live Server** (atau klik dua kali `index.html` langsung di browser).
