/* ===========================
   CONFIG — ganti sesukamu
=========================== */
const SECRET_CODE = "moon";
const CODE_HINT = "Hint: benda bercahaya di langit malam 🌙"; // muncul setelah 3x salah, kosongkan "" untuk mematikan

const LETTER = `Dear,

If you're reading this...

It means you found the right code.

I just wanted to make something
a little different for you.

Maybe this website isn't perfect.

But every line here
was made with one person in mind.

Thank you for staying.

Thank you for laughing with me.

Thank you for existing.

No matter how far the distance is,

I'll always wish
that your days are filled
with happiness.

Take care of yourself.

And don't forget...

Someone out there
is thinking about you.

🤍`;

const LOADING_STEPS = [
    "Initializing...", "Reading the stars...", "Finding the right words...",
    "Folding the paper...", "Almost there..."
];
const HUG_MESSAGES = ["Aku di sini 🤍", "Kamu nggak sendirian.", "Peluk dari jauh, tapi sungguhan.", "Terima kasih sudah ada."];

/* ===========================
   ELEMENT
=========================== */
const $ = (id) => document.getElementById(id);
const envelope = $("openEnvelope"), popup = $("popup"), popupCard = $("popupCard");
const unlockBtn = $("unlockBtn"), password = $("password"), errorEl = $("error"), hint = $("hint");
const loading = $("loading"), progressBar = $("progressBar"), loadingText = $("loadingText");
const letter = $("letter"), paper = $("paper"), typewriter = $("typewriter"), skipHint = $("skipHint");
const hugBtn = $("hugBtn"), hugMsg = $("hugMsg"), closeBtn = $("closeBtn");
const music = $("music"), musicBtn = $("musicBtn");
const heartContainer = $("heartContainer"), stars = $("stars"), particles = $("particles");
const moon = $("moon"), hero = $("hero"), subtitle = $("subtitle");

let unlocked = false, wrongCount = 0;

/* ===========================
   BACKGROUND: STARS, PARTICLES, SHOOTING STAR
=========================== */
for (let i = 0; i < 160; i++) {
    const s = document.createElement("span");
    const size = Math.random() * 2.5 + 0.8;
    s.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;top:${Math.random() * 100}%;` +
        `animation-duration:${2 + Math.random() * 5}s;animation-delay:-${Math.random() * 5}s`;
    stars.appendChild(s);
}

for (let i = 0; i < 24; i++) {
    const p = document.createElement("i");
    const size = Math.random() * 5 + 2;
    p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;` +
        `animation-duration:${9 + Math.random() * 12}s;animation-delay:-${Math.random() * 15}s`;
    particles.appendChild(p);
}

function shootingStar() {
    const s = document.createElement("div");
    s.className = "shooting";
    s.style.left = 40 + Math.random() * 55 + "vw";
    s.style.top = Math.random() * 40 + "vh";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1200);
}
setInterval(() => { if (Math.random() < 0.6) shootingStar(); }, 5000);

// klik bulan → bulan berdenyut + bintang jatuh
moon.onclick = () => {
    moon.classList.remove("pulse"); void moon.offsetWidth; moon.classList.add("pulse");
    shootingStar(); setTimeout(shootingStar, 300);
};

// jejak sparkle mengikuti kursor di halaman depan
let lastSpark = 0;
hero.addEventListener("pointermove", (e) => {
    const now = performance.now();
    if (now - lastSpark < 60 || unlocked) return;
    lastSpark = now;
    const sp = document.createElement("span");
    sp.className = "spark";
    sp.textContent = Math.random() < 0.5 ? "✨" : "🤍";
    sp.style.left = e.clientX + "px";
    sp.style.top = e.clientY + "px";
    document.body.appendChild(sp);
    setTimeout(() => sp.remove(), 800);
});

/* ===========================
   MUSIC — pakai assets/music.mp3 kalau ada,
   kalau tidak ada otomatis pakai melodi buatan (Web Audio)
=========================== */
let playing = false, useSynth = false, ac, master, seq, step = 0;
music.volume = 0.6;
music.querySelector("source").addEventListener("error", () => { useSynth = true; });

const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33]; // C mayor pentatonik
const MELODY = [2, 4, 5, 4, 2, 1, 0, 1, 2, 4, 5, 6, 5, 4, 2, 1];
const BASS = [130.81, 98.0, 110.0, 87.31];

function initSynth() {
    if (ac) return;
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = 0;
    const delay = ac.createDelay(1); delay.delayTime.value = 0.45;
    const fb = ac.createGain(); fb.gain.value = 0.38;
    const wet = ac.createGain(); wet.gain.value = 0.5;
    master.connect(ac.destination);
    master.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(ac.destination);
}
function tone(freq, t, dur, vol, type = "sine") {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
}
function synthTick() {
    const t = ac.currentTime + 0.05;
    tone(SCALE[MELODY[step % MELODY.length]], t, 1.6, 0.16);
    if (step % 4 === 0) tone(BASS[(step / 4) % BASS.length], t, 3.2, 0.12, "triangle");
    step++;
}
function synthStart() {
    initSynth(); ac.resume();
    master.gain.cancelScheduledValues(ac.currentTime);
    master.gain.linearRampToValueAtTime(0.9, ac.currentTime + 1.5);
    if (!seq) { synthTick(); seq = setInterval(synthTick, 650); }
}
function synthStop() {
    if (!ac) return;
    master.gain.cancelScheduledValues(ac.currentTime);
    master.gain.linearRampToValueAtTime(0, ac.currentTime + 0.6);
    clearInterval(seq); seq = null;
}

function startMusic() {
    if (playing) return;
    playing = true;
    musicBtn.classList.add("on"); musicBtn.textContent = "⏸";
    if (useSynth) return synthStart();
    music.play().catch(() => { useSynth = true; if (playing) synthStart(); });
}
function stopMusic() {
    playing = false;
    musicBtn.classList.remove("on"); musicBtn.textContent = "🎵";
    music.pause(); synthStop();
}
musicBtn.onclick = () => (playing ? stopMusic() : startMusic());

/* ===========================
   ENVELOPE → POPUP
=========================== */
function openPopup() {
    if (unlocked) return;
    popup.classList.remove("hidden");
    setTimeout(() => password.focus(), 50);
}
function closePopup() { popup.classList.add("hidden"); errorEl.textContent = ""; }

envelope.onclick = openPopup;
envelope.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPopup(); } });
popup.addEventListener("click", (e) => { if (e.target === popup) closePopup(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !popup.classList.contains("hidden")) closePopup(); });
password.addEventListener("keydown", (e) => { if (e.key === "Enter") unlock(); });
unlockBtn.onclick = unlock;

function shake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }

/* ===========================
   CHECK PASSWORD
=========================== */
function unlock() {
    if (password.value.trim().toLowerCase() !== SECRET_CODE.toLowerCase()) {
        wrongCount++;
        errorEl.textContent = "Wrong code 🤍";
        shake(popupCard); shake(envelope);
        password.select();
        if (wrongCount >= 3 && CODE_HINT) hint.textContent = CODE_HINT;
        return;
    }
    unlocked = true;
    popup.classList.add("hidden");
    loading.classList.remove("hidden");
    startMusic(); // klik tombol = interaksi user, jadi browser mengizinkan audio
    decrypt();
}

/* ===========================
   DECRYPT
=========================== */
function decrypt() {
    let progress = 0;
    progressBar.style.width = "0%";
    const timer = setInterval(() => {
        progress++;
        progressBar.style.width = progress + "%";
        const msg = LOADING_STEPS[Math.min(Math.floor(progress / (100 / LOADING_STEPS.length)), LOADING_STEPS.length - 1)];
        loadingText.textContent = `${msg} ${progress}%`;
        if (progress >= 100) {
            clearInterval(timer);
            loading.classList.add("hidden");
            openLetter();
        }
    }, 30);
}

/* ===========================
   OPEN LETTER + TYPEWRITER
=========================== */
let index = 0, typeTimer = null, typing = false;

function openLetter() {
    envelope.classList.add("opened");
    subtitle.style.opacity = 0;
    setTimeout(() => {
        letter.classList.remove("hidden");
        index = 0; typewriter.textContent = ""; skipHint.style.opacity = 1;
        typing = true; typewriter.classList.add("typing");
        typeText();
    }, 900);
}

function typeText() {
    if (index >= LETTER.length) return finishTyping();
    const ch = LETTER.charAt(index++);
    typewriter.textContent = LETTER.slice(0, index);
    paper.scrollTop = paper.scrollHeight;
    // jeda lebih panjang di tanda baca & baris kosong, supaya terasa seperti diketik pelan
    const delay = ch === "\n" ? 140 : /[.,…]/.test(ch) ? 220 : 32;
    typeTimer = setTimeout(typeText, delay);
}
function finishTyping() {
    clearTimeout(typeTimer);
    index = LETTER.length;
    typewriter.textContent = LETTER;
    typewriter.classList.remove("typing");
    skipHint.style.opacity = 0;
    typing = false;
}
// klik kertas = lewati animasi
paper.addEventListener("click", (e) => {
    if (typing && !e.target.closest("button")) finishTyping();
});

closeBtn.onclick = () => {
    finishTyping();
    letter.classList.add("hidden");
    envelope.classList.remove("opened");
    subtitle.style.opacity = 1;
    subtitle.textContent = "Kamu bisa membukanya lagi kapan saja.";
    unlocked = false; // klik amplop lagi akan langsung minta kode lagi
    password.value = "";
};

/* ===========================
   HOLD ME → HEARTS
=========================== */
let holdTimer = null, hugCount = 0;

function startHug(e) {
    e.preventDefault();
    if (holdTimer) return;
    hugBtn.classList.add("holding");
    burst(12);
    holdTimer = setInterval(() => burst(4), 180);
}
function endHug() {
    if (!holdTimer) return;
    clearInterval(holdTimer); holdTimer = null;
    hugBtn.classList.remove("holding");
    hugMsg.textContent = HUG_MESSAGES[hugCount++ % HUG_MESSAGES.length];
}
hugBtn.addEventListener("pointerdown", startHug);
["pointerup", "pointerleave", "pointercancel"].forEach((ev) => hugBtn.addEventListener(ev, endHug));
hugBtn.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && !e.repeat) { startHug(e); setTimeout(endHug, 900); } });

function burst(n) { for (let i = 0; i < n; i++) createHeart(); }

function createHeart() {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.textContent = ["❤️", "🤍", "💗", "💖"][Math.floor(Math.random() * 4)];
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.bottom = "-30px";
    heart.style.fontSize = 16 + Math.random() * 22 + "px";
    heart.style.animationDuration = 2 + Math.random() * 3 + "s";
    heartContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 5000);
}
