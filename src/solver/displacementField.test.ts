import { expect, it } from "vitest";
import { solveLinearStatic } from "./solve";
import type { AnalysisInput, AnalysisSuccess } from "./types";

// Independent closed-form solutions and tolerances: docs/solver-verification.md §7.
const E = 210e9, A = 0.02, I = 8e-6, L = 5;
function cantilever(angle = 0): AnalysisInput {
  return {
    nodes: [{ id: "i", x: 0, y: 0 }, { id: "j", x: L * Math.cos(angle), y: L * Math.sin(angle) }],
    elements: [{ id: "e", nodeI: "i", nodeJ: "j", elasticModulus: E, area: A, inertiaZ: I, yMinus: 0.1, yPlus: 0.1, releases: { rotationI: false, rotationJ: false } }],
    supports: [{ nodeId: "i", ux: true, uy: true, rz: true }],
    nodalLoads: [], uniformLoads: [], singularityTolerance: 1e-12
  };
}
function solve(input: AnalysisInput): AnalysisSuccess {
  const result = solveLinearStatic(input);
  if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
  expect(result.equilibrium.relativeResidual).toBeLessThan(1e-10);
  return result;
}
function near(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(Math.max(1e-12, Math.abs(expected) * 1e-9));
}

it.each([0, Math.PI / 2, Math.atan2(4, 3)])("поля u/v и концевые DOF под qx/qy при угле %s", angle => {
  const input = cantilever(angle), qx = 1700, w = 2300;
  input.uniformLoads = [{ elementId: "e", qx, qy: -w }];
  const result = solve(input), element = result.elements[0]!;
  for (const p of element.diagram) {
    near(p.axialDisplacement, qx * p.x * (2 * L - p.x) / (2 * E * A));
    near(p.transverseDisplacement, -w * p.x ** 2 * (6 * L ** 2 - 4 * L * p.x + p.x ** 2) / (24 * E * I));
  }
  const last = element.diagram.at(-1)!, node = result.displacements[1]!;
  near(last.axialDisplacement, element.localDisplacements[3]);
  near(last.transverseDisplacement, element.localDisplacements[4]);
  near(node.ux, Math.cos(angle) * last.axialDisplacement - Math.sin(angle) * last.transverseDisplacement);
  near(node.uy, Math.sin(angle) * last.axialDisplacement + Math.cos(angle) * last.transverseDisplacement);
});

it("двухсторонняя заделка: ненулевой прогиб при нулевых концевых DOF", () => {
  const input = cantilever(), w = 2300;
  input.supports.push({ nodeId: "j", ux: true, uy: true, rz: true });
  input.uniformLoads = [{ elementId: "e", qx: 0, qy: -w }];
  const result = solve(input);
  for (const p of result.elements[0]!.diagram) {
    near(p.transverseDisplacement, -w * p.x ** 2 * (L - p.x) ** 2 / (24 * E * I));
  }
  near(result.reactions[0]!.fy, w * L / 2);
  near(result.reactions[1]!.fy, w * L / 2);
});

it("полевые перемещения подчиняются суперпозиции силы, момента и qx/qy", () => {
  const a = cantilever(), b = cantilever();
  a.nodalLoads = [{ nodeId: "j", fx: 7000, fy: -1300, mz: 400 }];
  b.uniformLoads = [{ elementId: "e", qx: -500, qy: -2300 }];
  const combined = structuredClone(a);
  combined.uniformLoads = b.uniformLoads;
  const ra = solve(a), rb = solve(b), rc = solve(combined);
  rc.elements[0]!.diagram.forEach((p, i) => {
    near(p.axialDisplacement, ra.elements[0]!.diagram[i]!.axialDisplacement + rb.elements[0]!.diagram[i]!.axialDisplacement);
    near(p.transverseDisplacement, ra.elements[0]!.diagram[i]!.transverseDisplacement + rb.elements[0]!.diagram[i]!.transverseDisplacement);
  });
});

it("переполнение восстановления поля возвращает явный неуспех", () => {
  const input = cantilever();
  input.nodes[1]!.x = 1e80;
  input.elements[0]!.elasticModulus = 1e200;
  input.elements[0]!.area = 1;
  input.elements[0]!.inertiaZ = 1;
  input.supports.push({ nodeId: "j", ux: true, uy: true, rz: true });
  input.uniformLoads = [{ elementId: "e", qx: 0, qy: -1e-100 }];
  const result = solveLinearStatic(input);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.diagnostics[0]!.code).toBe("NUMERICAL_FAILURE");
  expect(result).not.toHaveProperty("elements");
});
