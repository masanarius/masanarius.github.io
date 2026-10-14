const $ = id => document.getElementById(id);
const visibleGroups = [true,true,true];
const groups = [
  {name:'A', color:'#e83b2e', mean:-2, sd:.2},
  {name:'B', color:'#1675d1', mean:-2, sd:5.2},
  {name:'C', color:'#23856b', mean:0, sd:.2}
];
let total=50, count=0, running=false, frame=null, previous=null, budget=0;
let axisMin,axisMax,binWidth,binCount,yMax;
$('groups').innerHTML=groups.map((g,i)=>`<article id="groupCard${i}" class="store-card" style="--group-color:${g.color}"><div class="store-info"><h2>グループ ${g.name}</h2></div><div class="live-weight"><span id="weightLabel${i}">—人目の体重変化</span><strong id="weight${i}">—</strong><small>kg</small></div></article>`).join('');
$('stats').innerHTML=groups.map((g,i)=>`<article id="statCard${i}" class="stat-card" style="border-color:${g.color}"><h3 id="statTitle${i}">グループ ${g.name}${i<2?' ／ Cとの比較':''}</h3><dl>${[['mean','平均'],['sd','標準偏差'],['se','標準誤差'],...(i<2?[['difference','平均差（'+g.name+' − C）'],['p','p値（Cとの比較）']]:[])].map(([key,label])=>`<div><dt id="${key}Label${i}">${label}</dt><dd id="${key}${i}">—</dd></div>`).join('')}</dl>${i<2?`<p id="decision${i}" class="decision"></p><p id="t${i}" class="test-detail"></p>`:''}</article>`).join('');
$('groupSettings').innerHTML=groups.map((g,i)=>`<fieldset class="group-setting"><legend style="color:${g.color}">グループ ${g.name}</legend><label>平均変化量（kg）<input id="settingMean${i}" type="number" min="-100" max="100" step="any" required></label><label>標準偏差（kg）<input id="settingSd${i}" type="number" min="0.01" max="100" step="any" required></label></fieldset>`).join('');
function randomGenerator(seed){return ()=>{seed=(seed*1664525+1013904223)>>>0;return (seed+.5)/4294967296;};}
function niceStep(value){const power=10**Math.floor(Math.log10(value));const normalized=value/power;return (normalized<=1?1:normalized<=2?2:normalized<=5?5:10)*power;}
function generate(){let low=0,high=0;groups.forEach((g,k)=>{const random=randomGenerator(20261014+k*104729);g.values=new Float64Array(total);g.means=new Float64Array(total+1);g.m2=new Float64Array(total+1);for(let i=0;i<total;i++){const value=g.mean+g.sd*Math.sqrt(-2*Math.log(random()))*Math.cos(2*Math.PI*random());g.values[i]=value;const delta=value-g.means[i];g.means[i+1]=g.means[i]+delta/(i+1);g.m2[i+1]=g.m2[i]+delta*(value-g.means[i+1]);low=Math.min(low,value);high=Math.max(high,value);}});binWidth=niceStep(Math.max((high-low)/60,.01));axisMin=Math.floor(low/binWidth)*binWidth-binWidth;axisMax=Math.ceil(high/binWidth)*binWidth+binWidth;binCount=Math.round((axisMax-axisMin)/binWidth);groups.forEach(g=>{g.bins=new Uint32Array(binCount);g.indices=Uint16Array.from(g.values,v=>Math.min(binCount-1,Math.floor((v-axisMin)/binWidth)));});const peak=Math.max(...groups.map(g=>{const fullBins=new Uint32Array(binCount);g.indices.forEach(i=>fullBins[i]++);return Math.max(...fullBins);}));const yStep=Math.max(1,niceStep(peak*1.1/4));yMax=yStep*4;$('progressTotal').textContent=total.toLocaleString('ja-JP');$('seekMax').textContent=total.toLocaleString('ja-JP');$('seekBar').max=total;$('binNote').textContent=`横軸：体重変化（kg）／縦軸：人数。階級幅 ${binWidth.toLocaleString('ja-JP',{maximumFractionDigits:3})} kg。破線は0kg。`;}
function statistics(g){if(!count)return null;const mean=g.means[count];if(count<2)return {mean,n:count};const sd=Math.sqrt(Math.max(0,g.m2[count])/(count-1)),se=sd/Math.sqrt(count);return {mean,sd,se,n:count};}
function compareWithControl(sample,control){
  if(!sample||!control)return null;
  const difference=sample.mean-control.mean;
  if(sample.n<2||control.n<2)return {difference};
  const a=sample.sd**2/sample.n,b=control.sd**2/control.n;
  const variance=a+b;
  if(variance===0)return {difference,t:null,df:null,p:null};
  const t=difference/Math.sqrt(variance);
  const df=variance**2/(a**2/(sample.n-1)+b**2/(control.n-1));
  const tail=.5*beta(df/(df+t*t),df/2,.5);
  return {difference,t,df,p:Math.max(0,Math.min(1,t<0?tail:1-tail))};
}
function compareWithZero(sample){
  if(!sample)return null;
  const difference=sample.mean;
  if(sample.n<2)return {difference};
  if(sample.se===0)return {difference,t:null,df:null,p:null};
  const t=sample.mean/sample.se,df=sample.n-1;
  const tail=.5*beta(df/(df+t*t),df/2,.5);
  return {difference,t,df,p:Math.max(0,Math.min(1,t<0?tail:1-tail))};
}
function smooth(bins){const kernel=[1,6,15,20,15,6,1];return Array.from(bins,(_,i)=>kernel.reduce((sum,k,j)=>sum+k*(bins[i+j-3]||0),0)/64);}
function prepare(canvas){const rect=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);ctx.font='11px sans-serif';return {ctx,w:rect.width,h:rect.height};}
function draw(canvas,line=false){const {ctx,w,h}=prepare(canvas),left=56,right=w-18,top=24,bottom=h-44,x=v=>left+(v-axisMin)/(axisMax-axisMin)*(right-left),y=v=>bottom-v/yMax*(bottom-top);ctx.fillStyle='#58616c';ctx.strokeStyle='#e8ebef';ctx.textAlign='right';for(let i=0;i<=4;i++){const value=yMax*i/4;ctx.fillText(value.toLocaleString('ja-JP',{maximumFractionDigits:1}),left-8,(bottom-value/yMax*(bottom-top))+4);ctx.beginPath();ctx.moveTo(left,bottom-value/yMax*(bottom-top));ctx.lineTo(right,bottom-value/yMax*(bottom-top));ctx.stroke();}ctx.fillText('人数',left-8,12);const tickStep=niceStep((axisMax-axisMin)/6);ctx.textAlign='center';for(let value=Math.ceil(axisMin/tickStep)*tickStep;value<=axisMax+tickStep*1e-8;value+=tickStep){ctx.fillText((Math.abs(value)<1e-10?0:value).toLocaleString('ja-JP',{maximumFractionDigits:3}),x(value),bottom+20);}ctx.textAlign='right';ctx.fillText('体重変化（kg）',right,h-3);ctx.save();ctx.setLineDash([5,4]);ctx.strokeStyle='#191814';ctx.beginPath();ctx.moveTo(x(0),top);ctx.lineTo(x(0),bottom);ctx.stroke();ctx.restore();groups.forEach((g,k)=>{if(!visibleGroups[k])return;ctx.fillStyle=g.color;ctx.strokeStyle=g.color;if(line){const points=smooth(g.bins).map((n,i)=>({x:x(axisMin+(i+.5)*binWidth),y:y(n)}));ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++){const previous=points[i-1],current=points[i];ctx.quadraticCurveTo(previous.x,previous.y,(previous.x+current.x)/2,(previous.y+current.y)/2);}const last=points[points.length-1];ctx.quadraticCurveTo(last.x,last.y,last.x,last.y);ctx.lineWidth=2.5;ctx.lineJoin="round";ctx.lineCap="round";ctx.stroke();}else{const width=(right-left)/binCount;g.bins.forEach((n,i)=>{if(n)ctx.fillRect(x(axisMin+i*binWidth)+width*(.04+k*.31),y(n),Math.max(.5,width*.29),bottom-y(n));});}});if(!count){ctx.fillStyle='#58616c';ctx.textAlign='center';ctx.fillText('観測を開始するとデータが現れます',(left+right)/2,top+20);}}
function render(){
  $('sampleCount').textContent=count.toLocaleString('ja-JP');
  $('seekBar').value=count;
  $('progressBar').style.width=`${count/total*100}%`;
  $('startButton').textContent=running?'Ⅱ 一時停止':count===total?'✓ 観測完了':count?'▶ ここから再開':'▶ 観測スタート';
  const summaries=groups.map(statistics);
  const useControl=visibleGroups[2];
  $('comparisonGuide').textContent=useControl
    ? 'RUZIPを利用したA・Bの体重変化を、利用していないCと比較します。'
    : 'RUZIPを利用したA・Bそれぞれの平均体重変化を、0kg（変化なし）と比較します。';
  $('modeGuide').textContent=useControl
    ? 'Cとの比較：Welchのt検定・減量方向の片側・5%水準。Cより平均体重変化が小さいかを調べます。因果関係の証明ではありません。'
    : '0kgとの比較：1標本t検定・減量方向の片側・5%水準。平均的に体重が減ったかを調べます。RUZIPが減量の原因かは判断できません。';
  groups.forEach((g,i)=>{
    $(`groupCard${i}`).hidden=!visibleGroups[i];
    $(`statCard${i}`).hidden=!visibleGroups[i];
    const s=summaries[i];
    $(`weightLabel${i}`).textContent=`${count?count.toLocaleString('ja-JP'):'—'}人目の体重変化`;
    $(`weight${i}`).textContent=count?g.values[count-1].toFixed(2):'—';
    ['mean','sd','se'].forEach(k=>$(`${k}${i}`).textContent=s?.[k]!==undefined?`${s[k].toFixed(2)} kg`:'—');
    if(i===2)return;
    $(`statTitle${i}`).textContent=`グループ ${g.name} ／ ${useControl?'C':'0kg'}との比較`;
    $(`differenceLabel${i}`).textContent=useControl?`平均差（${g.name} − C）`:'0kgとの差';
    $(`pLabel${i}`).textContent=`p値（${useControl?'C':'0kg'}との比較）`;
    const result=useControl?compareWithControl(s,summaries[2]):compareWithZero(s);
    $(`difference${i}`).textContent=result?`${result.difference.toFixed(2)} kg`:'—';
    $(`p${i}`).textContent=result?.p!=null?(result.p<.001?'< 0.001':result.p.toFixed(3)):'—';
    $(`decision${i}`).textContent=result?.p!=null?(result.p<.05?(useControl?'帰無仮説を棄却：Cより平均体重変化が小さい。':'帰無仮説を棄却：平均的な体重減少を支持する結果。'):(useControl?'棄却できない：Cより平均体重変化が小さいと判断する根拠が足りない。':'棄却できない：平均的な体重減少を判断する根拠が足りない。')):count>=2?'ばらつきが0のため、検定を計算できません。':'2人以上を観測すると検定結果を表示します。';
    $(`t${i}`).textContent=result?.t!=null?`${useControl?'Welchのt検定':'1標本t検定'}・左片側（5%） ／ t = ${result.t.toFixed(2)} ／ 自由度 ${result.df.toFixed(1)}${count<total?' ／ 観測途中':''}`:'';
  });
  draw($('histCanvas'));draw($('smoothCanvas'),true);
}
function stop(){running=false;cancelAnimationFrame(frame);previous=null;budget=0;}
function advance(target){target=Math.max(0,Math.min(total,Math.floor(target)));if(target<count){groups.forEach(g=>g.bins.fill(0));count=0;}for(let i=count;i<target;i++)groups.forEach(g=>g.bins[g.indices[i]]++);count=target;}
function seek(target){stop();advance(target);render();}
function tick(time){if(!running)return;if(previous!==null)budget+=Math.min(time-previous,250)*Number($('speedSelect').value)/1000;previous=time;const add=Math.floor(budget);budget-=add;advance(count+add);if(count===total)stop();render();if(running)frame=requestAnimationFrame(tick);}
function toggleObservation(){
  if(running)stop();
  else if(count<total){running=true;previous=null;frame=requestAnimationFrame(tick);}
  render();
}
$('startButton').addEventListener('click',toggleObservation);
document.addEventListener('keydown',event=>{
  if(event.code!=='Space'||event.repeat||event.isComposing||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
  if($('settingsDialog').open||event.target.closest('input, select, textarea, button, a, summary, [contenteditable]:not([contenteditable="false"]), [role="button"]'))return;
  event.preventDefault();
  toggleObservation();
});$('resetButton').addEventListener('click',()=>seek(0));$('completeButton').addEventListener('click',()=>seek(total));$('seekBar').addEventListener('input',e=>seek(Number(e.target.value)));
$('settingsButton').addEventListener('click',()=>{stop();render();groups.forEach((g,i)=>{$(`settingMean${i}`).value=g.mean;$(`settingSd${i}`).value=g.sd;});$('sampleSize').value=total;$('settingsError').textContent='';$('settingsDialog').showModal();});
['closeSettings','cancelSettings'].forEach(id=>$(id).addEventListener('click',()=>$('settingsDialog').close()));
$('settingsForm').addEventListener('submit',e=>{e.preventDefault();const size=Number($('sampleSize').value),settings=groups.map((g,i)=>({mean:Number($(`settingMean${i}`).value),sd:Number($(`settingSd${i}`).value)}));if(!Number.isInteger(size)||size<2||size>100000||settings.some(s=>!Number.isFinite(s.mean)||s.mean < -100||s.mean>100||!Number.isFinite(s.sd)||s.sd<.01||s.sd>100)){$('settingsError').textContent='平均は−100〜100kg、標準偏差は0.01〜100kg、人数は2〜100,000の整数で指定してください。';return;}stop();total=size;settings.forEach((s,i)=>Object.assign(groups[i],s));count=0;generate();render();$('settingsDialog').close();});
groups.forEach((g,i)=>$(`show${g.name}`).addEventListener('change',event=>{
  visibleGroups[i]=event.target.checked;
  render();
}));
window.addEventListener('resize',render);generate();render();
function logGamma(z){const c=[676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];if(z<.5)return Math.log(Math.PI)-Math.log(Math.sin(Math.PI*z))-logGamma(1-z);z--;let x=.99999999999980993;for(let i=0;i<c.length;i++)x+=c[i]/(z+i+1);const t=z+7.5;return .5*Math.log(2*Math.PI)+(z+.5)*Math.log(t)-t+Math.log(x);}
function betaFraction(a,b,x){let c=1,d=1-(a+b)*x/(a+1);d=1/d;let h=d;for(let m=1;m<=200;m++){let aa=m*(b-m)*x/((a+2*m-1)*(a+2*m));d=1+aa*d;if(Math.abs(d)<1e-30)d=1e-30;c=1+aa/c;if(Math.abs(c)<1e-30)c=1e-30;d=1/d;h*=d*c;aa=-(a+m)*(a+b+m)*x/((a+2*m)*(a+2*m+1));d=1+aa*d;if(Math.abs(d)<1e-30)d=1e-30;c=1+aa/c;if(Math.abs(c)<1e-30)c=1e-30;d=1/d;const delta=d*c;h*=delta;if(Math.abs(delta-1)<3e-14)break;}return h;}
function beta(x,a,b){if(x<=0)return 0;if(x>=1)return 1;const f=Math.exp(logGamma(a+b)-logGamma(a)-logGamma(b)+a*Math.log(x)+b*Math.log1p(-x));return x<(a+1)/(a+b+2)?f*betaFraction(a,b,x)/a:1-f*betaFraction(b,a,1-x)/b;}
