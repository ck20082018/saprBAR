import {Fragment,type ReactNode} from 'react';
import {propertiesAtAxis} from './calculate';
import {drawingLayout,type DrawingScale} from './SectionDrawing';
import {TextbookSectionDrawing} from './TextbookSectionDrawing';
import {TextbookParts,primitiveNames} from './TextbookParts';
import {V,Frac,Formula,Sum,U} from './TextbookMath';
import {textbookNumber,textbookZero} from './textbookFormat';
import {inUnit,type SectionGeometry,type SectionResult,type Unit} from './types';
import {getLength} from './expressions';

/** Presentation of the existing exact section calculation, following the seven-step reference. */
export function TextbookSectionReport({geometry,result:r,unit,angle=0,scale='fit'}:{geometry:SectionGeometry;result:SectionResult;unit:Unit;angle?:number;scale?:DrawingScale}){
 const layout=drawingLayout(r,scale),span=Math.max(layout.width,layout.height),x0=(layout.x.min+layout.x.max)/2,y0=layout.y.min;
 const u=(v:number,power=1,noiseScale=Math.abs(v))=>textbookNumber(inUnit(v,unit,power),inUnit(noiseScale,unit,power));
 const clean=(v:number,power=1)=>textbookZero(v,span**power);
 const cx=r.cx-x0,cy=r.cy-y0,ai=r.parts.map(p=>p.cy-r.cy),bi=r.parts.map(p=>p.cx-r.cx);
 const allOnY=bi.every(v=>clean(v)===0)&&clean(cx)===0;
 const rotatedParts=r.parts.some(v=>Math.abs(Math.sin(v.part.angle))>1e-12);
 const axesPrincipal=clean(r.jxy,4)===0;
 const p=propertiesAtAxis(r,angle),ax=angle===0?'x':'xθ',ay=angle===0?'y':'yθ';
 const sign=(index:number)=>r.parts[index]!.sign<0?' − ':index===0?'':' + ';
 const terms=(render:(i:number)=>ReactNode)=>r.parts.map((v,i)=><Fragment key={v.part.id}>{sign(i)}{render(i)}</Fragment>);
 const J=(axis:ReactNode,i?:number)=><V sub={axis} {...(i===undefined?{}:{sup:`(${i+1})`})}>J</V>;
 const A=(i:number)=><V sub={i+1}>A</V>;
 const xci=(i:number)=><V sub={<>c<sub>{i+1}</sub></>}>x</V>;
 const yci=(i:number)=><V sub={<>c<sub>{i+1}</sub></>}>y</V>;
 // The reference frame is a report-only translation; input geometry stays untouched.
 const Sx=r.area*cy,Sy=r.area*cx;
 const rounded=(v:number,power=1)=>Number(inUnit(v,unit,power).toFixed(2));
 const printedTerms=r.parts.map((v,i)=>v.sign*rounded(v.area,2)*rounded(ai[i]!));
 const printedResidual=printedTerms.reduce((a,b)=>a+b,0);
 const printedScale=Math.max(...printedTerms.map(Math.abs),1);
 const printedError=Math.abs(printedResidual)/printedScale*100;
 const printingResidual=textbookZero(printedResidual,printedScale);
 return <article className="rgr-document section-report textbook-section-report">
  <h1>Геометрические характеристики сечения</h1>
  <p className="tb-subtitle">{geometry.name}</p>
  {geometry.a!==undefined&&geometry.b!==undefined&&<p>Дано: a = {u(geometry.a)} <U unit={unit}/>; b = {u(geometry.b)} <U unit={unit}/>. {geometry.dimensionRow!==undefined&&<>Строка размеров № {geometry.dimensionRow}.</>}</p>}
  <p className="tb-solution">Решение:</p>
  <section>
   <h2>1. Сечение разобьём на простые части:</h2>
   {r.parts.map((v,i)=><p key={v.part.id}>{i+1} — {primitiveNames[v.part.shape.kind].toLocaleLowerCase('ru')}: {v.part.name} ({v.part.cut?'вырез, знак «−»':'материал, знак «+»'}).</p>)}
   {geometry.parts.flatMap((part,i)=>Object.entries(part.expressions??{}).map(([key,binding])=><p key={`${part.id}:${key}`}>Часть {i+1}, {key}: {binding.text} = {u(getLength(part,key))} <U unit={unit}/>.</p>))}
  </section>
  <section className="tb-drawing-step">
   <h2>2. Вычерчиваем сечение с нанесением местных и центральных осей.</h2>
   <p>Центры тяжести частей обозначаем <V sub="i">C</V>, местные центральные оси — <V sub="i">x</V>, <V sub="i">y</V>. Штриховка показывает материал; незаштрихованные области — вырезы.</p>
   <TextbookSectionDrawing geometry={geometry} result={r} unit={unit} scale={scale}/>
  </section>
  <section>
   <h2>3. Вычисляем геометрические характеристики каждой части.</h2>
   <p>Площади и собственные моменты частей записываем положительными; при суммировании учитываем знак выреза.</p>
   {r.parts.map((v,i)=><TextbookParts key={v.part.id} part={v} index={i+1} unit={unit}/>)}
  </section>
  <section>
   <h2>4. Определяем положение центра тяжести сечения.</h2>
   <p>Начальную ось <V sub="н">x</V> проводим по нижней границе сечения, ось <V sub="н">y</V> — вертикально через середину его габаритной ширины. Координаты отсчитываем от точки O; x направлена вправо, y — вверх.</p>
   <p>Координаты центров тяжести частей в начальной системе:</p>
   <div className="tb-coordinates">{r.parts.map((v,i)=><Formula key={v.part.id}><V sub={i+1}>C</V>: {xci(i)} = {u(v.cx-x0,1,span)}; {yci(i)} = {u(v.cy-y0)} <U unit={unit}/>;</Formula>)}</div>
   <Formula>A = {terms(i=>A(i))} = {terms(i=>u(r.parts[i]!.area,2))} = {u(r.area,2)} <U unit={unit} power={2}/>;</Formula>
   <Formula><V sub="c">x</V> = <Frac top={<V sub="yн">S</V>} bottom="A"/> = <Frac top={terms(i=><>{u(r.parts[i]!.area,2)} · ({u(r.parts[i]!.cx-x0,1,span)})</>)} bottom={u(r.area,2)}/> = {u(cx,1,span)} <U unit={unit}/>;</Formula>
   <Formula><V sub="c">y</V> = <Frac top={<V sub="xн">S</V>} bottom="A"/> = <Frac top={<><Sum count={r.parts.length}/><V sub="i">s</V><V sub="i">A</V><V sub={<>c<sub>i</sub></>}>y</V></>} bottom={<><Sum count={r.parts.length}/><V sub="i">s</V><V sub="i">A</V></>}/>.</Formula>
   <Formula><V sub="c">y</V> = <Frac top={terms(i=><>{u(r.parts[i]!.area,2)} · {u(r.parts[i]!.cy-y0)}</>)} bottom={u(r.area,2)}/> = <Frac top={u(Sx,3)} bottom={u(r.area,2)}/> = {u(cy)} <U unit={unit}/>.</Formula>
   <p>Через центр тяжести C проводим центральные оси xCy. Знак <V sub="i">s</V> равен +1 для материала и −1 для выреза. Новые координаты центров частей:</p>
   {r.parts.map((v,i)=><Formula key={v.part.id}><V sub={i+1}>a</V> = {yci(i)} − <V sub="c">y</V> = {u(v.cy-y0)} − {u(cy)} = {u(ai[i]!)} <U unit={unit}/>; <V sub={i+1}>b</V> = {xci(i)} − <V sub="c">x</V> = {u(v.cx-x0,1,span)} − ({u(cx,1,span)}) = {u(bi[i]!,1,span)} <U unit={unit}/>.</Formula>)}
   <p>Выполним проверку положения центра тяжести:</p>
   <Formula><V sub="x">S</V> = {terms(i=><>{A(i)}<V sub={i+1}>a</V></>)} = {terms(i=><>{u(r.parts[i]!.area,2)} · ({u(ai[i]!)})</>)} ≈ {u(r.centralSx,3,r.area*span)} <U unit={unit} power={3}/>;</Formula>
   <Formula><V sub="y">S</V> = {terms(i=><>{A(i)}<V sub={i+1}>b</V></>)} ≈ {u(r.centralSy,3,r.area*span)} <U unit={unit} power={3}/>.</Formula>
   {printingResidual!==0&&<p>При подстановке напечатанных значений, округлённых до двух знаков, остаток <V sub="x">S</V> составляет {textbookNumber(printingResidual)} <U unit={unit} power={3}/>; относительная невязка к наибольшему слагаемому — {new Intl.NumberFormat('ru-RU',{maximumFractionDigits:3}).format(printedError)} %. Основная проверка выше выполнена без промежуточного округления.</p>}
   {allOnY&&<p>Все центры тяжести частей лежат на оси y, поэтому {r.parts.map((_,i)=><Fragment key={i}><V sub={i+1}>b</V>{i<r.parts.length-1?' = ':' = 0.'}</Fragment>)}</p>}
   {!allOnY&&<p>Относительно начальной оси <V sub="н">y</V>: <V sub="yн">S</V> = {u(Sy,3)} <U unit={unit} power={3}/>; центральная ось y проходит через <V sub="c">x</V> = {u(cx,1,span)} <U unit={unit}/>.</p>}
  </section>
  <section>
   <h2>5. Вычисляем главные моменты инерции и находим положение главных центральных осей.</h2>
   <p>По теореме Гюйгенса — Штейнера{rotatedParts?" (собственные моменты частей предварительно приведены к осям, параллельным x и y)":""}:</p>
   <Formula>{J('x')} = <Sum count={r.parts.length}/><V sub="i">s</V>(<V sub={rotatedParts?'x':<>x<sub>i</sub></>} sup="(i)">J</V> + <V sub="i" sup="2">a</V><V sub="i">A</V>) =</Formula>
   <Formula>= {terms(i=><>({u(r.parts[i]!.jx,4)} + ({u(ai[i]!)})<sup>2</sup> · {u(r.parts[i]!.area,2)})</>)} = {u(r.jx,4)} <U unit={unit} power={4}/>;</Formula>
   <Formula>{J('y')} = <Sum count={r.parts.length}/><V sub="i">s</V>(<V sub={rotatedParts?'y':<>y<sub>i</sub></>} sup="(i)">J</V> + <V sub="i" sup="2">b</V><V sub="i">A</V>) =</Formula>
   <Formula>= {terms(i=><>({u(r.parts[i]!.jy,4)} + ({u(bi[i]!,1,span)})<sup>2</sup> · {u(r.parts[i]!.area,2)})</>)} = {u(r.jy,4)} <U unit={unit} power={4}/>;</Formula>
   <Formula>{J('xy')} = <Sum count={r.parts.length}/><V sub="i">s</V>(<V sub={rotatedParts?'xy':<>x<sub>i</sub>y<sub>i</sub></>} sup="(i)">J</V> + <V sub="i">a</V><V sub="i">b</V><V sub="i">A</V>) =</Formula>
   <Formula>= {terms(i=><>({u(r.parts[i]!.jxy,4,r.jx+r.jy)} + ({u(ai[i]!)}) · ({u(bi[i]!,1,span)}) · {u(r.parts[i]!.area,2)})</>)} = {u(r.jxy,4,r.jx+r.jy)} <U unit={unit} power={4}/>.</Formula>
   {axesPrincipal?<p>Центробежный момент {J('xy')} равен нулю с учётом вычислительной точности. Центральные оси x и y являются главными; поворот исходной пары центральных осей не требуется.</p>:<>
    <Formula><V sub="1,2">J</V> = <Frac top={<>{J('x')} + {J('y')}</>} bottom="2"/> ± √[ (<Frac top={<>{J('x')} − {J('y')}</>} bottom="2"/>)<sup>2</sup> + <V sub="xy" sup="2">J</V> ].</Formula>
    <Formula><V sub="max">θ</V> = ½ atan2(−2{J('xy')}, {J('x')} − {J('y')}) = {textbookNumber(r.angleMax!*180/Math.PI)}°.</Formula>
   </>}
   <Formula><V sub="1">J</V> = <V sub="max">J</V> = {axesPrincipal&&<>{J(r.jy>r.jx?'y':'x')} = </>}{u(r.jmax,4)} <U unit={unit} power={4}/>;</Formula>
   <Formula><V sub="2">J</V> = <V sub="min">J</V> = {axesPrincipal&&<>{J(r.jy>r.jx?'x':'y')} = </>}{u(r.jmin,4)} <U unit={unit} power={4}/>.</Formula>
   {r.angleMax===null&&<p>Главные моменты равны; направление главных осей не единственно.</p>}
  </section>
  <section>
   <h2>6. Найдём квадраты главных радиусов инерции:</h2>
   <Formula><V sub="1" sup="2">i</V> = <Frac top={<V sub="1">J</V>} bottom="A"/> = <Frac top={u(r.jmax,4)} bottom={u(r.area,2)}/> = {u(r.iMax2,2)} <U unit={unit} power={2}/>;</Formula>
   <Formula><V sub="2" sup="2">i</V> = <Frac top={<V sub="2">J</V>} bottom="A"/> = <Frac top={u(r.jmin,4)} bottom={u(r.area,2)}/> = {u(r.iMin2,2)} <U unit={unit} power={2}/>.</Formula>
  </section>
  <section>
   <h2>7. Определим моменты сопротивления сечения.</h2>
   {angle!==0&&<p>Оси для проверки сопротивления повёрнуты на θ = {textbookNumber(angle*180/Math.PI)}° относительно xCy; используются моменты относительно выбранных осей.</p>}
   <p>Для нижних и верхних волокон: <V sub="н">y</V> = {u(p.lower)} <U unit={unit}/>; <V sub="в">y</V> = {u(p.upper)} <U unit={unit}/>.</p>
   <Formula><V sub={ax} sup="н">W</V> = <Frac top={J(ax)} bottom={<V sub="н">y</V>}/> = <Frac top={u(p.j,4)} bottom={u(p.lower)}/> = {u(p.wLower,3)} <U unit={unit} power={3}/>;</Formula>
   <Formula><V sub={ax} sup="в">W</V> = <Frac top={J(ax)} bottom={<V sub="в">y</V>}/> = <Frac top={u(p.j,4)} bottom={u(p.upper)}/> = {u(p.wUpper,3)} <U unit={unit} power={3}/>.</Formula>
   <p>Для левых и правых волокон: <V sub="л">x</V> = {u(p.left)} <U unit={unit}/>; <V sub="п">x</V> = {u(p.right)} <U unit={unit}/>.</p>
   <Formula><V sub={ay} sup="л">W</V> = <Frac top={J(ay)} bottom={<V sub="л">x</V>}/> = <Frac top={u(p.jOther,4)} bottom={u(p.left)}/> = {u(p.wLeft,3)} <U unit={unit} power={3}/>;</Formula>
   <Formula><V sub={ay} sup="п">W</V> = <Frac top={J(ay)} bottom={<V sub="п">x</V>}/> = <Frac top={u(p.jOther,4)} bottom={u(p.right)}/> = {u(p.wRight,3)} <U unit={unit} power={3}/>.</Formula>
  </section>
  <p className="tb-rounding-note">Дробные результаты показаны с двумя знаками; расчёт выполнен без промежуточного округления и с точным π. Малые вычислительные остатки около нуля не выводятся. Подстановка округлённых чисел может дать иной последний знак.</p>
 </article>;
}
