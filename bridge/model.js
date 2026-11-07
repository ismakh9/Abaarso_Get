(function(root){
'use strict';
const format=n=>Number.isInteger(n)?String(n):`${Math.round(n*2)}/2`;
const difference=(p,value)=>p.fixed+value-p.target;
const angle=(p,value)=>Math.max(-13,Math.min(13,difference(p,value)*4));
const outcome=(p,value)=>difference(p,value)<0?'left-heavy':difference(p,value)>0?'right-heavy':'balanced';
function generate(previous={}){let p;do{p={fixed:Math.floor(Math.random()*9)/2,target:5+Math.floor(Math.random()*11)/2};}while(p.fixed===previous.fixed&&p.target===previous.target);return p;}
const M={format,difference,angle,outcome,generate};if(typeof module==='object'&&module.exports)module.exports=M;else root.BalanceModel=M;
})(typeof globalThis!=='undefined'?globalThis:this);
