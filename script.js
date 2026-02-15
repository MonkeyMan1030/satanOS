/* =========================================
   CONFIGURATION & DATA
   ========================================= */

// Game Time Settings
// 1 Real Second = 1 Game Minute.
// A 9-5 shift (8 hours) = 480 game minutes = 480 real seconds (8 minutes).
// To make it faster for testing, we can change the interval speed.
const GAME_TICK_SPEED = 1000; // 1000ms (1s) per game minute.
const SHIFT_START = 9; // 9:00 AM
const SHIFT_END = 17;  // 5:00 PM (17:00)

// Data for Procedural Generation
const firstNames = ["Chad", "Karen", "Elon", "Gertrude", "Kyle", "Bartholomew", "Susan", "Jeff", "Adolf", "Tiffany"];
const lastNames = ["Musk", "Smith", "Bezos", "Doe", "Vanderbilt", "Trump", "Buffett", "Kardashian", "Zuckerberg"];

// The Detective Database
// Each sin has Clues (Deaths, Feats, Family) and a Correct Punishment.
const sinDatabase = {
    "Gluttony": {
        punishment: "Spiders", // Must match value in HTML Radio button
        deaths: [
            "Choked on a gold-leaf steak.",
            "Stomach ruptured at a buffet.",
            "Drowned in a vat of chocolate."
        ],
        feats: [
            "Ate 50 hotdogs in 2 minutes.",
            "Banished from 10 'All You Can Eat' restaurants.",
            "Spent family savings on truffles."
        ],
        family: [
            "He loved food more than his children.",
            "We had to buy a double-wide coffin.",
            "He ate my birthday cake... every year."
        ]
    },
    "Greed": {
        punishment: "Gold",
        deaths: [
            "Crushed by a falling safe.",
            "Suffocated inside a bank vault.",
            "Heart attack while counting pennies."
        ],
        feats: [
            "Evaded $50 million in taxes.",
            "Foreclosed on an orphanage.",
            "Sold sand to people in the desert."
        ],
        family: [
            "He charged us rent to visit him.",
            "He died clutching his wallet.",
            "Is it true we get his money now?"
        ]
    },
    "Pride": {
        punishment: "Mirrors",
        deaths: [
            "Fell off a stage accepting an award.",
            "Walked into traffic staring at reflection.",
            "Plastic surgery gone wrong."
        ],
        feats: [
            "Wrote a memoir at age 12.",
            "Commissioned 50 statues of himself.",
            "Declared himself a sovereign nation."
        ],
        family: [
            "He never remembered our names.",
            "He thought he was God's gift.",
            "The mirror was his best friend."
        ]
    },
    "Sloth": {
        punishment: "Treadmill",
        deaths: [
            "Forgot to breathe.",
            "Bed sores infection.",
            "Starved because the fridge was too far."
        ],
        feats: [
            "Slept for 18 hours a day.",
            "Watched 20 years of TV.",
            "Never held a job for more than a day."
        ],
        family: [
            "He asked me to chew his food for him.",
            "He hasn't moved since 1999.",
            "Lazy doesn't even cover it."
        ]
    },
    "Wrath": {
        punishment: "Tickle",
        deaths: [
            "Head exploded from screaming.",
            "Shot while road raging.",
            "Stroke caused by a video game."
        ],
        feats: [
            "Punched a hole in every wall he owned.",
            "Started 50 bar fights.",
            "Screamed at 1,000 managers."
        ],
        family: [
            "We walked on eggshells around him.",
            "He kicked the dog... and the car.",
            "Always angry. Always shouting."
        ]
    },
    "Envy": {
        punishment: "Slime",
        deaths: [
            "Poisoned by own jealousy.",
            "Crashed trying to steal neighbor's car.",
            "Stalking accident."
        ],
        feats: [
            "Sabotaged 10 coworkers.",
            "Copied everything his brother did.",
            "Hated everyone successful."
        ],
        family: [
            "He couldn't stand seeing us happy.",
            "If I got a toy, he broke it.",
            "He wanted everyone's life but his own."
        ]
    },
    "Lust": {
        punishment: "Cactus",
        deaths: [
            "Heart attack in a brothel.",
            "Chased a lover off a cliff.",
            "Auto-erotic asphyxiation."
        ],
        feats: [
            "Slept with 1,000 people.",
            "Ruined 5 marriages.",
            "Spent fortune on 'entertainment'."
        ],
        family: [
            "He was never faithful.",
            "We don't talk about his 'hobbies'.",
            "A total pervert."
        ]
    }
};

/* =========================================
   GAME STATE VARIABLES
   ========================================= */
let currentDay = 1;
let currentHour = SHIFT_START;
let currentMinute = 0;
let gameTimer = null;
let activeSouls = []; // Array of Sinner Objects
let currentViewingID = null; // ID of soul currently open in Viewer

// Score Stats
let correctCount = 0;
let wrongCount = 0;
let doomLevel = 0;

/* =========================================
   INITIALIZATION
   ========================================= */
window.onload = function() {
    makeDraggable(); // Enable window dragging
    startDay();      // Begin the game loop
};

/* =========================================
   TIME & LOOP SYSTEM
   ========================================= */
function startDay() {
    // Reset daily variables
    currentHour = SHIFT_START;
    currentMinute = 0;
    correctCount = 0;
    wrongCount = 0;
    activeSouls = [];
    
    // Clear UI
    document.getElementById('email-tbody').innerHTML = '';
    document.getElementById('eod-screen').classList.add('hidden');
    document.getElementById('day-display').innerText = currentDay;
    updateDoomUI();

    // Start the Clock Interval
    if (gameTimer) clearInterval(gameTimer);
    gameTimer = setInterval(tickGameTime, GAME_TICK_SPEED);
    
    // Start Soul Spawning Loop
    scheduleNextSoul();
}

function tickGameTime() {
    // Increment Time
    currentMinute++;
    if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour++;
    }

    // Update Clock Display
    const timeStr = formatTime(currentHour, currentMinute);
    document.getElementById('clock').innerText = timeStr;

    // Check for End of Shift
    if (currentHour >= SHIFT_END) {
        endDay();
    }
}

function formatTime(h, m) {
    const period = h >= 12 ? "PM" : "AM";
    const hour = h > 12 ? h - 12 : h;
    const min = m < 10 ? "0" + m : m;
    return `${hour}:${min} ${period}`;
}

function endDay() {
    clearInterval(gameTimer);
    
    // Show End of Day Screen
    const screen = document.getElementById('eod-screen');
    screen.classList.remove('hidden');
    document.getElementById('eod-title').innerText = `Day ${currentDay} Report`;
    document.getElementById('eod-correct').innerText = correctCount;
    document.getElementById('eod-wrong').innerText = wrongCount;
    document.getElementById('eod-doom').innerText = doomLevel;
}

function startNextDay() {
    currentDay++;
    if (currentDay > 7) {
        alert("WEEK COMPLETE! You are now Manager of Hell. (You win!)");
        location.reload();
    } else {
        startDay();
    }
}

/* =========================================
   PROCEDURAL GENERATION (The "Sinner Factory")
   ========================================= */
function scheduleNextSoul() {
    // Random delay between 10 and 30 game minutes
    const delay = Math.floor(Math.random() * 20000) + 10000;
    
    setTimeout(() => {
        if (currentHour < SHIFT_END) {
            spawnSoul();
            scheduleNextSoul(); // Recursively schedule the next one
        }
    }, delay);
}

function spawnSoul() {
    if (activeSouls.length >= 10) return; // Mailbox full

    // 1. Pick a Random Sin (The hidden truth)
    const sinKeys = Object.keys(sinDatabase);
    const trueSin = sinKeys[Math.floor(Math.random() * sinKeys.length)];
    const sinData = sinDatabase[trueSin];

    // 2. Generate Random Details based on that Sin
    const soul = {
        id: Math.floor(Math.random() * 90000) + 10000,
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
        trueSin: trueSin, // Hidden from player
        death: sinData.deaths[Math.floor(Math.random() * sinData.deaths.length)],
        feat: sinData.feats[Math.floor(Math.random() * sinData.feats.length)],
        family: sinData.family[Math.floor(Math.random() * sinData.family.length)],
        time: formatTime(currentHour, currentMinute)
    };

    activeSouls.push(soul);
    renderMailbox();
    
    // Notification
    const notif = document.getElementById('mail-notification');
    notif.classList.remove('hidden');
    notif.innerText = activeSouls.length;
}

/* =========================================
   UI LOGIC: EMAIL & SOUL VIEWER
   ========================================= */
function renderMailbox() {
    const tbody = document.getElementById('email-tbody');
    tbody.innerHTML = '';

    activeSouls.forEach((soul, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>📧</td>
            <td>St. Peter</td>
            <td>New Arrival: ${soul.lastName}</td>
            <td>${soul.time}</td>
        `;
        // On Click: Show Preview
        tr.onclick = () => {
            const preview = document.getElementById('email-preview');
            preview.innerHTML = `
                <p><strong>FROM:</strong> St. Peter (Gate)</p>
                <p><strong>SUBJ:</strong> Judgment Required: ${soul.firstName} ${soul.lastName}</p>
                <hr>
                <p>Another one just dropped. Attached is their file.</p>
                <p>Review the evidence. Determine the Sin. Punish accordingly.</p>
                <br>
                <button class="win-btn" onclick="openSoulFile(${index})">📂 OPEN SOUL RECORD</button>
            `;
        };
        tbody.appendChild(tr);
    });
}

function openSoulFile(index) {
    const soul = activeSouls[index];
    currentViewingID = soul.id;

    // Populate the File Window
    document.getElementById('file-id').innerText = soul.id;
    document.getElementById('file-name').innerText = soul.firstName + " " + soul.lastName;
    document.getElementById('file-death').innerText = soul.death;
    document.getElementById('file-feat').innerText = soul.feat;
    document.getElementById('file-family').innerText = `"${soul.family}"`;

    // Show the Window
    openWindow('file-window');
}

/* =========================================
   GAMEPLAY LOGIC: PUNISHMENT & BIBLE
   ========================================= */
function showTorture(sinName) {
    const content = document.getElementById('bible-content');
    const method = sinDatabase[sinName].punishment;
    content.innerHTML = `
        <h3>SIN: ${sinName.toUpperCase()}</h3>
        <hr>
        <p><strong>Mandatory Punishment:</strong></p>
        <h2 style="color: blue">${method}</h2>
        <p><em>Failure to apply correct punishment will result in Doom.</em></p>
    `;
}

function openPunishWithID() {
    openWindow('punish-window');
    populatePunishDropdown();
    // Auto-select the soul we were just looking at
    const select = document.getElementById('soul-select');
    for (let i=0; i<select.options.length; i++) {
        if (select.options[i].text.includes(currentViewingID)) {
            select.selectedIndex = i;
            break;
        }
    }
    // Close the file window to clean up
    closeWindow('file-window');
}

function populatePunishDropdown() {
    const select = document.getElementById('soul-select');
    select.innerHTML = '';
    activeSouls.forEach((soul, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.innerText = `${soul.firstName} ${soul.lastName} (ID: ${soul.id})`;
        select.appendChild(opt);
    });
}

function submitPunishment() {
    const soulIndex = document.getElementById('soul-select').value;
    const radio = document.querySelector('input[name="torture"]:checked');
    const log = document.getElementById('punish-log');

    if (soulIndex === "" || !radio) {
        log.innerText = "ERROR: Missing Selection";
        log.style.color = "red";
        return;
    }

    const soul = activeSouls[soulIndex];
    const selectedMethod = radio.value;
    const correctMethod = sinDatabase[soul.trueSin].punishment;

    // JUDGMENT MOMENT
    if (selectedMethod === correctMethod) {
        log.innerText = "SUCCESS. SOUL PROCESSED.";
        log.style.color = "green";
        correctCount++;
        doomLevel = Math.max(0, doomLevel - 5);
        activeSouls.splice(soulIndex, 1); // Remove from game
    } else {
        log.innerText = `ERROR! SIN WAS ${soul.trueSin.toUpperCase()}.`;
        log.style.color = "red";
        wrongCount++;
        doomLevel += 15;
    }

    // Refresh UI
    updateDoomUI();
    renderMailbox();
    populatePunishDropdown();
    
    // Hide notification if empty
    if (activeSouls.length === 0) {
        document.getElementById('mail-notification').classList.add('hidden');
    }
}

function updateDoomUI() {
    document.getElementById('score-display').innerText = correctCount;
    document.getElementById('doom-display').innerText = doomLevel + "%";
    document.getElementById('doom-bar').style.width = doomLevel + "%";

    if (doomLevel >= 100) {
        clearInterval(gameTimer);
        alert("GAME OVER. DOOM REACHED 100%. YOU ARE FIRED.");
        location.reload();
    }
}

/* =========================================
   WINDOW MANAGEMENT (Drag & Drop)
   ========================================= */
function openWindow(id) {
    const win = document.getElementById(id);
    win.classList.remove('hidden');
    bringToFront(win);
}

function closeWindow(id) {
    document.getElementById(id).classList.add('hidden');
}

function bringToFront(win) {
    // Reset all z-indexes
    document.querySelectorAll('.window').forEach(w => w.style.zIndex = 10);
    win.style.zIndex = 100;
}

function makeDraggable() {
    const windows = document.querySelectorAll('.window');
    windows.forEach(win => {
        const titleBar = win.querySelector('.title-bar');
        
        // Click to bring to front
        win.addEventListener('mousedown', () => bringToFront(win));

        // Drag Logic
        titleBar.addEventListener('mousedown', (e) => {
            let shiftX = e.clientX - win.getBoundingClientRect().left;
            let shiftY = e.clientY - win.getBoundingClientRect().top;

            function moveAt(pageX, pageY) {
                win.style.left = pageX - shiftX + 'px';
                win.style.top = pageY - shiftY + 'px';
            }

            function onMouseMove(event) { moveAt(event.pageX, event.pageY); }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
            }, {once: true});
        });
    });
}