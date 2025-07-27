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
import {ShareStream} from './atoms';
import {useResetState} from './hooks';

export function ScreenshareButton() {
  const [, setStream] = useAtom(ShareStream);
  const resetState = useResetState();

  return (
    <button
      className="button flex gap-3 justify-center items-center"
      onClick={() => {
        resetState();
        navigator.mediaDevices.getDisplayMedia({video: true}).then((stream) => {
          setStream(stream);
        });
      }}>
      <div className="text-lg">🖥️</div>
      <div>Compartilhar Tela</div>
    </button>
  );
}
