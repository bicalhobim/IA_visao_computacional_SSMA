/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// Copyright 2024 Lucas Bicalho, PMP

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// !!! ATENÇÃO IMPORTANTE !!!
// As chaves de API e outras credenciais foram movidas deste arquivo
// para um modal de configuração dentro da própria aplicação.
//
// O usuário agora insere as chaves diretamente na interface, e elas
// são salvas no `localStorage` do navegador. Isso torna a configuração
// mais segura e acessível para usuários não-técnicos.
//
// Para obter as credenciais necessárias, consulte o `Guia de Configuração.md`.
// Este arquivo agora contém apenas constantes não sensíveis.

// Escopos definem as permissões que o aplicativo solicitará ao usuário.
// drive.readonly: Permite ver arquivos e metadados.
// drive.file: Necessário para o Google Picker selecionar arquivos/pastas.
export const GOOGLE_DRIVE_SCOPES = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file';

// Documentos de descoberta para a API do Google Drive v3
export const GOOGLE_DRIVE_DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
