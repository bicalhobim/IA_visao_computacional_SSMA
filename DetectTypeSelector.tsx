/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// Copyright 2024 Lucas Bicalho, PMP

// Licenciado sob a Licença Apache, Versão 2.0 (a "Licença");
// você não pode usar este arquivo exceto em conformidade com a Licença.
// Você pode obter uma cópia da Licença em

//     https://www.apache.org/licenses/LICENSE-2.0

// A menos que exigido pela lei aplicável ou acordado por escrito, o software
// distribuído sob a Licença é distribuído "COMO ESTÁ",
// SEM GARANTIAS OU CONDIÇÕES DE QUALQUER TIPO, expressas ou implícitas.
// Consulte a Licença para o idioma específico que governa as permissões e
// limitações sob a Licença.

import {useAtom} from 'jotai/react';
import {DetectTypeAtom} from './atoms';
import {DetectTypes} from './Types';
import {useResetState} from './hooks';

const optionsConfig: Record<DetectTypes, { icon: JSX.Element, label: string }> = {
  'Caixas delimitadoras 2D': {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v4m0 0h-4m4 0l-5-5" /></svg>,
    label: 'Caixas 2D'
  },
  'Máscaras de segmentação': {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
    label: 'Máscaras'
  },
  'Pontos': {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    label: 'Pontos'
  },
  'Caixas delimitadoras 3D': {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" /></svg>,
    label: 'Caixas 3D'
  },
};

export function DetectTypeSelector() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {(Object.keys(optionsConfig) as DetectTypes[]).map((label) => (
        <SelectOption key={label} label={label} />
      ))}
    </div>
  );
}

function SelectOption({label}: {label: DetectTypes}) {
  const [detectType, setDetectType] = useAtom(DetectTypeAtom);
  const resetState = useResetState();
  const isActive = detectType === label;

  return (
    <button
      className={`button-new secondary flex-col h-24 ${isActive ? 'active' : ''}`}
      onClick={() => {
        if (!isActive) {
            resetState();
            setDetectType(label);
        }
      }}>
      {optionsConfig[label].icon}
      <span className="mt-1 text-xs font-semibold">{optionsConfig[label].label}</span>
    </button>
  );
}