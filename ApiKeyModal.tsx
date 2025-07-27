/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// Copyright 2024 Lucas Bicalho, PMP

import { useAtom, useSetAtom } from 'jotai/react';
import { ApiKeyAtoms, IsApiKeyModalVisibleAtom } from './atoms';
import { useState } from 'react';

export function ApiKeyModal() {
  const setIsVisible = useSetAtom(IsApiKeyModalVisibleAtom);
  
  const [geminiKey, setGeminiKey] = useAtom(ApiKeyAtoms.gemini);
  const [driveApiKey, setDriveApiKey] = useAtom(ApiKeyAtoms.googleDriveApi);
  const [driveClientId, setDriveClientId] = useAtom(ApiKeyAtoms.googleDriveClient);
  const [projectNumber, setProjectNumber] = useAtom(ApiKeyAtoms.googleProjectNumber);

  // Estado local para o formulário
  const [localGeminiKey, setLocalGeminiKey] = useState(geminiKey);
  const [localDriveApiKey, setLocalDriveApiKey] = useState(driveApiKey);
  const [localDriveClientId, setLocalDriveClientId] = useState(driveClientId);
  const [localProjectNumber, setLocalProjectNumber] = useState(projectNumber);
  
  const [error, setError] = useState('');

  const handleSave = () => {
    setError('');
    if (!localGeminiKey.trim()) {
        setError('A Chave da API do Gemini é obrigatória.');
        return;
    }
    
    // Salva os valores do estado local para os átomos globais
    setGeminiKey(localGeminiKey);
    setDriveApiKey(localDriveApiKey);
    setDriveClientId(localDriveClientId);
    setProjectNumber(localProjectNumber);
    
    setIsVisible(false);
  };

  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-gray-800 w-full max-w-lg rounded-lg shadow-2xl flex flex-col border border-gray-700">
            <div className="flex-shrink-0 p-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-cyan-400"> Configuração de API</h2>
                <p className="text-sm text-gray-400 mt-1">Insira suas chaves de API para habilitar todas as funcionalidades.</p>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
                <div>
                    <label htmlFor="gemini-key" className="block text-sm font-medium text-gray-300 mb-1">
                        Chave da API do Gemini <span className="text-red-400">*</span>
                    </label>
                    <input
                        id="gemini-key"
                        type="password"
                        value={localGeminiKey}
                        onChange={(e) => setLocalGeminiKey(e.target.value)}
                        className="input-new"
                        placeholder="Cole sua chave do Google AI Studio aqui"
                    />
                </div>
                
                <div className="border-t border-gray-700 pt-4">
                     <p className="text-sm font-medium text-gray-300 mb-2">Credenciais do Google Drive (Opcional)</p>
                     <div className="space-y-3">
                        <div>
                            <label htmlFor="drive-api-key" className="block text-xs text-gray-400 mb-1">Chave da API do Google Drive</label>
                            <input
                                id="drive-api-key"
                                type="password"
                                value={localDriveApiKey}
                                onChange={(e) => setLocalDriveApiKey(e.target.value)}
                                className="input-new"
                                placeholder="Cole a Chave de API do Google Cloud aqui"
                            />
                        </div>
                         <div>
                            <label htmlFor="drive-client-id" className="block text-xs text-gray-400 mb-1">ID do Cliente Google Drive</label>
                            <input
                                id="drive-client-id"
                                type="password"
                                value={localDriveClientId}
                                onChange={(e) => setLocalDriveClientId(e.target.value)}
                                className="input-new"
                                placeholder="Cole o ID do Cliente OAuth 2.0 aqui"
                            />
                        </div>
                         <div>
                            <label htmlFor="project-number" className="block text-xs text-gray-400 mb-1">Número do Projeto Google</label>
                            <input
                                id="project-number"
                                type="text"
                                value={localProjectNumber}
                                onChange={(e) => setLocalProjectNumber(e.target.value)}
                                className="input-new"
                                placeholder="Cole o Número do Projeto aqui"
                            />
                        </div>
                     </div>
                </div>

                <p className="text-xs text-gray-500 text-center pt-2">
                    Não sabe onde encontrar suas chaves? <br/>
                    Consulte o nosso <a href="./Guia de Configuração.md" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Guia de Configuração</a>.
                </p>

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            </div>
            <div className="flex-shrink-0 p-4 border-t border-gray-700 flex justify-end">
                 <button 
                    onClick={handleSave}
                    className="button-new primary"
                >
                    Salvar e Continuar
                </button>
            </div>
        </div>
    </div>
  );
} 