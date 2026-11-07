(function(root,factory){const model=factory();if(typeof module==='object'&&module.exports)module.exports=model;else root.GraphModel=model;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const EPS=1e-9;
const DEFAULT_BOUNDS={minX:-10,maxX:10,minY:-10,maxY:10};
const isAbove=c=>c.op==='>'||c.op==='>=';
const isStrict=c=>c.op==='>'||c.op==='<';
const signedValue=(p,c)=>(isAbove(c)?1:-1)*(p.y-c.m*p.x-c.b);
function satisfies(point,constraint){const value=signedValue(point,constraint);return isStrict(constraint)?value>EPS:value>=-EPS;}
function onLine(point,line){return Math.abs(point.y-line.m*point.x-line.b)<=EPS;}
function inBounds(point,bounds=DEFAULT_BOUNDS){return point.x>=bounds.minX-EPS&&point.x<=bounds.maxX+EPS&&point.y>=bounds.minY-EPS&&point.y<=bounds.maxY+EPS;}
function lineIntersection(a,b,bounds=DEFAULT_BOUNDS){if(Math.abs(a.m-b.m)<=EPS)return Math.abs(a.b-b.b)<=EPS?{type:'coincident'}:{type:'parallel'};const x=(b.b-a.b)/(a.m-b.m),y=a.m*x+a.b;return {type:'point',x,y,visible:inBounds({x,y},bounds)};}
const square=(bounds=DEFAULT_BOUNDS)=>[{x:bounds.minX,y:bounds.minY},{x:bounds.maxX,y:bounds.minY},{x:bounds.maxX,y:bounds.maxY},{x:bounds.minX,y:bounds.maxY}];
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function deduplicate(points){const out=[];for(const p of points)if(!out.length||distance(out[out.length-1],p)>EPS)out.push(p);if(out.length>1&&distance(out[0],out[out.length-1])<=EPS)out.pop();return out;}
function clipHalfPlane(polygon,constraint){if(!polygon.length)return [];const result=[];for(let i=0;i<polygon.length;i++){const start=polygon[i],end=polygon[(i+1)%polygon.length],startValue=signedValue(start,constraint),endValue=signedValue(end,constraint),startInside=startValue>=-EPS,endInside=endValue>=-EPS;if(startInside!==endInside){const t=Math.max(0,Math.min(1,startValue/(startValue-endValue)));result.push({x:start.x+t*(end.x-start.x),y:start.y+t*(end.y-start.y)});}if(endInside)result.push({x:end.x,y:end.y});}return deduplicate(result);}
function clippedRegion(constraints,bounds=DEFAULT_BOUNDS){return constraints.reduce((poly,c)=>clipHalfPlane(poly,c),square(bounds));}
function polygonArea(polygon){if(polygon.length<3)return 0;return Math.abs(polygon.reduce((sum,p,i)=>{const next=polygon[(i+1)%polygon.length];return sum+p.x*next.y-next.x*p.y;},0)/2);}
function boundarySegment(line,bounds=DEFAULT_BOUNDS){const candidates=[{x:bounds.minX,y:line.m*bounds.minX+line.b},{x:bounds.maxX,y:line.m*bounds.maxX+line.b}];if(Math.abs(line.m)>EPS)candidates.push({x:(bounds.minY-line.b)/line.m,y:bounds.minY},{x:(bounds.maxY-line.b)/line.m,y:bounds.maxY});const points=[];for(const p of candidates)if(inBounds(p,bounds)&&!points.some(q=>distance(p,q)<=EPS))points.push(p);points.sort((a,b)=>a.x-b.x||a.y-b.y);return points.length>1?[points[0],points[points.length-1]]:points;}
/* For two nonvertical half-planes, only opposing parallel bounds can make
   the entire solution empty or a single line. Strictness affects that line. */
function globalSolutionKind(constraints){if(constraints.length<2)return 'area';const [a,b]=constraints;if(Math.abs(a.m-b.m)>EPS||isAbove(a)===isAbove(b))return 'area';const lower=isAbove(a)?a:b,upper=isAbove(a)?b:a;if(lower.b>upper.b+EPS)return 'none';if(Math.abs(lower.b-upper.b)<=EPS)return isStrict(lower)||isStrict(upper)?'none':'line';return 'area';}
function analyzeRegion(constraints,bounds=DEFAULT_BOUNDS){const globalKind=globalSolutionKind(constraints),polygon=clippedRegion(constraints,bounds),area=polygonArea(polygon);if(globalKind==='none')return {globalKind,visibleKind:'none',polygon:[],area:0,segment:[]};if(area>EPS)return {globalKind,visibleKind:'area',polygon,area,segment:[]};const candidates=polygon.slice();for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length];candidates.push({x:(a.x+b.x)/2,y:(a.y+b.y)/2});}const feasible=candidates.filter(p=>constraints.every(c=>satisfies(p,c)));let pair=[];let max=0;for(const a of feasible)for(const b of feasible){const d=distance(a,b);if(d>max){max=d;pair=[a,b];}}if(max>EPS)return {globalKind,visibleKind:'line',polygon,area:0,segment:pair};if(feasible.length)return {globalKind,visibleKind:'point',polygon,area:0,segment:[feasible[0]]};return {globalKind,visibleKind:'none',polygon,area:0,segment:[]};}
function probe(point,constraints,inequalities=true){const results=constraints.map(c=>inequalities?satisfies(point,c):onLine(point,c));return {results,both:results.every(Boolean)};}
return {EPS,DEFAULT_BOUNDS,isAbove,isStrict,signedValue,satisfies,onLine,inBounds,lineIntersection,square,clipHalfPlane,clippedRegion,polygonArea,boundarySegment,globalSolutionKind,analyzeRegion,probe};
});
