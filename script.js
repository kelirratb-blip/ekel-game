
// Variabel baru untuk sistem Streak
const streakCount = document.getElementById('streakCount');
let currentStreak = parseInt(localStorage.getItem('anime_streak')) || 0;
let lastStreakDate = localStorage.getItem('anime_last_streak_date') || ""; // Format: YYYY-MM-DD

// Variabel baru untuk fitur Manual Save
const manualSaveBtn = document.getElementById('manualSaveBtn');
const manualLoadBtn = document.getElementById('manualLoadBtn');
const saveStatus = document.getElementById('saveStatus');


// Variabel baru untuk sistem XP & Sound
const playerLevel = document.getElementById('playerLevel');
const xpText = document.getElementById('xpText');
const xpBar = document.getElementById('xpBar');

let playerXP = parseInt(localStorage.getItem('anime_xp')) || 0;

// Sound FX menggunakan synthesizer internal browser (jadi kamu gak perlu download file .mp3)
function playCyberSound(type) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'accept') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    } else if (type === 'clear') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    } else if (type === 'fail') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    }
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
}

// Fungsi logika penentuan Rank berdasarkan total XP
function updateRankSystem(xpGained = 0) {
    playerXP += xpGained;
    if (playerXP < 0) playerXP = 0;
    
    localStorage.setItem('anime_xp', playerXP);
    
    // Hitung Level (Setiap 100 XP naik 1 Tingkat)
    const levelTier = Math.floor(playerXP / 100);
    const currentXPInTier = playerXP % 100;
    
    // Daftar Rank ala Anime Solo Leveling / RPG
    const ranks = ['E-RANK', 'D-RANK', 'C-RANK', 'B-RANK', 'A-RANK', 'S-RANK', 'SUPREME OVERLORD'];
    const currentRank = ranks[Math.min(levelTier, ranks.length - 1)];
    
    // Update ke tampilan HTML
    playerLevel.textContent = `${currentRank} (Lv. ${levelTier + 1})`;
    xpText.textContent = `${currentXPInTier}/100`;
    xpBar.style.width = `${currentXPInTier}%`;
}

// Ambil elemen DOM
const questInput = document.getElementById('questInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');
const cyberClock = document.getElementById('cyberClock');

// --- FUNGSI JAM CYBER REAL-TIME ---
function updateClock() {
    const now = new Date();
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    let seconds = now.getSeconds().toString().padStart(2, '0');
    
    cyberClock.textContent = `${hours}:${minutes}:${seconds}`;
}
// Jalankan jam tiap 1 detik (1000ms)
setInterval(updateClock, 1000);
updateClock(); // Panggil sekali di awal biar langsung muncul
// ----------------------------------

// Array untuk menyimpan data quest (otomatis cek localStorage)
let quests = JSON.parse(localStorage.getItem('anime_quests')) || [];

// Fungsi untuk memperbarui UI dan menyimpan ke LocalStorage
function updateUI() {
    taskList.innerHTML = '';
    let active = 0;
    let completed = 0;

    quests.forEach((quest, index) => {
        const li = document.createElement('li');
        li.className = `task-item ${quest.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <span class="task-text" onclick="toggleQuest(${index})">${quest.text}</span>
            <div class="action-btns">
                <button class="btn-complete" onclick="toggleQuest(${index})">
                    ${quest.completed ? 'Undo' : 'Clear'}
                </button>
                <button class="btn-delete" onclick="deleteQuest(${index})">Fail</button>
            </div>
        `;

        taskList.appendChild(li);

        if (quest.completed) {
            completed++;
        } else {
            active++;
        }
    });

    // Update statistik angka
    activeCount.textContent = active;
    completedCount.textContent = completed;

    // Simpan data terbaru ke storage browser
    localStorage.setItem('anime_quests', JSON.stringify(quests));
}

// Fungsi tambah misi baru
function addQuest() {
    const text = questInput.value.trim();
    if (text === '') return;

    quests.push({
        text: text,
        completed: false
    });

    playCyberSound('accept');

    questInput.value = '';
    updateUI();
}

function toggleQuest(index) {
    // 1. Cek dulu status SEBELUM diubah
    const wasCompleted = quests[index].completed;

    // 2. Ubah statusnya
    quests[index].completed = !quests[index].completed;
    
    // 3. Logika suara, XP, dan tambahan STREAK baru:
    if (quests[index].completed) {
        // Jika misi selesai
        playCyberSound('clear');
        updateRankSystem(25); // Hadiah 25 XP
        
        // ---> INI DIA FITUR STREAK BARUNYA <---
        checkAndUpdateStreak(true); 
        
    } else if (wasCompleted && !quests[index].completed) {
        // Jika misi di-undo balik jadi belum selesai
        playCyberSound('accept');
        updateRankSystem(-25); // Kurangi 25 XP
    }
    
    updateUI();
}


playCyberSound('fail');
updateRankSystem(-15); // Mengurangi 15 XP kalau misinya digagalkan/dihapus

// Fungsi menghapus misi
function deleteQuest(index) {
    quests.splice(index, 1);
    updateUI();
}

// Event listener tombol & enter key
addBtn.addEventListener('click', addQuest);
questInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addQuest();
});

// Render pertama kali saat halaman dimuat
updateUI();

// Render sistem rank di awal
updateRankSystem(0);

// --- FUNGSI MANUAL SAVE & LOAD ---

// 1. Fungsi Menampilkan Notifikasi Status ala Cyberpunk
function showSaveStatus(message, isSuccess) {
    saveStatus.textContent = message;
    saveStatus.style.color = isSuccess ? '#00ffcc' : '#ff0055';
    
    // Teks otomatis hilang dalam waktu 3 detik
    setTimeout(() => {
        saveStatus.textContent = '';
    }, 3000);
}

// 2. Logika saat tombol SAVE dipencet
manualSaveBtn.addEventListener('click', () => {
    try {
        // Ambil data state saat ini
        const currentQuests = JSON.stringify(quests);
        const currentXP = playerXP.toString();
        
        // Simpan ke slot cadangan khusus (Manual Slot)
        localStorage.setItem('manual_quests_backup', currentQuests);
        localStorage.setItem('manual_xp_backup', currentXP);
        
        // Mainkan sound effect sukses (pakai fungsi sound lama)
        if (typeof playCyberSound === 'function') playCyberSound('clear');
        
        showSaveStatus('>> SYSTEM SAVED SUCCESSFULLY! <<', true);
    } catch (error) {
        showSaveStatus('>> SAVE FAILED! SYSTEM ERROR <<', false);
    }
});

// 3. Logika saat tombol LOAD dipencet
manualLoadBtn.addEventListener('click', () => {
    const savedQuests = localStorage.getItem('manual_quests_backup');
    const savedXP = localStorage.getItem('manual_xp_backup');
    
    // Cek apakah user sudah pernah melakukan save manual sebelumnya
    if (savedQuests !== null && savedXP !== null) {
        // Timpa data aktif dengan data dari file save manual
        quests = JSON.parse(savedQuests);
        playerXP = parseInt(savedXP);
        
        // Update memori auto-save utama agar sinkron
        localStorage.setItem('anime_quests', savedQuests);
        localStorage.setItem('anime_xp', savedXP);
        
        // Refresh seluruh UI aplikasi
        updateUI();
        if (typeof updateRankSystem === 'function') updateRankSystem(0);
        if (typeof playCyberSound === 'function') playCyberSound('accept');
        
        showSaveStatus('>> FILE LOADED SUCCESSFULLY! <<', true);
    } else {
        // Jika belum ada data di slot manual
        if (typeof playCyberSound === 'function') playCyberSound('fail');
        showSaveStatus('>> NO SAVE DATA FOUND! <<', false);
    }
});

// PASTIKAN 3 BARIS INI ADA DI PALING BAWAH FILE SCRIPT.JS LU:
updateUI();
updateRankSystem(0);
checkAndUpdateStreak(false); // <--- Baris ini wajib ada di paling bawah