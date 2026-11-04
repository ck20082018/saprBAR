// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {URL as NodeURL} from 'node:url';
import App from '../App';
import {exampleProject} from '../examples/exampleProject';
import {calculateSection} from '../sections/calculate';
const fixture=readFileSync(new NodeURL('../../tests/fixtures/section27.saprsection.json',import.meta.url),'utf8');
let root:Root;
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
beforeEach(async()=>{
 document.body.innerHTML='<div id="app-test"></div>';
 root=createRoot(document.getElementById('app-test')!);
 await act(async()=>root.render(<App/>));
});
afterEach(async()=>{await act(async()=>root.unmount());vi.restoreAllMocks();});
async function open(source:string){
 const file=document.querySelector<HTMLInputElement>('.file-actions input[type=file]')!;
 Object.defineProperty(file,'files',{value:[{name:'section27.json',text:async()=>source}],configurable:true});
 await act(async()=>file.dispatchEvent(new Event('change',{bubbles:true})));
}
it('основная кнопка JSON открывает сечение 27 и рассчитывает его без замены стержневого проекта',async()=>{
 await open(fixture);
 expect(document.querySelector('.message')!.textContent).toContain('Открыто сечение');
 expect(document.querySelector<HTMLSelectElement>('select[aria-label="Схема сечения"]')!.value).toBe('27');
 expect(document.querySelector<HTMLSelectElement>('select[aria-label="Строка размеров"]')!.value).toBe('4');
 expect(document.querySelector<HTMLInputElement>('.project-title')!.value).toBe(exampleProject.metadata.title);
 const calculate=[...document.querySelectorAll('button')].find(b=>b.textContent==='Рассчитать сечение')!;
 await act(async()=>calculate.click());
 const report=document.querySelector('.section-report')!.textContent!.replace(/\s/g,'');
 expect(report).toContain('4080');expect(report).toContain('777484,8');expect(report).toContain('4166224');
 const r=calculateSection(JSON.parse(fixture).geometry);
 expect(r.area).toBeCloseTo(.408,12);expect(r.cy).toBeCloseTo(.228,12);
});
it.each(['{"format":"saprbar-section","version":2}',JSON.stringify({format:'saprbar-section',version:1,geometry:{}})])('повреждённое или неподдерживаемое сечение явно отклоняется: %s',async source=>{
 await open(source);
 expect(document.querySelector('.message')!.textContent).toContain('Файл не открыт:');
 expect(document.querySelector('.section-calculator')).toBeNull();
});
it('проект по-прежнему открывается через основную кнопку',async()=>{
 const p=structuredClone(exampleProject);p.metadata.title='Проверка старого проекта';
 await open(JSON.stringify(p));
 expect(document.querySelector<HTMLInputElement>('.project-title')!.value).toBe(p.metadata.title);
 expect(document.querySelector('.section-calculator')).toBeNull();
});
