const COL = ["pnk", "blu", "grn", "yel"];
const PAT = ["sdt", "ldt", "fms", "cms", "nst", "wst", "fch", "cch"];
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
    selected_pos: "entry.1916842762",
    selected_img_pts: "entry.1382321511",
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
    ldt: -1, sdt: 2,
    cms: 0, fms: 0,
    cch: 1, fch: 1,
    wst: 2, nst: -1

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
    pnt: 1.25,
    hex: 1.15
};

const hiddenRuleByPlayerMod = { // 表示されない
    0: { COL: [], PAT: ["ldt", "cms", "cch", "wst"], SHP: ["hex"] },
    1: { COL: [], PAT: ["ldt", "cms", "cch", "wst"], SHP: ["cir"] },
    2: { COL: [], PAT: ["sdt", "fms", "fch", "nst"], SHP: ["hex"] },
    3: { COL: [], PAT: ["sdt", "fms", "fch", "nst"], SHP: ["cir"] }
};

const hiddenFeedbackRuleByPlayerMod = { // 得点が「？」になる
    0: {
        COL: [],
        PAT: ["sdt"],
        SHP: []
    },

    1: {
        COL: [],
        PAT: ["nst"],
        SHP: []
    },

    2: {
        COL: [],
        PAT: ["ldt"],
        SHP: []
    },

    3: {
        COL: [],
        PAT: ["wst"],
        SHP: []
    }
};

const SELECT_COOLDOWN_SEC = 10.0;
const REFRESH_COOLDOWN_SEC = 5.0;
const ENABLE_REFRESH_DURING_SELECT_COOLDOWN = false;
