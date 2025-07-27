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

declare var gapi: any;
declare var google: any;

import { GOOGLE_DRIVE_SCOPES, GOOGLE_DRIVE_DISCOVERY_DOCS } from './googleDriveConfig';
import type { Dispatch, SetStateAction } from 'react';
import type { GoogleUser, DriveFile } from './atoms';


// Definições de tipo para funções 'setter' do Jotai, compatíveis com o tipo de 'dispatch' do useState do React
type BooleanSetter = Dispatch<SetStateAction<boolean>>;
type GoogleUserSetter = Dispatch<SetStateAction<GoogleUser | null>>;
type StringOrNullSetter = Dispatch<SetStateAction<string | null>>;
type DriveFolderInfoSetter = Dispatch<SetStateAction<{ id: string; name: string } | null>>;
type DriveImageFilesSetter = Dispatch<SetStateAction<DriveFile[]>>;


// Promise para garantir que o gapi seja carregado e que client/auth2 sejam inicializados
let gapiInitializationPromise: Promise<void> | null = null;

function checkCredentials(apiKey: string, clientId: string) {
  if (!apiKey || !clientId) {
    const message = `A Chave de API e/ou o ID do Cliente do Google Drive não foram fornecidos.`;
    console.error(message);
    return false;
  }
  return true;
}


export async function initializeGapiClient(
  setIsGapiInitialized: BooleanSetter,
  setIsGoogleAuthenticated: BooleanSetter,
  setGoogleUser: GoogleUserSetter,
  setGoogleAuthError: StringOrNullSetter,
  apiKey: string,
  clientId: string,
): Promise<void> {
  if (!checkCredentials(apiKey, clientId)) {
    setGoogleAuthError("Credenciais do Google Drive não configuradas.");
    setIsGapiInitialized(false);
    return;
  }

  // Não reinicializa se a promessa já existe e está em andamento.
  if (gapiInitializationPromise) {
    return gapiInitializationPromise;
  }

  gapiInitializationPromise = new Promise((resolve, reject) => {
    // Carrega o cliente e a autenticação
    gapi.load('client:auth2', async () => {
      try {
        await gapi.client.init({
          apiKey: apiKey,
          discoveryDocs: GOOGLE_DRIVE_DISCOVERY_DOCS,
        });

        await gapi.auth2.init({
          client_id: clientId,
          scope: GOOGLE_DRIVE_SCOPES,
        });
        
        setIsGapiInitialized(true);
        setGoogleAuthError(null);

        const authInstance = gapi.auth2.getAuthInstance();
        
        // Listener para mudanças no estado de login
        authInstance.isSignedIn.listen((isSignedIn:boolean) => {
          setIsGoogleAuthenticated(isSignedIn);
          if (isSignedIn) {
            const profile = authInstance.currentUser.get().getBasicProfile();
            setGoogleUser({
              name: profile.getName(),
              email: profile.getEmail(),
              imageUrl: profile.getImageUrl(),
            });
            setGoogleAuthError(null);
          } else {
            setGoogleUser(null);
          }
        });

        // Verifica o estado de login inicial
        const isSignedIn = authInstance.isSignedIn.get();
        setIsGoogleAuthenticated(isSignedIn);
        if (isSignedIn) {
          const profile = authInstance.currentUser.get().getBasicProfile();
          setGoogleUser({
            name: profile.getName(),
            email: profile.getEmail(),
            imageUrl: profile.getImageUrl(),
          });
        }
        resolve();
      } catch (error: any) {
        console.error('Erro ao inicializar GAPI client ou auth2:', error);
        setGoogleAuthError(`Erro ao inicializar Google API: ${error.details || error.message || error.toString()}`);
        setIsGapiInitialized(false);
        // Reseta a promessa em caso de erro para permitir nova tentativa
        gapiInitializationPromise = null; 
        reject(error);
      }
    });
  });
  return gapiInitializationPromise;
}

export async function handleSignIn() {
  if (!gapi.auth2 || !gapi.auth2.getAuthInstance()) {
    console.error('GAPI auth2 não inicializado.');
    alert('Serviço de autenticação do Google não está pronto. Tente novamente em instantes.');
    return;
  }
  try {
    await gapi.auth2.getAuthInstance().signIn();
  } catch (error: any) {
    console.error('Erro durante o Sign In:', error);
    if (error.error !== "popup_closed_by_user" && error.error !== "access_denied") {
      alert(`Erro ao tentar fazer login: ${error.details || error.message || 'Verifique as configurações do Client ID OAuth no Google Cloud Console (origens JavaScript, URIs de redirecionamento).'}`);
    }
  }
}

export async function handleSignOut(
  setDriveFolderInfo: DriveFolderInfoSetter,
  setDriveImageFiles: DriveImageFilesSetter
 ) {
  if (!gapi.auth2 || !gapi.auth2.getAuthInstance()) {
    console.error('GAPI auth2 não inicializado.');
    return;
  }
  await gapi.auth2.getAuthInstance().signOut();
  setDriveFolderInfo(null);
  setDriveImageFiles([]);
}


let pickerApiLoaded = false;

function loadPicker(callback: () => void) {
  if (pickerApiLoaded) {
    callback();
    return;
  }
  gapi.load('picker', { 'callback': () => {
    pickerApiLoaded = true;
    callback();
  }});
}


export function showFolderPicker(
  setDriveFolderInfo: DriveFolderInfoSetter,
  setGoogleAuthError: StringOrNullSetter,
  apiKey: string,
  projectNumber: string,
) {
  if (!apiKey || !projectNumber) {
    setGoogleAuthError("A Chave de API e o Número do Projeto do Google Drive são necessários.");
    return;
  }

  const_showFolderPicker(setDriveFolderInfo, setGoogleAuthError, apiKey, projectNumber).catch(error => {
      console.error("Erro não tratado em showFolderPicker:", error);
      setGoogleAuthError("Ocorreu um erro inesperado ao tentar abrir o seletor de pastas.");
  });
}

async function const_showFolderPicker(
  setDriveFolderInfo: DriveFolderInfoSetter,
  setGoogleAuthError: StringOrNullSetter,
  apiKey: string,
  projectNumber: string,
) {
  if (!gapi.auth2 || !gapi.auth2.getAuthInstance() || !gapi.auth2.getAuthInstance().isSignedIn.get()) {
    setGoogleAuthError('Usuário não autenticado. Por favor, conecte-se ao Google Drive primeiro.');
    return;
  }

  loadPicker(() => {
    const accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token;
    if (!accessToken) {
      setGoogleAuthError('Não foi possível obter o token de acesso. Tente reconectar.');
      return;
    }

    const view = new google.picker.View(google.picker.ViewId.FOLDERS);
    view.setMimeTypes("application/vnd.google-apps.folder");

    const picker = new google.picker.PickerBuilder()
      .setAppId(projectNumber) // Use o Número do Projeto aqui
      .setOAuthToken(accessToken)
      .setDeveloperKey(apiKey) // A Chave de API ainda é importante
      .addView(view)
      .setLocale('pt-BR')
      .setTitle('Selecione uma pasta do Google Drive')
      .setCallback((data: google.picker.ResponseObject) => {
        if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
          const doc = data[google.picker.Response.DOCUMENTS][0];
          if (doc.mimeType === "application/vnd.google-apps.folder") {
            setDriveFolderInfo({ id: doc.id, name: doc.name });
            setGoogleAuthError(null);
          } else {
            setGoogleAuthError("Por favor, selecione uma pasta.");
          }
        } else if (data[google.picker.Response.ACTION] === google.picker.Action.CANCEL) {
          console.log('Seleção de pasta cancelada.');
        } else if (data[google.picker.Response.ACTION] === google.picker.Action.ERROR ){
            setGoogleAuthError(`Erro no Google Picker: ${data[google.picker.Response.ERROR] || 'Erro desconhecido no Picker.'}`);
            console.error('Erro no Google Picker:', data);
        }
      })
      .build();
    picker.setVisible(true);
  });
}


export async function listImageFilesInFolder(
  folderId: string,
  setDriveImageFiles: DriveImageFilesSetter,
  setGoogleAuthError: StringOrNullSetter
): Promise<void> {
  try {
    if (!gapi.client.drive) {
        await new Promise<void>((resolve, reject) => {
            gapi.client.load('drive', 'v3', resolve).catch(reject);
        });
    }

    const response = await gapi.client.drive.files.list({
      q: `'${folderId}' in parents and (mimeType='image/jpeg' or mimeType='image/png' or mimeType='image/webp') and trashed=false`,
      fields: 'files(id, name, mimeType, webViewLink)',
      pageSize: 100, 
    });
    
    const files = response.result.files;
    if (files && files.length > 0) {
      setDriveImageFiles(files as DriveFile[]);
      setGoogleAuthError(null);
    } else {
      setDriveImageFiles([]);
      alert('Nenhum arquivo de imagem (jpg, png, webp) encontrado na pasta selecionada.');
    }
  } catch (error: any) {
    console.error('Erro ao listar arquivos do Drive:', error);
    setGoogleAuthError(`Erro ao listar arquivos: ${error.result?.error?.message || error.message || 'Erro desconhecido'}`);
    setDriveImageFiles([]);
  }
}

export async function downloadDriveFileAsBase64(fileId: string): Promise<string> {
  if (!gapi.client.drive) {
    await new Promise<void>((resolve, reject) => {
        gapi.client.load('drive', 'v3', resolve).catch(reject);
    });
  }

  try {
    const accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token;
    const fetchResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!fetchResponse.ok) {
      const errorBody = await fetchResponse.json().catch(() => ({message: fetchResponse.statusText}));
      throw new Error(`Falha ao baixar arquivo do Drive (${fetchResponse.status}): ${errorBody.error?.message || errorBody.message}`);
    }

    const blob = await fetchResponse.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string); 
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  } catch (error: any) {
    console.error(`Erro ao baixar arquivo ${fileId} do Drive:`, error);
    throw new Error(`Falha ao baixar arquivo do Drive: ${error.message || 'Erro desconhecido'}`);
  }
}

// Estende os tipos do google.picker se não estiverem totalmente disponíveis
declare global {
  namespace google.picker {
    interface ResponseObject {
      [key: string]: any;
    }
    const ViewId: {
        DOCS: string;
        DOCS_IMAGES: string;
        DOCS_IMAGES_AND_VIDEOS: string;
        DOCS_VIDEOS: string;
        DOCUMENTS: string;
        FOLDERS: string;
    };
     interface PickerBuilder {
        setAppId(appId: string): PickerBuilder;
        setLocale(locale: string): PickerBuilder;
        setTitle(title: string): PickerBuilder;
    }
     const Action: {
        CANCEL: string;
        PICKED: string;
        ERROR: string;
    };
    const Response: {
        ACTION: string;
        DOCUMENTS: string;
        ERROR: string;
    };
  }
   interface Window {
    gapiLoaded?: boolean;
  }
}