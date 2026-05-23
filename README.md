Berikut adalah draf file `README.md` yang lengkap, terstruktur, dan mudah dipahami. File ini menjelaskan arsitektur sistem, aturan logika bisnis pabrik yang diterapkan, serta instruksi penggunaan untuk admin.

Anda tinggal menyalin teks di bawah ini ke dalam file `README.md` di folder proyek Anda.

---

```markdown
# 📊 Sistem Antrian Lembur Bergilir (Filling Shift)

Sistem berbasis web (*Vanilla JavaScript*) ini dirancang khusus untuk mengotomatisasi penjadwalan lembur harian di divisi **Filling Shift**. Sistem ini **bukan** sistem absensi atau shift kerja biasa, melainkan replikasi digital dari **logika rotasi antrian Excel manual** yang digunakan di lantai pabrik.

Sistem menggunakan `localStorage` browser agar seluruh riwayat data jadwal dan urutan antrian terakhir tetap tersimpan dengan aman meskipun halaman web dimuat ulang (*refresh*) atau browser ditutup.

---

## 📁 Struktur Proyek

```text
lembur-system/
│── index.html      # Struktur halaman, form input admin, dan tabel utama
│── style.css       # Desain antarmuka & pewarnaan indikator khas Excel
│── script.js      # Logika komputasi antrian, rotasi, dan local storage
└── README.md       # Dokumentasi panduan sistem

```

---

## 🧠 Logika Bisnis & Aturan Antrian

Sistem ini membagi karyawan ke dalam dua kelompok besar dengan perlakuan logika yang sangat berbeda:

### 1. Kuota & Rotasi Dasar (Daftar Karyawan - 12 Orang)

* **Kuota Harian:** Setiap shift lembur hanya membutuhkan **8 orang**. Sisa **4 orang** otomatis berstatus sebagai cadangan/libur.
* **Sistem Bergilir:** Karyawan yang sudah mendapatkan giliran lembur resmi akan digeser ke antrian paling belakang untuk memberikan kesempatan kepada karyawan yang belum lembur.

### 2. Legenda & Indikator Warna Tabel (Replikasi Khas Excel)

| Indikator | Arti Status | Efek pada Antrian Hari Berikutnya |
| --- | --- | --- |
| **Angka (1–8)** | **Hadir Lembur Resmi**: Karyawan masuk lembur normal. | Dipindahkan ke **antrian paling belakang**. |
| **Angka (Merah)** | **Izin (Sakit/Keperluan)**: Karyawan tidak masuk tapi ada pemberitahuan. | **Urutan ditahan**. Besoknya langsung jadi prioritas utama di depan. |
| **X (Hitam / Merah)** | **Mangkir / Meliburkan Diri**: Tidak masuk tanpa kabar terkonfirmasi. | **Dilangkahi & Kehilangan Hak**. Langsung dilempar ke antrian paling belakang. |
| **Inti (Hijau)** | **Pengganti Karyawan Inti**: Menggantikan personil inti yang absen. | **Tidak dihitung lembur resmi**. Antrian regulernya tidak berubah. |
| **Kosong (Blank)** | **Cadangan / Off**: Tidak terpilih masuk dalam plot lembur hari ini. | Posisi antrian maju secara normal untuk jadwal berikutnya. |

### 3. Logika Khusus Karyawan Inti

* Terdapat 5 orang **Karyawan Inti** yang tidak masuk dalam daftar antrian reguler.
* Jika ada karyawan inti yang diabsenkan oleh admin (tidak masuk), sistem akan otomatis mencari penggantinya dari **Daftar Karyawan yang berstatus cadangan/libur hari itu**.
* Karyawan cadangan yang naik mengisi posisi ini ditandai dengan warna **Hijau** (Teks: *Inti*). Mereka tidak kehilangan hak antrian regulernya karena ini dianggap sebagai tugas pengganti darurat.

---

## 🚀 Cara Penggunaan Sistem

1. **Buka Aplikasi:** Jalankan file `index.html` pada browser Anda.
2. **Lihat Prioritas Antrian:** Pada bagian atas form, sistem akan menampilkan urutan antrian terkini. Nama yang dicetak **tebal** adalah 8 orang kandidat utama yang akan ditarik masuk lembur.
3. **Input Data Harian oleh Admin:**
* Pilih **Tanggal** dan **Shift** (Shift 1 / Shift 2).
* Pada kolom *Karyawan Inti Tidak Masuk*, centang nama karyawan inti jika ada yang absen hari itu.
* Pada tabel *Status Kehadiran Daftar Karyawan*, ubah pilihan menjadi **Izin** atau **Mangkir/Libur** jika ada karyawan reguler yang tidak hadir.


4. **Generate Jadwal:** Klik tombol **"Generate Jadwal Excel"**.
5. **Hasil Output:** Sistem akan otomatis menghitung, memindahkan antrian, dan memunculkan baris baru pada tabel di bawah dengan format warna persis seperti file Excel manual pabrik.

---

## ⚠️ Fitur Reset Sistem

* Terdapat tombol **"Reset Semua Data"** di bagian bawah form.
* Mengklik tombol ini akan **menghapus seluruh riwayat** di tabel dan mengembalikan urutan antrian *Daftar Karyawan* ke susunan awal pabrik (Siklus diulang dari nomor 1 kembali).
* Gunakan fitur ini hanya saat pergantian tahun periode buku atau jika terjadi kesalahan input fatal pada sisa riwayat lama.

```

```