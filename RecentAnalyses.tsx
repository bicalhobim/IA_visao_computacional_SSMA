
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

import { useAtom, useSetAtom } from 'jotai/react';
import {
  ImageSrcAtom,
  IsUploadedImageAtom,
  RecentAnalysesAtom,
  RecentAnalysis,
  DetectTypeAtom,
  BoundingBoxes2DAtom,
  BoundingBoxMasksAtom,
  PointsAtom,
  BoundingBoxes3DAtom,
  IsResultsPanelVisibleAtom
} from './atoms';
import { useResetState } from './hooks';
import { BoundingBox2DType, BoundingBox3DType, BoundingBoxMaskType, PointingType } from './Types';


export function RecentAnalyses() {
  const [recentAnalyses] = useAtom(RecentAnalysesAtom);
  const [currentImageSrc, setImageSrc] = useAtom(ImageSrcAtom);
  const setDetectType = useSetAtom(DetectTypeAtom);
  const setBoundingBoxes2D = useSetAtom(BoundingBoxes2DAtom);
  const setBoundingBoxMasks = useSetAtom(BoundingBoxMasksAtom);
  const setPoints = useSetAtom(PointsAtom);
  const setBoundingBoxes3D = useSetAtom(BoundingBoxes3DAtom);
  const setIsResultsPanelVisible = useSetAtom(IsResultsPanelVisibleAtom);
  const setIsUploadedImage = useSetAtom(IsUploadedImageAtom);
  const resetState = useResetState();

  const handleRestoreAnalysis = (analysis: RecentAnalysis) => {
    // Primeiro, limpa o estado atual para evitar misturar dados
    resetState();

    // Restaura o estado da análise selecionada
    setImageSrc(analysis.fullImage);
    setDetectType(analysis.detectType);
    setIsUploadedImage(true); // Trata a imagem restaurada como uma imagem "carregada"

    // Restaura os dados de detecção corretos com base no tipo
    switch (analysis.detectType) {
        case 'Caixas delimitadoras 2D':
            setBoundingBoxes2D(analysis.detectionData as BoundingBox2DType[]);
            break;
        case 'Máscaras de segmentação':
            setBoundingBoxMasks(analysis.detectionData as BoundingBoxMaskType[]);
            break;
        case 'Pontos':
            setPoints(analysis.detectionData as PointingType[]);
            break;
        case 'Caixas delimitadoras 3D':
            setBoundingBoxes3D(analysis.detectionData as BoundingBox3DType[]);
            break;
    }
    
    // Mostra o painel de resultados com os dados restaurados
    setIsResultsPanelVisible(true);
  };

  const statusStyles: {[key: string]: string} = {
    analyzed: 'bg-green-500',
    analyzing: 'bg-yellow-500 animate-pulse',
    queued: 'bg-gray-500',
  };


  return (
    <div className="mt-4">
      <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Análise & Histórico</h3>
      {recentAnalyses.length > 0 ? (
        <div className="grid grid-cols-5 gap-2">
          {recentAnalyses.map((analysis) => {
            const isActive = currentImageSrc !== null && currentImageSrc === analysis.fullImage;
            return (
              <button
                key={analysis.id}
                className={`relative w-full h-0 pb-[100%] rounded-md overflow-hidden transition-all duration-200 transform hover:scale-105 focus:outline-none ${isActive ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-gray-800' : ''}`}
                onClick={() => {
                  if (!isActive) {
                    handleRestoreAnalysis(analysis);
                  }
                }}
                title={`Análise de ${new Date(analysis.id).toLocaleString('pt-BR')} - Status: ${analysis.status}`}
              >
                <img
                  src={analysis.thumbnail}
                  className="absolute left-0 top-0 w-full h-full object-cover"
                  alt={`Análise de ${new Date(analysis.id).toLocaleDateString()}`}
                />
                <div 
                  className={`absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-gray-900/50 ${statusStyles[analysis.status]}`}
                ></div>
                <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded-sm font-mono" title={`ID: ${analysis.id}`}>
                  ID:{analysis.id.toString().slice(-5)}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="text-center text-xs text-gray-500 bg-gray-800/50 p-4 rounded-lg">
          Suas análises aparecerão aqui.
        </div>
      )}
    </div>
  );
}