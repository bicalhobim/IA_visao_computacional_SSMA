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
import {useEffect} from 'react';
import {Content} from './Content';
import {ExtraModeControls} from './ExtraModeControls';
import {TopBar} from './TopBar';
import {ControlPanel} from './SideControls';
import {ResultsPanel} from './ResultsPanel';
import {
  IsGapiScriptLoadedAtom,
  IsGapiInitializedAtom,
  IsGoogleAuthenticatedAtom,
  GoogleUserAtom,
  GoogleAuthErrorAtom,
  IsResultsPanelVisibleAtom,
  IsLeftPanelCollapsedAtom,
  IsRightPanelCollapsedAtom,
  ReportHtmlToViewAtom,
  ApiKeyAtoms,
  IsApiKeyModalVisibleAtom,
} from './atoms';
import { initializeGapiClient } from './googleDriveService';
import { ApiKeyModal } from './ApiKeyModal';


export function MainAppLayout() {
  const [isGapiScriptLoaded, setIsGapiScriptLoaded] = useAtom(IsGapiScriptLoadedAtom);
  const [, setIsGapiInitialized] = useAtom(IsGapiInitializedAtom);
  const [, setIsGoogleAuthenticated] = useAtom(IsGoogleAuthenticatedAtom);
  const [, setGoogleUser] = useAtom(GoogleUserAtom);
  const [, setGoogleAuthError] = useAtom(GoogleAuthErrorAtom);
  const [isResultsPanelVisible] = useAtom(IsResultsPanelVisibleAtom);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useAtom(IsLeftPanelCollapsedAtom);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useAtom(IsRightPanelCollapsedAtom);
  const [reportHtml, setReportHtml] = useAtom(ReportHtmlToViewAtom);
  const [isApiKeyModalVisible] = useAtom(IsApiKeyModalVisibleAtom);

  const [googleDriveApiKey] = useAtom(ApiKeyAtoms.googleDriveApi);
  const [googleDriveClientId] = useAtom(ApiKeyAtoms.googleDriveClient);


  useEffect(() => {
    const handleGapiLoad = () => {
      setIsGapiScriptLoaded(true);
    };

    if (window.gapiLoaded) { 
        handleGapiLoad();
    } else {
        window.addEventListener('gapiLoaded', handleGapiLoad, { once: true });
    }
    
    return () => {
      window.removeEventListener('gapiLoaded', handleGapiLoad);
    };
  }, [setIsGapiScriptLoaded]);


  useEffect(() => {
    // Inicializa o cliente GAPI somente se o script foi carregado e as chaves necessárias estão presentes.
    if (isGapiScriptLoaded && googleDriveApiKey && googleDriveClientId) {
      initializeGapiClient(
        setIsGapiInitialized,
        setIsGoogleAuthenticated,
        setGoogleUser,
        setGoogleAuthError,
        googleDriveApiKey,
        googleDriveClientId,
      ).catch(error => {
        console.error("Falha crítica na inicialização do GAPI:", error);
      });
    }
  }, [
      isGapiScriptLoaded,
      googleDriveApiKey,
      googleDriveClientId,
      setIsGapiInitialized,
      setIsGoogleAuthenticated,
      setGoogleUser,
      setGoogleAuthError
  ]);


  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white font-sans antialiased">
      <TopBar />
      <main className="flex grow overflow-hidden relative">
        {/* Painel de Controle (Esquerda) */}
        <div className={`flex-shrink-0 bg-gray-900/70 transition-all duration-300 ease-in-out ${isLeftPanelCollapsed ? 'w-0' : 'w-[380px]'}`}>
          {!isLeftPanelCollapsed && (
            <div className="w-[380px] p-4 h-full overflow-y-auto flex flex-col">
              <ControlPanel />
            </div>
          )}
        </div>

        {/* Painel de Visualização (Centro) com botões de toggle */}
        <div className="flex-grow flex flex-col relative">
            <button
                onClick={() => setIsLeftPanelCollapsed(p => !p)}
                className="absolute top-1/2 -translate-y-1/2 left-2 z-20 bg-gray-800/80 hover:bg-cyan-600/80 rounded-full p-1 text-white transition-opacity"
                title={isLeftPanelCollapsed ? 'Expandir Painel' : 'Recolher Painel'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-5 h-5 transition-transform duration-300 ${isLeftPanelCollapsed ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
            </button>

            <Content />
            <ExtraModeControls />

            {isResultsPanelVisible && (
                <button
                    onClick={() => setIsRightPanelCollapsed(p => !p)}
                    className="absolute top-1/2 -translate-y-1/2 right-2 z-20 bg-gray-800/80 hover:bg-cyan-600/80 rounded-full p-1 text-white transition-opacity"
                    title={isRightPanelCollapsed ? 'Expandir Painel' : 'Recolher Painel'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-5 h-5 transition-transform duration-300 ${isRightPanelCollapsed ? '' : 'rotate-180'}`}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                </button>
            )}
        </div>

        {/* Painel de Resultados (Direita, Dinâmico) */}
        <div 
          className={`flex-shrink-0 bg-gray-900/70 transition-all duration-300 ease-in-out ${isResultsPanelVisible && !isRightPanelCollapsed ? 'w-[400px]' : 'w-0'}`}
        >
          {isResultsPanelVisible && !isRightPanelCollapsed && (
            <div className="w-[400px] p-4 h-full overflow-y-auto">
              <ResultsPanel />
            </div>
          )}
        </div>

        {/* API Key Modal */}
        {isApiKeyModalVisible && <ApiKeyModal />}

        {/* Report Viewer Modal */}
        {reportHtml && (
            <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-gray-800 w-full h-full rounded-lg shadow-2xl flex flex-col">
                    <div className="flex-shrink-0 p-4 border-b border-gray-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-cyan-400">Visualizador de Relatório</h2>
                        <button 
                            onClick={() => setReportHtml(null)}
                            className="button-new tertiary"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            <span className="sr-only">Fechar</span>
                        </button>
                    </div>
                    <div className="flex-grow overflow-hidden">
                       <iframe
                            srcDoc={reportHtml}
                            title="Relatório HTML"
                            className="w-full h-full border-0"
                            sandbox="allow-scripts allow-same-origin"
                       />
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
} 