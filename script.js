// ================= DATA MASTER =================
const daftarKaryawan = ['Masiah', 'Sofyan', 'Suhanda', 'Riscaya', 'Bambang', 'Syahrul', 'Arya', 'Ryho', 'Aldi', 'Indri', 'Ricky', 'Marwah'];
const karyawanInti = ['Diat', 'Jihan', 'Rina', 'Fahri', 'Sadam'];

// ================= STATE (LOCAL STORAGE) =================
// belumLembur: antrian saat ini yang berhak lembur
let belumLembur = JSON.parse(localStorage.getItem('belumLembur')) || [...daftarKaryawan];
// sudahLembur: mereka yang sudah berputar di siklus ini atau dilangkahi
let sudahLembur = JSON.parse(localStorage.getItem('sudahLembur')) || [];
// Riwayat jadwal untuk ditabelkan
let riwayatJadwal = JSON.parse(localStorage.getItem('riwayatJadwal')) || [];

// ================= INISIALISASI UI =================
window.onload = () => {
    renderFormUI();
    renderAntrian();
    renderTable();
    renderDetail();
};

function renderFormUI() {
    // 1. Render Checkbox Karyawan Inti
    const intiContainer = document.getElementById('intiContainer');
    karyawanInti.forEach(nama => {
        intiContainer.innerHTML += `
            <label><input type="checkbox" value="${nama}" class="inti-checkbox"> ${nama}</label>
        `;
    });

    // 2. Render Form Kehadiran Daftar Karyawan
    const karyawanContainer = document.getElementById('karyawanContainer');
    daftarKaryawan.forEach(nama => {
        karyawanContainer.innerHTML += `
            <tr>
                <td>${nama}</td>
                <td><input type="radio" name="status_${nama}" value="hadir" checked></td>
                <td><input type="radio" name="status_${nama}" value="izin"></td>
                <td><input type="radio" name="status_${nama}" value="absen"></td>
            </tr>
        `;
    });
}

function renderAntrian() {
    // Menampilkan urutan antrian yang akan dipanggil di form utama
    const fullQueue = [...belumLembur, ...sudahLembur];
    const htmlQueue = fullQueue.map((nama, idx) => {
        if(idx < 8) return `<strong>${nama}</strong>`; // 8 antrian teratas di-bold
        return `<span style="color: gray;">${nama}</span>`;
    }).join(' ➔ ');
    document.getElementById('currentQueue').innerHTML = htmlQueue;
}

// ================= LOGIKA INTI GENERATE JADWAL =================
document.getElementById('formLembur').addEventListener('submit', function(e) {
    e.preventDefault();

    const tanggal = document.getElementById('tanggal').value;
    const shift = document.getElementById('shift').value;

    // Hitung berapa Inti yang absen
    const intiCheckboxes = document.querySelectorAll('.inti-checkbox:checked');
    const intiAbsenCount = intiCheckboxes.length;

    // Ambil status radio button karyawan
    let statusKaryawan = {};
    daftarKaryawan.forEach(nama => {
        statusKaryawan[nama] = document.querySelector(`input[name="status_${nama}"]:checked`).value;
    });

    // Variabel kalkulasi rotasi
    let barisHasil = {};
    let pekerjaReguler = 0; // Target: 8 orang
    let urutanAngka = 1;
    let izinDitahan = []; // Menyimpan orang Izin agar besok jadi urutan pertama lagi
    
    // Copy state antrian agar aman dimanipulasi
    let tempBelum = [...belumLembur];
    let tempSudah = [...sudahLembur];

    // ----- TAHAP 1: PENGISIAN 8 SLOT LEMBUR REGULER -----
    let limitLoop = 0; 
    while (pekerjaReguler < 8 && limitLoop < daftarKaryawan.length) {
        limitLoop++;

        // Jika antrian habis sebelum 8 slot terpenuhi, reset siklus
        if (tempBelum.length === 0) {
            tempBelum = [...tempSudah];
            tempSudah = [];
        }

        let nama = tempBelum.shift(); // Ambil kandidat paling depan antrian
        let status = statusKaryawan[nama];

        if (status === 'absen') {
            // SILANG HITAM: Dilangkahi, kehilangan urutan, masuk ke belakang
            barisHasil[nama] = { text: 'X', class: 'merah-silang' };
            tempSudah.push(nama);
        } 
        else if (status === 'izin') {
            // MERAH: Tidak lembur hari ini, tetapi urutannya ditahan (tidak masuk ke belakang)
            barisHasil[nama] = { text: urutanAngka, class: 'merah' };
            izinDitahan.push(nama);
            urutanAngka++;
        } 
        else {
            // NORMAL: Kerja lembur resmi
            barisHasil[nama] = { text: urutanAngka, class: 'normal' };
            tempSudah.push(nama);
            urutanAngka++;
            pekerjaReguler++;
        }
    }

    // ----- TAHAP 2: PENGISIAN SLOT HIJAU (PENGGANTI INTI) -----
    // Mencari orang untuk slot hijau hanya dari sisa orang yang belum mendapat job (Cadangan/Off hari ini)
    let pekerjaHijau = 0;
    
    // Gabungkan antrian untuk melihat siapa saja cadangan dari urutan teratas
    let cadanganTersedia = [...tempBelum, ...tempSudah].filter(nama => !barisHasil[nama]);

    for (let i = 0; i < cadanganTersedia.length; i++) {
        if (pekerjaHijau >= intiAbsenCount) break; // Berhenti jika kebutuhan Inti terpenuhi

        let nama = cadanganTersedia[i];
        
        // Hanya yang statusnya "Hadir" yang bisa menggantikan posisi inti
        if (statusKaryawan[nama] === 'hadir') {
            barisHasil[nama] = { text: 'Inti', class: 'hijau' };
            pekerjaHijau++;
            // PENTING: Antrian tempBelum / tempSudah mereka TIDAK diubah. 
            // Karena hijau tidak dihitung pernah lembur resmi.
        }
    }

    // ----- TAHAP 3: UPDATE & SIMPAN DATA ANTRIAN -----
    // Rapikan jika kebetulan tempBelum habis saat memproses ke-8
    if (tempBelum.length === 0) {
        tempBelum = [...tempSudah];
        tempSudah = [];
    }

    // Urutan antrian besok = Orang Izin (paling prioritas) + Sisa orang yang belum kebagian
    belumLembur = [...izinDitahan, ...tempBelum];
    sudahLembur = tempSudah;

    // Simpan history lembur hari ini
    riwayatJadwal.push({
        tanggal,
        shift,
        data: barisHasil,
        meta: {
            intiAbsen: [...intiCheckboxes].map(el => el.value),
            hadir: Object.values(statusKaryawan).filter(v => v === 'hadir').length,
            izin: Object.values(statusKaryawan).filter(v => v === 'izin').length,
            absen: Object.values(statusKaryawan).filter(v => v === 'absen').length,
            reguler: Object.entries(barisHasil)
                .filter(([_, value]) => value.class === 'normal')
                .map(([nama, _]) => nama),
            penggantiInti: Object.entries(barisHasil)
                .filter(([_, value]) => value.class === 'hijau')
                .map(([nama, _]) => nama)
        }
    });
    
    // Simpan semua ke localStorage
    localStorage.setItem('belumLembur', JSON.stringify(belumLembur));
    localStorage.setItem('sudahLembur', JSON.stringify(sudahLembur));
    localStorage.setItem('riwayatJadwal', JSON.stringify(riwayatJadwal));

    // Reset Form & Render Ulang
    document.getElementById('formLembur').reset();
    renderAntrian();
    renderTable();
    renderDetail();
});

// ================= RENDER TABEL EXCEL =================
function renderTable() {
    // 1. Buat Header (Selalu berurutan sesuai daftar awal Karyawan)
    const thead = document.getElementById('tableHead');
    let headHtml = `<tr><th>Tanggal</th><th>Shift</th>`;
    daftarKaryawan.forEach(nama => {
        headHtml += `<th>${nama}</th>`;
    });
    headHtml += `</tr>`;
    thead.innerHTML = headHtml;

    // 2. Buat Isi Tabel History
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    riwayatJadwal.forEach(jadwal => {
        const tr = document.createElement('tr');
        let html = `<td>${jadwal.tanggal}</td><td>${jadwal.shift}</td>`;
        
        daftarKaryawan.forEach(nama => {
            const selData = jadwal.data[nama];
            if (selData) {
                html += `<td class="${selData.class}">${selData.text}</td>`;
            } else {
                html += `<td></td>`; // Kosong jika mereka adalah cadangan yang tidak dipanggil
            }
        });
        
        tr.innerHTML = html;
        tbody.appendChild(tr);
    });
}

// ================= RESET SYSTEM =================
function resetSemua() {
    if(confirm('PERINGATAN: Yakin ingin mereset SELURUH riwayat jadwal dan mereset ulang rotasi dari awal?')) {
        localStorage.removeItem('belumLembur');
        localStorage.removeItem('sudahLembur');
        localStorage.removeItem('riwayatJadwal');
        
        // Kembalikan ke state pabrik
        belumLembur = [...daftarKaryawan];
        sudahLembur = [];
        riwayatJadwal = [];
        
        renderAntrian();
        renderTable();
        renderDetail();
    }
}

function renderDetail() {
    const detailTanggal = document.getElementById('detailTanggal');
    const detailShift = document.getElementById('detailShift');
    const detailIntiAbsen = document.getElementById('detailIntiAbsen');
    const detailHadir = document.getElementById('detailHadir');
    const detailIzin = document.getElementById('detailIzin');
    const detailAbsen = document.getElementById('detailAbsen');
    const detailReguler = document.getElementById('detailReguler');
    const detailPengganti = document.getElementById('detailPengganti');

    if (riwayatJadwal.length === 0) {
        detailTanggal.textContent = '-';
        detailShift.textContent = '-';
        detailIntiAbsen.textContent = '-';
        detailHadir.textContent = '-';
        detailIzin.textContent = '-';
        detailAbsen.textContent = '-';
        detailReguler.textContent = '-';
        detailPengganti.textContent = '-';
        return;
    }

    const last = riwayatJadwal[riwayatJadwal.length - 1];
    const meta = last.meta || {
        intiAbsen: [],
        hadir: 0,
        izin: 0,
        absen: 0,
        reguler: [],
        penggantiInti: []
    };

    detailTanggal.textContent = last.tanggal || '-';
    detailShift.textContent = last.shift || '-';
    detailIntiAbsen.textContent = meta.intiAbsen.length ? meta.intiAbsen.join(', ') : '-';
    detailHadir.textContent = meta.hadir;
    detailIzin.textContent = meta.izin;
    detailAbsen.textContent = meta.absen;
    detailReguler.textContent = meta.reguler.length ? meta.reguler.join(', ') : '-';
    detailPengganti.textContent = meta.penggantiInti.length ? meta.penggantiInti.join(', ') : '-';

} // ================= FITUR DARK MODE =================
const themeToggle = document.getElementById('themeToggle');
// Cek preferensi tema sebelumnya
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '☀️ Mode Cerah';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    let theme = 'light';
    
    if (document.body.classList.contains('dark-mode')) {
        theme = 'dark';
        themeToggle.innerHTML = '☀️ Mode Cerah';
    } else {
        themeToggle.innerHTML = '🌙 Mode Gelap';
    }
    
    // Simpan pilihan ke localStorage agar tidak hilang saat refresh
    localStorage.setItem('theme', theme);
});

// ================= FITUR MODAL DETAIL PEKERJA =================
const modalDetail = document.getElementById('modalDetail');
const btnDetailLembur = document.getElementById('btnDetailLembur');
const closeModal = document.getElementById('closeModal');
const modalBodyData = document.getElementById('modalBodyData');

// Buka Modal
// Buka Modal (VERSI REVISI: TABEL MODERN)
btnDetailLembur.addEventListener('click', () => {
    if (riwayatJadwal.length === 0) {
        modalBodyData.innerHTML = `<p style="text-align:center; color:gray;">Belum ada jadwal yang di-generate hari ini.</p>`;
    } else {
        // Ambil data dari jadwal yang paling terakhir digenerate
        const lastJadwal = riwayatJadwal[riwayatJadwal.length - 1];
        const meta = lastJadwal.meta;
        
        // Gabungkan semua karyawan yang lembur hari itu (Reguler + Pengganti Inti)
        const semuaKaryawanLembur = [...(meta.reguler || []), ...(meta.penggantiInti || [])];
        
        let tableRows = '';
        if (semuaKaryawanLembur.length === 0) {
            tableRows = `<tr><td colspan="2" style="text-align:center; color:gray; padding: 20px;">Tidak ada karyawan yang lembur</td></tr>`;
        } else {
            semuaKaryawanLembur.forEach((nama, index) => {
                tableRows += `
                    <tr>
                        <td style="text-align: center; font-weight: bold; width: 60px;">${index + 1}</td>
                        <td style="text-align: left; padding-left: 20px;">${nama}</td>
                    </tr>
                `;
            });
        }
        
        let htmlTableContent = `
            <div style="margin-bottom: 15px; font-size: 13px; color: gray;">
                <strong>📅 Tanggal:</strong> ${lastJadwal.tanggal} | <strong>Shift:</strong> ${lastJadwal.shift}
            </div>
            
            <h4 class="modal-table-title">karyawan yang lembur</h4>
            <table class="modal-table">
                <thead>
                    <tr>
                        <th>No</th>
                        <th style="text-align: left; padding-left: 20px;">Nama Karyawan</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        `;
        modalBodyData.innerHTML = htmlTableContent;
    }
    
// Menutup Modal saat tombol X diklik
closeModal.addEventListener('click', (e) => {
    e.preventDefault(); // Mencegah aksi bawaan browser jika ada
    modalDetail.classList.remove('show');
});

    modalDetail.classList.add('show');
});
