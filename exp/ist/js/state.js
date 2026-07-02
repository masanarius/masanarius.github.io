let currentTrial = 0;
let totalScore = 0;
let refreshCountInTrial = 0;

const imageList = [];
let currentImages = [];

let historyData = [];

let isSelectCoolingDown = false;
let cooldownRemainingSec = 0;
let cooldownTimer = null;

let isRefreshCoolingDown = false;
let refreshCooldownRemainingSec = 0;
let refreshCooldownTimer = null;