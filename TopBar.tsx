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
  ImageSrcAtom,
  ShareStream,
  IsBatchProcessingAtom,
  BatchProcessingProgressAtom,
  IsGoogleAuthenticatedAtom,
  GoogleUserAtom,
  DriveFolderInfoAtom,
  DriveImageFilesAtom,
  GoogleAuthErrorAtom,
  IsGapiInitializedAtom,
  RecentAnalysesAtom,
} from './atoms';
import {useResetState} from './hooks';
import { handleSignOut } from './googleDriveService';

export function TopBar() {
  const appResetState = useResetState(); 
  const [, setImageSrc] = useAtom(ImageSrcAtom);
  const [stream, setStream] = useAtom(ShareStream);

  const [isBatchProcessing, setIsBatchProcessing] = useAtom(IsBatchProcessingAtom);
  const [batchProgress, setBatchProgress] = useAtom(BatchProcessingProgressAtom); 

  // Estado do Google Drive
  const [isGapiInitialized] = useAtom(IsGapiInitializedAtom);
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useAtom(IsGoogleAuthenticatedAtom);
  const [googleUser] = useAtom(GoogleUserAtom);
  const [, setDriveFolderInfo] = useAtom(DriveFolderInfoAtom);
  const [, setDriveImageFiles] = useAtom(DriveImageFilesAtom);
  const [, setGoogleAuthError] = useAtom(GoogleAuthErrorAtom); 
  const setRecentAnalyses = useSetAtom(RecentAnalysesAtom);


  const handleFullResetSession = () => {
    appResetState(); 
    setRecentAnalyses({ type: 'RESET_SESSION' });
    setImageSrc(null); 
    if (stream) { 
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsBatchProcessing(false); 
    setBatchProgress({ current: 0, total: 0, currentFileName: '', statusMessage: '' }); 
    
    setDriveFolderInfo(null);
    setDriveImageFiles([]);
  };

  const onSignOut = async () => {
    if (!isGapiInitialized) return;
    try {
      await handleSignOut(setDriveFolderInfo, setDriveImageFiles); 
      setIsGoogleAuthenticated(false); 
      setGoogleAuthError(null); 
    } catch (e) {
      console.error("Erro ao deslogar:", e);
    }
  }

  const isProcessing = isBatchProcessing && batchProgress.total > 0 && batchProgress.current < batchProgress.total;

  return (
    <header className="grid grid-cols-3 w-full items-center px-4 bg-gray-900/80 border-b border-gray-700/50 flex-shrink-0 h-16">
      {/* Seção Esquerda (Logo Secundário) */}
      <div className="flex justify-start items-center">
        <h2 className="text-lg font-semibold text-gray-400">Verum Institute</h2>
      </div>

      {/* Seção Central (Logo ou Progresso) */}
      <div className="flex flex-col items-center justify-center text-center">
        {isBatchProcessing ? (
          <>
            <p className="text-sm text-gray-300 truncate w-full max-w-xs" title={`${batchProgress.statusMessage} ${batchProgress.currentFileName}`}>
                {batchProgress.statusMessage} 
                {isProcessing && ` (${batchProgress.current}/${batchProgress.total})`}
                <span className="font-semibold text-cyan-400 ml-2">{batchProgress.currentFileName}</span>
            </p>
            {isProcessing && (
                <div className="w-48 bg-gray-700 rounded-full h-1.5 mt-1">
                    <div 
                        className="bg-cyan-400 h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}>
                    </div>
                </div>
            )}
          </>
        ) : (
          <h1 className="text-xl font-bold text-white tracking-wide" aria-label="Nome da aplicação: AI.MÉTODO EXPERT">
            <span className="text-cyan-400">AI.</span>MÉTODO EXPERT
          </h1>
        )}
      </div>

      {/* Seção Direita (Controles e Usuário) */}
      <div className="flex justify-end items-center gap-4">
        {isGoogleAuthenticated && googleUser && (
            <div className="flex items-center gap-2 text-sm text-gray-300" title={googleUser.email || ''}>
                {googleUser.imageUrl && <img src={googleUser.imageUrl} alt="Foto do usuário Google" className="w-7 h-7 rounded-full"/>}
                <span className="hidden md:inline">{googleUser.name?.split(' ')[0]}</span>
                <button onClick={onSignOut} className="button-new tertiary !text-xs" disabled={!isGapiInitialized}>Sair</button>
            </div>
        )}
        <button
          onClick={handleFullResetSession}
          className="button-new tertiary flex items-center gap-2"
          disabled={isProcessing}
          >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l5 5M20 20l-5-5" /></svg>
          Reiniciar Sessão
        </button>
      </div>
    </header>
  );
}