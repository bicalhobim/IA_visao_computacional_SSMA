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

import {atom} from 'jotai';
import {
  colors,
  defaultPromptParts,
  defaultPrompts,
  imageOptions,
} from './consts';
import {
  BoundingBox2DType,
  BoundingBox3DType,
  BoundingBoxMaskType,
  DetectTypes,
  PointingType, // Importa PointingType
} from './Types';

// Helper to create explicitly writable atoms to work around a potential build/type issue.
function writableAtom<Value>(initialValue: Value) {
    const baseAtom = atom(initialValue);
    type Update = Value | ((prev: Value) => Value);
    return atom(
        (get) => get(baseAtom),
        (get, set, update: Update) => {
            set(baseAtom, update);
        }
    );
}

// Helper to get value from localStorage
const getStoredKey = (key: string, fallback: string = ''): string => {
    try {
        const item = window.localStorage.getItem(key);
        return item !== null ? item : fallback;
    } catch {
        return fallback;
    }
};

// Helper to create a persistent atom
const persistentAtom = (key: string, initialValue: string = '') => {
    const anAtom = atom(getStoredKey(key, initialValue));
    const derived = atom(
        (get) => get(anAtom),
        (get, set, newValue: string) => {
            set(anAtom, newValue);
            try {
                window.localStorage.setItem(key, newValue);
            } catch (e) {
                console.error(`Falha ao salvar a chave ${key} no localStorage`, e);
            }
        }
    );
    return derived;
};


// --- Atoms de Autenticação e Configuração ---
export const IsUserAuthenticatedAtom = writableAtom(false);

export const ApiKeyAtoms = {
    gemini: persistentAtom('aiverum_gemini_api_key'),
    googleDriveApi: persistentAtom('aiverum_google_drive_api_key'),
    googleDriveClient: persistentAtom('aiverum_google_drive_client_id'),
    googleProjectNumber: persistentAtom('aiverum_google_project_number'),
};

export const IsApiKeyModalVisibleAtom = atom(false);


// --- Atoms de Estado da Aplicação ---
export const ImageSrcAtom = writableAtom<string | null>(imageOptions[0]);

export const ImageSentAtom = writableAtom(false);

export const PromptsAtom = writableAtom<Record<DetectTypes, string[]>>({
  ...(defaultPromptParts as Record<DetectTypes, string[]>),
});
export const CustomPromptsAtom = writableAtom<Record<DetectTypes, string>>({
  ...(defaultPrompts as Record<DetectTypes, string>),
});

export const RevealOnHoverModeAtom = writableAtom<boolean>(true);

export const FOVAtom = writableAtom<number>(60);

export const TemperatureAtom = writableAtom<number>(0.5);

export const ShareStream = writableAtom<MediaStream | null>(null);

export const DrawModeAtom = writableAtom<boolean>(false);

export const DetectTypeAtom = writableAtom<DetectTypes>('Caixas delimitadoras 2D');

export const LinesAtom = writableAtom<[[number, number][], string][]>([]);

export const ActiveColorAtom = writableAtom(colors[6]);

export const VideoRefAtom = writableAtom<{current: HTMLVideoElement | null}>({
  current: null,
});

export const BumpSessionAtom = writableAtom(0);

export const IsUploadedImageAtom = writableAtom(false);

// Atoms para controlar a visibilidade dos painéis
export const IsResultsPanelVisibleAtom = writableAtom(false);
export const IsLeftPanelCollapsedAtom = writableAtom(false);
export const IsRightPanelCollapsedAtom = writableAtom(false);

// Atom para controlar o visualizador de relatório HTML
export const ReportHtmlToViewAtom = writableAtom<string | null>(null);


// --- Atoms de Resultados da Análise ---
export const BoundingBoxes2DAtom = writableAtom<BoundingBox2DType[]>([]);
export const BoundingBoxes3DAtom = writableAtom<BoundingBox3DType[]>([]);
export const BoundingBoxMasksAtom = writableAtom<BoundingBoxMaskType[]>([]);
export const PointsAtom = writableAtom<PointingType[]>([]);
export const HoveredBoxAtom = writableAtom<number | null>(null);

export const ActiveResultIndexAtom = writableAtom<number | null>(null);
export const AnnotationsVisibleAtom = writableAtom(true); 
export const HiddenAnnotationIndicesAtom = writableAtom<number[]>([]); 


// --- Atoms de Processamento em Lote ---
export const IsBatchProcessingAtom = writableAtom(false);

export const BatchProcessingProgressAtom = writableAtom<{
  current: number;
  total: number;
  currentFileName: string;
  statusMessage: string;
}>({ current: 0, total: 0, currentFileName: '', statusMessage: '' });

export type BatchResultItem = {
  imageName: string;
  detectType: DetectTypes;
  detectionData: BoundingBox2DType[] | BoundingBox3DType[] | BoundingBoxMaskType[] | PointingType[];
  imageBase64: string | null;
  error?: string;
  source?: 'local' | 'drive';
};
export const BatchResultsAtom = writableAtom<BatchResultItem[]>([]);

// --- Atoms de Integração com Google Drive ---
export const IsGapiScriptLoadedAtom = writableAtom(false);
export const IsGapiInitializedAtom = writableAtom(false);
export const IsGoogleAuthenticatedAtom = writableAtom(false);
export type GoogleUser = {
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
};
export const GoogleUserAtom = writableAtom<GoogleUser | null>(null);

export const GoogleAuthErrorAtom = writableAtom<string | null>(null);

export const DriveFolderInfoAtom = writableAtom<{id: string; name: string} | null>(null);

export type DriveFile = { id: string; name: string; mimeType: string; webViewLink?: string;};

export const DriveImageFilesAtom = writableAtom<DriveFile[]>([]);


// --- Atoms para Histórico de Análises Recentes ---
const RECENT_ANALYSES_STORAGE_KEY = 'aiverum_recent_analyses';

export type AnalysisStatus = 'queued' | 'analyzing' | 'analyzed';

export type RecentAnalysis = {
  id: number; // Timestamp de quando foi criado
  thumbnail: string; // base64 de uma imagem pequena
  fullImage: string; // base64 da imagem completa para restaurar
  detectType: DetectTypes;
  detectionData: BatchResultItem['detectionData'];
  status: AnalysisStatus;
};

const getInitialRecentAnalyses = (): RecentAnalysis[] => {
  try {
    const item = window.localStorage.getItem(RECENT_ANALYSES_STORAGE_KEY);
    const parsedItems = item ? JSON.parse(item) : [];
    return parsedItems.map((analysis: any) => ({
        ...analysis,
        status: analysis.status || 'analyzed',
    }));
  } catch (error) {
    console.error('Erro ao ler análises recentes do localStorage:', error);
    return [];
  }
};

type RecentAnalysesUpdate = 
    | { type: 'ADD_QUEUED'; payload: Omit<RecentAnalysis, 'status' | 'detectionData' | 'detectType'>[] }
    | { type: 'UPDATE'; payload: Partial<Omit<RecentAnalysis, 'id'>> & { id: number } }
    | { type: 'RESET_SESSION' };


const _RecentAnalysesAtom = atom<RecentAnalysis[]>(getInitialRecentAnalyses());

export const RecentAnalysesAtom = atom(
  (get) => get(_RecentAnalysesAtom),
  (get, set, update: RecentAnalysesUpdate) => {
    let currentAnalyses = get(_RecentAnalysesAtom);
    let updatedAnalyses = [...currentAnalyses];

    switch (update.type) {
      case 'ADD_QUEUED': {
        const newItems: RecentAnalysis[] = update.payload.map(p => ({
            ...p,
            status: 'queued',
            detectionData: [],
            detectType: get(DetectTypeAtom),
        }));
        const existingImageUrls = new Set(currentAnalyses.map(a => a.fullImage));
        const uniqueNewItems = newItems.filter(item => !existingImageUrls.has(item.fullImage));
        updatedAnalyses = [...uniqueNewItems, ...currentAnalyses];
        break;
      }
      case 'UPDATE': {
        updatedAnalyses = currentAnalyses.map(item =>
          item.id === update.payload.id ? { ...item, ...update.payload } : item
        );
        break;
      }
      case 'RESET_SESSION': {
        updatedAnalyses = currentAnalyses.filter(item => item.status === 'analyzed');
        break;
      }
    }
    
    set(_RecentAnalysesAtom, updatedAnalyses);

    const analyzedItems = updatedAnalyses.filter(item => item.status === 'analyzed').slice(0, 5);
    try {
      window.localStorage.setItem(RECENT_ANALYSES_STORAGE_KEY, JSON.stringify(analyzedItems));
    } catch (error) {
      console.error('Erro ao salvar análises recentes no localStorage:', error);
    }
  }
);