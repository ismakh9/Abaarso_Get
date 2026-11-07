(function(root){
 'use strict';
 const Q=typeof module!=='undefined'&&module.exports?require('../shared/equations.js'):root.EquationFactory;
 const equation=(wave,seed=7319)=>({...Q.generate(wave,seed),wave});
 const travelSeconds=wave=>Math.max(8,18-Math.max(0,wave)*.45);
 const isCorrect=(problem,value)=>Q.evaluate(problem,value);
 const constants={shields:3,forwardSpeed:18,correctBoost:200,speedBonusPerSecond:36,wrongCooldown:.95,shotSeconds:.32,hitReveal:.7,missReveal:1.15,maxFrameDelta:.08};
 const answerBoost=(wave,progress)=>Math.round(constants.correctBoost+constants.speedBonusPerSecond*travelSeconds(wave)*(1-Math.min(1,Math.max(0,progress))));
 const model={equation,freshSeed:Q.freshSeed,travelSeconds,isCorrect,answerBoost,constants};
 if(typeof module!=='undefined'&&module.exports)module.exports=model;else root.SpaceModel=model;
})(typeof window!=='undefined'?window:globalThis);
