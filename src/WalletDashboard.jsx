// src/WalletDashboard.jsx - CORRIGIDO com modal de desbloqueio

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ethers } from 'ethers';
import EthPriceChart from './EthPriceChart';
import logo from './assets/logo.png';
import SecurityScreen from './SecurityScreen';
import AddFundsScreen from './AddFundsScreen';
import SendFundsScreen from './SendFundsScreen';

// Defina sua ALCHEMY_URL aqui
const ALCHEMY_URL = "https://eth-sepolia.g.alchemy.com/v2/dC3pmW1-LvddpiUj1zchD"; 

// --- Componentes de Ícones SVG (Sem Alterações) ---
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const AddFundsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

const SendFundsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 5 19 12"></polyline>
    </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const EthIcon = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.69L11.5 3.5V12.9L12 13.12L18 9.52L12 2.69Z" fill="#343434"/>
    <path d="M12 2.69L6 9.52L12 13.12V3.5L12 2.69Z" fill="#8C8C8C"/>
    <path d="M12 14.32L11.5 14.5V20.5L12 21.31L18 10.72L12 14.32Z" fill="#3C3C3B"/>
    <path d="M12 21.31L12 14.32L6 10.72L12 21.31Z" fill="#8C8C8C"/>
    <path d="M12 13.12L18 9.52L12 6.92V13.12Z" fill="#141414"/>
    <path d="M6 9.52L12 13.12V6.92L6 9.52Z" fill="#393939"/>
  </svg>
);

// --- Componente do Menu Hambúrguer (Código Completo) ---
const HeaderMenu = ({ onLock, onToggleTheme, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavigation = (view) => {
    onNavigate(view);
    setIsOpen(false);
  };

  const handleToggleTheme = () => {
    onToggleTheme();
    setIsOpen(false);
  };

  const handleLock = () => {
    onLock();
    setIsOpen(false); 
  }

  return (
    <div className="header-menu-container" ref={menuRef}>
      <button className={`hamburger-icon ${isOpen ? 'is-open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line className="line top" x1="3" y1="6" x2="21" y2="6"></line>
          <line className="line middle" x1="3" y1="12" x2="21" y2="12"></line>
          <line className="line bottom" x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={() => handleNavigation('main')}>
            <HomeIcon />
            <span>Início</span>
          </button>
          <button className="dropdown-item" onClick={() => handleNavigation('addFunds')}>
            <AddFundsIcon />
            <span>Adicionar Fundos</span>
          </button>
          <button className="dropdown-item" onClick={() => handleNavigation('sendFunds')}>
            <SendFundsIcon />
            <span>Enviar Fundos</span>
          </button>
          <button className="dropdown-item" onClick={() => handleNavigation('security')}>
            <ShieldIcon />
            <span>Segurança</span>
          </button>
          <button className="dropdown-item" onClick={handleToggleTheme}>
            <MoonIcon />
            <span>Modo Escuro</span>
          </button>
          <button className="dropdown-item" onClick={handleLock}>
            <LogOutIcon />
            <span>Sair</span>
          </button>
        </div>
      )}
    </div>
  );
};


// --- Componente Principal WalletDashboard ---
function WalletDashboard({ wallet, onLock, onToggleTheme, activeView, setActiveView, currentTheme, onWalletUnlocked }) {
    const [balance, setBalance] = useState('0');
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // NOVO ESTADO: Controla a visibilidade do modal de desbloqueio
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [unlockPassword, setUnlockPassword] = useState('');
    const [unlockError, setUnlockError] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);

    const provider = useMemo(() => new ethers.JsonRpcProvider(ALCHEMY_URL), []);

    useEffect(() => {
        const storedName = localStorage.getItem('walletName');
        if (storedName) {
            setUserName(storedName);
        }

        const fetchBalanceAndCheckUnlock = async () => {
            setLoading(true);
            setError('');
            let addressToFetch = wallet?.address; // Tenta pegar o endereço da carteira em memória

            // Se a carteira NÃO está desbloqueada na memória, mas existe no localStorage,
            // então precisamos do modal de desbloqueio.
            if (!wallet) {
                const storedEncryptedWallet = localStorage.getItem('encryptedWallet');
                const storedUserAddress = localStorage.getItem('userAddress');

                if (storedEncryptedWallet && storedUserAddress) {
                    addressToFetch = storedUserAddress; // Pega o endereço para exibir saldo
                    setShowUnlockModal(true); // Exibe o modal para desbloquear a carteira
                } else {
                    // Caso não tenha carteira alguma salva, algo está errado no fluxo,
                    // ou o usuário precisa ir para a tela de login para criar uma.
                    // Isso não deve acontecer com a lógica do App.jsx, mas é um fallback.
                    onLock(); // Força o logout para ir para o LoginScreen
                    setLoading(false);
                    return;
                }
            } else {
                // Se a carteira já está desbloqueada, não mostra o modal.
                setShowUnlockModal(false);
            }

            if (!addressToFetch || !provider) {
                setLoading(false);
                setError('Não foi possível carregar o endereço da carteira ou provedor indisponível.');
                return;
            }

            try {
                const balanceWei = await provider.getBalance(addressToFetch);
                const balanceEth = ethers.formatEther(balanceWei);
                setBalance(balanceEth);
            } catch (err) {
                setError('Falha ao buscar saldo.');
                console.error("Erro ao buscar saldo:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBalanceAndCheckUnlock();
    }, [wallet, provider, onLock]); // Dependências: wallet, provider, onLock

    // Função para lidar com o desbloqueio da carteira via modal
    const handleUnlockWalletFromModal = async () => {
        setUnlockError('');
        if (!unlockPassword) {
            setUnlockError('Por favor, digite sua senha.');
            return;
        }
        setIsUnlocking(true);
        try {
            const encryptedJson = localStorage.getItem('encryptedWallet');
            const decryptedWallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, unlockPassword);
            
            // Sucesso: a carteira foi desbloqueada.
            onWalletUnlocked(decryptedWallet); // Atualiza o estado da carteira no App.jsx
            setShowUnlockModal(false); // Fecha o modal
            setUnlockPassword(''); // Limpa a senha
        } catch (err) {
            setUnlockError('Senha incorreta. Tente novamente.');
            console.error("Erro ao desbloquear carteira via modal:", err);
        } finally {
            setIsUnlocking(false);
        }
    };

    // Renderiza o modal de desbloqueio
    const renderUnlockModal = () => {
        if (!showUnlockModal) return null;

        return (
            <div className="modal-overlay">
                <div className="card" style={{maxWidth: '420px', textAlign: 'center'}}>
                    <h2 style={{color: 'var(--text-primary)'}}>Carteira Protegida</h2>
                    <p style={{color: 'var(--text-secondary)'}}>
                        Sua carteira está bloqueada. Por favor, digite sua senha para acessar todas as funcionalidades.
                    </p>
                    <input
                        type="password"
                        placeholder="Digite sua senha"
                        value={unlockPassword}
                        onChange={(e) => setUnlockPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleUnlockWalletFromModal()}
                        className="security-input" // Reutiliza estilo de input
                        style={{width: 'calc(100% - 32px)', margin: '1rem 0'}} // Ajuste de largura para mobile
                    />
                    {unlockError && <p className="error-message">{unlockError}</p>}
                    <button
                        onClick={handleUnlockWalletFromModal}
                        disabled={isUnlocking || !unlockPassword}
                        className="button primary"
                        style={{marginTop: '1.5rem'}}
                    >
                        {isUnlocking ? 'Desbloqueando...' : 'Desbloquear Carteira'}
                    </button>
                    {/* Opcional: Botão para Sair completamente, caso o usuário queira */}
                    <button
                        onClick={onLock} // Leva o usuário para a tela de LoginScreen para recriar/acessar outra
                        className="link-button"
                        style={{marginTop: '1rem', fontSize: '0.9rem'}}
                    >
                        Sair
                    </button>
                </div>
            </div>
        );
    };

    // Retorno do componente principal
    return (
        <div className="wallet-screen">
            <header className="wallet-header">
                <div className="logo-container">
                    <img src={logo} alt="Logótipo da Guardian Wallet" className="logo" />
                    <h1>
                        <strong>Guardian</strong>
                        <span> Wallet</span>
                    </h1>
                </div>
                <HeaderMenu 
                  onLock={onLock} 
                  onToggleTheme={onToggleTheme} 
                  onNavigate={setActiveView}
                />
            </header>
            
            {renderUnlockModal()} {/* Renderiza o modal aqui */}

            <main className="wallet-content" style={showUnlockModal ? {filter: 'blur(3px)', pointerEvents: 'none'} : {}}>
              {/* Mensagem de boas-vindas */}
              {userName && (
                <h2 className="welcome-greeting">
                  Olá, <strong>{userName}</strong>!
                </h2>
              )}

              <div className="balance-section">
                <p className="balance-label">SALDO TOTAL</p>
                <div className="balance-value">
                  {loading ? 'A carregar...' : parseFloat(balance).toFixed(5)}
                  <div className="eth-unit">
                    <EthIcon className="eth-icon"/>
                    <span>ETH</span>
                  </div>
                </div>
              </div>
              <div className="chart-section">
                <p className="address-label">ETHEREUM (USD) - ÚLTIMOS 7 DIAS</p>
                <EthPriceChart />
              </div>
              {error && <p className="error-message" style={{textAlign: 'center'}}>{error}</p>}
            </main>

            {/* Telas que exigem a carteira desbloqueada só são acessíveis se wallet não for null */}
            {activeView === 'security' && wallet && <SecurityScreen wallet={wallet} onNavigate={setActiveView} />}
            {activeView === 'addFunds' && <AddFundsScreen walletAddress={wallet?.address || localStorage.getItem('userAddress')} onNavigate={setActiveView} currentTheme={currentTheme} />}
            {activeView === 'sendFunds' && wallet && <SendFundsScreen wallet={wallet} provider={provider} onNavigate={setActiveView} currentBalance={balance} />}
        </div>
    );
}

export default WalletDashboard;