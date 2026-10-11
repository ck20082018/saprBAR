// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {Blob as NativeBlob} from 'node:buffer';
import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import {SectionCalculator} from './SectionCalculator';
import {NumberFormatProvider} from '../display/NumberFormat';
import type {Section} from '../model';
import type {SectionGeometry} from './types';
let root:Root,downloaded:NativeBlob|null;
const used=vi.fn<(s:Section)=>void>(),draft=vi.fn<(g:SectionGeometry)=>void>(),printed=vi.fn();
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
const button=(text:string)=>[...document.querySelectorAll('button')].find(b=>b.textContent===text)!;
const select=(label:string)=>document.querySelector<HTMLSelectElement>(`select[aria-label="${label}"]`)!;
async function click(text:string){await act(async()=>button(text).click());}
async function change(el:HTMLInputElement|HTMLSelectElement,value:string){await act(async()=>{Object.getOwnPropertyDescriptor(el instanceof HTMLInputElement?HTMLInputElement.prototype:HTMLSelectElement.prototype,'value')!.set!.call(el,value);el.dispatchEvent(new Event(el instanceof HTMLInputElement?'input':'change',{bubbles:true}));});}
beforeEach(async()=>{
 document.body.innerHTML='<div id="section-test"></div>';downloaded=null;used.mockClear();draft.mockClear();printed.mockClear();
 vi.stubGlobal('Blob',NativeBlob);
 URL.createObjectURL=vi.fn((blob)=>{downloaded=blob as unknown as NativeBlob;return 'blob:section-test';});URL.revokeObjectURL=vi.fn();
 vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{});
 root=createRoot(document.getElementById('section-test')!);await act(async()=>root.render(<NumberFormatProvider places={3}><SectionCalculator onClose={()=>{}} onDraft={draft} onUse={used} onPrint={printed}/></NumberFormatProvider>));
});
afterEach(async()=>{await act(async()=>root.unmount());vi.restoreAllMocks();vi.unstubAllGlobals();});
it('catalog→independent row→calculate→edit→save/open→transfer→report',async()=>{
 expect(select('Схема сечения').value).toBe('19');expect(select('Строка размеров').value).toBe('19');
 await change(select('Строка размеров'),'4');expect(select('Схема сечения').value).toBe('19');
 await click('Рассчитать сечение');expect(document.querySelector('.section-report')).not.toBeNull();
 await change(document.querySelector<HTMLInputElement>('input[aria-label="Размер a"]')!,'55,25');expect(document.querySelector('.section-report')).toBeNull();
 await click('Рассчитать сечение');await click('Сохранить сечение');
 const saved=JSON.parse(await downloaded!.text());expect(saved.geometry.scheme).toBe(19);expect(saved.geometry.dimensionRow).toBe(4);expect(saved.geometry.a).toBeCloseTo(.5525,14);
 await change(select('Схема сечения'),'1');
 const file=document.querySelector<HTMLInputElement>('input[type=file]')!;Object.defineProperty(file,'files',{value:[{name:'section.saprsection.json',text:async()=>JSON.stringify(saved)}],configurable:true});
 await act(async()=>file.dispatchEvent(new Event('change',{bubbles:true})));expect(select('Схема сечения').value).toBe('19');expect(select('Строка размеров').value).toBe('4');
 expect(document.querySelector('.section-report')).toBeNull();await click('Рассчитать сечение');
 const confirm=[...document.querySelectorAll('label')].find(l=>l.textContent?.includes('Подтверждаю'))!.querySelector('input')!;
 expect(button('Использовать сечение в проекте').disabled).toBe(true);await act(async()=>confirm.click());await click('Использовать сечение в проекте');
 expect(used).toHaveBeenCalledTimes(1);expect(used.mock.calls[0]![0].calculator!.geometry).toEqual(saved.geometry);
 await click('Печать сечения / A4');expect(printed).toHaveBeenCalledTimes(1);
 await change(document.querySelector<HTMLInputElement>('input[aria-label="Размер b"]')!,'15');expect(document.querySelector('.section-report')).toBeNull();
});
it('unconfirmed template explains missing geometry and cannot calculate',async()=>{
 await change(select('Схема сечения'),'20');expect(document.querySelector('[role=alert]')!.textContent).toContain('радиус');
 expect(button('Рассчитать сечение').disabled).toBe(true);expect(document.querySelector('.section-report')).toBeNull();
});
it('physical scale blocks oversized A4 and changing units preserves geometry',async()=>{
 await click('Рассчитать сечение');const original=draft.mock.calls.length;
 await change(select('Единицы сечения'),'mm');expect(draft.mock.calls.length).toBe(original);expect(document.querySelector('.section-report')).not.toBeNull();
 const scale=[...document.querySelectorAll('label')].find(l=>l.textContent?.startsWith('Масштаб чертежа'))!.querySelector('select')!;
 await change(scale,'2');expect(button('Печать сечения / A4').disabled).toBe(true);await change(scale,'fit');expect(button('Печать сечения / A4').disabled).toBe(false);
});
