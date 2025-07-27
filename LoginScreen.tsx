/** @license
 * SPDX-License-Identifier: Apache-2.0 */
/* Copyright 2024 Lucas Bicalho, PMP */

import { useState } from "react";
import { useAtom, useSetAtom } from 'jotai/react';
import { ApiKeyAtoms, IsApiKeyModalVisibleAtom, IsUserAuthenticatedAtom } from "./atoms";

export function LoginScreen() {
    const setIsUserAuthenticated = useSetAtom(IsUserAuthenticatedAtom);
    const [geminiApiKey] = useAtom(ApiKeyAtoms.gemini);
    const setIsApiKeyModalVisible = useSetAtom(IsApiKeyModalVisibleAtom);
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Simulated authentication logic
        if (email.trim() !== '' && password.trim() !== '') {
            // In a real application, here would be an API call to a backend
            console.log("Simulated successful login for:", email);
            setIsUserAuthenticated(true);
            
            // After authenticating, check if the main API key is missing
            // If so, trigger the modal for the user to enter the keys.
            if (!geminiApiKey) {
                setIsApiKeyModalVisible(true);
            }
        } else {
            setError('Por favor, preencha o e-mail e a senha.');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white font-sans antialiased">
            {/* Header with logo */}
            <header className="absolute top-0 left-0 p-6">
                <h2 className="text-lg font-semibold text-gray-400">Verum Institute</h2>
            </header>

            {/* Main content centered */}
            <main className="flex-grow flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-sm text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-white">
                        <span className="text-cyan-400">AI.</span>MÉTODO EXPERT
                        <span className="block text-2xl font-normal text-gray-300 mt-1">SSMA</span>
                    </h1>
                    <p className="mt-4 text-gray-400">
                        Sua plataforma de IA para análise inteligente de Segurança, Saúde e Meio Ambiente.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">E-mail</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-new"
                                placeholder="E-mail"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Senha</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-new"
                                placeholder="Senha"
                            />
                        </div>

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                className="button-new primary w-full"
                            >
                                Entrar
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            
            {/* Footer */}
            <footer className="text-center p-4 text-xs text-gray-500">
                &copy; {new Date().getFullYear()} Lucas Bicalho, PMP. Todos os direitos reservados.
            </footer>
        </div>
    );
}