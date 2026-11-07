(function(root){
'use strict';
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a||1;};
function rational(n,d=1){if(!Number.isSafeInteger(n)||!Number.isSafeInteger(d)||d===0)throw new RangeError('Use safe integer numerator and nonzero denominator.');if(n===0)return {n:0,d:1};if(d<0){n=-n;d=-d;}const g=gcd(n,d);return {n:n/g,d:d/g};}
function parse(value){if(value&&typeof value==='object'&&'n'in value&&'d'in value){try{return rational(value.n,value.d);}catch{return null;}}const s=String(value??'').trim().replace(/−/g,'-').replace(/\s*\/\s*/g,'/');let m;if((m=s.match(/^([+-]?\d+)\/([+-]?\d+)$/))){try{return rational(Number(m[1]),Number(m[2]));}catch{return null;}}if((m=s.match(/^([+-]?)(\d*)(?:\.(\d+))?$/))&&(m[2]||m[3])&&(m[3]?.length||0)<=8){const d=10**(m[3]?.length||0),n=Number((m[2]||'0')+(m[3]||''))*(m[1]==='-'?-1:1);try{return rational(n,d);}catch{return null;}}return null;}
const R=value=>{const r=parse(value);if(!r)throw new TypeError('Invalid rational.');return r;};
const add=(a,b)=>{a=R(a);b=R(b);return rational(a.n*b.d+b.n*a.d,a.d*b.d);};
const sub=(a,b)=>{a=R(a);b=R(b);return rational(a.n*b.d-b.n*a.d,a.d*b.d);};
const mul=(a,b)=>{a=R(a);b=R(b);return rational(a.n*b.n,a.d*b.d);};
const div=(a,b)=>{a=R(a);b=R(b);return rational(a.n*b.d,a.d*b.n);};
const equal=(a,b)=>{a=parse(a);b=parse(b);return !!a&&!!b&&a.n===b.n&&a.d===b.d;};
const format=value=>{const a=R(value);return (a.n<0?'−':'')+Math.abs(a.n)+(a.d===1?'':'/'+a.d);};
const divisor=value=>{const r=R(value);return r.d!==1||r.n<0?'('+format(r)+')':format(r);};
const signed=value=>{const r=R(value);return r.n<0?'('+format(r)+')':format(r);};
function random(seed){let x=seed>>>0;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
function freshSeed(){if(root.crypto?.getRandomValues){const a=new Uint32Array(1);root.crypto.getRandomValues(a);return a[0];}return (Math.floor(Math.random()*4294967296)^Date.now())>>>0;}
function valueAt(problem,value){return add(mul(problem.coefficients.a,R(value)),problem.coefficients.b);}
function evaluate(problem,value){const r=parse(value);return !!r&&equal(valueAt(problem,r),problem.coefficients.c);}
function generate(index=0,seed=7319){
 if(!Number.isSafeInteger(index)||index<0)throw new RangeError('Index must be a nonnegative safe integer.');
 const rng=random((Math.imul(index+1,2654435761)^(seed>>>0))>>>0),pick=list=>list[Math.floor(rng()*list.length)],int=(lo,hi)=>lo+Math.floor(rng()*(hi-lo+1));
 const starter=index<8,variable='xtnaybkrpzw'[(index+((seed>>>0)%11))%11],kind=(starter?['add','subtract','multiply','divide']:['add','subtract','multiply','divide','scaled','shifted'])[index%(starter?4:6)];
 let answer=rational(int(1,9)),operand=rational(int(1,5)),extra=rational(0),a=rational(1),b=rational(0),operations=[],left,substitution,words,hint,tokens;
 if(!starter){answer=rational(pick([-9,-7,-5,-3,-1,0,1,2,3,5,7,9]),pick(index<14?[1,2]:[1,2,3,4]));operand=rational(int(1,5),pick(index<14?[1]:[1,2,3]));}
 const num=v=>({type:'number',value:v,label:format(v)}),op=label=>({type:'operator',label}),unknown={type:'variable',label:variable};
 if(kind==='add'||kind==='subtract'){
  const minus=kind==='subtract';if(starter&&minus)answer=add(answer,operand);b=minus?mul(operand,-1):operand;operations=[minus?'−':'+'];
  left=`${variable} ${operations[0]} ${format(operand)}`;substitution=`${signed(answer)} ${operations[0]} ${format(operand)}`;tokens=[unknown,op(operations[0]),num(operand)];
  words={en:`An unknown number ${minus?'minus':'plus'} ${format(operand)}`,so:`Tiro aan la aqoon oo ${minus?'laga jaray':'lagu daray'} ${format(operand)}`};
  hint={en:`${minus?'Add':'Subtract'} ${format(operand)} ${minus?'to':'from'} both sides.`,so:`Labada dhinac ${format(operand)} ${minus?'ku dar':'ka jar'}.`};
 }else if(kind==='multiply'||kind==='divide'){
  const divide=kind==='divide';if(starter&&divide)answer=mul(answer,operand);a=divide?div(1,operand):operand;operations=[divide?'÷':'×'];
  left=divide?`${variable} ÷ ${divisor(operand)}`:`${format(operand)} × ${variable}`;substitution=divide?`${signed(answer)} ÷ ${divisor(operand)}`:`${format(operand)} × ${signed(answer)}`;tokens=divide?[unknown,op('÷'),num(operand)]:[num(operand),op('×'),unknown];
  words={en:divide?`An unknown number divided by ${format(operand)}`:`${format(operand)} times an unknown number`,so:divide?`Tiro aan la aqoon oo loo qaybiyey ${format(operand)}`:`${format(operand)} lagu dhuftay tiro aan la aqoon`};
  hint={en:`${divide?'Multiply':'Divide'} both sides ${divide?'by':'by'} ${format(operand)}.`,so:`Labada dhinac ${format(operand)} ${divide?'ku dhufo':'u qaybi'}.`};
 }else{
  extra=rational(int(1,5));const shifted=kind==='shifted';if(!shifted&&index%4===0)extra=mul(extra,-1);
  const sign=extra.n<0?'−':'+',abs=rational(Math.abs(extra.n),extra.d);
  a=shifted?div(1,operand):operand;b=shifted?div(extra,operand):extra;operations=shifted?['+','÷']:['×',sign];
  left=shifted?`(${variable} + ${format(extra)}) ÷ ${divisor(operand)}`:`${format(operand)} × ${variable} ${sign} ${format(abs)}`;
  substitution=shifted?`(${signed(answer)} + ${format(extra)}) ÷ ${divisor(operand)}`:`${format(operand)} × ${signed(answer)} ${sign} ${format(abs)}`;
  tokens=shifted?[op('('),unknown,op('+'),num(extra),op(')'),op('÷'),num(operand)]:[num(operand),op('×'),unknown,op(sign),num(abs)];
  words={en:shifted?`Add ${format(extra)} to an unknown number, then divide by ${format(operand)}`:`Multiply an unknown number by ${format(operand)}, then ${extra.n<0?'subtract':'add'} ${format(abs)}`,so:shifted?`Tirada aan la aqoon ku dar ${format(extra)}, dabadeed u qaybi ${format(operand)}`:`Tirada aan la aqoon ku dhufo ${format(operand)}, dabadeed ${format(abs)} ${extra.n<0?'ka jar':'ku dar'}`};
  hint={en:shifted?`Multiply both sides by ${format(operand)}, then subtract ${format(extra)} from both sides.`:`${extra.n<0?'Add':'Subtract'} ${format(abs)} ${extra.n<0?'to':'from'} both sides, then divide both sides by ${format(operand)}.`,so:shifted?`Labada dhinac ku dhufo ${format(operand)}, dabadeed labadaba ka jar ${format(extra)}.`:`Labada dhinac ${format(abs)} ${extra.n<0?'ku dar':'ka jar'}, dabadeed labadaba u qaybi ${format(operand)}.`};
 }
 const c=add(mul(a,answer),b),rhs=format(c),options=[answer];
 let offsets=starter?[1,-1,2,-2,3,-3]:[1,-1,'1/2','-1/2',2,-2,'1/3','-1/3'];
 offsets=offsets.map(value=>({value,sort:rng()})).sort((x,y)=>x.sort-y.sort).map(x=>x.value);
 for(const offset of offsets){const candidate=add(answer,offset);if((!starter||candidate.n>=0)&&!options.some(v=>equal(v,candidate)))options.push(candidate);if(options.length===4)break;}
 for(let i=options.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[options[i],options[j]]=[options[j],options[i]];}
 return {index,variable,kind,operations,answer,operand,extra,coefficients:{a,b,c},text:`${left} = ${rhs}`,solution:format(answer),check:`${substitution} = ${rhs}`,tokens:[...tokens,op('='),num(c)],words:{en:`${words.en} equals ${rhs}.`,so:`${words.so} waxay la mid tahay ${rhs}.`},hint,options:options.map(value=>({value,label:format(value)}))};
}
const api={rational,parse,add,sub,mul,div,equal,format,random,freshSeed,valueAt,evaluate,generate};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EquationFactory=api;
})(typeof window!=='undefined'?window:globalThis);
