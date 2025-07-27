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
import {ActiveColorAtom} from './atoms';
import {colors} from './consts';

export function Palette() {
  const [activeColor, setActiveColor] = useAtom(ActiveColorAtom);
  return (
    <div
      className="flex gap-2 pointer-events-auto"
      onClick={(e) => {
        e.stopPropagation();
      }}>
      {colors.map((color) => (
        <div
          className="w-7 h-7 rounded-full pointer-events-auto cursor-pointer relative"
          style={{
            background: color === activeColor ? 'transparent' : color,
            border: color === activeColor ? '1px solid ' + color : 'none',
            width: 24,
            height: 24,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setActiveColor(color);
          }}>
          <div
            className="w-5 h-5 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 18,
              height: 18,
              background: color,
            }}
          />
        </div>
      ))}
    </div>
  );
}