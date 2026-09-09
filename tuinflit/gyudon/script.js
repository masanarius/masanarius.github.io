const MIN_GRAMS = 50;
const MAX_GRAMS = 110;
let total = 100;
let yAxisMax = 100;
let targetMeanA = 80.5;
let targetMeanB = 79.5;
let activeA = true;
let activeB = true;
const binsA = Array(MAX_GRAMS - MIN_GRAMS + 1).fill(0);
const binsB = Array(MAX_GRAMS - MIN_GRAMS + 1).fill(0);
const valuesA = [];
const valuesB = [];
let allValuesA = [];
let allValuesB = [];

const $ = (id) => document.getElementById(id);
const histogram = $('histogram');
const densityCanvas = $('densityCanvas');
const fragments = document.createDocumentFragment();
const barsA = [];
const barsB = [];
let count = 0;
let running = false;
let frameId = null;
let seed = 20260908;
let lastFrameTime = null;
let sampleBudget = 0;

for (let gram = MIN_GRAMS; gram <= MAX_GRAMS; gram += 1) {
  const bin = document.createElement('div');
  bin.className = 'bin';
  bin.title = `${gram}g`;
  const a = document.createElement('span');
  const b = document.createElement('span');
  a.className = 'bar a'; b.className = 'bar b';
  bin.append(a, b); fragments.append(bin);
  barsA.push(a); barsB.push(b);
}
histogram.append(fragments);

function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}

function normal(mean, deviation) {
  const u = Math.max(random(), 1e-9);
  const v = random();
  return Math.round(mean + deviation * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v));
}

function sample(mean, deviation) {
  return Math.min(MAX_GRAMS, Math.max(MIN_GRAMS, normal(mean, deviation)));
}

function generateExperiment() {
  seed = 20260908;
  allValuesA = []; allValuesB = [];
  for (let i = 0; i < total; i += 1) {
    allValuesA.push(sample(targetMeanA, 5.0));
    allValuesB.push(sample(targetMeanB, 4.8));
  }
  const expectedMode = total / (Math.min(5.0, 4.8) * Math.sqrt(2 * Math.PI));
  yAxisMax = niceCeiling(expectedMode + 2 * Math.sqrt(expectedMode));
  updateAxisLabels();
}

function niceCeiling(value) {
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = magnitude / 5;
  return Math.ceil(value / step) * step;
}

function updateAxisLabels() {
  document.querySelectorAll('.y-scale').forEach((scale) => {
    [...scale.children].forEach((label, index) => {
      const value = yAxisMax * (4 - index) / 4;
      label.textContent = value.toLocaleString('ja-JP', { maximumFractionDigits: 1 });
    });
  });
}

function stats(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return { mean, median, sd: Math.sqrt(variance) };
}

function smoothBins(bins) {
  const kernel = [1, 4, 7, 10, 13, 10, 7, 4, 1];
  const radius = Math.floor(kernel.length / 2);
  return bins.map((_, index) => {
    let weighted = 0; let weight = 0;
    kernel.forEach((factor, offset) => {
      const source = index + offset - radius;
      if (source >= 0 && source < bins.length) { weighted += bins[source] * factor; weight += factor; }
    });
    return weighted / weight;
  });
}

function drawDensity() {
  const rect = densityCanvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const ratio = window.devicePixelRatio || 1;
  densityCanvas.width = Math.round(rect.width * ratio);
  densityCanvas.height = Math.round(rect.height * ratio);
  const ctx = densityCanvas.getContext('2d');
  ctx.scale(ratio, ratio);
  const series = [smoothBins(binsA), smoothBins(binsB)];
  const colors = ['#e83b2e', '#1675d1'];
  series.forEach((points, seriesIndex) => {
    const coords = points.map((value, index) => ({
      x: index / (points.length - 1) * rect.width,
      y: rect.height - 2 - Math.min(value, yAxisMax) / yAxisMax * (rect.height - 4)
    }));
    ctx.beginPath();
    coords.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else {
        const previous = coords[index - 1];
        ctx.quadraticCurveTo(previous.x, previous.y, (previous.x + point.x) / 2, (previous.y + point.y) / 2);
      }
    });
    const last = coords[coords.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.strokeStyle = colors[seriesIndex]; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.lineTo(rect.width, rect.height); ctx.lineTo(0, rect.height); ctx.closePath();
    ctx.globalAlpha = 0.1; ctx.fillStyle = colors[seriesIndex]; ctx.fill(); ctx.globalAlpha = 1;
  });
}

function render() {
  binsA.forEach((value, index) => {
    barsA[index].style.height = `${Math.min(value, yAxisMax) / yAxisMax * 100}%`;
    barsB[index].style.height = `${Math.min(binsB[index], yAxisMax) / yAxisMax * 100}%`;
  });
  $('sampleCount').textContent = count.toLocaleString('ja-JP');
  $('progressBar').style.width = `${count / total * 100}%`;
  $('seekBar').value = count;
  renderStoreStats('A', stats(valuesA), targetMeanA);
  renderStoreStats('B', stats(valuesB), targetMeanB);
  drawDensity();
}

function renderStoreStats(store, result, targetMean) {
  if (!result) return;
  $(`mean${store}`).firstChild.textContent = result.mean.toFixed(1);
  $(`median${store}`).firstChild.textContent = result.median.toFixed(1);
  $(`sd${store}`).textContent = result.sd.toFixed(1);
  const error = result.mean - targetMean;
  $(`error${store}`).firstChild.textContent = `${error >= 0 ? '+' : ''}${error.toFixed(2)}`;
}

function measureOne() {
  const a = allValuesA[count];
  const b = allValuesB[count];
  if (activeA) { valuesA.push(a); binsA[a - MIN_GRAMS] += 1; }
  if (activeB) { valuesB.push(b); binsB[b - MIN_GRAMS] += 1; }
  count += 1;
  $('weightA').textContent = activeA ? a : 'OFF'; $('weightB').textContent = activeB ? b : 'OFF';
}

function seekTo(target) {
  running = false; cancelAnimationFrame(frameId);
  lastFrameTime = null; sampleBudget = 0;
  count = Math.max(0, Math.min(total, Number(target)));
  binsA.fill(0); binsB.fill(0); valuesA.length = 0; valuesB.length = 0;
  for (let i = 0; i < count; i += 1) {
    const a = allValuesA[i]; const b = allValuesB[i];
    if (activeA) { valuesA.push(a); binsA[a - MIN_GRAMS] += 1; }
    if (activeB) { valuesB.push(b); binsB[b - MIN_GRAMS] += 1; }
  }
  $('weightA').textContent = activeA ? (count ? allValuesA[count - 1] : '—') : 'OFF';
  $('weightB').textContent = activeB ? (count ? allValuesB[count - 1] : '—') : 'OFF';
  $('emptyState').style.display = count ? 'none' : '';
  $('densityEmpty').style.display = count ? 'none' : '';
  $('startButton').querySelector('.play-icon').textContent = count >= total ? '✓' : '▶';
  $('startButton').querySelector('.button-label').textContent = count >= total ? '計測完了' : (count ? 'ここから再開' : '計測スタート');
  if (!count) {
    ['meanA','medianA','meanB','medianB','errorA','errorB'].forEach((id) => { $(id).firstChild.textContent = '—'; });
    ['sdA','sdB'].forEach((id) => { $(id).textContent = '—'; });
  }
  render();
}

function tick(timestamp) {
  if (!running) return;
  if (lastFrameTime === null) lastFrameTime = timestamp;
  const elapsed = Math.min(timestamp - lastFrameTime, 250);
  lastFrameTime = timestamp;
  sampleBudget += elapsed * Number($('speedSelect').value) / 1000;
  const batch = Math.floor(sampleBudget);
  if (batch > 0) {
    sampleBudget -= batch;
    for (let i = 0; i < batch && count < total; i += 1) measureOne();
    render();
  }
  if (count >= total) {
    running = false;
    $('startButton').querySelector('.play-icon').textContent = '✓';
    $('startButton').querySelector('.button-label').textContent = '計測完了';
    return;
  }
  frameId = requestAnimationFrame(tick);
}

function toggle() {
  if (count >= total) return;
  running = !running;
  lastFrameTime = null; sampleBudget = 0;
  $('emptyState').style.display = 'none';
  $('densityEmpty').style.display = 'none';
  $('startButton').querySelector('.play-icon').textContent = running ? 'Ⅱ' : '▶';
  $('startButton').querySelector('.button-label').textContent = running ? '一時停止' : '計測を再開';
  if (running) frameId = requestAnimationFrame(tick); else cancelAnimationFrame(frameId);
}

function reset() {
  running = false; cancelAnimationFrame(frameId); count = 0; generateExperiment();
  lastFrameTime = null; sampleBudget = 0;
  binsA.fill(0); binsB.fill(0); valuesA.length = 0; valuesB.length = 0;
  barsA.forEach((bar, index) => { bar.style.height = '0%'; barsB[index].style.height = '0%'; });
  $('weightA').textContent = activeA ? '—' : 'OFF';
  $('weightB').textContent = activeB ? '—' : 'OFF';
  ['meanA','medianA','meanB','medianB','errorA','errorB'].forEach((id) => { $(id).firstChild.textContent = '—'; });
  ['sdA','sdB'].forEach((id) => { $(id).textContent = '—'; });
  $('sampleCount').textContent = '0'; $('progressBar').style.width = '0%'; $('emptyState').style.display = '';
  $('densityEmpty').style.display = ''; drawDensity();
  $('startButton').querySelector('.play-icon').textContent = '▶'; $('startButton').querySelector('.button-label').textContent = '計測スタート';
}

$('startButton').addEventListener('click', toggle);
$('resetButton').addEventListener('click', reset);
$('seekBar').addEventListener('input', (event) => seekTo(event.target.value));
$('orderSlider').addEventListener('input', (event) => {
  total = Number(event.target.value);
  const formatted = total.toLocaleString('ja-JP');
  $('orderOutput').textContent = `${formatted}杯`;
  $('introOrderCount').textContent = formatted;
  $('progressTotal').textContent = formatted;
  $('seekMax').textContent = formatted;
  $('seekBar').max = total;
  const activeCount = Number(activeA) + Number(activeB);
  $('totalBowls').textContent = `${(total * activeCount).toLocaleString('ja-JP')}杯`;
  document.title = `牛丼${(total * activeCount).toLocaleString('ja-JP')}杯で差は見える？ | GYŪDON GRAM LAB`;
  reset();
});
function updateTargetMean(store, value) {
  const mean = Number(value);
  if (store === 'A') targetMeanA = mean; else targetMeanB = mean;
  $(`meanOutput${store}`).textContent = `${mean.toFixed(1)}g`;
  reset();
}
$('meanSliderA').addEventListener('input', (event) => updateTargetMean('A', event.target.value));
$('meanSliderB').addEventListener('input', (event) => updateTargetMean('B', event.target.value));
function updateRunTargets(changedStore) {
  if (!$('runA').checked && !$('runB').checked) $(changedStore === 'A' ? 'runB' : 'runA').checked = true;
  activeA = $('runA').checked; activeB = $('runB').checked;
  $('storeCardA').classList.toggle('inactive', !activeA);
  $('storeCardB').classList.toggle('inactive', !activeB);
  document.querySelector('.stat-card.red').classList.toggle('inactive', !activeA);
  document.querySelector('.stat-card.blue').classList.toggle('inactive', !activeB);
  const activeCount = Number(activeA) + Number(activeB);
  $('activeStoreCount').textContent = activeCount;
  $('totalBowls').textContent = `${(total * activeCount).toLocaleString('ja-JP')}杯`;
  document.title = `牛丼${(total * activeCount).toLocaleString('ja-JP')}杯で差は見える？ | GYŪDON GRAM LAB`;
  reset();
}
$('runA').addEventListener('change', () => updateRunTargets('A'));
$('runB').addEventListener('change', () => updateRunTargets('B'));
window.addEventListener('resize', drawDensity);
generateExperiment();
drawDensity();
