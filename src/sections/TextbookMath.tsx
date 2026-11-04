import type {ReactNode} from 'react';

export function V({children,sub,sup}:{children:ReactNode;sub?:ReactNode;sup?:ReactNode}) {
  return <span className="tb-var"><i>{children}</i>{sub!==undefined&&<sub>{sub}</sub>}{sup!==undefined&&<sup>{sup}</sup>}</span>;
}
export function Frac({top,bottom}:{top:ReactNode;bottom:ReactNode}) {
  return <span className="tb-frac"><span>{top}</span><span>{bottom}</span></span>;
}
export function Formula({children}:{children:ReactNode}) {
  return <div className="tb-formula">{children}</div>;
}
export function Sum({count}:{count:number}) {
  return <span className="tb-sum"><span>{count}</span><span>∑</span><span><i>i</i> = 1</span></span>;
}
export function U({unit,power=1}:{unit:string;power?:number}) {
  const label=({cm:'см',mm:'мм',m:'м'} as Record<string,string>)[unit]??unit;
  return <span className="tb-unit">{label}{power>1&&<sup>{power}</sup>}</span>;
}
