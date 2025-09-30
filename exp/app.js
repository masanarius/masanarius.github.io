"use strict";

/* ========== 表示制御 ========== */
const UI_SHOW = { title: false, idSelect: true, score: false, high: false, trial: true, reset: false, refresh: true, help: true, points: false, popup: true };

// DOM 参照
const titleEl = document.getElementById('title');
const idBlock = document.getElementById('idBlock');
const helperText = document.getElementById('helperText');
const grid = document.getElementById('grid');
const scoreEl = document.getElementById('score');
const highEl = document.getElementById('high');
const trialEl = document.getElementById('trial');
const resetBtn = document.getElementById('resetBtn');
const refreshBtn = document.getElementById('refreshBtn');
// ★ 追加：Session ドロップダウン
const sessionSelect = document.getElementById('sessionSelect');

function showOrHide(el, on) { if (!el) return; el.classList.toggle('hidden', !on); }
function applyUIVisibility() {
    showOrHide(titleEl, UI_SHOW.title);
    showOrHide(idBlock, UI_SHOW.idSelect);
    showOrHide(scoreEl, UI_SHOW.score);
    showOrHide(highEl, UI_SHOW.high);
    showOrHide(trialEl, UI_SHOW.trial);
    showOrHide(resetBtn, UI_SHOW.reset);
    showOrHide(refreshBtn, UI_SHOW.refresh);
    showOrHide(helperText, UI_SHOW.help);
}
applyUIVisibility();

/* ========== Google Forms ========== */
// /formResponse を使うこと
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeyAJSCKsDMDDvbF4O7XJrV3kZxdJszUBMd2g0b-HwSTHO4tA/formResponse";
const E = {
    time: "entry.1571500214",
    session_id: "entry.1437906042",
    player_id: "entry.1675133863",
    trial: "entry.1922827613",
    event: "entry.2001340447",

    l_img: "entry.1538485900",
    c_img: "entry.1353722818",
    r_img: "entry.40212684",

    l_img_pts: "entry.103761169",
    c_img_pts: "entry.1387556079",
    r_img_pts: "entry.1571065213",

    l_pos_pts: "entry.1984614365",
    c_pos_pts: "entry.1602656512",
    r_pos_pts: "entry.891595214",

    l_sum_pts: "entry.782728472",
    c_sum_pts: "entry.1810463804",
    r_sum_pts: "entry.2121136899",

    selected_img: "entry.1193759899",
    selected_pos: "entry.1916842762",
    selected_img_pts: "entry.1382321511",
    selected_pos_pts: "entry.1313096228",

    rand_pts: "entry.729117079",
    delta_score: "entry.333867801",
    total_score: "entry.453560264",

    rand_min: "entry.1841599467",
    rand_max: "entry.281080697",
    rand_dist: "entry.697536712",
};

/* ========== スコア設定 ========== */
const POSITION_SCORE = { left: 6, center: 4, right: 2 }; // 位置得点
const REFRESH_SCORE = 0; // Refresh の加点（試行は増えない）

/* ========== 乱数設定 ========== */
const RAND = { enabled: false, min: 0, max: 0, dist: "uniform" };
function sampleRand() {
    if (!RAND.enabled) return { u: 0, pts: 0 };
    const u = Math.random();
    const pts = RAND.min + u * (RAND.max - RAND.min);
    return { u, pts };
}

/* ========== ID / プール ========== */
const idSelect = document.getElementById('idSelect');
// player_id ドロップダウン
for (let i = 1; i <= 20; i++) { const o = document.createElement('option'); o.value = i; o.textContent = i; idSelect.appendChild(o); }
// session_id ドロップダウン
for (let i = 1; i <= 20; i++) { const o = document.createElement('option'); o.value = i; o.textContent = i; sessionSelect.appendChild(o); }

let subjectId = null;   // player_id
let sessionId = null;   // session_id（ドロップダウン選択値）
let started = false;    // ゲーム開始フラグ

const COLORS = ['yel', 'grn', 'blu', 'pnk'];
const PATTERNS = ['str', 'dot', 'box', 'hrb'];
const SHAPES = ['cir', 'tri', 'sqr', 'hex'];

const INCLUDE_BY_SUBJECT = {
    "1": { colors: ["yel", "blu", "pnk"], patterns: ["str", "dot", "box"], shapes: ["cir", "tri", "sqr"] },
    "2": { colors: ["yel", "grn", "pnk"], patterns: ["str", "dot", "box"], shapes: ["cir", "tri", "sqr"] },
    "3": { colors: ["yel", "blu", "pnk"], patterns: ["str", "dot", "box"], shapes: ["cir", "tri", "sqr"] },
    "4": { colors: ["yel", "grn", "pnk"], patterns: ["str", "dot", "box"], shapes: ["cir", "tri", "sqr"] },

    "5": { colors: ["yel", "blu", "pnk"], patterns: ["str", "dot", "box"], shapes: ["tri", "sqr", "hex"] },
    "6": { colors: ["yel", "grn", "pnk"], patterns: ["str", "dot", "box"], shapes: ["tri", "sqr", "hex"] },
    "7": { colors: ["yel", "blu", "pnk"], patterns: ["str", "dot", "box"], shapes: ["tri", "sqr", "hex"] },
    "8": { colors: ["yel", "grn", "pnk"], patterns: ["str", "dot", "box"], shapes: ["tri", "sqr", "hex"] },

    "9": { colors: ["yel", "blu", "pnk"], patterns: ["str", "dot", "hrb"], shapes: ["cir", "tri", "sqr"] },
    "10": { colors: ["yel", "grn", "pnk"], patterns: ["str", "dot", "hrb"], shapes: ["cir", "tri", "sqr"] },
    "11": { colors: ["yel", "blu", "pnk"], patterns: ["str", "dot", "hrb"], shapes: ["cir", "tri", "sqr"] },
    "12": { colors: ["yel", "grn", "pnk"], patterns: ["str", "dot", "hrb"], shapes: ["cir", "tri", "sqr"] },
    "13": { colors: ["yel", "blu", "pnk"], patterns: ["str", "dot", "hrb"], shapes: ["tri", "sqr", "hex"] },
    "14": { colors: ["yel", "grn", "pnk"], patterns: ["str", "dot", "hrb"], shapes: ["tri", "sqr", "hex"] },
    "15": { colors: ["yel", "blu", "pnk"], patterns: ["str", "dot", "hrb"], shapes: ["tri", "sqr", "hex"] },
    "16": { colors: ["yel", "grn", "pnk"], patterns: ["str", "dot", "hrb"], shapes: ["tri", "sqr", "hex"] },

    "17": { colors: ["yel", "blu", "pnk"], patterns: ["str", "dot", "box"], shapes: ["cir", "tri", "sqr"] },
    "18": { colors: ["yel", "grn", "pnk"], patterns: ["str", "dot", "box"], shapes: ["cir", "tri", "sqr"] },
    "19": { colors: ["yel", "blu", "pnk"], patterns: ["str", "dot", "box"], shapes: ["cir", "tri", "sqr"] },
    "20": { colors: ["yel", "grn", "pnk"], patterns: ["str", "dot", "box"], shapes: ["cir", "tri", "sqr"] },

    "default": { colors: [], patterns: [], shapes: [] }
};

// スコア辞書
const SCORE_BY = {
    file: {},
    color: { yel: 1, grn: 2, blu: 3, pnk: 4 },
    pattern: { str: 3, dot: 4, box: 5, hrb: 6 },
    shape: { cir: 2, tri: 3, sqr: 4, hex: 5 }
};
const BASE_SCORE = 0, DEFAULT_SCORE = 1;

// プール
function buildFilesFromInclude(inc) {
    const allowC = (inc?.colors?.length ? inc.colors : COLORS);
    const allowP = (inc?.patterns?.length ? inc.patterns : PATTERNS);
    const allowS = (inc?.shapes?.length ? inc.shapes : SHAPES);
    const files = [];
    for (const c of allowC) for (const p of allowP) for (const s of allowS) {
        files.push(`${c}_${p}_${s}.png`);
    }
    return files;
}

// 初期（まだ開始しない）
let CURRENT_INCLUDE = INCLUDE_BY_SUBJECT["default"];
let FILES = buildFilesFromInclude(CURRENT_INCLUDE);

/* ========== 状態 ========== */
const IMG_PATH_PREFIX = 'images/';
let score = 0;
let high = Number(localStorage.getItem('imggame_high') || 0);
let trial = 0;
let trialLimit = 20;
let lastKeys = new Set();

updateScore(0); updateTrialUI();

// 待機表示
function renderWaiting() {
    grid.innerHTML = '<div class="points" style="margin:8px auto">Player ID と Session ID を選択してください．</div>';
}

// 両方選択済みか
const bothReady = () => !!subjectId && !!sessionId;

// 開始処理（重複起動防止）
function startGameIfReady() {
    if (started || !bothReady()) return;
    started = true;

    CURRENT_INCLUDE = INCLUDE_BY_SUBJECT[subjectId] || INCLUDE_BY_SUBJECT["default"];
    FILES = buildFilesFromInclude(CURRENT_INCLUDE);

    score = 0; updateScore(0);
    trial = 0; updateTrialUI();

    if (FILES.length === 0) {
        grid.innerHTML = '<div class="points" style="margin:8px auto">このIDの条件では画像プールが空です</div>';
        lastKeys = new Set();
        return;
    }
    const first = pickUniqueBatch(Math.min(3, FILES.length));
    grid.innerHTML = '';
    first.forEach(k => grid.appendChild(createCard(k)));
    lastKeys = new Set(first);
    enqueueRecord(recordShow()); // 初回 show を送信
}

/* ========== 共通ユーティリティ ========== */
function isoNowJST() {
    const d = new Date();
    const tz = 9 * 60; // Asia/Tokyo
    const local = new Date(d.getTime() + (tz + d.getTimezoneOffset()) * 60000);
    return local.toISOString().replace('Z', '+09:00');
}
function updateScore(delta) {
    score += delta;
    if (score > high) { high = score; localStorage.setItem('imggame_high', String(high)); }
    scoreEl.innerHTML = `<span class="label">Score：</span>${score}`;
    highEl.innerHTML = `<span class="label">High：</span>${high}`;
}
function updateTrialUI() { trialEl.innerHTML = `<span class="label">Trial：</span>${trial}/${trialLimit}`; }

function getScoreForKey(key) {
    if (SCORE_BY.file && Object.prototype.hasOwnProperty.call(SCORE_BY.file, key)) return SCORE_BY.file[key];
    const [c, p, s] = key.replace('.png', '').split('_');
    let v = BASE_SCORE;
    if (SCORE_BY.color[c] != null) v += Number(SCORE_BY.color[c]);
    if (SCORE_BY.pattern[p] != null) v += Number(SCORE_BY.pattern[p]);
    if (SCORE_BY.shape[s] != null) v += Number(SCORE_BY.shape[s]);
    return v === BASE_SCORE ? DEFAULT_SCORE : v;
}
function getCardPosition(article) {
    const arr = Array.from(grid.children);
    const idx = arr.indexOf(article);
    if (idx === 0) return 'left';
    if (idx === 1) return 'center';
    return 'right';
}
function pickUniqueBatch(k, avoid = new Set()) {
    const shuffleInPlace = arr => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; } };
    const primary = FILES.filter(x => !avoid.has(x));
    const result = [];
    const p = primary.slice(); shuffleInPlace(p);
    while (result.length < k && p.length) result.push(p.pop());
    if (result.length < k) {
        const fallback = FILES.filter(x => !result.includes(x));
        shuffleInPlace(fallback);
        while (result.length < k && fallback.length) result.push(fallback.pop());
    }
    return result;
}

/* ========== ログ（イベントごと送信） ========== */
function triplet() {
    const [L, C, R] = Array.from(grid.children);
    const key = el => el?.dataset.key ?? "";
    const img = el => el ? Number(el.dataset.value || 0) : 0;
    return {
        L: { key: key(L), imgPts: img(L), posPts: POSITION_SCORE.left },
        C: { key: key(C), imgPts: img(C), posPts: POSITION_SCORE.center },
        R: { key: key(R), imgPts: img(R), posPts: POSITION_SCORE.right },
    };
}
function recordShow() {
    const t = triplet();
    return {
        time: isoNowJST(), player_id: subjectId ?? "", session_id: sessionId ?? "",
        trial, event: "show",
        l_img: t.L.key, c_img: t.C.key, r_img: t.R.key,
        l_img_pts: t.L.imgPts, c_img_pts: t.C.imgPts, r_img_pts: t.R.imgPts,
        l_pos_pts: t.L.posPts, c_pos_pts: t.C.posPts, r_pos_pts: t.R.posPts,
        l_sum_pts: t.L.imgPts + t.L.posPts,
        c_sum_pts: t.C.imgPts + t.C.posPts,
        r_sum_pts: t.R.imgPts + t.R.posPts,
        selected_img: "", selected_pos: "", selected_img_pts: "", selected_pos_pts: "",
        rand_pts: 0, delta_score: 0, total_score: score,
        rand_min: RAND.min, rand_max: RAND.max, rand_dist: RAND.dist,
    };
}
function recordSelect(selectedPos, randPts) {
    const t = triplet();
    const map = { left: t.L, center: t.C, right: t.R };
    const s = map[selectedPos];
    const delta = s.imgPts + s.posPts + randPts;
    return {
        time: isoNowJST(), player_id: subjectId ?? "", session_id: sessionId ?? "",
        trial, event: "select",
        l_img: t.L.key, c_img: t.C.key, r_img: t.R.key,
        l_img_pts: t.L.imgPts, c_img_pts: t.C.imgPts, r_img_pts: t.R.imgPts,
        l_pos_pts: t.L.posPts, c_pos_pts: t.C.posPts, r_pos_pts: t.R.posPts,
        l_sum_pts: t.L.imgPts + t.L.posPts,
        c_sum_pts: t.C.imgPts + t.C.posPts,
        r_sum_pts: t.R.imgPts + t.R.posPts,
        selected_img: s.key, selected_pos: selectedPos,
        selected_img_pts: s.imgPts, selected_pos_pts: s.posPts,
        rand_pts: randPts, delta_score: delta, total_score: score,
        rand_min: RAND.min, rand_max: RAND.max, rand_dist: RAND.dist,
    };
}
function recordRefresh() {
    const t = triplet();
    return {
        time: isoNowJST(), player_id: subjectId ?? "", session_id: sessionId ?? "",
        trial, event: "refresh",
        l_img: t.L.key, c_img: t.C.key, r_img: t.R.key,
        l_img_pts: t.L.imgPts, c_img_pts: t.C.imgPts, r_img_pts: t.R.imgPts,
        l_pos_pts: t.L.posPts, c_pos_pts: t.C.posPts, r_pos_pts: t.R.posPts,
        l_sum_pts: t.L.imgPts + t.L.posPts,
        c_sum_pts: t.C.imgPts + t.C.posPts,
        r_sum_pts: t.R.imgPts + t.R.posPts,
        selected_img: "", selected_pos: "", selected_img_pts: "", selected_pos_pts: "",
        rand_pts: 0, delta_score: REFRESH_SCORE, total_score: score,
        rand_min: RAND.min, rand_max: RAND.max, rand_dist: RAND.dist,
    };
}

/* ========== 送信キュー（URL エンコード；sendBeacon→fetch） ========== */
const QUEUE_KEY = "imggame_queue_v2";
let isFlushing = false;

function enqueueRecord(rec) {
    for (const k in rec) { if (rec[k] == null) rec[k] = ""; }
    const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    q.push(rec);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    flushQueue();
}

// URL エンコードでボディ化（application/x-www-form-urlencoded）
function buildBodyParams(rec) {
    const p = new URLSearchParams();
    for (const k of Object.keys(E)) {
        const entry = E[k];
        if (!entry) continue;
        p.append(entry, rec[k] ?? "");
    }
    return p;
}

function flushQueue() {
    if (isFlushing) return;
    isFlushing = true;

    const loop = () => {
        const raw = localStorage.getItem(QUEUE_KEY);
        if (!raw) { isFlushing = false; return; }
        const q = JSON.parse(raw);
        if (q.length === 0) { isFlushing = false; return; }

        const rec = q[0];
        const params = buildBodyParams(rec);
        const bodyString = params.toString();
        const beaconBody = new Blob([bodyString], { type: "application/x-www-form-urlencoded;charset=UTF-8" });

        let sent = false;
        try {
            sent = !!(navigator.sendBeacon && navigator.sendBeacon(FORM_URL, beaconBody));
        } catch (_) { sent = false; }

        if (sent) {
            q.shift(); localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
            setTimeout(loop, 0);
            return;
        }

        fetch(FORM_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
            body: bodyString,
            keepalive: true
        })
            .then(() => {
                q.shift(); localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
                setTimeout(loop, 0);
            })
            .catch(() => {
                // ネットワーク不可→次回 online で再送
                isFlushing = false;
            });
    };

    loop();
}
window.addEventListener('online', flushQueue);

/* ========== カード生成 ========== */
function createCard(key) {
    const tmpl = document.getElementById('cardTmpl');
    const frag = tmpl.content.cloneNode(true);
    const article = frag.querySelector('.card');
    hydrateCard(article, key);
    return article;
}
function hydrateCard(article, key) {
    const a = article.querySelector('.thumb');
    const img = article.querySelector('img');
    const clicker = article.querySelector('.clicker');
    const plus = article.querySelector('.points');
    const pop = article.querySelector('.pop');

    const url = IMG_PATH_PREFIX + key;
    a.href = url; img.src = url; img.alt = `画像: ${key}`;

    const base = getScoreForKey(key);
    article.dataset.key = key;
    article.dataset.value = base;
    plus.textContent = `+${base}`;
    pop.textContent = `+${base}`;
    plus.style.display = UI_SHOW.points ? '' : 'none';
    pop.style.display = UI_SHOW.popup ? '' : 'none';

    clicker.onclick = () => {
        if (trial >= trialLimit || !bothReady() || article.dataset.lock === '1') return; // 両方必須
        article.dataset.lock = '1';

        const pos = getCardPosition(article);
        const bonus = Number(POSITION_SCORE[pos] || 0);
        const baseVal = Number(article.dataset.value || 0);

        const { pts: randPts } = sampleRand();
        const final = baseVal + bonus + randPts;

        if (UI_SHOW.popup) pop.textContent = `+${final}`;

        updateScore(final);
        trial++; updateTrialUI();

        enqueueRecord(recordSelect(pos, randPts));

        article.classList.remove('popshow'); void article.offsetWidth;
        if (UI_SHOW.popup) article.classList.add('popshow');

        const after = () => {
            article.dataset.lock = '';
            if (UI_SHOW.popup) pop.textContent = `+${baseVal}`;
            if (trial >= trialLimit) {
                flushQueue();
                alert("ありがとうございました．結果を送信しました．");
                return;
            }
            refreshAllCards();
        };
        if (!UI_SHOW.popup) { after(); return; }
        pop.addEventListener('animationend', after, { once: true });
    };
}

/* ========== 提示更新 ========== */
function refreshAllCards() {
    const n = grid.children.length || 3;
    const newKeys = pickUniqueBatch(n, lastKeys);
    grid.innerHTML = '';
    newKeys.forEach(k => grid.appendChild(createCard(k)));
    lastKeys = new Set(newKeys);
    if (bothReady()) enqueueRecord(recordShow()); // 新しい show を送信
}

/* ========== 初期描画（開始しない） ========== */
renderWaiting();

/* ========== イベント ========== */
resetBtn?.addEventListener('click', () => { score = 0; updateScore(0); });

refreshBtn.addEventListener('click', () => {
    if (!bothReady() || trial >= trialLimit) return;
    if (REFRESH_SCORE) updateScore(REFRESH_SCORE);
    enqueueRecord(recordRefresh()); // refresh 行
    refreshAllCards();              // 続けて show 行
});

// player_id 選択
idSelect.addEventListener('change', () => {
    if (!idSelect.value) return;
    idSelect.disabled = true;            // 一度選ぶと固定
    subjectId = idSelect.value;
    startGameIfReady();
});

// session_id 選択
sessionSelect.addEventListener('change', () => {
    if (!sessionSelect.value) return;
    sessionSelect.disabled = true;       // 一度選ぶと固定
    sessionId = sessionSelect.value;
    startGameIfReady();
});
