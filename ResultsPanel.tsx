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
import { useState } from 'react';
import {
  BoundingBoxes2DAtom,
  BoundingBoxes3DAtom,
  BoundingBoxMasksAtom,
  PointsAtom,
  DetectTypeAtom,
  IsBatchProcessingAtom,
  BatchResultsAtom,
  BatchProcessingProgressAtom,
  HoveredBoxAtom,
  ImageSrcAtom,
  ShareStream,
  VideoRefAtom,
  ActiveResultIndexAtom,
  AnnotationsVisibleAtom,
  HiddenAnnotationIndicesAtom,
} from './atoms';
import { getActiveImageAsBase64, getAnnotatedReportImageAsBase64, downloadJson, generatePdfReport, generateBatchPdfReport, generateHtmlReport, generateBatchHtmlReport } from './utils';
import { BoundingBox2DType, BoundingBox3DType, BoundingBoxMaskType, PointingType } from './Types';


export function ResultsPanel() {
  const [detectType] = useAtom(DetectTypeAtom);
  const [isBatchProcessing] = useAtom(IsBatchProcessingAtom);
  const [batchResults] = useAtom(BatchResultsAtom);
  const [batchProgress] = useAtom(BatchProcessingProgressAtom);

  // Resultados de imagem única
  const [boundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [boundingBoxes3D] = useAtom(BoundingBoxes3DAtom);
  const [boundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [points] = useAtom(PointsAtom);
  const [, setHoveredBox] = useAtom(HoveredBoxAtom);
  
  // Para exportação de imagem única
  const [imageSrc] = useAtom(ImageSrcAtom);
  const [stream] = useAtom(ShareStream);
  const [videoRef] = useAtom(VideoRefAtom);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingHtml, setIsGeneratingHtml] = useState(false);

  // Estado para o item de resultado ativo/selecionado
  const [activeResultIndex, setActiveResultIndex] = useAtom(ActiveResultIndexAtom);

  // Estado para visibilidade das anotações
  const setAnnotationsVisible = useSetAtom(AnnotationsVisibleAtom);
  const [hiddenAnnotationIndices, setHiddenAnnotationIndices] = useAtom(HiddenAnnotationIndicesAtom);

  let singleImageData: any[] = [];
  switch (detectType) {
    case 'Caixas delimitadoras 2D': singleImageData = boundingBoxes2D; break;
    case 'Máscaras de segmentação': singleImageData = boundingBoxMasks; break;
    case 'Pontos': singleImageData = points; break;
    case 'Caixas delimitadoras 3D': singleImageData = boundingBoxes3D; break;
  }

  const handleExportJson = async () => {
    let dataToExport, filename;
    if (isBatchProcessing) {
      if (batchResults.length === 0) { alert('Nenhum resultado em lote para exportar.'); return; }
      dataToExport = {
          batchProcessDate: new Date().toISOString(),
          detectionTypeUsed: batchResults[0]?.detectType || 'Múltiplos',
          source: batchResults[0]?.source,
          results: batchResults,
      };
      filename = `relatorio_lote_${new Date().getTime()}.json`;
    } else {
      if (singleImageData.length === 0) { alert('Nenhum resultado para exportar.'); return; }
      dataToExport = {
        tipoDeteccao: detectType,
        dados: singleImageData,
        timestamp: new Date().toISOString(),
      };
      filename = `relatorio_imagem_${new Date().getTime()}.json`;
    }
    downloadJson(dataToExport, filename);
  };
  
  const handleExportPdf = async () => {
      setIsGeneratingPdf(true);
      try {
        if (isBatchProcessing) {
          if (batchResults.length === 0) { alert('Nenhum resultado em lote para gerar PDF.'); return; }
          const successfulResults = batchResults.filter(r => !r.error);
          if (successfulResults.length === 0) { alert('Nenhum resultado com sucesso para gerar PDF.'); return; }
          await generateBatchPdfReport(successfulResults, 'relatorio_lote_consolidado');
        } else {
            if (singleImageData.length === 0 || (!imageSrc && !stream)) {
                alert('Nenhum resultado ou imagem ativa para gerar PDF.');
                return;
            }
            const baseImage = await getActiveImageAsBase64(imageSrc, stream, videoRef);
            if (!baseImage) {
                alert("Não foi possível obter a imagem para o relatório.");
                return;
            }
            const annotatedImage = await getAnnotatedReportImageAsBase64(baseImage, singleImageData, detectType, hiddenAnnotationIndices);

            await generatePdfReport(detectType, singleImageData, annotatedImage, 'relatorio_imagem_unica');
        }
      } catch(e) {
          alert(`Erro ao gerar PDF: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setIsGeneratingPdf(false);
      }
  };

  const handleExportHtml = async () => {
    setIsGeneratingHtml(true);
    try {
        if (isBatchProcessing) {
            if (batchResults.length === 0) { alert('Nenhum resultado em lote para exportar.'); return; }
            await generateBatchHtmlReport(batchResults, 'relatorio_lote_editavel');
        } else {
            if (singleImageData.length === 0 || (!imageSrc && !stream)) { 
                alert('Nenhum resultado ou imagem ativa para gerar HTML.'); 
                return;
            }
            const baseImage = await getActiveImageAsBase64(imageSrc, stream, videoRef);
            if (!baseImage) {
                alert("Não foi possível obter a imagem para o relatório.");
                return;
            }
            const annotatedImage = await getAnnotatedReportImageAsBase64(baseImage, singleImageData, detectType, hiddenAnnotationIndices);
            generateHtmlReport(detectType, singleImageData, annotatedImage, 'relatorio_imagem_unica_editavel');
        }
    } catch (e) {
        alert(`Erro ao gerar relatório HTML: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        setIsGeneratingHtml(false);
    }
  };

  const handleShowAll = () => {
    setAnnotationsVisible(true);
    setHiddenAnnotationIndices([]);
  }

  const handleHideAll = () => {
    setAnnotationsVisible(false);
  }

  const handleToggleIndividualVisibility = (index: number) => {
    setHiddenAnnotationIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const hasResults = isBatchProcessing ? batchResults.length > 0 : singleImageData.length > 0;

  return (
    <div className="flex flex-col h-full text-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-cyan-400">
          {isBatchProcessing ? 'Resultados do Lote' : 'Resultados da Análise'}
        </h2>
        <div className="flex items-center gap-3">
            <button onClick={handleShowAll} title="Mostrar todas as anotações" className="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7S3.732 16.057 2.458 12z" /></svg>
            </button>
            <button onClick={handleHideAll} title="Ocultar todas as anotações" className="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            </button>
        </div>
      </div>


      {isBatchProcessing && batchProgress.total > 0 && (
          <div className="mb-4">
            <p className="truncate text-gray-300">{batchProgress.statusMessage}: {batchProgress.currentFileName}</p>
            <p className="text-cyan-400 font-semibold">{batchProgress.current} / {batchProgress.total}</p>
          </div>
      )}
      
      <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-2">
        {isBatchProcessing ? (
          batchResults.map((result, index) => (
            <div key={index} className="bg-gray-800/50 p-3 rounded-lg">
              <h3 className="font-semibold text-white truncate" title={result.imageName}>{result.imageName}</h3>
              {result.error ? (
                <p className="text-red-400">Erro: {result.error}</p>
              ) : (
                <p className="text-gray-400">{result.detectionData.length} risco(s) detectado(s).</p>
              )}
            </div>
          ))
        ) : (
          singleImageData.map((item: BoundingBox2DType | BoundingBox3DType | BoundingBoxMaskType | PointingType, index) => {
            const isHidden = hiddenAnnotationIndices.includes(index);
            return (
              <div 
                  key={index} 
                  className={`p-3 rounded-lg cursor-pointer transition-all ${activeResultIndex === index ? 'bg-cyan-900/40' : 'bg-gray-800/50 hover:bg-gray-700/80'} ${isHidden ? 'opacity-60' : ''}`}
                  onMouseEnter={() => setHoveredBox(index)}
                  onMouseLeave={() => setHoveredBox(null)}
                  onClick={() => setActiveResultIndex(activeResultIndex === index ? null : index)}
              >
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-white">{item.risco}</h3>
                      <p className="text-gray-300 mt-1 text-xs">{item.descricaoRisco}</p>
                      {item.fonte && <p className="text-xs text-gray-400 mt-2">Fonte: <span className="font-medium text-gray-300">{item.fonte}</span></p>}
                      {item.planoAcao && item.planoAcao.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-cyan-300">Plano de Ação Sugerido:</p>
                          <ul className="list-disc list-inside text-xs text-gray-300 pl-2">
                            {item.planoAcao.map((action, i) => <li key={i}>{action}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      {(item.nr || item.itemNr) && <span className="text-xs bg-cyan-900 text-cyan-200 px-2 py-0.5 rounded-full mb-2">{item.nr} {item.itemNr}</span>}
                      {isHidden && (
                        <button onClick={(e) => { e.stopPropagation(); handleToggleIndividualVisibility(index); }} className="text-xs text-cyan-400 hover:text-cyan-200 font-semibold">
                          Mostrar
                        </button>
                      )}
                    </div>
                </div>
              </div>
            )
          })
        )}
        {!hasResults && <p className="text-gray-400 text-center mt-8">Nenhum resultado para exibir. Realize uma análise.</p>}
      </div>

      <div className="flex-shrink-0 mt-4 pt-4 border-t border-gray-700">
        {hasResults && (
            <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700 text-yellow-200 text-xs rounded-lg">
                <p className="font-bold mb-1">AVISO DE RESPONSABILIDADE</p>
                <p>Esta ferramenta de IA é um auxílio e pode cometer erros. A validação e aplicação das informações são de sua inteira responsabilidade. Esta análise não substitui o julgamento de um profissional de SST qualificado.</p>
            </div>
        )}
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase">Exportar Relatório</h3>
        <div className="flex gap-3">
          <button className="button-new secondary w-full" onClick={handleExportJson} disabled={!hasResults || isGeneratingPdf || isGeneratingHtml}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            JSON
          </button>
          <button className="button-new secondary w-full" onClick={handleExportPdf} disabled={!hasResults || isGeneratingPdf || isGeneratingHtml}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            {isGeneratingPdf ? 'Gerando...' : 'PDF'}
          </button>
          <button className="button-new secondary w-full" onClick={handleExportHtml} disabled={!hasResults || isGeneratingPdf || isGeneratingHtml}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            {isGeneratingHtml ? 'Gerando...' : 'HTML'}
          </button>
        </div>
      </div>
    </div>
  );
}