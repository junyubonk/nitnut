/* ===========================
   CONFIG — ganti sesukamu
=========================== */
const SECRET_CODE = "moon";
const CODE_HINT = "Hint: benda bercahaya di langit malam 🌙 (lihat siapa yang duduk di atasnya)"; // "" = matikan

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

🤍🐾`;

const LOADING_STEPS = ["Membangunkan kucing penjaga...", "Mengendus kode...", "Mencakar segel...", "Merapikan kertas...", "Hampir selesai..."];
const HUG_MESSAGES = ["Purr purr... 🐱", "Aku di sini 🤍", "Kamu nggak sendirian.", "Peluk dari jauh, tapi sungguhan."];
const LOVE_MESSAGES = ["Sayang terkirim", "Sayangku sampai", "Cinta terkirim"]; // dipakai di bawah foto profil

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
const moon = $("moon"), hero = $("hero"), subtitle = $("subtitle"), loveCount = $("loveCount");

let unlocked = false, wrongCount = 0;
const small = matchMedia("(max-width:768px)").matches; // HP: kurangi efek supaya ringan
const buzz = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} }; // getar (Android)

/* ===========================
   BACKGROUND
=========================== */
for (let i = 0; i < (small ? 70 : 150); i++) {
    const s = document.createElement("span");
    const size = Math.random() * 2.5 + 0.8;
    s.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;top:${Math.random() * 100}%;` +
        `animation-duration:${2 + Math.random() * 5}s;animation-delay:-${Math.random() * 5}s`;
    stars.appendChild(s);
}
for (let i = 0; i < (small ? 8 : 16); i++) { // jejak kaki & ikan melayang naik
    const p = document.createElement("i");
    p.textContent = i % 5 === 0 ? "🐟" : "🐾";
    p.style.cssText = `left:${Math.random() * 100}%;font-size:${12 + Math.random() * 12}px;` +
        `animation-duration:${10 + Math.random() * 12}s;animation-delay:-${Math.random() * 15}s`;
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

moon.onclick = () => {
    moon.classList.remove("pulse"); void moon.offsetWidth; moon.classList.add("pulse");
    meow(0.9); shootingStar(); setTimeout(shootingStar, 300);
};

/* ===========================
   POINTER: jejak kaki + mata kucing mengikuti kursor
=========================== */
let lastPaw = 0, pawSide = 1;
function lookAt(x, y) { // pupil mengikuti kursor / jari
    document.querySelectorAll(".eye").forEach((eye) => {
        const r = eye.getBoundingClientRect();
        const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
        const ang = Math.atan2(dy, dx), d = Math.min(r.width * 0.25, Math.hypot(dx, dy) / 30);
        eye.firstElementChild.style.translate = `${Math.cos(ang) * d}px ${Math.sin(ang) * d}px`;
    });
}
function pawAt(x, y, force) {
    const now = performance.now();
    if ((now - lastPaw < 110 && !force) || unlocked) return;
    lastPaw = now; pawSide *= -1;
    const p = document.createElement("span");
    p.className = "paw"; p.textContent = "🐾";
    p.style.left = x + pawSide * 8 + "px"; p.style.top = y + "px";
    p.style.setProperty("--r", pawSide * 25 + "deg");
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1000);
}
document.addEventListener("pointermove", (e) => { lookAt(e.clientX, e.clientY); pawAt(e.clientX, e.clientY); });
// di HP tidak ada "hover", jadi setiap tap juga meninggalkan jejak kaki & membuat mata melirik
document.addEventListener("pointerdown", (e) => { lookAt(e.clientX, e.clientY); pawAt(e.clientX, e.clientY, true); });

/* ===========================
   AUDIO: musik + suara kucing
=========================== */
let ac, master, sfx, playing = false, useSynth = false, seq, step = 0;
music.volume = 0.6;
music.querySelector("source").addEventListener("error", () => { useSynth = true; });

function ensureAC() {
    if (!ac) {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        master = ac.createGain(); master.gain.value = 0;
        const delay = ac.createDelay(1); delay.delayTime.value = 0.45;
        const fb = ac.createGain(); fb.gain.value = 0.38;
        const wet = ac.createGain(); wet.gain.value = 0.5;
        master.connect(ac.destination);
        master.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(ac.destination);
        sfx = ac.createGain(); sfx.gain.value = 1; sfx.connect(ac.destination);
    }
    ac.resume();
}

// "Meow" buatan: sawtooth + filter formant yang disapu naik-turun
function meow(pitch = 1, sad = false) {
    buzz(sad ? [60, 40, 60] : 18);
    try {
        ensureAC();
        const t = ac.currentTime, dur = sad ? 0.9 : 0.6;
        const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
        o.type = "sawtooth";
        const [a, b, c] = sad ? [700, 600, 330] : [480, 820, 430];
        o.frequency.setValueAtTime(a * pitch, t);
        o.frequency.linearRampToValueAtTime(b * pitch, t + dur * 0.3);
        o.frequency.linearRampToValueAtTime(c * pitch, t + dur);
        f.type = "bandpass"; f.Q.value = 3;
        f.frequency.setValueAtTime(900, t);
        f.frequency.linearRampToValueAtTime(sad ? 1100 : 1900, t + dur * 0.35);
        f.frequency.linearRampToValueAtTime(800, t + dur);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.35, t + 0.07);
        g.gain.linearRampToValueAtTime(0, t + dur);
        o.connect(f); f.connect(g); g.connect(sfx);
        o.start(t); o.stop(t + dur + 0.05);
    } catch (e) {}
}

// Purr: gelombang rendah yang amplitudonya bergetar ±25x/detik
let purrNodes = null;
function purrStart() {
    try {
        ensureAC();
        if (purrNodes) return;
        const o = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain();
        const lfo = ac.createOscillator(), lg = ac.createGain();
        o.type = "sawtooth"; o.frequency.value = 95;
        lp.type = "lowpass"; lp.frequency.value = 420;
        lfo.frequency.value = 24; lg.gain.value = 0.12; g.gain.value = 0;
        lfo.connect(lg); lg.connect(g.gain);
        o.connect(lp); lp.connect(g); g.connect(sfx);
        g.gain.setTargetAtTime(0.14, ac.currentTime, 0.15);
        o.start(); lfo.start();
        purrNodes = { o, lfo, g };
    } catch (e) {}
}
function purrStop() {
    if (!purrNodes) return;
    const { o, lfo, g } = purrNodes; purrNodes = null;
    g.gain.setTargetAtTime(0, ac.currentTime, 0.1);
    setTimeout(() => { o.stop(); lfo.stop(); }, 400);
}

// Musik latar sintetis (dipakai kalau assets/music.mp3 tidak ada)
const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];
const MELODY = [2, 4, 5, 4, 2, 1, 0, 1, 2, 4, 5, 6, 5, 4, 2, 1];
const BASS = [130.81, 98.0, 110.0, 87.31];
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
    ensureAC();
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
    playing = true; musicBtn.classList.add("on"); musicBtn.textContent = "⏸";
    if (useSynth) return synthStart();
    music.play().catch(() => { useSynth = true; if (playing) synthStart(); });
}
function stopMusic() {
    playing = false; musicBtn.classList.remove("on"); musicBtn.textContent = "🎵";
    music.pause(); synthStop();
}
musicBtn.onclick = () => (playing ? stopMusic() : startMusic());

/* ===========================
   FOTO PROFIL + HATI
=========================== */
let loveTaps = 0;
function burst(n) { n = small ? Math.ceil(n * 0.6) : n; for (let i = 0; i < n; i++) createHeart(); }

document.addEventListener("click", (e) => {
    const av = e.target.closest(".avatar");
    if (av) {
        av.classList.remove("wiggle"); void av.offsetWidth; av.classList.add("wiggle");
        meow(av.closest(".person").nextElementSibling ? 0.85 : 1.25); // dua suara kucing beda nada
        burst(10);
        return;
    }
    const lv = e.target.closest(".love");
    if (lv) {
        lv.classList.remove("pop"); void lv.offsetWidth; lv.classList.add("pop");
        loveTaps++;
        if (loveCount) loveCount.textContent = `${LOVE_MESSAGES[loveTaps % LOVE_MESSAGES.length]} ${loveTaps}x 💗`;
        meow(1.1); burst(18);
        if (loveTaps === 10) burst(60); // bonus tap ke-10
    }
});

function createHeart() {
    const h = document.createElement("div");
    h.className = "heart";
    h.textContent = ["❤️", "🤍", "💗", "😻", "🐾"][Math.floor(Math.random() * 5)];
    h.style.left = Math.random() * 100 + "vw";
    h.style.bottom = "-30px";
    h.style.fontSize = 16 + Math.random() * 22 + "px";
    h.style.animationDuration = 2 + Math.random() * 3 + "s";
    heartContainer.appendChild(h);
    setTimeout(() => h.remove(), 5000);
}

/* ===========================
   KUCING JALAN LEWAT SESEKALI
=========================== */
function walker() {
    if (document.querySelector(".walker")) return;
    const w = document.createElement("div");
    w.className = "walker"; w.textContent = "🐈"; w.title = "Meow?";
    w.onclick = () => { meow(1.2); burst(14); };
    w.addEventListener("animationend", () => w.remove());
    document.body.appendChild(w);
}
setTimeout(walker, 8000);
setInterval(walker, 30000);

/* ===========================
   ENVELOPE → POPUP → UNLOCK
=========================== */
function openPopup() {
    if (unlocked) return;
    meow(1);
    popup.classList.remove("hidden");
    password.focus({ preventScroll: true }); // harus sinkron agar keyboard HP (iOS) muncul
}
function closePopup() { popup.classList.add("hidden"); errorEl.textContent = ""; }
function shake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }

envelope.onclick = openPopup;
envelope.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPopup(); } });
popup.addEventListener("click", (e) => { if (e.target === popup) closePopup(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !popup.classList.contains("hidden")) closePopup(); });
password.addEventListener("keydown", (e) => { if (e.key === "Enter") unlock(); });
unlockBtn.onclick = unlock;

function unlock() {
    if (password.value.trim().toLowerCase() !== SECRET_CODE.toLowerCase()) {
        wrongCount++;
        errorEl.textContent = "Kodenya salah, kucingnya mendesis 😾";
        shake(popupCard); shake(envelope); meow(0.8, true);
        password.select();
        if (wrongCount >= 3 && CODE_HINT) hint.textContent = CODE_HINT;
        return;
    }
    unlocked = true;
    popup.classList.add("hidden");
    loading.classList.remove("hidden");
    meow(1.3); startMusic(); // klik = interaksi user, jadi audio diizinkan browser
    decrypt();
}

function decrypt() {
    let progress = 0;
    progressBar.style.width = "0%";
    const timer = setInterval(() => {
        progress++;
        progressBar.style.width = progress + "%";
        const msg = LOADING_STEPS[Math.min(Math.floor(progress / (100 / LOADING_STEPS.length)), LOADING_STEPS.length - 1)];
        loadingText.textContent = `${msg} ${progress}%`;
        if (progress >= 100) { clearInterval(timer); loading.classList.add("hidden"); openLetter(); }
    }, 30);
}

/* ===========================
   SURAT + TYPEWRITER
=========================== */
let index = 0, typeTimer = null, typing = false, miniAdded = false;

function openLetter() {
    envelope.classList.add("opened");
    subtitle.style.opacity = 0;
    setTimeout(() => {
        if (!miniAdded) { // salin foto profil + hati ke atas surat
            const mini = document.querySelector(".couple").cloneNode(true);
            mini.className = "mini"; $("miniSlot").appendChild(mini); miniAdded = true;
        }
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
    typeTimer = setTimeout(typeText, ch === "\n" ? 140 : /[.,…]/.test(ch) ? 220 : 32);
}
function finishTyping() {
    clearTimeout(typeTimer);
    index = LETTER.length;
    typewriter.textContent = LETTER;
    typewriter.classList.remove("typing");
    skipHint.style.opacity = 0;
    typing = false;
}
paper.addEventListener("click", (e) => { if (typing && !e.target.closest("button, .avatar")) finishTyping(); });

closeBtn.onclick = () => {
    finishTyping(); purrStop();
    letter.classList.add("hidden");
    envelope.classList.remove("opened");
    subtitle.style.opacity = 1; subtitle.textContent = "Kamu bisa membukanya lagi kapan saja 🐾";
    unlocked = false; password.value = "";
};

/* ===========================
   TAHAN = ELUS KUCING (purr + hati)
=========================== */
let holdTimer = null, hugCount = 0;
function startHug(e) {
    e.preventDefault();
    if (holdTimer) return;
    hugBtn.classList.add("holding");
    purrStart(); burst(10);
    buzz(40);
    holdTimer = setInterval(() => { burst(3); buzz(30); }, 200);
}
function endHug() {
    if (!holdTimer) return;
    clearInterval(holdTimer); holdTimer = null;
    hugBtn.classList.remove("holding"); purrStop(); buzz(0);
    hugMsg.textContent = HUG_MESSAGES[hugCount++ % HUG_MESSAGES.length];
}
hugBtn.addEventListener("contextmenu", (e) => e.preventDefault()); // cegah menu long-press di HP
hugBtn.addEventListener("pointerdown", startHug);
["pointerup", "pointerleave", "pointercancel"].forEach((ev) => hugBtn.addEventListener(ev, endHug));
hugBtn.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && !e.repeat) { startHug(e); setTimeout(endHug, 1200); } });

/* HP: kalau tab/aplikasi ke background, jeda musik; saat kembali, lanjutkan */
let resumeAfter = false;
document.addEventListener("visibilitychange", () => {
    if (document.hidden) { resumeAfter = playing; if (playing) stopMusic(); purrStop(); }
    else if (resumeAfter) { resumeAfter = false; startMusic(); }
});
