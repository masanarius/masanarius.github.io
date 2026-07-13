const COL = [
    "ppn", "pyl", "pgn", "pbl",
    "vpn", "vyl", "vgn", "vbl"
];

const PAT = [
    "str", "chk", "dot", "wav"
];
const SHP = [
    "cir", "pnt", "tri", "squ",
    "spd", "hrt", "clv", "dia"
];

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
    ppn: -1, pyl: 0, pgn: 1, pbl: 2,
    vpn: 1, vyl: 2, vgn: -1, vbl: 0
};

const shapeScore = {
    pnt: -1,
    cir: 0,
    squ: 1,
    tri: 2
};

const patternScore = {
    dot: -1,
    wav: 0,
    chk: 1,
    str: 2,
    // cdt: -1, fdt: 1,
    // cgr: 0, fgr: 2,
    // cch: 1, fch: -1,
    // cst: 2, fst: 0

};

const positionScore = {
    left: 0,
    center: 0,
    right: 0
};

const positionNames = ["left", "center", "right"];
const positionNamesForLog = ["LEFT", "CENTER", "RIGHT"];

const shapeScale = {
    // cir: 1.00,
    // tri: 1.15,
    // squ: 0.95,
    // pnt: 1.20,
    // hex: 1.15
    // cir: 1.00,
    // tri: 1.00,
    // squ: 1.00,
    // pnt: 1.00,
    // hex: 1.00
};

const visibleRuleByPlayerMod = {
    0: {
        COL: ["ppn", "pyl", "pgn", "pbl"],
        PAT: PAT,
        SHP: ["cir", "pnt", "tri", "squ"]
    },

    1: {
        COL: ["ppn", "pyl", "pgn", "pbl"],
        PAT: PAT,
        SHP: ["spd", "hrt", "clv", "dia"]
    },

    2: {
        COL: ["vpn", "vyl", "vgn", "vbl"],
        PAT: PAT,
        SHP: ["cir", "pnt", "tri", "squ"]
    },

    3: {
        COL: ["vpn", "vyl", "vgn", "vbl"],
        PAT: PAT,
        SHP: ["spd", "hrt", "clv", "dia"]
    }
};

const hiddenFeedbackRuleByPlayerMod = { // 得点が「？」になる
    0: {
        COL: ["pbl"],
        PAT: [],
        SHP: []
    },

    1: {
        COL: ["ppn"],
        PAT: [],
        SHP: []
    },

    2: {
        COL: ["vyl"],
        PAT: [],
        SHP: []
    },

    3: {
        COL: ["vgn"],
        PAT: [],
        SHP: []
    }
};

const SELECT_COOLDOWN_SEC = 0.5;
const REFRESH_COOLDOWN_SEC = 0.5;
const ENABLE_REFRESH_DURING_SELECT_COOLDOWN = false;
