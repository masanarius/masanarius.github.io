const COL = ["pnk", "blu", "grn", "yel"];
const PAT = [
    "fdt", "cdt",
    "fgr", "cgr",
    "fch", "cch",
    "fst", "cst"
];
const SHP = ["cir", "hex", "pnt", "tri", "squ"];

const MAX_TRIAL = 60;
const SHOW_TOTAL_SCORE = false;
const REFRESH_SCORE = 0;

const PLAYER_MOD_BASE = 4;

const ENABLE_GOOGLE_FORMS = true;

const GOOGLE_FORM_ACTION_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSe6judp3oDNOHDpBNW22eaB9JiwuvnuwCBJ8tvHWUiOdhFqmw/formResponse";

const FORM_ENTRIES = {
    time: "entry.1571500214",
    session_id: "entry.1437906042",
    player_id: "entry.1675133863",
    trial: "entry.1673476348",
    refreshing: "entry.1384988083",
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
    selected_img_shape: "entry.158281576",
    selected_img_color: "entry.901393716",
    selected_img_pattern: "entry.1281819507",
    selected_pos: "entry.1916842762",

    selected_img_pts: "entry.1382321511",
    selected_img_shape_pts: "entry.449527582",
    selected_img_color_pts: "entry.705426569",
    selected_img_pattern_pts: "entry.614853997",
    selected_pos_pts: "entry.1313096228",

    delta_score: "entry.333867801",
    total_score: "entry.453560264"
};

const colorScore = {
    pnk: -1,
    grn: 0,
    yel: 1,
    blu: 2
};

const shapeScore = {
    pnt: -1,
    cir: 0,
    hex: 0,
    squ: 1,
    tri: 2
};

const patternScore = {
    // dot: -1,
    // grd: 0,
    // chk: 1,
    // str: 2,
    cdt: -1, fdt: 1,
    cgr: 0, fgr: 2,
    cch: 1, fch: -1,
    wst: 2, nst: 0

};

const positionScore = {
    left: 0,
    center: 0,
    right: 0
};

const positionNames = ["left", "center", "right"];
const positionNamesForLog = ["LEFT", "CENTER", "RIGHT"];

const shapeScale = {
    cir: 1.00,
    tri: 1.15,
    squ: 0.95,
    pnt: 1.20,
    hex: 1.15
};

const hiddenRuleByPlayerMod = { // 表示されない
    0: { COL: [], PAT: ["cdt", "cgr", "cch", "cst"], SHP: ["hex"] }, // 粗い = 細かいが表示されない
    1: { COL: [], PAT: ["cdt", "cgr", "cch", "cst"], SHP: ["cir"] }, // 粗い = 細かいが表示されない
    2: { COL: [], PAT: ["fdt", "fgr", "fch", "fst"], SHP: ["hex"] }, // 細かい = 粗いが表示されない
    3: { COL: [], PAT: ["fdt", "fgr", "fch", "fst"], SHP: ["cir"] }  // 細かい = 粗いが表示されない
};

const hiddenFeedbackRuleByPlayerMod = { // 得点が「？」になる
    0: {
        COL: [],
        PAT: ["fdt"],
        SHP: []
    },

    1: {
        COL: [],
        PAT: ["fst"],
        SHP: []
    },

    2: {
        COL: [],
        PAT: ["cch"],
        SHP: []
    },

    3: {
        COL: [],
        PAT: ["cgr"],
        SHP: []
    }
};

const SELECT_COOLDOWN_SEC = 10.0;
const REFRESH_COOLDOWN_SEC = 5.0;
const ENABLE_REFRESH_DURING_SELECT_COOLDOWN = false;
