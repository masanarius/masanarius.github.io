const COL = ["amb", "blu", "cob", "grn", "yel"];
const PAT = ["dot", "grd", "str"];
const SHP = ["cir", "pnt", "tri", "squ"];

const MAX_TRIAL = 30;
const SHOW_TOTAL_SCORE = true;
const REFRESH_SCORE = 0;

const PLAYER_MOD_BASE = 4;

const ENABLE_GOOGLE_FORMS = true;

const GOOGLE_FORM_ACTION_URL =
    "https://docs.google.com/forms/d/e/FORM_ID/formResponse";

const FORM_ENTRIES = {
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
    left: 0,
    center: 2,
    right: 0
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