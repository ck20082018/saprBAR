import type { AnalysisResult } from "../solver";
import type { ResultLayer } from "./SchemeCanvas";

interface Props {
  analysis: AnalysisResult | null;
  stale: boolean;
  layer: ResultLayer;
  deformationScale: number;
  onLayer: (layer: ResultLayer) => void;
  onDeformationScale: (value: number) => void;
}

const f = (value: number) => value.toExponential(5);

export function ResultsPanel({ analysis, stale, layer, deformationScale, onLayer, onDeformationScale }: Props) {
  return <section className={`results-dock panel ${stale ? "stale" : ""}`}>
    <div className="panel-title"><h2>Результаты</h2>{analysis?.ok && <span>{analysis.solverVersion}</span>}</div>
    {!analysis && <div className="results-empty">Выполните расчёт корректной модели. Результаты показываются только после успешного решения.</div>}
    {analysis && !analysis.ok && <div className="result-error"><strong>Расчёт не выполнен</strong><ul>{analysis.diagnostics.map((item,index)=><li key={index}>{item.message}{item.nodeId ? ` Объект: ${item.nodeId}, DOF: ${item.dof}.` : ""}</li>)}</ul></div>}
    {analysis?.ok && <>
      {stale && <div className="stale-banner">Результаты неактуальны: модель изменена. Пересчитайте схему.</div>}
      <div className="result-controls">
        <button className={layer==="none"?"active":""} onClick={()=>onLayer("none")}>Таблицы</button>
        <button className={layer==="deformed"?"active":""} onClick={()=>onLayer("deformed")}>Деформации</button>
        <button className={layer==="axial"?"active":""} onClick={()=>onLayer("axial")}>N, кН</button>
        <button className={layer==="shear"?"active":""} onClick={()=>onLayer("shear")}>Q, кН</button>
        <button className={layer==="moment"?"active":""} onClick={()=>onLayer("moment")}>M, кН·м</button>
        {layer==="deformed" && <label>Масштаб перемещений × <input type="number" min="0" step="10" value={deformationScale} onChange={(e)=>onDeformationScale(e.target.valueAsNumber)}/></label>}
      </div>
      <div className="results-tables">
        <div><h3>Перемещения</h3><table><thead><tr><th>Узел</th><th>Ux, м</th><th>Uy, м</th><th>Rz, рад</th></tr></thead><tbody>{analysis.displacements.map((item)=><tr key={item.nodeId}><td>{item.nodeId}</td><td>{f(item.ux)}</td><td>{f(item.uy)}</td><td>{f(item.rz)}</td></tr>)}</tbody></table></div>
        <div><h3>Реакции</h3><table><thead><tr><th>Узел</th><th>Rx, кН</th><th>Ry, кН</th><th>Mz, кН·м</th></tr></thead><tbody>{analysis.reactions.map((item)=><tr key={item.nodeId}><td>{item.nodeId}</td><td>{f(item.fx/1000)}</td><td>{f(item.fy/1000)}</td><td>{f(item.mz/1000)}</td></tr>)}</tbody></table></div>
        <div><h3>Концевые действия узлов на элементы</h3><table><thead><tr><th>Элемент</th><th>Fxᵢ</th><th>Fyᵢ</th><th>Mᵢ</th><th>Fxⱼ</th><th>Fyⱼ</th><th>Mⱼ</th></tr></thead><tbody>{analysis.elements.map((item)=><tr key={item.elementId}><td>{item.elementId}</td>{item.localNodeActions.map((value,index)=><td key={index}>{f(value/1000)}</td>)}</tr>)}</tbody></table><p className="table-note">Силы — кН, моменты — кН·м. Это действия узлов на элемент; действия элемента на узлы имеют обратный знак.</p></div>
      </div>
      <div className="sign-rules">Знаки: N&gt;0 — растяжение; dM/dx=Q; M&gt;0 растягивает нижнее волокно; +Rz и +Mz — против часовой стрелки. Остаток равновесия: {analysis.equilibrium.relativeResidual.toExponential(3)}.</div>
    </>}
  </section>;
}
