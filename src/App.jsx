// src/App.jsx - CORRIGIDO para o fluxo de logout

import React, { useState, useEffect } from 'react';
import LoginScreen from './LoginScreen';
import WalletDashboard from './WalletDashboard';
import './App.css';

function App() {
  const [unlockedWallet, setUnlockedWallet] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [activeDashboardView, setActiveDashboardView] = useState('main');

  // NOVO ESTADO: Para controlar se o usuário está 'logado' na sessão atual, persistido via localStorage
  const [isUserLoggedInSession, setIsUserLoggedInSession] = useState(false);
  // Estado para garantir que a verificação inicial do localStorage foi concluída
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);


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
    return <div className="App"><header className="App-header">Carregando...</header></div>;
  }

  // Lógica de renderização principal:
  // Se o usuário está logado na sessão (via isLoggedIn no localStorage) E/OU a carteira está desbloqueada na memória,
  // E também existe uma carteira criptografada no localStorage, vai para o Dashboard.
  // Caso contrário, vai para o LoginScreen.
  const renderAppContent = () => {
    const hasEncryptedWalletOnDisk = localStorage.getItem('encryptedWallet') !== null;

    if (unlockedWallet) {
      // Cenário 1: Carteira desbloqueada na sessão atual
      return (
        <WalletDashboard
          wallet={unlockedWallet} // Carteira completa
          onLock={handleLock}
          onToggleTheme={toggleTheme}
          activeView={activeDashboardView}
          setActiveView={setActiveDashboardView}
          currentTheme={theme}
          onWalletUnlocked={handleLoginSuccess}
        />
      );
    } else if (isUserLoggedInSession && hasEncryptedWalletOnDisk) {
      // Cenário 2: Usuário estava logado na sessão anterior OU fez refresh, e tem carteira no disco.
      // Vai para o Dashboard com o modal de desbloqueio.
      return (
        <WalletDashboard
          wallet={null} // Passa null para o Dashboard, indicando que ele deve mostrar o modal
          onLock={handleLock}
          onToggleTheme={toggleTheme}
          activeView={activeDashboardView}
          setActiveView={setActiveDashboardView}
          currentTheme={theme}
          onWalletUnlocked={handleLoginSuccess}
        />
      );
    } else {
      // Cenário 3: Não está logado na sessão, ou não tem carteira no disco (logout ou primeiro acesso)
      return <LoginScreen onWalletUnlocked={handleLoginSuccess} />;
    }
  };

  // A classe do App agora reflete se estamos em um contexto de dashboard ou login
  const appViewClass = (unlockedWallet || (isUserLoggedInSession && localStorage.getItem('encryptedWallet') !== null)) ? 'dashboard-view' : 'login-view';
  const appClassName = `App ${appViewClass} theme-${theme}`;

  return (
    <div className={appClassName}>
      <header className="App-header">
        {renderAppContent()}
      </header>
    </div>
  );
}

export default App;