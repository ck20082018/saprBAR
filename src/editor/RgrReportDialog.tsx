import { useRef } from "react";
import type { Project } from "../model";
import type { AnalysisSuccess } from "../solver";
import { RgrReport } from "./RgrReport";
import { axialReportData, type RgrOptions } from "./axialReport";
import exportCss from "./rgrReport.css?raw";
import "./rgrReport.css";

export function RgrReportDialog({project,analysis,stale,options,onOptions,onClose,onPrint}:{
  project:Project;analysis:AnalysisSuccess;stale:boolean;options:RgrOptions;
  onOptions:(options:RgrOptions)=>void;onClose:()=>void;onPrint:()=>void;
}){
  const preview=useRef<HTMLDivElement>(null);
  const data=axialReportData(project,analysis);
  const fields=[['institution','Учебное заведение'],['discipline','Дисциплина'],['student','ФИО студента'],['group','Группа'],['teacher','Преподаватель'],['city','Город'],['year','Год'],['tensionMPa','[σ] растяжение, МПа'],['compressionMPa','[σ] сжатие, МПа'],['displacementMM','[u] допустимое, мм (если задано)']] as const;
  const download=()=>{
    if(stale||!data.ok||!preview.current)return;
    const title=project.metadata.title.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
    const html=`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><style>${exportCss}</style></head><body>${preview.current.innerHTML}</body></html>`;
    const url=URL.createObjectURL(new Blob([html],{type:"text/html;charset=utf-8"})),link=document.createElement('a');link.href=url;link.download='RGR-report.html';link.click();setTimeout(()=>URL.revokeObjectURL(url),0);
  };
  return <div className="modal-backdrop"><section className="legacy-dialog rgr-dialog panel" role="dialog" aria-modal="true" aria-labelledby="rgr-title">
    <div className="panel-title"><h2 id="rgr-title">Отчёт РГР</h2><button onClick={onClose}>Закрыть</button></div>
    <div className="legacy-body"><p>Пошаговый расчёт прямого ступенчатого стержня с одной или несколькими заделками и узловыми осевыми силами. Титульные поля и критерии проверки можно заполнить ниже. Они действуют в текущем сеансе; скачанный HTML сохраняет заполненный отчёт.</p>
      <div className="rgr-fields">{fields.map(([key,label])=><label key={key}>{label}<input value={options[key]} onChange={e=>onOptions({...options,[key]:e.target.value})}/></label>)}</div>
      <label><input type="checkbox" checked={options.modulusConfirmed} onChange={e=>onOptions({...options,modulusConfirmed:e.target.checked})}/> Материал и E в модели проверены по условию задания</label>
      <p className="hint">Изменение критериев отчёта не меняет геометрию и материал модели. Чтобы изменить E или площади, закройте отчёт, отредактируйте модель и пересчитайте.</p>
      {stale&&<p className="rgr-note">Модель изменена: пересчитайте её перед выводом отчёта.</p>}
      {!data.ok&&<p className="rgr-note">{data.reason}</p>}
      <div className="rgr-actions"><button className="primary" disabled={stale||!data.ok} onClick={onPrint}>Печать / PDF</button><button disabled={stale||!data.ok} onClick={download}>Скачать HTML</button></div>
      {!stale&&data.ok&&<div className="rgr-preview" ref={preview}><RgrReport project={project} analysis={analysis} options={options}/></div>}
    </div>
  </section></div>;
}
