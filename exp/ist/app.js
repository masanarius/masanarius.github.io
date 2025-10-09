"use strict";

/* =========================================================
   バージョン管理
========================================================= */
const APP_VERSION = "44";  // ★バージョン更新（表示確認用）


/* =========================================================
   スコア設定（最優先で初期化：未定義エラー防止のため最上段）
========================================================= */
const BASE_SCORE = 0;
const DEFAULT_SCORE = 1;
const SCORE_BY = {
    file: {},
    // アルファベット順（後ろほど高得点）／ブラックリストは 0
    color: {
        grn: 1,
        ind: 2,
        lmn: 3,
        lps: 4,
        org: 0,  // blacklist
        pnk: 5,
        trq: 0,  // blacklist
        yel: 6
    },
    pattern: {
        bsl: 1,
        chk: 2,
        dch: 0,  // blacklist
        dgr: 0,  // blacklist
        dot: 3,
        grd: 4,  // (旧 box)
        sla: 5,
        str: 0   // blacklist
    },
    shape: {
        cir: 1,
        hex: 0,  // blacklist
        oct: 0,  // blacklist
        pbd: 2,
        plt: 3,
        pnt: 0,  // blacklist（五角形）
        squ: 4,
        tri: 5
    }
};


/* ========== スコア設定 ========== */
const POSITION_SCORE = { left: 6, center: 4, right: 2 };
const REFRESH_SCORE = 0;

// マスター（image_generator.py に合わせる）
const COLORS = ['org', 'yel', 'lmn', 'ind', 'trq', 'lps', 'grn', 'pnk'];
const PATTERNS = ['dot', 'str', 'grd', 'sla', 'bsl', 'chk', 'dch', 'dgr'];
const SHAPES = ['squ', 'cir', 'tri', 'pbd', 'plt', 'pnt', 'hex', 'oct'];


/* ========== ブラックリスト（参加者別） ========== */
/* ========== ブラックリスト（参加者別：順序を shapes → patterns → colors に変更） ========== */
const EXCLUDE_BY_SUBJECT = {
    "1": { shapes: ['tri', 'plt'], patterns: ['grd', 'sla'], colors: ['lmn', 'lps', 'pnk'] },
    "2": { shapes: ['tri', 'plt'], patterns: ['grd', 'sla'], colors: ['yel', 'ind', 'grn'] },
    "3": { shapes: ['tri', 'plt'], patterns: ['bsl', 'chk'], colors: ['lmn', 'lps', 'pnk'] },
    "4": { shapes: ['tri', 'plt'], patterns: ['bsl', 'chk'], colors: ['yel', 'ind', 'grn'] },

    "5": { shapes: ['squ', 'pbd'], patterns: ['grd', 'sla'], colors: ['lmn', 'lps', 'pnk'] },
    "6": { shapes: ['squ', 'pbd'], patterns: ['grd', 'sla'], colors: ['yel', 'ind', 'grn'] },
    "7": { shapes: ['squ', 'pbd'], patterns: ['bsl', 'chk'], colors: ['lmn', 'lps', 'pnk'] },
    "8": { shapes: ['squ', 'pbd'], patterns: ['bsl', 'chk'], colors: ['yel', 'ind', 'grn'] },

    "9": { shapes: ['tri', 'plt'], patterns: ['grd', 'sla'], colors: ['lmn', 'lps', 'pnk'] },
    "10": { shapes: ['tri', 'plt'], patterns: ['grd', 'sla'], colors: ['yel', 'ind', 'grn'] },
    "11": { shapes: ['tri', 'plt'], patterns: ['bsl', 'chk'], colors: ['lmn', 'lps', 'pnk'] },
    "12": { shapes: ['tri', 'plt'], patterns: ['bsl', 'chk'], colors: ['yel', 'ind', 'grn'] },

    "13": { shapes: ['squ', 'pbd'], patterns: ['grd', 'sla'], colors: ['lmn', 'lps', 'pnk'] },
    "14": { shapes: ['squ', 'pbd'], patterns: ['grd', 'sla'], colors: ['yel', 'ind', 'grn'] },
    "15": { shapes: ['squ', 'pbd'], patterns: ['bsl', 'chk'], colors: ['lmn', 'lps', 'pnk'] },
    "16": { shapes: ['squ', 'pbd'], patterns: ['bsl', 'chk'], colors: ['yel', 'ind', 'grn'] },

    "17": { shapes: ['tri', 'plt'], patterns: ['grd', 'sla'], colors: ['lmn', 'lps', 'pnk'] },
    "18": { shapes: ['tri', 'plt'], patterns: ['grd', 'sla'], colors: ['yel', 'ind', 'grn'] },
    "19": { shapes: ['tri', 'plt'], patterns: ['bsl', 'chk'], colors: ['lmn', 'lps', 'pnk'] },
    "20": { shapes: ['tri', 'plt'], patterns: ['bsl', 'chk'], colors: ['yel', 'ind', 'grn'] },

    "default": { shapes: [], patterns: [], colors: [] },
};


/* ========== グローバル ブラックリスト（全参加者共通） ========== */
const EXCLUDE_GLOBAL = {
    colors: ['org', 'trq'],          // オレンジ，ターコイズ
    patterns: ['str', 'dch', 'dgr'], // ストライプ，DCH，DGR
    shapes: ['pnt', 'hex', 'oct']    // 五角形，六角形，八角形
};


/* グローバル×参加者別の除外をマージ（和集合） */
function mergeExclude(globalExc, subjectExc) {
    const g = globalExc || {};
    const s = subjectExc || {};
    const uniq = (arr) => Array.from(new Set((arr || []).filter(Boolean)));
    return {
        colors: uniq([...(g.colors || []), ...(s.colors || [])]),
        patterns: uniq([...(g.patterns || []), ...(s.patterns || [])]),
        shapes: uniq([...(g.shapes || []), ...(s.shapes || [])]),
    };
}

// バージョン表記を反映
const versionEl = document.getElementById("versionText");
if (versionEl) {
    versionEl.textContent = `ver.${APP_VERSION}`;
}


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
// Session ドロップダウン
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

    delta_score: "entry.333867801",
    total_score: "entry.453560264",
};

/* ========== ID / プール ========== */
const idSelect = document.getElementById('idSelect');
for (let i = 1; i <= 20; i++) { const o = document.createElement('option'); o.value = i; o.textContent = i; idSelect.appendChild(o); }
for (let i = 1; i <= 20; i++) { const o = document.createElement('option'); o.value = i; o.textContent = i; sessionSelect.appendChild(o); }

let subjectId = null;
let sessionId = null;
let started = false;

/* ブラックリストを適用してプールを生成 */
function buildFilesFromExclude(exc) {
    const denyC = new Set(exc?.colors ?? []);
    const denyP = new Set(exc?.patterns ?? []);
    const denyS = new Set(exc?.shapes ?? []);

    const files = [];
    for (const c of COLORS) {
        if (denyC.has(c)) continue;
        for (const p of PATTERNS) {
            if (denyP.has(p)) continue;
            for (const s of SHAPES) {
                if (denyS.has(s)) continue;
                files.push(`${c}_${p}_${s}.png`);
            }
        }
    }
    return files;
}

// 初期（待機）
let CURRENT_RULES = mergeExclude(EXCLUDE_GLOBAL, EXCLUDE_BY_SUBJECT["default"]);
let FILES = buildFilesFromExclude(CURRENT_RULES);

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

const bothReady = () => !!subjectId && !!sessionId;

// 開始処理（★ show ログは送らない）
function startGameIfReady() {
    if (started || !bothReady()) return;
    started = true;

    CURRENT_RULES = mergeExclude(
        EXCLUDE_GLOBAL,
        EXCLUDE_BY_SUBJECT[subjectId] || EXCLUDE_BY_SUBJECT["default"]
    );
    FILES = buildFilesFromExclude(CURRENT_RULES);

    score = 0; updateScore(0);
    trial = 0; updateTrialUI();

    if (FILES.length === 0) {
        grid.innerHTML = '<div class="points" style="margin:8px auto">このIDの条件では画像プールが空です．</div>';
        lastKeys = new Set();
        return;
    }
    const first = pickUniqueBatch(Math.min(3, FILES.length));
    grid.innerHTML = '';
    first.forEach(k => grid.appendChild(createCard(k)));
    lastKeys = new Set(first);
    // enqueueRecord(recordShow()); // ← 送らない
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

// 安全ガード付き：SCORE_BY が改変・未定義でも落ちない
function getScoreForKey(key) {
    const SB = (typeof SCORE_BY === 'object' && SCORE_BY) ? SCORE_BY
        : { file: {}, color: {}, pattern: {}, shape: {} };
    if (SB.file && Object.prototype.hasOwnProperty.call(SB.file, key)) return SB.file[key];
    const [c, p, s] = key.replace('.png', '').split('_');
    let v = BASE_SCORE;
    if (SB.color[c] != null) v += Number(SB.color[c]);
    if (SB.pattern[p] != null) v += Number(SB.pattern[p]);
    if (SB.shape[s] != null) v += Number(SB.shape[s]);
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

/* ========== ログ ========== */
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

// 非selectイベント用：selected_* にイベント名を刻む（show は今は送らないが保持）
function stampSelected(ev) {
    return {
        selected_img: ev,
        selected_pos: ev,
        selected_img_pts: ev,
        selected_pos_pts: ev,
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
        ...stampSelected("show"),
        delta_score: 0, total_score: score,
    };
}

function recordSelect(selectedPos) {
    const t = triplet();
    const map = { left: t.L, center: t.C, right: t.R };
    const s = map[selectedPos];
    const delta = s.imgPts + s.posPts;
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
        delta_score: delta, total_score: score,
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
        ...stampSelected("refresh"),
        delta_score: REFRESH_SCORE, total_score: score,
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
        if (trial >= trialLimit || !bothReady() || article.dataset.lock === '1') return;
        article.dataset.lock = '1';

        const pos = getCardPosition(article);
        const bonus = Number(POSITION_SCORE[pos] || 0);
        const baseVal = Number(article.dataset.value || 0);

        const final = baseVal + bonus;

        if (UI_SHOW.popup) pop.textContent = `+${final}`;

        updateScore(final);
        trial++; updateTrialUI();

        enqueueRecord(recordSelect(pos));

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

/* ========== 提示更新（★ show ログは送らない） ========== */
function refreshAllCards() {
    const n = grid.children.length || 3;
    const newKeys = pickUniqueBatch(n, lastKeys);
    grid.innerHTML = '';
    newKeys.forEach(k => grid.appendChild(createCard(k)));
    lastKeys = new Set(newKeys);
    // enqueueRecord(recordShow()); // ← 送らない
}

/* ========== 初期描画（開始しない） ========== */
renderWaiting();

/* ========== イベント ========== */
resetBtn?.addEventListener('click', () => { score = 0; updateScore(0); });

refreshBtn.addEventListener('click', () => {
    if (!bothReady() || trial >= trialLimit) return;
    if (REFRESH_SCORE) updateScore(REFRESH_SCORE);
    enqueueRecord(recordRefresh()); // refresh を送信
    refreshAllCards();              // show は送らない
});

// player_id 選択
idSelect.addEventListener('change', () => {
    if (!idSelect.value) return;
    idSelect.disabled = true;
    subjectId = idSelect.value;
    startGameIfReady();
});

// session_id 選択
sessionSelect.addEventListener('change', () => {
    if (!sessionSelect.value) return;
    sessionSelect.disabled = true;
    sessionId = sessionSelect.value;
    startGameIfReady();
});
