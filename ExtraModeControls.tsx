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

import {useAtom, useSetAtom} from 'jotai/react';
import {
  BoundingBoxes2DAtom,
  BoundingBoxes3DAtom,
  BoundingBoxMasksAtom,
  DetectTypeAtom,
  DrawModeAtom,
  FOVAtom,
  LinesAtom,
  PointsAtom,
  ShareStream,
} from './atoms';
import {Palette} from './Palette';

export function ExtraModeControls() {
  const setBoundingBoxes2D = useSetAtom(BoundingBoxes2DAtom);
  const setBoundingBoxes3D = useSetAtom(BoundingBoxes3DAtom);
  const setBoundingBoxMasks = useSetAtom(BoundingBoxMasksAtom);
  const [stream, setStream] = useAtom(ShareStream);
  const [detectType] = useAtom(DetectTypeAtom);
  const [fov, setFoV] = useAtom(FOVAtom);
  const setPoints = useSetAtom(PointsAtom);
  const [drawMode, setDrawMode] = useAtom(DrawModeAtom);
  const setLines = useSetAtom(LinesAtom);

  const showExtraBar = stream || detectType === 'Caixas delimitadoras 3D';

  return (
    <>
      {detectType === 'Caixas delimitadoras 3D' ? (
        <div className="flex gap-3 px-3 py-3 items-center justify-center bg-[var(--accent-color)] text-[var(--bg-color)] text-center border-t">
          <div className="text-lg">🚧</div> Caixas delimitadoras 3D é uma capacidade preliminar do modelo. Use caixas delimitadoras 2D para maior precisão.
        </div>
      ) : null}
      {drawMode ? (
        <div className="flex gap-3 px-3 py-3 items-center justify-between border-t">
          <div style={{width: 200}}></div>
          <div className="grow flex justify-center">
            <Palette />
          </div>
          <div className="flex gap-3">
            <div className="flex gap-3">
              <button
                className="flex gap-3 text-sm secondary"
                onClick={() => {
                  setLines([]);
                }}>
                <div className="text-xs">🗑️</div>
                Limpar
              </button>
            </div>
            <div className="flex gap-3">
              <button
                className="flex gap-3 secondary"
                onClick={() => {
                  setDrawMode(false);
                }}>
                <div className="text-sm">✅</div>
                <div>Concluído</div>
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {showExtraBar ? (
        <div className="flex gap-3 px-3 py-3 border-t items-center justify-center">
          {stream ? (
            <button
              className="flex gap-3 text-sm items-center secondary"
              onClick={() => {
                stream.getTracks().forEach((track) => track.stop());
                setStream(null);
                setBoundingBoxes2D([]);
                setBoundingBoxes3D([]);
                setBoundingBoxMasks([]);
                setPoints([]);
              }}>
              <div className="text-xs">🔴</div>
              <div className="whitespace-nowrap">Parar compartilhamento de tela</div>
            </button>
          ) : null}
          {detectType === 'Caixas delimitadoras 3D' ? (
            <>
              <div>CDV</div>
              <input
                className="w-full"
                type="range"
                min="30"
                max="120"
                value={fov}
                onChange={(e) => setFoV(+e.target.value)}
              />
              <div>{fov}</div>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}