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

import {GoogleGenAI, GenerateContentResponse} from '@google/genai';
import { BoundingBox2DType, BoundingBox3DType, BoundingBoxMaskType, DetectTypes, PointingType } from './Types';

// A instância do `ai` agora é criada dinamicamente dentro da função analyzeImageWithGemini,
// usando a chave de API fornecida pelo usuário.

// Função exportada para análise de imagem genérica via Gemini
export async function analyzeImageWithGemini(
  geminiApiKey: string, // Chave de API agora é um argumento
  imageDataBase64: string, // string base64 sem 'data:image/png;base64,'
  promptText: string,
  temperatureValue: number,
  isSegmentation: boolean,
  modelName: string = 'gemini-2.5-flash'
): Promise<any> { // Retorna a resposta JSON PARSEADA
  if (!geminiApiKey) {
    throw new Error("A chave da API do Gemini não foi configurada. Por favor, insira-a no modal de configuração.");
  }
  
  // Instancia o cliente da API aqui, com a chave fornecida.
  const ai = new GoogleGenAI({apiKey: geminiApiKey});

  const config: {
    temperature: number;
    thinkingConfig?: { thinkingBudget: number };
    responseMimeType?: string;
  } = {
    temperature: temperatureValue,
    responseMimeType: 'application/json', // Solicita saída JSON
  };
  
  const genAIResponse: GenerateContentResponse = await ai.models.generateContent({
    model: modelName,
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              data: imageDataBase64,
              mimeType: 'image/png', // Assumindo PNG por simplicidade, poderia ser dinâmico
            },
          },
          { text: promptText },
        ],
      },
    ],
    config,
  });

  let responseText = genAIResponse.text;

  // Padroniza a extração de JSON
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = responseText.match(fenceRegex);
  if (match && match[2]) {
    responseText = match[2].trim();
  } else if (responseText.startsWith('```json')) { 
     responseText = responseText.substring(7, responseText.length - 3).trim();
  } else if (responseText.startsWith('```')) {
     responseText = responseText.substring(3, responseText.length - 3).trim();
  }
  
  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.error("Falha ao analisar resposta JSON:", responseText, e);
    throw new Error("Resposta da API não é um JSON válido. Conteúdo: " + responseText.substring(0, 200) + "...");
  }
}


// Função exportada para formatar a resposta do Gemini com base no tipo de detecção
export function formatGeminiResponseForDetectType(
  parsedResponse: any, 
  detectType: DetectTypes
): BoundingBox2DType[] | BoundingBox3DType[] | BoundingBoxMaskType[] | PointingType[] {
  if (!Array.isArray(parsedResponse)) {
    console.warn("A resposta da API não é um array, como esperado:", parsedResponse);
    // Tenta usá-la se for um único objeto, caso contrário, retorna um array vazio
    if (typeof parsedResponse === 'object' && parsedResponse !== null) {
        parsedResponse = [parsedResponse];
    } else {
        return [];
    }
  }

  const mapItem = (item: any) => {
    const safetyData = {
      risco: item.risco || 'N/A',
      nr: item.nr || '',
      itemNr: item.item_nr || item.itemNr || '', // Lida com 'item_nr' e 'itemNr'
      descricaoRisco: item.descricao_risco || item.descricaoRisco || 'N/A',
      fonte: item.fonte || '', // Extrai o novo campo de fonte
      planoAcao: item.plano_acao || item.planoAcao || [],
    };
    return safetyData;
  };


  switch (detectType) {
    case 'Caixas delimitadoras 2D':
      return parsedResponse.map(
        (item: {box_2d: [number, number, number, number]} & any) => {
          const [ymin, xmin, ymax, xmax] = item.box_2d || [0,0,0,0];
          return {
            ...mapItem(item),
            x: xmin / 1000,
            y: ymin / 1000,
            width: (xmax - xmin) / 1000,
            height: (ymax - ymin) / 1000,
          };
        },
      );
    case 'Pontos':
      return parsedResponse.map(
        (item: {point: [number, number]} & any) => {
          const pointCoords = item.point || [0,0];
          return {
            ...mapItem(item),
            point: {
              x: pointCoords[1] / 1000, // x geralmente é a segunda coordenada
              y: pointCoords[0] / 1000, // y geralmente é a primeira coordenada
            },
          };
        },
      );
    case 'Máscaras de segmentação':
      const formattedBoxes = parsedResponse.map(
        (item: {
          box_2d: [number, number, number, number];
          mask: string;
        } & any) => {
          const [ymin, xmin, ymax, xmax] = item.box_2d || [0,0,0,0];
          return {
            ...mapItem(item),
            x: xmin / 1000,
            y: ymin / 1000,
            width: (xmax - xmin) / 1000,
            height: (ymax - ymin) / 1000,
            imageData: item.mask || '',
          };
        },
      );
      // ordena do maior para o menor
      return formattedBoxes.sort(
        (a: any, b: any) => b.width * b.height - a.width * a.height,
      );
    case 'Caixas delimitadoras 3D':
      return parsedResponse.map(
        (item: {
          box_3d: [number, number, number, number, number, number, number, number, number];
        } & any) => {
          const b3d = item.box_3d || [0,0,0,0,0,0,0,0,0];
          const center = b3d.slice(0, 3) as [number, number, number];
          const size = b3d.slice(3, 6) as [number, number, number];
          // Assumindo que o RPY da API está em graus, conforme solicitado no prompt.
          // Converte para radianos para consistência, se outras partes da aplicação esperarem radianos para RPY.
          const rpy = b3d.slice(6).map((x: number) => (x * Math.PI) / 180) as [number, number, number];
          return { ...mapItem(item), center, size, rpy };
        },
      );
    default:
      return [];
  }
}