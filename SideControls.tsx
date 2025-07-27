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

declare module 'react' {
    interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
        webkitdirectory?: string;
        directory?: string;
    }
}

import {useAtom, useSetAtom} from 'jotai';
import {useEffect, useRef, useState} from 'react';
import {
  ImageSrcAtom,
  IsUploadedImageAtom,
  IsBatchProcessingAtom,
  BatchProcessingProgressAtom,
  BatchResultsAtom,
  DetectTypeAtom,
  IsGapiInitializedAtom,
  IsGoogleAuthenticatedAtom,
  DriveFolderInfoAtom,
  DriveImageFilesAtom,
  GoogleAuthErrorAtom,
  LinesAtom,
  TemperatureAtom,
  CustomPromptsAtom,
  PromptsAtom,
  ShareStream,
  VideoRefAtom,
  IsResultsPanelVisibleAtom,
  BoundingBoxes2DAtom,
  BoundingBoxes3DAtom,
  BoundingBoxMasksAtom,
  PointsAtom,
  BatchResultItem,
  RecentAnalysesAtom,
  ApiKeyAtoms,
  IsApiKeyModalVisibleAtom,
} from './atoms';
import {useResetState} from './hooks';
import { createThumbnail, getSvgPathFromStroke, loadImage, getPromptTextForDetectType } from './utils';
import { BoundingBox2DType, DetectTypes } from './Types';
import { handleSignIn, showFolderPicker, listImageFilesInFolder, downloadDriveFileAsBase64 } from './googleDriveService';
import { analyzeImageWithGemini, formatGeminiResponseForDetectType } from './Prompt';
import { DetectTypeSelector } from './DetectTypeSelector';
import { RecentAnalyses } from './RecentAnalyses';
import getStroke from 'perfect-freehand';
import { lineOptions } from './consts';

export function ControlPanel() {
  const [imageSrc, setImageSrc] = useAtom(ImageSrcAtom);
  const setIsUploadedImage = useSetAtom(IsUploadedImageAtom);
  const resetState = useResetState();
  const localFolderInputRef = useRef<HTMLInputElement | null>(null);

  // Atoms de estado
  const [isBatchProcessing, setIsBatchProcessing] = useAtom(IsBatchProcessingAtom);
  const setBatchProgress = useSetAtom(BatchProcessingProgressAtom);
  const setBatchResults = useSetAtom(BatchResultsAtom);
  const [detectType] = useAtom(DetectTypeAtom);
  const [prompts] = useAtom(PromptsAtom);
  const [temperature, setTemperature] = useAtom(TemperatureAtom);
  const [lines] = useAtom(LinesAtom);
  const [stream] = useAtom(ShareStream);
  const [videoRef] = useAtom(VideoRefAtom);

  // Estado do prompt
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [targetPrompt, setTargetPrompt] = useState('EPIs faltantes, condições de risco, extintores');
  const [customPrompts, setCustomPrompts] = useAtom(CustomPromptsAtom);
  const [isLoading, setIsLoading] = useState(false);
  
  // Atoms das chaves de API (agora dinâmicas)
  const [geminiApiKey] = useAtom(ApiKeyAtoms.gemini);
  const [googleDriveApiKey] = useAtom(ApiKeyAtoms.googleDriveApi);
  const [googleDriveClientId] = useAtom(ApiKeyAtoms.googleDriveClient);
  const [googleProjectNumber] = useAtom(ApiKeyAtoms.googleProjectNumber);
  const setIsApiKeyModalVisible = useSetAtom(IsApiKeyModalVisibleAtom);


  // Atoms do Google Drive
  const [isGapiInitialized] = useAtom(IsGapiInitializedAtom);
  const [isGoogleAuthenticated] = useAtom(IsGoogleAuthenticatedAtom);
  const [googleAuthError, setGoogleAuthError] = useAtom(GoogleAuthErrorAtom);
  const [driveFolderInfo, setDriveFolderInfo] = useAtom(DriveFolderInfoAtom);
  const [driveImageFiles, setDriveImageFiles] = useAtom(DriveImageFilesAtom);

  // Atoms de resultados
  const [recentAnalyses, setRecentAnalyses] = useAtom(RecentAnalysesAtom);
  const setBoundingBoxes2D = useSetAtom(BoundingBoxes2DAtom);
  const setBoundingBoxes3D = useSetAtom(BoundingBoxes3DAtom);
  const setBoundingBoxMasks = useSetAtom(BoundingBoxMasksAtom);
  const setPoints = useSetAtom(PointsAtom);
  const setIsResultsPanelVisible = useSetAtom(IsResultsPanelVisibleAtom);


  const areDriveCredentialsFullySet =
    googleDriveApiKey && googleDriveClientId && googleProjectNumber;

  useEffect(() => {
    if (driveFolderInfo?.id && isGoogleAuthenticated) {
      setBatchProgress({ current: 0, total: 0, currentFileName: '', statusMessage: `Listando em "${driveFolderInfo.name}"...` });
      listImageFilesInFolder(driveFolderInfo.id, setDriveImageFiles, setGoogleAuthError);
    }
  }, [driveFolderInfo, isGoogleAuthenticated, setDriveImageFiles, setGoogleAuthError, setBatchProgress]);

  useEffect(() => {
    if (driveImageFiles.length > 0 && isGoogleAuthenticated && !isBatchProcessing) {
      processDriveFiles(driveImageFiles);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driveImageFiles, isGoogleAuthenticated]);


  const handleSingleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    resetState();
    setIsBatchProcessing(false);
    setDriveFolderInfo(null);
    setDriveImageFiles([]);

    const newAnalysesPayload = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.readAsDataURL(file);
        });

        const thumbnail = await createThumbnail(dataUrl, 128);
        newAnalysesPayload.push({
            id: Date.now() + i,
            thumbnail,
            fullImage: dataUrl,
        });
    }

    if (newAnalysesPayload.length > 0) {
        setRecentAnalyses({ type: 'ADD_QUEUED', payload: newAnalysesPayload });
        setImageSrc(newAnalysesPayload[0].fullImage);
        setIsUploadedImage(true);
        setIsResultsPanelVisible(true);
    }
    e.target.value = '';
  };
  
  const handleLocalFolderSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    if (!geminiApiKey) {
        alert("A Chave da API do Gemini é necessária para processar em lote.");
        setIsApiKeyModalVisible(true);
        return;
    }
    setIsBatchProcessing(true);
    setBatchResults([]);
    setDriveFolderInfo(null); 
    setDriveImageFiles([]);
    const imageFiles = Array.from(files).filter(file => /\.(jpe?g|png|webp)$/i.test(file.name));
    await processImageFiles(imageFiles, 'local');
  };
  
  const handleGoogleDriveConnect = () => {
    if (!areDriveCredentialsFullySet) {
        alert("As credenciais do Google Drive não estão configuradas.");
        setIsApiKeyModalVisible(true);
        return;
    }
    if (!isGapiInitialized) {
      alert('A API do Google Drive ainda não foi inicializada. Tente novamente.');
      return;
    }
    if (!isGoogleAuthenticated) {
      handleSignIn().catch(err => setGoogleAuthError(`Falha ao conectar: ${err.message}`));
    } else {
      showFolderPicker(setDriveFolderInfo, setGoogleAuthError, googleDriveApiKey, googleProjectNumber);
    }
  };

  const handleAnalyze = async () => {
    if (!geminiApiKey) {
        alert("Por favor, configure sua Chave de API do Gemini para continuar.");
        setIsApiKeyModalVisible(true);
        return;
    }
    if (!imageSrc && !stream) {
        alert("Por favor, carregue uma imagem ou compartilhe sua tela.");
        return;
    }
    setIsLoading(true);
    setIsBatchProcessing(false);

    setBoundingBoxes2D([]);
    setBoundingBoxes3D([]);
    setBoundingBoxMasks([]);
    setPoints([]);

    let analysisItem = recentAnalyses.find(a => a.fullImage === imageSrc);
    let analysisId: number;

    const imageForAnalysis = await getActiveImageAsDataURL();
    if (!imageForAnalysis) {
        setIsLoading(false);
        alert('Não foi possível obter a imagem para análise.');
        return;
    }

    if (analysisItem) {
        analysisId = analysisItem.id;
    } else {
        analysisId = Date.now();
        const thumbnail = await createThumbnail(imageForAnalysis, 128);
        setRecentAnalyses({
            type: 'ADD_QUEUED',
            payload: [{ id: analysisId, thumbnail, fullImage: imageForAnalysis }],
        });
        setImageSrc(imageForAnalysis);
    }
    
    setRecentAnalyses({ type: 'UPDATE', payload: { id: analysisId, status: 'analyzing' } });

    const activeDataURLBase64 = imageForAnalysis.replace(/^data:image\/(png|jpeg|webp);base64,/, '');

    try {
      setBatchProgress({ current: 0, total: 2, currentFileName: 'Pré-análise', statusMessage: 'Identificando NRs relevantes...' });
      const preAnalysisPrompt = `Analise esta imagem e liste, em um array JSON de strings, as NRs (Normas Regulamentadoras) brasileiras (ex: "NR-6", "NR-10") que são mais relevantes para os riscos visíveis. Retorne apenas o array.`;
      const relevantNrsResponse = await analyzeImageWithGemini(geminiApiKey, activeDataURLBase64, preAnalysisPrompt, temperature, false);
      const relevantNrs: string[] = Array.isArray(relevantNrsResponse) ? relevantNrsResponse : [];
      
      let knowledgeContext = "Nenhum conhecimento específico de NR foi carregado.";
      if (relevantNrs.length > 0) {
        try {
          const response = await fetch('/nr_knowledge_base.json');
          const knowledgeBase = await response.json();
          knowledgeContext = relevantNrs
            .map(nr => knowledgeBase[nr] ? `Trechos da ${nr}:\n${knowledgeBase[nr].map((item: any) => `* Item ${item.item}: ${item.text}`).join('\n')}` : '')
            .filter(Boolean)
            .join('\n\n');
        } catch (e) {
          console.error("Falha ao carregar a base de conhecimento das NRs.", e);
        }
      }

      setBatchProgress({ current: 1, total: 2, currentFileName: 'Análise Principal', statusMessage: 'Analisando riscos com base nas NRs...' });
      
      const baseAnalysisPrompt = showCustomPrompt 
        ? customPrompts[detectType] 
        : getPromptTextForDetectType(detectType, prompts, targetPrompt);

      const finalPrompt = `
Contexto de Conhecimento (Fonte da Verdade):
---
${knowledgeContext}
---
Usando APENAS o contexto de conhecimento fornecido acima como sua fonte da verdade, realize a seguinte tarefa de análise de segurança:

${baseAnalysisPrompt}

Importante: 
1. Para cada risco identificado, adicione um campo "fonte" no JSON, citando o item exato da NR do contexto que justifica a detecção (ex: "NR-6, item 6.3.a"). Se um risco for óbvio mas não estiver no contexto, não o inclua.
2. Certifique-se de que o campo "plano_acao" contém um array com 3 a 5 sugestões práticas e acionáveis para resolver o risco.
`;

      const parsedResponse = await analyzeImageWithGemini(geminiApiKey, activeDataURLBase64, finalPrompt, temperature, detectType === 'Máscaras de segmentação');
      const formattedData = formatGeminiResponseForDetectType(parsedResponse, detectType);
      
      if (detectType === 'Caixas delimitadoras 2D') setBoundingBoxes2D(formattedData as any);
      else if (detectType === 'Pontos') setPoints(formattedData as any);
      else if (detectType === 'Máscaras de segmentação') setBoundingBoxMasks(formattedData as any);
      else setBoundingBoxes3D(formattedData as any);
      
      setRecentAnalyses({
        type: 'UPDATE',
        payload: {
            id: analysisId,
            status: 'analyzed',
            detectionData: formattedData,
            detectType: detectType,
        }
      });

      setIsResultsPanelVisible(true);
      setBatchProgress({ current: 2, total: 2, currentFileName: '', statusMessage: 'Análise concluída!' });

    } catch (error) {
      console.error("Erro na análise RAG:", error);
      alert(`Falha na análise: ${error instanceof Error ? error.message : String(error)}`);
      setBatchProgress({ current: 2, total: 2, currentFileName: '', statusMessage: 'Erro na análise!' });
      setRecentAnalyses({ type: 'UPDATE', payload: { id: analysisId, status: 'queued' } });

    } finally {
      setIsLoading(false);
    }
  };

  async function getActiveImageAsDataURL(): Promise<string | null> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    let source: HTMLImageElement | HTMLVideoElement;
    if (stream && videoRef.current) {
      source = videoRef.current;
      canvas.width = source.videoWidth;
      canvas.height = source.videoHeight;
    } else if (imageSrc) {
      source = await loadImage(imageSrc);
      canvas.width = source.width;
      canvas.height = source.height;
    } else {
      return null;
    }
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.9);
  }

  async function processImageFiles(imageFiles: File[], source: 'local') {
    setIsResultsPanelVisible(true);
    const total = imageFiles.length;
    let processed = 0;
    const results: BatchResultItem[] = [];
    setBatchProgress({ current: 0, total, currentFileName: '', statusMessage: `Iniciando lote de ${total} imagens...` });

    for (const file of imageFiles) {
        processed++;
        setBatchProgress({ current: processed, total, currentFileName: file.name, statusMessage: `Analisando: ${file.name}` });
        try {
            const reader = new FileReader();
            const fileReadPromise = new Promise<string>((resolve, reject) => {
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            const imageDataUrl = await fileReadPromise;
            const geminiImageData = await prepareImageForGemini(imageDataUrl);
            const pdfImageData = await prepareImageForPdf(imageDataUrl);
            const prompt = getPromptTextForDetectType(detectType, prompts, 'EPIs faltantes, condições de risco, extintores');
            const response = await analyzeImageWithGemini(geminiApiKey, geminiImageData, prompt, temperature, detectType === 'Máscaras de segmentação');
            const data = formatGeminiResponseForDetectType(response, detectType);
            results.push({ imageName: file.name, detectType, detectionData: data, imageBase64: pdfImageData, source });
        } catch (e) {
            results.push({ imageName: file.name, detectType, detectionData: [], imageBase64: null, error: e instanceof Error ? e.message : String(e), source });
        }
    }
    setBatchResults(results);
    setBatchProgress({ current: total, total, currentFileName: '', statusMessage: 'Processamento em lote concluído!' });
  }

  async function processDriveFiles(files: typeof driveImageFiles) {
    setIsResultsPanelVisible(true);
    const total = files.length;
    let processed = 0;
    const results: BatchResultItem[] = [];
    setBatchProgress({ current: 0, total, currentFileName: '', statusMessage: `Iniciando lote de ${total} imagens do Drive...` });

    for (const file of files) {
        processed++;
        setBatchProgress({ current: processed, total, currentFileName: file.name, statusMessage: `Analisando: ${file.name}` });
        try {
            const imageDataUrl = await downloadDriveFileAsBase64(file.id);
            const geminiImageData = await prepareImageForGemini(imageDataUrl);
            const pdfImageData = await prepareImageForPdf(imageDataUrl);
            const prompt = getPromptTextForDetectType(detectType, prompts, 'EPIs faltantes, condições de risco, extintores');
            const response = await analyzeImageWithGemini(geminiApiKey, geminiImageData, prompt, temperature, detectType === 'Máscaras de segmentação');
            const data = formatGeminiResponseForDetectType(response, detectType);
            results.push({ imageName: file.name, detectType, detectionData: data, imageBase64: pdfImageData, source: 'drive' });
        } catch (e) {
            results.push({ imageName: file.name, detectType, detectionData: [], imageBase64: null, error: e instanceof Error ? e.message : String(e), source: 'drive' });
        }
    }
    setBatchResults(results);
    setBatchProgress({ current: total, total, currentFileName: '', statusMessage: 'Processamento do Drive concluído!' });
  }

  async function prepareImageForGemini(source: string | HTMLVideoElement): Promise<string> {
    const maxSize = 640;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const image = typeof source === 'string' ? await loadImage(source) : source;
    const w = typeof source === 'string' ? image.width : (image as HTMLVideoElement).videoWidth;
    const h = typeof source === 'string' ? image.height : (image as HTMLVideoElement).videoHeight;
    const scale = Math.min(maxSize / w, maxSize / h, 1);
    canvas.width = w * scale;
    canvas.height = h * scale;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    if (lines.length > 0) {
      for (const line of lines) {
        const p = new Path2D(getSvgPathFromStroke(getStroke(line[0].map(([x, y]) => [x * canvas.width, y * canvas.height, 0.5]), lineOptions)));
        ctx.fillStyle = line[1];
        ctx.fill(p);
      }
    }
    return canvas.toDataURL('image/png').replace(/^data:image\/(png|jpeg|webp);base64,/, '');
  }

  async function prepareImageForPdf(source: string): Promise<string> {
    const maxSize = 1024;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const image = await loadImage(source);
    const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase">Fonte da Imagem</h2>
          <div className="grid grid-cols-1 gap-3">
            <label className="button-new primary flex items-center justify-center gap-2 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Carregar Imagem(ns)
              <input type="file" className="hidden" accept=".jpg, .jpeg, .png, .webp" onChange={handleSingleImageUpload} disabled={isBatchProcessing || isLoading} multiple />
            </label>

            <button className="button-new secondary flex items-center justify-center gap-2" onClick={() => localFolderInputRef.current?.click()} disabled={isBatchProcessing || isLoading}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
              Analisar Pasta Local
            </button>
            <input type="file" ref={localFolderInputRef} style={{ display: 'none' }} webkitdirectory="" directory="" multiple onChange={handleLocalFolderSelect} disabled={isBatchProcessing || isLoading} />

            <button className="button-new secondary flex items-center justify-center gap-2" onClick={handleGoogleDriveConnect} disabled={!isGapiInitialized || isBatchProcessing || isLoading || !areDriveCredentialsFullySet}>
               <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.006 8.994H13.35L10.674 4H4.994A1.994 1.994 0 003 5.994v12.012A1.994 1.994 0 004.994 20h14.012A1.994 1.994 0 0021 18.006V10.994A1.997 1.997 0 0019.006 8.994zM8.574 16.99L6.568 12.316l5.062.005.932 1.821-3.988 2.848zm3.003-5.996h4.855l-2.429-4.254-2.426 4.254z"></path></svg>
              {isGoogleAuthenticated ? 'Pasta do Drive' : 'Conectar Drive'}
            </button>
             {googleAuthError && <p className="text-red-500 text-xs text-center">{googleAuthError}</p>}
             {driveFolderInfo && <p className="text-xs text-cyan-400 text-center truncate" title={driveFolderInfo.name}>Pasta: {driveFolderInfo.name}</p>}
          </div>
          <RecentAnalyses />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase">Configurar Análise</h2>
          <DetectTypeSelector />
        </section>

        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase">Prompt de Análise</h2>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" className="checkbox-new" checked={showCustomPrompt} onChange={() => setShowCustomPrompt(!showCustomPrompt)} />
              Personalizado
            </label>
          </div>
          {showCustomPrompt ? (
            <textarea className="textarea-new" rows={4} value={customPrompts[detectType]} onChange={(e) => setCustomPrompts({...customPrompts, [detectType]: e.target.value})} disabled={isLoading || isBatchProcessing} />
          ) : (
            <textarea className="textarea-new" placeholder="Especifique o foco: EPIs, riscos de queda..." rows={3} value={targetPrompt} onChange={(e) => setTargetPrompt(e.target.value)} disabled={isLoading || isBatchProcessing} />
          )}
          <div className="flex items-center gap-3 mt-3">
             <label htmlFor="temperature" className="text-sm text-gray-300">Temperatura:</label>
             <input id="temperature" type="range" min="0" max="1" step="0.05" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} className="range-new" disabled={isLoading || isBatchProcessing} />
             <span className="text-sm font-mono text-cyan-400">{temperature.toFixed(2)}</span>
          </div>
        </section>
      </div>

      <div className="mt-auto pt-4">
        <button className="button-new primary w-full text-lg" onClick={handleAnalyze} disabled={isLoading || isBatchProcessing || (!imageSrc && !stream)}>
          {isLoading ? 'Analisando...' : (isBatchProcessing ? 'Aguarde o Lote' : 'Analisar Imagem')}
        </button>
      </div>
    </div>
  );
}