import {useId,type CSSProperties} from 'react';
import type {Edge,SectionGeometry,SectionResult,Unit} from './types';
import {inUnit} from './types';
import {pointOn} from './geometry';
import {drawingLayout,type DrawingScale} from './SectionDrawing';
import {textbookNumber} from './textbookFormat';

function contour(edges:Edge[],closed=false){
 let d='';
 edges.forEach((e,i)=>{
  const a=pointOn(e,0),b=pointOn(e,1);
  if(!closed||i===0)d+=`M${a.x},${a.y} `;
  if(e.kind==='line')d+=`L${b.x},${b.y} `;
  else if(e.sweep>Math.PI*1.99){const m=pointOn(e,.5);d+=`A${e.r},${e.r} 0 0 1 ${m.x},${m.y} A${e.r},${e.r} 0 0 1 ${b.x},${b.y} `;}
  else d+=`A${e.r},${e.r} 0 ${e.sweep>Math.PI?1:0} 1 ${b.x},${b.y} `;
 });
 return d+(closed?'Z ':'');
}
export function TextbookSectionDrawing({geometry,result:r,unit,scale='fit'}:{geometry:SectionGeometry;result:SectionResult;unit:Unit;scale?:DrawingScale}){
 const id=useId().replaceAll(':',''),layout=drawingLayout(r,scale),span=Math.max(layout.width,layout.height),margin=span*.22,font=span/43;
 const box={x:layout.x.min-margin,y:-layout.y.max-margin,w:layout.width+2*margin,h:layout.height+2*margin};
 const x0=(layout.x.min+layout.x.max)/2,y0=layout.y.min;
 const u=(v:number)=>textbookNumber(inUnit(v,unit),inUnit(span,unit));
 const label=(name:string,index:number|string)=><>{name}<tspan baselineShift="sub" fontSize="70%">{index}</tspan></>;
 const sameY=r.parts.every(p=>Math.abs(p.cx-x0)<=span*1e-12);
 const unique=(values:number[])=>values.sort((a,b)=>a-b).filter((v,i,arr)=>i===0||v-arr[i-1]!>span*1e-10);
 const xMarks=unique(r.parts.flatMap(p=>p.edges.flatMap(e=>e.kind==='line'?[e.a.x,e.b.x]:[])));
 const yMarks=unique(r.parts.flatMap(p=>p.edges.flatMap(e=>e.kind==='line'?[e.a.y,e.b.y]:[])));
 const dimensionX=(a:number,b:number,y:number,text:string,key:string)=><g key={key}><line x1={a} y1={y} x2={b} y2={y}/>{[a,b].map(x=><line key={x} x1={x-font/4} y1={y+font/4} x2={x+font/4} y2={y-font/4}/>)}<text stroke="none" x={(a+b)/2} y={y+font*1.2} textAnchor="middle">{text}</text></g>;
 const dimensionY=(a:number,b:number,x:number,text:string,key:string)=><g key={key}><line x1={x} y1={-a} x2={x} y2={-b}/>{[a,b].map(y=><line key={y} x1={x-font/4} y1={-y+font/4} x2={x+font/4} y2={-y-font/4}/>)}<text stroke="none" x={x+font/2} y={-(a+b)/2} dominantBaseline="middle">{text}</text></g>;
 return <figure className="section-drawing textbook-drawing" style={{'--drawing-width':`${box.w*1000/layout.ratio}mm`,'--drawing-height':`${box.h*1000/layout.ratio}mm`} as CSSProperties}>
  <svg viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} role="img" aria-label="Учебный чертёж сечения: размеры, центры тяжести и оси" style={{fontFamily:'Times New Roman,serif',fontSize:font}}>
   <defs><pattern id={id} width={span*.018} height={span*.018} patternUnits="userSpaceOnUse"><path d={`M0,${span*.018} L${span*.018},0`} stroke="#aaa" strokeWidth={span*.0005}/></pattern></defs>
   <g transform="scale(1,-1)"><path d={r.parts.map(p=>contour(p.edges,true)).join(' ')} fill={`url(#${id})`} fillRule="evenodd"/><path d={contour(r.boundary)} stroke="black" strokeWidth={span*.0016} fill="none"/></g>
   <g stroke="black" strokeWidth={span*.00065} fill="black">
    <line x1={layout.x.min-margin*.4} y1={-y0} x2={layout.x.max+margin*.6} y2={-y0}/><text x={layout.x.max+margin*.65} y={-y0+font/3} stroke="none">{label('x','н')}</text>
    <line x1={layout.x.min-margin*.4} y1={-r.cy} x2={layout.x.max+margin*.6} y2={-r.cy}/><text x={layout.x.max+margin*.65} y={-r.cy+font/3} stroke="none">x</text>
    <line x1={r.cx} y1={-layout.y.min+margin*.13} x2={r.cx} y2={-layout.y.max-margin*.6}/><text x={r.cx+font/3} y={-layout.y.max-margin*.65} stroke="none">y{sameY&&<>, {r.parts.map((_,i)=><tspan key={i}>{label('y',i+1)}{i<r.parts.length-1?', ':''}</tspan>)}</>}</text>
    {!sameY&&<line x1={x0} y1={-y0+font/2} x2={x0} y2={-layout.y.max-font*2} strokeDasharray={`${font/3} ${font/4}`}/>}
    {r.parts.map((p,i)=><g key={p.part.id}>
     <line x1={layout.x.min} x2={layout.x.max+margin*.12} y1={-p.cy} y2={-p.cy} strokeDasharray={`${font/4} ${font/5}`}/><text stroke="none" x={layout.x.max+margin*.14} y={-p.cy-font/4}>{label('x',i+1)}</text>
     {!sameY&&<line x1={p.cx} x2={p.cx} y1={-p.cy+font} y2={-p.cy-font*1.5} strokeDasharray={`${font/3} ${font/4}`}/>}
     <circle cx={p.cx} cy={-p.cy} r={font/9}/><text stroke="none" x={p.cx+font*.35} y={-p.cy-font*.25}>{label('C',i+1)}</text>
    </g>)}
    <circle cx={r.cx} cy={-r.cy} r={font/7}/><text stroke="none" x={r.cx-font*.9} y={-r.cy+font*.9}>C</text>
    <text x={x0-font*.9} y={-y0+font} stroke="none">O</text>
    {xMarks.length>=2&&xMarks.length<=6?xMarks.slice(1).map((x,i)=>{
      const delta=x-xMarks[i]!,a=geometry.a;
      return dimensionX(xMarks[i]!,x,-y0+margin*.4,`${a&&Math.abs(delta-a)<span*1e-10?'a = ':''}${u(delta)}`,`x${i}`);
    }):dimensionX(layout.x.min,layout.x.max,-y0+margin*.4,u(layout.width),'width')}
    {yMarks.length>=2&&yMarks.length<=6?yMarks.slice(1).map((y,i)=>{
      const delta=y-yMarks[i]!,b=geometry.b;
      return dimensionY(yMarks[i]!,y,layout.x.max+margin*.58,`${b&&Math.abs(delta-b)<span*1e-10?'b = ':''}${u(delta)}`,`y${i}`);
    }):dimensionY(layout.y.min,layout.y.max,layout.x.max+margin*.58,u(layout.height),'height')}
   </g>
  </svg>
  <figcaption>Рис. 1. Сечение, местные и центральные оси. Размеры в {unit==='cm'?'см':unit==='mm'?'мм':'м'}. Масштаб печати 1:{textbookNumber(layout.ratio)}{scale==='fit'?' (вписывание в A4)':''}.</figcaption>
 </figure>;
}
