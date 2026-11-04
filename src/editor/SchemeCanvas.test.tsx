import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { SchemeCanvas } from "./SchemeCanvas";
import { LegacyImportDialog } from "../legacy/LegacyImportDialog";
import { importLegacyFiles } from "../legacy/importLegacy";
import { analyzeProject } from "../solver";
import { exampleProject } from "../examples/exampleProject";

it("деформированная схема показывает прогиб между двумя заделками", () => {
  const project = structuredClone(exampleProject);
  project.model.nodes = [{ id: "n1", number: 1, x: 0, y: 0 }, { id: "n2", number: 2, x: 6, y: 0 }];
  project.model.elements = [project.model.elements[0]!];
  project.model.supports = project.model.nodes.map(n => ({ nodeId: n.id, ux: true, uy: true, rz: true }));
  project.loadCases[0]!.nodalLoads = [];
  project.loadCases[0]!.elementLoads = [{ id: "q", elementId: "e1", type: "uniform-local", qx: 0, qy: -2000 }];
  const result = analyzeProject(project);
  if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
  const markup = renderToStaticMarkup(<SchemeCanvas project={project} selection={null} tool="select" snap={false} gridStep={1} elementStart={null} result={result} resultLayer="deformed" deformationScale={100} onSelect={()=>{}} onCreateNode={()=>{}} onCreateElement={()=>{}} onMoveNode={()=>{}}/>);
  expect(markup).not.toMatch(/NaN|Infinity/);
  const points = markup.match(/class="deformed" points="([^"]+)"/)![1]!.split(" ").map(p => p.split(",").map(Number));
  expect(points).toHaveLength(21);
  expect(points[0]![1]).toBeCloseTo(280, 10);
  expect(points.at(-1)![1]).toBeCloseTo(280, 10);
  // Independent fixed-fixed beam oracle, SVG Y points downward, scale = 660/6 px/m.
  const section = project.model.sections[0]!, material = project.model.materials[0]!;
  const sag = 2000 * 6 ** 4 / (384 * material.elasticModulus * section.inertiaZ);
  expect(points[10]![1]).toBeCloseTo(280 + sag * 100 * 110, 9);
});

it("вписывает Иванова в SVG и замыкает эпюры на ось стержня", () => {
  const file=(ext:string)=>({name:`IVANOV_SI.${ext}`,text:readFileSync(new URL(`../../tests/fixtures/ivanov-corrected/IVANOV_SI.${ext}`,import.meta.url),"utf8")});
  const imported=importLegacyFiles(file("CN"),file("LD"),file("MD"),{variant:"B",unitSystem:"SI"});
  if(!imported.ok) throw new Error("Ошибка комплекта");
  const result=analyzeProject(imported.project); if(!result.ok) throw new Error("Ошибка расчёта");
  const markup=renderToStaticMarkup(<SchemeCanvas project={imported.project} selection={null} tool="select" snap={false} gridStep={1} elementStart={null} result={result} resultLayer="axial" deformationScale={1} onSelect={()=>{}} onCreateNode={()=>{}} onCreateElement={()=>{}} onMoveNode={()=>{}}/>);
  expect(markup).not.toMatch(/NaN|Infinity/);
  expect(markup).toContain('cx="120"'); expect(markup).toContain('cx="780"');
  const diagrams=[...markup.matchAll(/class="diagram axial" points="([^"]+)"/g)].map(m=>m[1]!.split(" "));
  expect(diagrams).toHaveLength(4);
  diagrams.forEach(points=>{expect(points[0]!.split(",")[1]).toBe("280");expect(points.at(-1)!.split(",")[1]).toBe("280");});
  expect(markup).toContain('>60</text>'); expect(markup).toContain('>90</text>');
});

it("не разрешает проверку импорта до выбора единиц", () => {
  const markup=renderToStaticMarkup(<LegacyImportDialog onApply={()=>{}} onClose={()=>{}}/>);
  expect(markup).toContain('<option value="" disabled="" selected="">Выберите единицы</option>');
  expect(markup).toContain('disabled="">Проверить комплект');
});

it.each([0, Math.PI/2, Math.PI/4])("эпюра следует стержню при угле %s, ординаты перпендикулярны его оси", (angle) => {
  const file=(ext:string)=>({name:`IVANOV_SI.${ext}`,text:readFileSync(new URL(`../../tests/fixtures/ivanov-corrected/IVANOV_SI.${ext}`,import.meta.url),"utf8")});
  const imported=importLegacyFiles(file("CN"),file("LD"),file("MD"),{variant:"B",unitSystem:"SI"});
  if(!imported.ok) throw new Error("Ошибка комплекта");
  const result=analyzeProject(imported.project); if(!result.ok) throw new Error("Ошибка расчёта");
  // Rotate the displayed geometry and preserve local axial values: this tests
  // the renderer's transform independently from the already tested solver.
  imported.project.model.nodes.forEach(n=>{const x=n.x;n.x=x*Math.cos(angle);n.y=x*Math.sin(angle);});
  const markup=renderToStaticMarkup(<SchemeCanvas project={imported.project} selection={null} tool="select" snap={false} gridStep={1} elementStart={null} result={result} resultLayer="axial" deformationScale={1} onResultLayer={()=>{}} onSelect={()=>{}} onCreateNode={()=>{}} onCreateElement={()=>{}} onMoveNode={()=>{}}/>);
  expect(markup).toContain('Эпюры вдоль стержней');
  expect(markup).not.toContain('class="load nodal"');
  const curve=markup.match(/class="diagram axial" points="([^"]+)"/)![1]!.split(" ").map(p=>p.split(",").map(Number));
  const a=curve[0]!,b=curve.at(-1)!,offset=curve[1]!;
  const tangent=[b[0]!-a[0]!,b[1]!-a[1]!];
  const normal=[offset[0]!-a[0]!,offset[1]!-a[1]!];
  expect(tangent[0]!*normal[0]!+tangent[1]!*normal[1]!).toBeCloseTo(0,7);
  expect(Math.hypot(...normal)).toBeCloseTo(60000/90000*70,7);
  const last=curve.at(-2)!;
  expect(last[0]!-b[0]!).toBeCloseTo(normal[0]!,7);
  expect(last[1]!-b[1]!).toBeCloseTo(normal[1]!,7);
});
