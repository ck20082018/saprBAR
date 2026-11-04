// @vitest-environment jsdom
import {expect,it} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import {calculateSection,propertiesAtAxis} from './calculate';
import {catalogSection,textbookExample} from './catalog';
import {SectionReport} from './SectionReport';
import {NumberFormatProvider} from '../display/NumberFormat';
import {textbookNumber,textbookZero} from './textbookFormat';
import type {SectionGeometry} from './types';
const dom=(markup:string)=>{const d=document.implementation.createHTMLDocument();d.body.innerHTML=markup;return d;};
const norm=(text:string)=>text.replace(/\s+/g,' ');
const render=(geometry:SectionGeometry,angle=0)=>renderToStaticMarkup(<SectionReport geometry={geometry} result={calculateSection(geometry)} unit="cm" textbook angle={angle}/>);

it('семь шагов и индексы/дроби учебного отчёта используют актуальные значения схемы 27',()=>{
 const file=JSON.parse(readFileSync('tests/fixtures/section27.saprsection.json','utf8'));
 const snapshot=JSON.stringify(file),markup=render(file.geometry),doc=dom(markup);
 expect([...doc.querySelectorAll('h2')].map(h=>h.textContent![0])).toEqual(['1','2','3','4','5','6','7']);
 expect(doc.querySelectorAll('.tb-frac').length).toBeGreaterThan(15);
 expect(doc.querySelector('.tb-var sub')!.textContent).toBeTruthy();
 expect(doc.querySelector('.tb-var sup')!.textContent).toBe('(1)');
 const text=norm(doc.body.textContent!);
 for(const value of ['4 080','22,80','777 484,80','4 166 224','34 100,21','30 852,57','81 690,67'])expect(text).toContain(value);
 expect(text).not.toMatch(/10⁻|NaN|Infinity|3 %/);
 expect(doc.querySelector('path[fill-rule="evenodd"]')).not.toBeNull();
 expect(markup).toContain('b = 12');expect(markup).toContain('a = 34');
 expect(JSON.stringify(file)).toBe(snapshot);
});
it('учебное округление использует запятую, группы, два знака и сохраняет малые ненулевые величины',()=>{
 expect(norm(textbookNumber(2531629.7))).toBe('2 531 629,70');
 expect(textbookNumber(20.17)).toBe('20,17');expect(textbookNumber(22.8)).toBe('22,80');
 expect(textbookNumber(-4.8)).toBe('−4,80');expect(textbookNumber(-0)).toBe('0');
 expect(textbookNumber(4080+1e-12)).toBe('4\u00a0080');
 expect(textbookZero(1e-17,1)).toBe(0);
 expect(textbookNumber(1e-17)).not.toBe('0');
 expect(textbookNumber(1e-17,1)).toBe('0');
});
it('π и расчёт остаются точными, значения методички с π=3.14 не подставляются',()=>{
 const g=textbookExample(),r=calculateSection(g),snapshot=JSON.stringify({g,r});
 const doc=dom(render(g)),text=norm(doc.body.textContent!);
 expect(text).toContain('353,43');expect(text).not.toContain('353,25');
 expect(text).toContain('По теореме Гюйгенса');
 expect(r.parts[2]!.area).toBeCloseTo(Math.PI*.15**2/2,14);
 expect(JSON.stringify({g,r})).toBe(snapshot);
});
it('новая геометрия меняет ответ, и выбор оси меняет W',()=>{
 const g=catalogSection(27,.34,.12,4),before=render(g),larger=catalogSection(27,.4,.12,4);
 expect(render(larger)).not.toBe(before);
 const text=norm(dom(render(g,Math.PI/2)).body.textContent!);
 expect(text).toContain(norm(textbookNumber(propertiesAtAxis(calculateSection(g),Math.PI/2).wLower/1e-6)));
 expect(text).toContain('90°');
});
it('положительный малый момент тонкого прямоугольника не превращается в ноль',()=>{
 const g:SectionGeometry={version:1,name:'thin',parts:[{id:'r',name:'r',cut:false,x:0,y:0,angle:0,shape:{kind:'rectangle',width:1,height:1e-5}}]};
 const doc=dom(render(g));
 expect(doc.querySelectorAll('.tb-part .tb-formula')[1]!.textContent).not.toMatch(/= 0 см/);
});
it('учебные два знака независимы от настройки точности прежних отчётов',()=>{
 const g=catalogSection(27,.34,.12),r=calculateSection(g);
 const at=(places:number)=>renderToStaticMarkup(<NumberFormatProvider places={places}><SectionReport geometry={g} result={r} unit="cm" textbook/></NumberFormatProvider>);
 expect(at(0)).toBe(at(8));
});
it('повёрнутая асимметричная часть не объявляется симметричной, индексы и знаки сохранены',()=>{
 const g:SectionGeometry={version:1,name:'triangle',parts:[{id:'t',name:'t',cut:false,x:1,y:0,angle:.2,shape:{kind:'triangle',width:2,height:3,apex:0}}]};
 const text=dom(render(g)).body.textContent!;
 expect(text).toContain('atan2');expect(text).not.toContain('поворот исходной пары центральных осей не требуется');
 expect(text).toContain('повёрнута');
});
