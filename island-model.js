(function(root){
'use strict';
const Q=typeof module!=='undefined'&&module.exports?require('./shared/equations.js'):root.EquationFactory;
const K={width:900,height:620,spikes:594,launchY:510,gap:160,baseSpeed:6,maxSpeed:22,speedPerJump:.7,jumpSeconds:.78,jumpArc:62,maxReach:230,cameraAnchor:430,cameraRate:300,recycleY:594};
function platformX(generation,seed){const rng=Q.random((Math.imul(generation+3,2246822519)^seed)>>>0);return 230+Math.round(rng()*440);}
function makePlatform(id,generation,y,seed){return {id,generation,y,x:platformX(generation,seed),problem:Q.generate(generation,seed)};}
function create(seed=Q.freshSeed()){seed=seed>>>0;return {seed,mode:'ready',paused:false,pauseReason:'',platforms:[makePlatform(0,0,380,seed),makePlatform(1,1,220,seed),makePlatform(2,2,60,seed)],generation:3,launch:{x:450,y:K.launchY},hero:{x:450,y:K.launchY},rider:'launch',jump:null,speed:K.baseSpeed,jumps:0,height:0,elapsed:0,feedback:null,hint:false,words:false};}
function nearest(state){return state.platforms.filter(p=>p.y<state.hero.y-10&&state.hero.y-p.y<=K.maxReach).sort((a,b)=>b.y-a.y||a.id-b.id)[0]||null;}
function target(state){return state.jump?state.platforms.find(p=>p.id===state.jump.platformId&&p.generation===state.jump.generation)||null:nearest(state);}
function start(state){if(state.mode!=='ready')return false;state.mode='playing';state.paused=false;return true;}
function choose(state,index,expectedId,expectedGeneration){if(state.mode!=='playing'||state.paused||state.jump)return false;const p=nearest(state);if(!p||expectedId!==undefined&&p.id!==expectedId||expectedGeneration!==undefined&&p.generation!==expectedGeneration)return false;const option=p.problem.options[index];if(!option)return false;
 if(!Q.evaluate(p.problem,option.value)){state.feedback={kind:'wrong',platformId:p.id,generation:p.generation,variable:p.problem.variable,chosen:option.value,total:Q.valueAt(p.problem,option.value),rhs:p.problem.coefficients.c};return false;}
 state.feedback={kind:'correct',variable:p.problem.variable,answer:p.problem.answer,check:p.problem.check};state.jump={platformId:p.id,generation:p.generation,startX:state.hero.x,startY:state.hero.y,elapsed:0};state.rider=null;state.hint=false;state.words=false;return true;
}
function shiftCamera(state,dy){if(dy<=0)return;state.hero.y+=dy;if(state.jump)state.jump.startY+=dy;state.launch.y+=dy;state.platforms.forEach(p=>p.y+=dy);state.height+=dy;}
function step(state,dt){state.elapsed+=dt;const fall=state.speed*dt;state.platforms.forEach(p=>p.y+=fall);state.launch.y+=fall;
 if(state.jump){const jump=state.jump,p=target(state);if(!p){state.mode='over';return;}jump.elapsed+=dt;const t=Math.min(1,jump.elapsed/K.jumpSeconds);state.hero.x=jump.startX+(p.x-jump.startX)*t;state.hero.y=jump.startY+(p.y-jump.startY)*t-K.jumpArc*4*t*(1-t);if(t>=1){state.hero.x=p.x;state.hero.y=p.y;state.rider=p.id;state.jump=null;state.jumps++;state.speed=Math.min(K.maxSpeed,K.baseSpeed+state.jumps*K.speedPerJump);}}
 else{const ride=state.rider==='launch'?state.launch:state.platforms.find(p=>p.id===state.rider);if(!ride){state.mode='over';return;}state.hero.x=ride.x;state.hero.y=ride.y;}
 // Collision is checked before either camera follow or recycling: a rider can never teleport out of spikes.
 if(state.hero.y>=K.spikes){state.hero.y=K.spikes;state.mode='over';state.jump=null;return;}
 // Follow the intended landing height, never the airborne apex. Shift the jump origin with the world.
 const followY=state.jump?target(state).y:state.hero.y;
 if((state.jump||state.rider!=='launch')&&followY<K.cameraAnchor)shiftCamera(state,Math.min(K.cameraAnchor-followY,K.cameraRate*dt));
 for(const p of state.platforms){if(p.y>K.recycleY){if(state.rider===p.id){state.mode='over';return;}const top=Math.min(...state.platforms.filter(other=>other!==p).map(other=>other.y));Object.assign(p,makePlatform(p.id,state.generation++,top-K.gap,state.seed));}}
}
function advance(state,dt){if(state.mode!=='playing'||state.paused||!Number.isFinite(dt)||dt<=0)return;let remaining=dt;while(remaining>1e-9&&state.mode==='playing'){const stepTime=Math.min(1/90,remaining);step(state,stepTime);remaining-=stepTime;}}
const api={constants:K,create,start,nearest,target,choose,advance,platformX};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.IslandClimb=api;
})(typeof window!=='undefined'?window:globalThis);
