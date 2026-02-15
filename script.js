// === GAME CONFIGURATION ===
const SHIFT_START = 9; 
const SHIFT_END = 17;
const TOTAL_DAYS = 7;
const SECONDS_PER_HOUR = 20; // Fast gameplay: 20 real seconds = 1 game hour

// === DATABASE ===
const sins = ["Gluttony", "Greed", "Pride", "Sloth", "Wrath", "Envy", "Lust"];
const tortures = [
    "Force-feed Spiders", "Molten Gold Enema", "Mirror of Screams",
    "Eternal Treadmill", "Tickle Torture", "Green Slime Bath", "Cactus Hugs"
];

const sinData = {
    "Gluttony": { clue: "Deaths involving food, stomach explosions, or eating contests.", punish: "Force-feed Spiders" },
    "Greed": { clue: "Deaths involving money, gold, safes, or tax evasion.", punish: "Molten Gold Enema" },
    "Pride": { clue: "Deaths involving selfies, statues, mirrors, or plastic surgery.", punish: "Mirror of Screams" },
    "Sloth": { clue: "Deaths involving sleeping, inactivity, or starvation due to laziness.", punish: "Eternal Treadmill" },
    "Wrath": { clue: "Deaths involving screaming, fighting, road rage, or explosions.", punish: "Tickle Torture" },
    "Envy": { clue: "Deaths involving stalking, stealing, or copying others.", punish: "Green Slime Bath" },
    "Lust": { clue: "Deaths involving brothels, affairs, or dangerous liaisons.", punish: "Cactus Hugs" }
};

// Procedural Names
const fNames = ["Chad", "Karen", "Elon", "Jeff", "Karen", "Bartholomew", "Susan", "Kyle"];
const lNames = ["Musk", "Bezos", "Smith", "Doe", "Trump", "Zuckerberg"];

// Gallery Data
const galleryImages = [
    { src: "", caption: "Sinner 4022: Attempted to bribe St. Peter." },
    { src: "", caption: "Sinner 8811: Complained about the heat." },
    { src: "", caption: "The Boss (Do not stare directly)." }
];

// === STATE VARIABLES ===
let state = {
    day: 1, hour: SHIFT_START, minute: 0,
    souls: [],
    doom: 0,
    score: 0,
    timer: null
};

// === INITIALIZATION ===
window.onload = () => {
    makeDraggable();
    populateBible();
    populateTortureSelect();
    startDay();
};

// === GAME LOOP ===
function startDay() {
    state.hour = SHIFT_START;
    state.souls = [];
    state.doom = 0;
    updateUI();
    
    // Clear old emails
    document.getElementById('email-list-body').innerHTML = '';
    
    // Start Clock
    clearInterval(state.timer);
    state.timer = setInterval(tick, (SECONDS_PER_HOUR * 1000) / 60);
    
    // Schedule first soul
    setTimeout(spawnSoul, 2000);
}

function tick() {
    state.minute += 5;
    if (state.minute >= 60) {
        state.minute = 0;
        state.hour++;
    }
    
    // Update Clock
    const period = state.hour >= 12 ? "PM" : "AM";
    const h = state.hour > 12 ? state.hour - 12 : state.hour;
    const m = state.minute.toString().padStart(2, '0');
    document.getElementById('clock').innerText = `${h}:${m} ${period}`;

    // Random events
    if (Math.random() < 0.1 && state.souls.length < 10) spawnSoul();

    // End Day
    if (state.hour >= SHIFT_END) {
        clearInterval(state.timer);
        alert(`SHIFT OVER.\nSouls Processed: ${state.score}\nDoom Level: ${state.doom}%`);
        state.day++;
        if(state.day > 7) location.reload();
        else startDay();
    }
}

// === SOUL GENERATION ===
function spawnSoul() {
    const sinKey = sins[Math.floor(Math.random() * sins.length)];
    const id = Math.floor(Math.random() * 90000) + 10000;
    
    const soul = {
        id: id,
        name: `${fNames[Math.floor(Math.random() * fNames.length)]} ${lNames[Math.floor(Math.random() * lNames.length)]}`,
        sin: sinKey,
        // Generate clues based on sin
        death: "Details: " + sinData[sinKey].clue,
        feat: "Accomplishment: Ruined everything.",
        family: "Family says: 'Good riddance.'"
    };

    state.souls.push(soul);
    
    // Add to Email
    const tbody = document.getElementById('email-list-body');
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>💀 Gate</td><td>New Sinner: ${soul.name}</td>`;
    tr.onclick = () => openEmail(soul);
    tbody.appendChild(tr);

    // Update Badge
    document.getElementById('mail-badge').classList.remove('hidden');
    document.getElementById('inbox-count').innerText = `(${state.souls.length})`;
}

// === APP LOGIC: EMAIL ===
function openEmail(soul) {
    const preview = document.getElementById('email-preview');
    preview.innerHTML = `
        <p><strong>SUBJECT:</strong> Judgment Request</p>
        <p><strong>SOUL ID:</strong> ${soul.id}</p>
        <p>Please review attached file and punish immediately.</p>
        <br>
        <button class="win-btn" onclick="openFile(${soul.id})">📂 OPEN SOUL_RECORD.TXT</button>
    `;
}

// === APP LOGIC: FILE VIEWER ===
function openFile(id) {
    const soul = state.souls.find(s => s.id === id);
    if (!soul) return;
    
    document.getElementById('file-id').innerText = soul.id;
    document.getElementById('file-name').innerText = soul.name;
    document.getElementById('file-death').innerText = soul.death;
    document.getElementById('file-feat').innerText = soul.feat;
    document.getElementById('file-family').innerText = soul.family;
    
    openWindow('file-window');
}

// === APP LOGIC: PUNISH ===
function openPunishWithID() {
    openWindow('punish-window');
    closeWindow('file-window');
    populatePunishSelect();
}

function populatePunishSelect() {
    const select = document.getElementById('soul-select');
    select.innerHTML = '';
    state.souls.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.innerText = `${s.name} (${s.id})`;
        select.appendChild(opt);
    });
}

function submitPunishment() {
    const select = document.getElementById('soul-select');
    const soulId = parseInt(select.value);
    const soul = state.souls.find(s => s.id === soulId);
    
    // Get radio selection
    const radios = document.getElementsByName('punish-method');
    let selectedPunish = null;
    for (let r of radios) if (r.checked) selectedPunish = r.value;

    if (!soul || !selectedPunish) return;

    // Judge
    if (selectedPunish === sinData[soul.sin].punish) {
        document.getElementById('punish-log').innerText = "SUCCESS: SOUL DAMNED.";
        document.getElementById('punish-log').style.color = "green";
        state.score++;
        state.doom = Math.max(0, state.doom - 5);
        // Remove soul
        state.souls = state.souls.filter(s => s.id !== soulId);
        select.remove(select.selectedIndex);
        // Remove email row (simplified)
        document.getElementById('email-list-body').innerHTML = ''; // lazy redraw
    } else {
        document.getElementById('punish-log').innerText = "ERROR: WRONG PUNISHMENT!";
        document.getElementById('punish-log').style.color = "red";
        state.doom += 15;
    }
    updateUI();
}

// === APP LOGIC: CALCULATOR (CURSED) ===
function calcPress(val) {
    const display = document.getElementById('calc-display');
    if (display.value === "0") display.value = "";
    display.value += "6"; // ALWAYS ADDS 6
}
function calcSolve() {
    document.getElementById('calc-display').value = "666"; // ALWAYS 666
}
function calcClear() {
    document.getElementById('calc-display').value = "0";
}

// === APP LOGIC: GALLERY ===
let currentImgIdx = 0;
function nextImage() {
    currentImgIdx = (currentImgIdx + 1) % galleryImages.length;
    updateGallery();
}
function prevImage() {
    currentImgIdx = (currentImgIdx - 1 + galleryImages.length) % galleryImages.length;
    updateGallery();
}
function updateGallery() {
    document.getElementById('gallery-caption').innerText = galleryImages[currentImgIdx].caption;
    document.getElementById('img-counter').innerText = `${currentImgIdx+1}/${galleryImages.length}`;
    // Since we don't have real images, we change the placeholder color
    const colors = ["red", "blue", "green"];
    document.getElementById('gallery-display').style.color = colors[currentImgIdx];
}

// === SYSTEM & UI UTILS ===
function updateUI() {
    document.getElementById('day-display').innerText = state.day;
    document.getElementById('score-display').innerText = state.score;
    document.getElementById('doom-bar').style.width = Math.min(state.doom, 100) + "%";
    
    if (state.doom >= 100) {
        document.getElementById('bsod').classList.remove('hidden');
        clearInterval(state.timer);
    }
}

function populateBible() {
    const list = document.getElementById('bible-list');
    sins.forEach(sin => {
        const li = document.createElement('li');
        li.innerText = sin;
        li.onclick = () => {
            document.getElementById('bible-content').innerHTML = `
                <h3>${sin}</h3>
                <p><strong>Symptoms:</strong> ${sinData[sin].clue}</p>
                <p><strong>Punishment:</strong> ${sinData[sin].punish}</p>
            `;
        };
        list.appendChild(li);
    });
}

function populateTortureSelect() {
    const container = document.getElementById('torture-options');
    tortures.forEach(t => {
        const div = document.createElement('div');
        div.innerHTML = `<input type="radio" name="punish-method" value="${t}"> ${t}`;
        container.appendChild(div);
    });
}

// === WINDOW MANAGER ===
function openWindow(id) {
    const win = document.getElementById(id);
    win.classList.remove('hidden');
    
    // Simple z-index handling
    document.querySelectorAll('.window').forEach(w => {
        w.style.zIndex = 10;
        w.querySelector('.title-bar').classList.add('inactive');
    });
    win.style.zIndex = 100;
    win.querySelector('.title-bar').classList.remove('inactive');
}

function closeWindow(id) {
    document.getElementById(id).classList.add('hidden');
}

function toggleStartMenu() {
    const menu = document.getElementById('start-menu');
    menu.classList.toggle('hidden');
}

function makeDraggable() {
    document.querySelectorAll('.window').forEach(win => {
        const titleBar = win.querySelector('.title-bar');
        
        win.addEventListener('mousedown', () => openWindow(win.id));

        titleBar.addEventListener('mousedown', (e) => {
            let shiftX = e.clientX - win.getBoundingClientRect().left;
            let shiftY = e.clientY - win.getBoundingClientRect().top;
            
            function moveAt(pageX, pageY) {
                win.style.left = pageX - shiftX + 'px';
                win.style.top = pageY - shiftY + 'px';
            }
            function onMouseMove(event) { moveAt(event.pageX, event.pageY); }
            
            document.addEventListener('mousemove', onMouseMove);
            document.onmouseup = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.onmouseup = null;
            };
        });
    });
}
