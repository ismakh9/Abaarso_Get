(function(root){
'use strict';
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a)||1;
function rat(n,d=1){if(!Number.isSafeInteger(n)||!Number.isSafeInteger(d)||d===0)throw new RangeError('Invalid rational');if(d<0){n=-n;d=-d;}const g=gcd(n,d);return {n:n/g,d:d/g};}
const add=(a,b)=>rat(a.n*b.d+b.n*a.d,a.d*b.d),sub=(a,b)=>rat(a.n*b.d-b.n*a.d,a.d*b.d),mul=(a,b)=>rat(a.n*b.n,a.d*b.d),div=(a,b)=>rat(a.n*b.d,a.d*b.n),neg=a=>rat(-a.n,a.d),eq=(a,b)=>a.n*b.d===b.n*a.d,num=a=>a.n/a.d,fmt=a=>a.d===1?String(a.n):`${a.n}/${a.d}`;
function parse(text){text=String(text).trim().replace(/−/g,'-').replace(/^([+-]?)\./,'$10.').replace(/^(\d+)\.$/,'$1.0');if(text.length>24)return null;const fraction=text.match(/^([+-]?\d{1,7})\s*\/\s*([+-]?\d{1,7})$/);if(fraction){if(+fraction[2]===0)return null;return rat(+fraction[1],+fraction[2]);}const decimal=text.match(/^([+-]?)(\d{1,7})(?:\.(\d{1,6}))?$/);if(!decimal)return null;const denominator=10**(decimal[3]?.length||0),numerator=(+decimal[2]*denominator+ +(decimal[3]||0))*(decimal[1]==='-'?-1:1);return rat(numerator,denominator);}
const random=seed=>{let state=seed>>>0;return()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};};
const choose=(rng,list)=>list[Math.floor(rng()*list.length)];
function term(coefficient,variable,first=false){if(coefficient.n===0)return '';const magnitude=rat(Math.abs(coefficient.n),coefficient.d),value=eq(magnitude,rat(1))?variable:`${magnitude.d===1?fmt(magnitude):'('+fmt(magnitude)+')'}${variable}`;return (coefficient.n<0?(first?'−':' − '):first?'':' + ')+value;}
function constant(value){return value.n===0?'':`${value.n<0?' − ':' + '}${fmt(rat(Math.abs(value.n),value.d))}`;}
function lineText(line,variables){const [x,y]=variables;if(line.form==='slope')return `${y} = ${term(line.m,x,true)}${constant(line.b)}`;return `${term(line.A,x,true)}${term(line.B,y,false)} = ${fmt(line.C)}`;}
const citySets=[{id:'tokyo',city:{en:'Tokyo',so:'Tokyo'},region:{en:'Japan · Tokaido Shinkansen',so:'Japan · Tokaido Shinkansen'},train:'N700S Shinkansen',route:'Tokyo → Shin-Osaka',colors:['#e9eef1','#275a98']},{id:'paris',city:{en:'Paris',so:'Paris'},region:{en:'France · High-speed rail',so:'Faransiiska · Tareennada xawaaraha sare'},train:'TGV INOUI',route:'Paris → Lyon',colors:['#bfc8d1','#af254c']},{id:'frankfurt',city:{en:'Frankfurt',so:'Frankfurt'},region:{en:'Germany · Rhine–Main',so:'Jarmalka · Rhine–Main'},train:'ICE 3',route:'Cologne → Frankfurt',colors:['#e9edf1','#c84745']}];
function system(index,seed=7319){if(!Number.isInteger(index)||index<0)throw new RangeError('Index must be nonnegative');const rng=random((Math.imul(index+1,2654435761)^seed)>>>0),variables=index<3?['x','y']:choose(rng,[['x','y'],['u','v'],['a','b'],['p','q']]);let point,m1,m2;
if(index===0){point={x:rat(2),y:rat(1)};m1=rat(1);m2=rat(-1);}
else{const denominator=index<3?1:choose(rng,[1,1,2,2,3]);point={x:rat(Math.floor(rng()*5)-2,denominator),y:rat(Math.floor(rng()*5)-2,denominator)};if(index===2)point={x:rat(3,2),y:rat(-1,2)};if(index%7===6)point.x=rat(0);const slopes=index<3?[rat(1),rat(2)]:[rat(1,2),rat(2,3),rat(1),rat(3,2),rat(2)];m1=choose(rng,slopes);m2=neg(choose(rng,slopes));}
const lines=[m1,m2].map((m,id)=>{const b=sub(point.y,mul(m,point.x)),scale=index>5&&index%3===0?rat(1,choose(rng,[2,3])):rat(1);const A=mul(rat(-m.n),scale),B=mul(rat(m.d),scale),C=mul(mul(b,rat(m.d)),scale);const form=index<2?'slope':index%3===2?'standard':choose(rng,['slope','standard']);const line={m,b,A,B,C,form};line.text=lineText(line,variables);return line;});
const diff=sub(m1,m2),rhs=sub(lines[1].b,lines[0].b),city=citySets[index%citySets.length];return {index,variables,point,lines,city,duration:Math.max(30,75-index*2.5),work:{hasStandard:lines.some(line=>line.form==='standard'),isolated:lines.map(line=>lineText({...line,form:'slope'},variables)),equal:`${term(m1,variables[0],true)}${constant(lines[0].b)} = ${term(m2,variables[0],true)}${constant(lines[1].b)}`,collect:`${term(diff,variables[0],true)} = ${fmt(rhs)}`,first:`${variables[0]} = ${fmt(point.x)}`,substitute:`${variables[1]} = ${fmt(m1)} × (${fmt(point.x)})${constant(lines[0].b)} = ${fmt(point.y)}`,pair:`(${fmt(point.x)}, ${fmt(point.y)})`}};
}
function correct(problem,x,y){return !!x&&!!y&&problem.lines.every(l=>eq(add(mul(l.A,x),mul(l.B,y)),l.C));}
const plot={width:900,height:560,scale:48,origin:{x:450,y:280},bounds:{xmin:-8,xmax:8,ymin:-5,ymax:5}};
const project=(x,y)=>({x:plot.origin.x+num(x)*plot.scale,y:plot.origin.y-num(y)*plot.scale});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),lerp=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
function pointOnLine(line,x){return project(rat(Math.round(x*10000),10000),add(mul(line.m,rat(Math.round(x*10000),10000)),line.b));}
function lineEnds(line){const m=num(line.m),b=num(line.b),{xmin,xmax,ymin,ymax}=plot.bounds;const xs=[xmin,xmax,(ymin-b)/m,(ymax-b)/m].filter(x=>x>=xmin-1e-8&&x<=xmax+1e-8&&m*x+b>=ymin-1e-8&&m*x+b<=ymax+1e-8).sort((a,b)=>a-b);return [pointOnLine(line,xs[0]),pointOnLine(line,xs[xs.length-1])];}
function bezier(a,b,c,d,t){const u=1-t;return{x:u*u*u*a.x+3*u*u*t*b.x+3*u*t*t*c.x+t*t*t*d.x,y:u*u*u*a.y+3*u*u*t*b.y+3*u*t*t*c.y+t*t*t*d.y};}
// Car dimensions and the departure speed are in drawing units, not real rail units.
const motion={carLength:48,carGap:5,carCount:3,wheelbase:28,accelerationSeconds:1.7,cruiseSpeed:155,switchSeconds:.9,switchLockSeconds:.7};
motion.trainLength=motion.carLength*motion.carCount+motion.carGap*(motion.carCount-1);
function curveTangent(route,t){const u=1-t,{stop:a,c1:b,c2:c,end:d}=route;return{x:3*u*u*(b.x-a.x)+6*u*t*(c.x-b.x)+3*t*t*(d.x-c.x),y:3*u*u*(b.y-a.y)+6*u*t*(c.y-b.y)+3*t*t*(d.y-c.y)};}
function geometry(problem){const junction=project(problem.point.x,problem.point.y);return {junction,routes:problem.lines.map((line,id)=>{
 const [entry,exit]=lineEnds(line),length=distance(entry,junction),unit={x:(junction.x-entry.x)/length,y:(junction.y-entry.y)/length};
 // A broad tangent turnout levels into a parallel bypass lane. Every control
 // point stays on this train's side of the mathematical crossing.
 const stop={x:junction.x-unit.x*140,y:junction.y-unit.y*140},end={x:1010,y:junction.y+(id===0?32:-32)},c1={x:stop.x+unit.x*75,y:stop.y+unit.y*75},c2={x:stop.x+170,y:end.y};
 const samples=[entry,stop],parameters=[null,0];for(let i=1;i<=320;i++){samples.push(bezier(stop,c1,c2,end,i/320));parameters.push(i/320);}
 const cumulative=[0];for(let i=1;i<samples.length;i++)cumulative[i]=cumulative[i-1]+distance(samples[i-1],samples[i]);
 return {entry,exit,stop,c1,c2,end,unit,approachLength:distance(entry,stop),samples,parameters,cumulative,totalLength:cumulative[cumulative.length-1],path:`M ${stop.x} ${stop.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`};
 })};}
function pathPosition(route,at){let p,tangent;
 if(at<=route.approachLength){p={x:route.entry.x+route.unit.x*at,y:route.entry.y+route.unit.y*at};tangent=route.unit;}
 else if(at>=route.totalLength){p={x:route.end.x+(at-route.totalLength),y:route.end.y};tangent={x:1,y:0};}
 else{let low=1,high=route.cumulative.length-1;while(low+1<high){const mid=(low+high)>>1;if(route.cumulative[mid]<at)low=mid;else high=mid;}
  const fraction=(at-route.cumulative[low])/(route.cumulative[high]-route.cumulative[low]),t=route.parameters[low]+(route.parameters[high]-route.parameters[low])*fraction;
  p=bezier(route.stop,route.c1,route.c2,route.end,t);tangent=curveTangent(route,t);
 }
 const magnitude=Math.hypot(tangent.x,tangent.y),ux=tangent.x/magnitude,uy=tangent.y/magnitude;
 return {...p,ux,uy,angle:Math.atan2(uy,ux)*180/Math.PI};
}
function convoyPose(route,front){const cars=[];for(let index=0;index<motion.carCount;index++){
 const centerAt=front-motion.carLength/2-index*(motion.carLength+motion.carGap),bogies=[pathPosition(route,centerAt+motion.wheelbase/2),pathPosition(route,centerAt-motion.wheelbase/2)];
 const center={x:(bogies[0].x+bogies[1].x)/2,y:(bogies[0].y+bogies[1].y)/2},dx=bogies[0].x-bogies[1].x,dy=bogies[0].y-bogies[1].y,length=Math.hypot(dx,dy),ux=dx/length,uy=dy/length;
 cars.push({...center,angle:Math.atan2(uy,ux)*180/Math.PI,bogies,front:{x:center.x+ux*motion.carLength/2,y:center.y+uy*motion.carLength/2},rear:{x:center.x-ux*motion.carLength/2,y:center.y-uy*motion.carLength/2}});
 }return {cars,links:cars.slice(0,-1).map((car,index)=>({a:car.rear,b:cars[index+1].front})),tail:cars[cars.length-1].rear};}
const approachDistance=(route,progress)=>route.approachLength*(.13+.87*progress);
const clearDistance=route=>route.totalLength+motion.trainLength+24;
function departureDistance(seconds){const t=Math.max(0,seconds),a=motion.accelerationSeconds,v=motion.cruiseSpeed;return t<a?v*(t/2-a*Math.sin(Math.PI*t/a)/(2*Math.PI)):v*(t-a/2);}
const departureDuration=distance=>distance/motion.cruiseSpeed+motion.accelerationSeconds/2;
function departurePlan(problem,progress){const routes=geometry(problem).routes,distance=Math.max(...routes.map(route=>clearDistance(route)-approachDistance(route,progress)));return {distance,duration:departureDuration(distance)};}
function departureFront(route,progress,seconds){return Math.min(clearDistance(route),approachDistance(route,progress)+departureDistance(seconds));}
function session(seed=7319,practice=false){return {seed,index:0,problem:system(0,seed),phase:'ready',previousPhase:'ready',phaseTime:0,elapsed:0,remaining:75,progress:0,rescueStart:0,rescueDuration:0,practice,score:0,streak:0,saved:0,answerStatus:'',hint:0};}
function reset(s,index=s.index){s.index=index;s.problem=system(index,s.seed);s.phase='running';s.phaseTime=0;s.elapsed=0;s.remaining=s.problem.duration;s.progress=0;s.rescueStart=0;s.rescueDuration=0;s.answerStatus='';s.hint=0;}
function submit(s,xText,yText){if(s.phase!=='running')return 'inactive';const x=parse(xText),y=parse(yText);if(!x||!y){s.answerStatus='format';return 'format';}let isCorrect=false;try{isCorrect=correct(s.problem,x,y);}catch{s.answerStatus='format';return 'format';}if(!isCorrect){s.answerStatus='wrong';return 'wrong';}s.phase='switching';s.phaseTime=0;s.rescueStart=s.progress;s.rescueDuration=departurePlan(s.problem,s.progress).duration;s.answerStatus='correct';return 'correct';}
function setPractice(s,value){if(!['ready','running'].includes(s.phase)&&!(s.phase==='paused'&&s.previousPhase==='running'))return;if(s.practice&&!value)s.remaining=s.problem.duration*(1-s.progress);s.practice=!!value;}
function pause(s){if(['running','switching','rescuing','braking'].includes(s.phase)){s.previousPhase=s.phase;s.phase='paused';}}
function resume(s){if(s.phase==='paused')s.phase=s.previousPhase;}
function tick(s,delta){const dt=Math.max(0,Math.min(.1,delta));if(s.phase==='running'){s.elapsed+=dt;if(s.practice)s.progress=Math.max(s.progress,Math.min(.38,s.progress+dt*.015));else{s.remaining=Math.max(0,s.remaining-dt);s.progress=Math.min(1,1-s.remaining/s.problem.duration);if(s.remaining<=0){s.phase='braking';s.phaseTime=0;s.streak=0;s.answerStatus='timeout';}}}else if(['switching','rescuing','braking'].includes(s.phase)){s.phaseTime+=dt;if(s.phase==='switching'&&s.phaseTime>=motion.switchSeconds){s.phase='rescuing';s.phaseTime=0;}else if(s.phase==='rescuing'&&s.phaseTime>=s.rescueDuration){s.phase='saved';s.phaseTime=0;s.saved++;s.streak++;s.score+=100+(s.practice?0:Math.round(s.remaining*2));}else if(s.phase==='braking'&&s.phaseTime>=.9){s.phase='failed';s.phaseTime=0;}}}
const model={rat,add,sub,mul,div,neg,eq,num,fmt,parse,system,correct,plot,project,geometry,pathPosition,curveTangent,convoyPose,motion,approachDistance,clearDistance,departureDistance,departureDuration,departurePlan,departureFront,session,reset,submit,setPractice,pause,resume,tick,citySets};
if(typeof module!=='undefined'&&module.exports)module.exports=model;else root.TrainModel=model;
})(typeof window!=='undefined'?window:globalThis);
