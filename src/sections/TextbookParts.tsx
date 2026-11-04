import {Fragment,type ReactNode} from 'react';
import {partMoments} from './calculate';
import {vertices,cross} from './geometry';
import {inUnit,type PartResult,type Unit} from './types';
import {textbookNumber} from './textbookFormat';
import {V,Frac,Formula,U} from './TextbookMath';

export const primitiveNames={rectangle:'Прямоугольник',triangle:'Треугольник',trapezoid:'Трапеция',circle:'Круг',semicircle:'Полукруг',polygon:'Многоугольник'};
export function TextbookParts({part,index,unit}:{part:PartResult;index:number;unit:Unit}) {
 const p=part.part,s=p.shape,local=partMoments({...p,x:0,y:0,angle:0});
 const span=Math.max(...part.edges.flatMap(e=>e.kind==='arc'?[e.r]:[Math.hypot(e.b.x-e.a.x,e.b.y-e.a.y)]));
 const u=(value:number,power=1,noiseScale=Math.abs(value))=>textbookNumber(inUnit(value,unit,power),inUnit(noiseScale,unit,power));
 const b=<V sub={index}>b</V>,ht=<V sub={index}>h</V>,d=<V>d</V>;
 const knownZeroProduct=s.kind==='rectangle'||s.kind==='circle'||s.kind==='semicircle'||(s.kind==='triangle'&&Math.abs(s.apex-s.width/2)<span*1e-12);
 const J=(axis:ReactNode)=><V sub={axis} sup={`(${index})`}>J</V>;
 const xi=<>x<sub>{index}</sub></>,yi=<>y<sub>{index}</sub></>;
 let area:ReactNode,jx:ReactNode,jy:ReactNode,jxy:ReactNode=<>0</>;
 let dimensions:ReactNode;
 if(s.kind==='rectangle'||s.kind==='triangle'){
  dimensions=<>{b} = {u(s.width)} <U unit={unit}/>; {ht} = {u(s.height)} <U unit={unit}/>.</>;
  area=s.kind==='rectangle'?<>{b}{ht} = {u(s.width)} · {u(s.height)}</>:<><Frac top={<>{b}{ht}</>} bottom="2"/> = <Frac top={<>{u(s.width)} · {u(s.height)}</>} bottom="2"/></>;
  jx=<><Frac top={<>{b}<V sub={index} sup="3">h</V></>} bottom={s.kind==='rectangle'?'12':'36'}/> = <Frac top={<>{u(s.width)} · {u(s.height)}<sup>3</sup></>} bottom={s.kind==='rectangle'?'12':'36'}/></>;
  if(s.kind==='rectangle')jy=<><Frac top={<>{ht}<V sub={index} sup="3">b</V></>} bottom="12"/> = <Frac top={<>{u(s.height)} · {u(s.width)}<sup>3</sup></>} bottom="12"/></>;
  else if(Math.abs(s.apex-s.width/2)<span*1e-12)jy=<><Frac top={<>{ht}<V sub={index} sup="3">b</V></>} bottom="48"/> = <Frac top={<>{u(s.height)} · {u(s.width)}<sup>3</sup></>} bottom="48"/></>;
  else {
   dimensions=<>{dimensions} Координата вершины t = {u(s.apex)} <U unit={unit}/>.</>;
   jy=<><Frac top={<>{b}{ht}(b<sub>{index}</sub><sup>2</sup> − b<sub>{index}</sub>t + t<sup>2</sup>)</>} bottom="36"/> = <Frac top={<>{u(s.width)} · {u(s.height)} · ({u(s.width)}<sup>2</sup> − {u(s.width)} · {u(s.apex)} + {u(s.apex)}<sup>2</sup>)</>} bottom="36"/></>;
   jxy=<><Frac top={<>{b}<V sub={index} sup="2">h</V>(2t − {b})</>} bottom="72"/> = <Frac top={<>{u(s.width)} · {u(s.height)}<sup>2</sup> · (2 · {u(s.apex)} − {u(s.width)})</>} bottom="72"/></>;
  }
 }else if(s.kind==='circle'||s.kind==='semicircle'){
  const semi=s.kind==='semicircle',diameter=2*s.radius;
  dimensions=<>{d} = {u(diameter)} <U unit={unit}/>.</>;
  area=<><Frac top={<>π<V sup="2">d</V></>} bottom={semi?'8':'4'}/> = <Frac top={<>π · {u(diameter)}<sup>2</sup></>} bottom={semi?'8':'4'}/></>;
  jy=<><Frac top={<>π<V sup="4">d</V></>} bottom={semi?'128':'64'}/> = <Frac top={<>π · {u(diameter)}<sup>4</sup></>} bottom={semi?'128':'64'}/></>;
  jx=semi?<><Frac top={<>π<V sup="4">d</V></>} bottom="128"/> − <V sub={index}>A</V>(<Frac top={<>2{d}</>} bottom="3π"/>)<sup>2</sup> = <Frac top={<>π · {u(diameter)}<sup>4</sup></>} bottom="128"/> − {u(local.area,2)} · (<Frac top={<>2 · {u(diameter)}</>} bottom="3π"/>)<sup>2</sup></>:jy;
 }else {
  let v=vertices(s);
  if(v.reduce((sum,q,i)=>sum+cross(q,v[(i+1)%v.length]!),0)<0)v=[...v].reverse();
  dimensions=s.kind==='trapezoid'?<>Основания b = {u(s.width)}, t = {u(s.top)}; h = {u(s.height)}; смещение верхнего основания {u(s.shift)} <U unit={unit}/>.</>:<>Вершины: {v.map((q,i)=><Fragment key={i}>({u(q.x)}; {u(q.y)}){i<v.length-1?'; ':'.'}</Fragment>)} <U unit={unit}/>.</>;
  const cs=v.map((q,i)=>cross(q,v[(i+1)%v.length]!));
  area=<><Frac top={<>Σ c<sub>k</sub></>} bottom="2"/> = <Frac top={u(Math.abs(cs.reduce((a,b)=>a+b,0)),2)} bottom="2"/></>;
  jx=<><Frac top={<>Σ (y<sub>k</sub><sup>2</sup> + y<sub>k</sub>y<sub>k+1</sub> + y<sub>k+1</sub><sup>2</sup>)c<sub>k</sub></>} bottom="12"/> − A<V sub="c" sup="2">y</V></>;
  jy=<><Frac top={<>Σ (x<sub>k</sub><sup>2</sup> + x<sub>k</sub>x<sub>k+1</sub> + x<sub>k+1</sub><sup>2</sup>)c<sub>k</sub></>} bottom="12"/> − A<V sub="c" sup="2">x</V></>;
  jxy=<><Frac top={<>Σ (2x<sub>k</sub>y<sub>k</sub> + x<sub>k</sub>y<sub>k+1</sub> + x<sub>k+1</sub>y<sub>k</sub> + 2x<sub>k+1</sub>y<sub>k+1</sub>)c<sub>k</sub></>} bottom="24"/> − Ax<sub>c</sub>y<sub>c</sub></>;
 }
 return <div className="tb-part">
  <h3>{index}. <em>{primitiveNames[s.kind]}</em> ({p.cut?'вырез':'материал'}).</h3>
  <p>{dimensions} Центр тяжести — точка <V sub={index}>C</V>.</p>
  {(s.kind==='polygon'||s.kind==='trapezoid')&&<p>Обход вершин против часовой стрелки; c<sub>k</sub> = x<sub>k</sub>y<sub>k+1</sub> − x<sub>k+1</sub>y<sub>k</sub>; x<sub>c</sub> = {u(local.cx)}, y<sub>c</sub> = {u(local.cy)} <U unit={unit}/> — координаты центра этой части в её местной системе.</p>}
  <Formula><V sub={index}>A</V> = {area} = {u(local.area,2)} <U unit={unit} power={2}/>;</Formula>
  <Formula>{J(xi)} = {jx} = {u(local.jx,4)} <U unit={unit} power={4}/>;</Formula>
  <Formula>{J(yi)} = {jy} = {u(local.jy,4)} <U unit={unit} power={4}/>;</Formula>
  <Formula>{J(<>{xi}{yi}</>)} = {jxy}{!knownZeroProduct&&<> = {u(local.jxy,4,Math.abs(local.jx)+Math.abs(local.jy))}</>} <U unit={unit} power={4}/>.</Formula>
  {Math.abs(Math.sin(p.angle))>1e-12&&<><p>Часть повёрнута на {textbookNumber(p.angle*180/Math.PI)}°. Моменты относительно осей, параллельных общим x и y:</p>
   <Formula><V sub="x" sup={`(${index})`}>J</V> = {u(part.jx,4)}; <V sub="y" sup={`(${index})`}>J</V> = {u(part.jy,4)}; <V sub="xy" sup={`(${index})`}>J</V> = {u(part.jxy,4,Math.abs(part.jx)+Math.abs(part.jy))} <U unit={unit} power={4}/>.</Formula></>}
 </div>;
}
