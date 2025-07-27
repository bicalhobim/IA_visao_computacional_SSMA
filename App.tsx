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
import { IsUserAuthenticatedAtom } from './atoms';
import { LoginScreen } from './LoginScreen';
import { MainAppLayout } from './MainAppLayout';


function App() {
  const [isUserAuthenticated] = useAtom(IsUserAuthenticatedAtom);

  useEffect(() => {
    // Garante que o tema escuro seja aplicado globalmente
    document.documentElement.classList.add('dark');
  }, []);

  return isUserAuthenticated ? <MainAppLayout /> : <LoginScreen />;
}

export default App;