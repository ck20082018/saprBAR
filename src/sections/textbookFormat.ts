import {formatNumber} from '../display/formatNumber';

/** Presentation only. A scale-relative binary64 roundoff envelope, not a solver tolerance. */
export function textbookZero(value:number,scale:number):number {
  return Math.abs(value)<=128*Number.EPSILON*Math.abs(scale)?0:value;
}
export function textbookNumber(value:number,scale=Math.abs(value)):string {
  const clean=textbookZero(value,scale);
  if(!Number.isFinite(clean))return '—';
  if(clean===0)return '0';
  // Preserve genuinely small nonzero quantities instead of printing a false zero.
  if(Math.abs(clean)<.005||Math.abs(clean)>=1e12)return formatNumber(clean,2);
  const integer=Math.round(clean);
  const digits=Math.abs(clean-integer)<=128*Number.EPSILON*Math.max(Math.abs(clean),Math.abs(scale))?0:2;
  return new Intl.NumberFormat('ru-RU',{minimumFractionDigits:digits,maximumFractionDigits:digits,useGrouping:true}).format(clean).replace(/^-/, '−');
}
