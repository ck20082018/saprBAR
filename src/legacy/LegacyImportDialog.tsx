import { useState, type ChangeEvent } from "react";
import type { Project } from "../model";
import { importLegacyFiles } from "./importLegacy";
import type { LegacyImportResult, LegacyUnitSystem, LegacyVariant } from "./types";
import { createBlankLegacySet, createLegacyTemplate, type LegacyEditableSet } from "./templates";

interface Props { initialFiles?:LegacyEditableSet|undefined; initialVariant?:LegacyVariant|undefined; initialUnitSystem?:LegacyUnitSystem|undefined; onApply:(project:Project)=>void; onClose:()=>void }
const kinds=["CN","LD","MD"] as const;

function downloadLegacyFile(name:string,text:string):void {
  const blob=new Blob([text],{type:"text/plain;charset=utf-8"});
  const url=URL.createObjectURL(blob);const anchor=document.createElement("a");anchor.href=url;anchor.download=name;anchor.click();URL.revokeObjectURL(url);
}

export function LegacyImportDialog({initialFiles,initialVariant="B",initialUnitSystem="mm-kN-MPa",onApply,onClose}:Props) {
  const [files,setFiles]=useState<LegacyEditableSet>(()=>initialFiles??createBlankLegacySet());const [variant,setVariant]=useState<LegacyVariant>(initialVariant);const [unitSystem,setUnitSystem]=useState<LegacyUnitSystem>(initialUnitSystem);const [result,setResult]=useState<LegacyImportResult|null>(null);
  const pick=(kind:"CN"|"LD"|"MD")=>async(e:ChangeEvent<HTMLInputElement>)=>{const file=e.target.files?.[0];e.target.value="";if(file){const bytes=await file.arrayBuffer();let text:string;try{text=new TextDecoder("ibm866",{fatal:true}).decode(bytes);}catch{text=new TextDecoder().decode(bytes);}setFiles(x=>({...x,[kind]:{name:file.name,text}}));setResult(null);}};
  const update=(kind:"CN"|"LD"|"MD",patch:Partial<LegacyEditableSet[typeof kind]>)=>{setFiles(current=>({...current,[kind]:{...current[kind],...patch}}));setResult(null);};
  const inspect=()=>setResult(importLegacyFiles(files.CN,files.LD,files.MD,{variant,unitSystem}));
  const loadTemplate=()=>{setFiles(createLegacyTemplate(variant));setResult(null);};
  const clear=()=>{if(window.confirm("Очистить тексты CN, LD и MD?")){setFiles(createBlankLegacySet());setResult(null);}};
  return <div className="modal-backdrop"><section className="legacy-dialog panel" role="dialog" aria-modal="true" aria-labelledby="legacy-title"><div className="panel-title"><h2 id="legacy-title">Редактор CN / LD / MD</h2><button onClick={onClose}>Закрыть</button></div><div className="legacy-body">
    <p className="legacy-caution"><strong>Ограничение доказательств.</strong> Проверяется текстовый профиль по HELP_30B/R. Реальных файлов SAPR-BAR в архиве нет; совместимость с оригинальной программой не подтверждена.</p>
    <div className="legacy-options"><label>Вариант XC <select value={variant} onChange={e=>{setVariant(e.target.value as LegacyVariant);setResult(null);}}><option value="B">B — 10 полей</option><option value="R">R — 11 полей + SC</option></select></label><label>Единицы исходных чисел <select value={unitSystem} onChange={e=>{setUnitSystem(e.target.value as LegacyUnitSystem);setResult(null);}}><option value="mm-kN-MPa">мм, кН, МПа</option><option value="SI">м, Н, Па</option></select></label></div>
    <p className="hint">Единицы справкой не заданы. Выбор обязателен для переноса в современную SI-модель. Тексты сохраняются без автоматического пересчёта единиц.</p>
    <div className="legacy-editor-actions"><button onClick={loadTemplate}>Создать синтетический пример {variant}</button><button onClick={clear}>Новый пустой комплект</button><button className="primary" onClick={inspect}>Проверить комплект</button></div>
    <div className="legacy-editors">{kinds.map(kind=><section key={kind} className="legacy-file-editor"><div className="legacy-file-head"><strong>{kind}</strong><label>Имя файла <input value={files[kind].name} onChange={e=>update(kind,{name:e.target.value})}/></label><label className="legacy-file-picker">Открыть<input type="file" accept={`.${kind.toLowerCase()},.${kind},text/plain`} onChange={pick(kind)}/></label><button onClick={()=>downloadLegacyFile(files[kind].name||`model.${kind}`,files[kind].text)}>Скачать {kind}</button></div><textarea aria-label={`Текст ${kind}`} spellCheck={false} value={files[kind].text} onChange={e=>update(kind,{text:e.target.value})} placeholder={`Введите записи ${kind} по одной на строку`}/><small>{files[kind].text.split(/\r?\n/).filter(line=>line.trim()).length} непустых строк</small></section>)}</div>
    {result&&!result.ok&&<div className="import-errors"><h3>Импорт невозможен</h3><ul>{result.issues.map((x,i)=><li key={i}><strong>{x.file}, строка {x.line||"?"}, {x.field}:</strong> {x.message}</li>)}</ul></div>}
    {result?.ok&&<div className="import-preview"><h3>Предварительный отчёт</h3><p>{result.report.compatibilityStatement}</p><dl><dt>Узлы</dt><dd>{result.report.counts.nodes}</dd><dt>Стержни</dt><dd>{result.report.counts.elements}</dd><dt>Типы свойств</dt><dd>{result.report.counts.propertyTypes}</dd><dt>Опоры</dt><dd>{result.report.counts.supports}</dd><dt>Узловые нагрузки</dt><dd>{result.report.counts.nodalLoads}</dd><dt>Стержневые нагрузки</dt><dd>{result.report.counts.elementLoads}</dd></dl><h4>Принятые допущения</h4><ul>{result.report.assumptions.map(x=><li key={x}>{x}</li>)}</ul>{result.report.warnings.length>0&&<><h4>Предупреждения</h4><ul>{result.report.warnings.map((x,i)=><li key={i}>{x.file}:{x.line} {x.field} — {x.message}</li>)}</ul></>}{result.report.blockers.length>0&&<div className="blocked"><strong>Расчёт будет заблокирован</strong><ul>{result.report.blockers.map((x,i)=><li key={i}>{x.file}:{x.line} {x.field} — {x.message}</li>)}</ul></div>}<button className="primary" onClick={()=>onApply(result.project)}>Применить импортированную модель</button></div>}
  </div></section></div>;
}
