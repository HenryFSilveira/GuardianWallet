// src/App.jsx - CORRIGIDO para o fluxo de logout e layout do header

import React, { useState, useEffect } from 'react';
import LoginScreen from './LoginScreen';
import WalletDashboard from './WalletDashboard';
import './App.css'; // Aponta apenas para App.css

function App() {
  const [unlockedWallet, setUnlockedWallet] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [activeDashboardView, setActiveDashboardView] = useState('main');

  // NOVO ESTADO: Para controlar se o usuário está 'logado' na sessão atual, persistido via localStorage
  const [isUserLoggedInSession, setIsUserLoggedInSession] = useState(false);
  // Estado para garantir que a verificação inicial do localStorage foi concluída
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);

  // Efeito para garantir que a página inicie sempre no topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // Array de dependências vazio para rodar apenas uma vez na montagem

  // Efeito para carregar o tema e verificar o estado de login/carteira ao montar
  useEffect(() => {
    // Carrega o tema
    const storedTheme = localStorage.getItem('appTheme');
    if (storedTheme) {
      setTheme(storedTheme);
    }
    document.body.className = '';
    document.body.classList.add(`theme-${storedTheme || theme}`);

    // Verifica se o usuário estava logado na sessão anterior
    const wasLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const hasEncryptedWallet = localStorage.getItem('encryptedWallet');

    if (wasLoggedIn && hasEncryptedWallet) {
      // Se estava logado e tem uma carteira, assume que quer ir para o dashboard (com modal se necessário)
      setIsUserLoggedInSession(true);
    } else {
      // Caso contrário, não está logado na sessão (ou não tem carteira)
      setIsUserLoggedInSession(false);
    }
    setIsInitialCheckDone(true); // Marca que a verificação inicial foi concluída
  }, [theme]); // Depende do tema para garantir a classe do body

  const handleLoginSuccess = (wallet) => {
    setUnlockedWallet(wallet);
    localStorage.setItem('isLoggedIn', 'true'); // Marca como logado
    setIsUserLoggedInSession(true); // Atualiza o estado da sessão
    setActiveDashboardView('main');
  };

  const handleLock = () => {
    setUnlockedWallet(null); // Remove a carteira da memória (sessão)
    localStorage.setItem('isLoggedIn', 'false'); // Marca como deslogado
    setIsUserLoggedInSession(false); // Atualiza o estado da sessão
    setActiveDashboardView('main'); // Garante que a view volte para a principal (LoginScreen)
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('appTheme', newTheme);
      return newTheme;
    });
  };

  // Exibe um estado de carregamento enquanto a verificação inicial não é concluída
  if (!isInitialCheckDone) {
    // Melhorar este loading, talvez um spinner ou tela mais elaborada
    return <div className="App app-loading">Carregando...</div>;
  }

  // Lógica de renderização principal:
  // Se o usuário está logado na sessão (via isLoggedIn no localStorage) E/OU a carteira está desbloqueada na memória,
  // E também existe uma carteira criptografada no localStorage, vai para o Dashboard.
  // Caso contrário, vai para o LoginScreen.
  const hasEncryptedWalletOnDisk = localStorage.getItem('encryptedWallet') !== null;

  // A classe do App agora reflete se estamos em um contexto de dashboard ou login
  const appViewClass = (unlockedWallet || (isUserLoggedInSession && hasEncryptedWalletOnDisk)) ? 'dashboard-view' : 'login-view';
  const appClassName = `App ${appViewClass} theme-${theme}`;

  return (
    <div className={appClassName}>
      {/* Removido o <header className="App-header"> aqui */}
      {unlockedWallet || (isUserLoggedInSession && hasEncryptedWalletOnDisk) ? (
        <WalletDashboard
          wallet={unlockedWallet} // Carteira completa
          onLock={handleLock}
          onToggleTheme={toggleTheme}
          activeView={activeDashboardView}
          setActiveView={setActiveDashboardView}
          currentTheme={theme}
          onWalletUnlocked={handleLoginSuccess}
        />
      ) : (
        <LoginScreen onWalletUnlocked={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;