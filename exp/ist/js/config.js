const COL = ["amb", "blu", "cob", "grn", "yel"];
const PAT = ["dot", "grd", "str"];
const SHP = ["cir", "pnt", "tri", "squ"];

const MAX_TRIAL = 30;
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
    grn: -1,
    blu: 0,
    yel: 1,
    cob: 1,
    amb: 0
};

const shapeScore = {
    tri: -1,
    cir: 0,
    squ: 1,
    pnt: 0
};

const patternScore = {
    str: 1,
    dot: -1,
    grd: 0
};

const positionScore = {
    left: -1,
    center: 0,
    right: 1
};

const positionNames = ["left", "center", "right"];
const positionNamesForLog = ["LEFT", "CENTER", "RIGHT"];

const shapeScale = {
    cir: 1.00,
    tri: 1.15,
    squ: 0.95,
    pnt: 1.30
};

const hiddenRuleByPlayerMod = {
    0: {
        COL: ["cob", "amb"],
        SHP: ["cir"],
        PAT: []
    },

    1: {
        COL: ["cob", "amb"],
        SHP: ["pnt"],
        PAT: []
    },

    2: {
        COL: ["yel", "blu"],
        SHP: ["cir"],
        PAT: []
    },

    3: {
        COL: ["yel", "blu"],
        SHP: ["pnt"],
        PAT: []
    }
};

const hiddenFeedbackRuleByPlayerMod = {
    0: {
        COL: [],
        PAT: ["str"],
        SHP: []
    },

    1: {
        COL: [],
        PAT: ["dot"],
        SHP: []
    },

    2: {
        COL: [],
        PAT: [],
        SHP: ["tri"]
    },

    3: {
        COL: [],
        PAT: [],
        SHP: ["squ"]
    }
};

const SELECT_COOLDOWN_SEC = 3.0;
const REFRESH_COOLDOWN_SEC = 5.0;
