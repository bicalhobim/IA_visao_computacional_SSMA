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

import {useSetAtom} from 'jotai/react';
import {
  BoundingBoxes2DAtom,
  BoundingBoxes3DAtom,
  BoundingBoxMasksAtom,
  BumpSessionAtom,
  ImageSentAtom,
  PointsAtom,
  IsResultsPanelVisibleAtom,
  BatchResultsAtom,
  LinesAtom,
  ActiveResultIndexAtom,
  AnnotationsVisibleAtom,
  HiddenAnnotationIndicesAtom,
} from './atoms';

export function useResetState() {
  const setImageSent = useSetAtom(ImageSentAtom);
  const setBoundingBoxes2D = useSetAtom(BoundingBoxes2DAtom);
  const setBoundingBoxes3D = useSetAtom(BoundingBoxes3DAtom);
  const setBoundingBoxMasks = useSetAtom(BoundingBoxMasksAtom);
  const setPoints = useSetAtom(PointsAtom);
  const setBumpSession = useSetAtom(BumpSessionAtom);
  const setIsResultsPanelVisible = useSetAtom(IsResultsPanelVisibleAtom);
  const setBatchResults = useSetAtom(BatchResultsAtom);
  const setLines = useSetAtom(LinesAtom);
  const setActiveResultIndex = useSetAtom(ActiveResultIndexAtom);
  const setAnnotationsVisible = useSetAtom(AnnotationsVisibleAtom);
  const setHiddenAnnotationIndices = useSetAtom(HiddenAnnotationIndicesAtom);


  return () => {
    setImageSent(false);
    setBoundingBoxes2D([]);
    setBoundingBoxes3D([]);
    setBoundingBoxMasks([]);
    setPoints([]);
    setLines([]);
    setBatchResults([]);
    setIsResultsPanelVisible(false);
    setActiveResultIndex(null);
    setAnnotationsVisible(true);
    setHiddenAnnotationIndices([]);
    setBumpSession((prev) => prev + 1);
  };
}