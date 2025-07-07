// src/WalletDashboard.jsx - CORRIGIDO com modal de desbloqueio e scroll-to-top e CONTROLE DO MENU HAMBÚRGUER

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ethers } from 'ethers';
import EthPriceChart from './EthPriceChart';
import logo from './assets/logo.png';
import SecurityScreen from './SecurityScreen';
import AddFundsScreen from './AddFundsScreen';
import SendFundsScreen from './SendFundsScreen';

// Defina sua ALCHEMY_URL aqui
const ALCHEMY_URL = "https://eth-sepolia.g.alchemy.com/v2/dC3pmW1-LvddpiUj1zchD";

// --- Componentes de Ícones SVG ---
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

// NOVO: Ícone de Cifrão ($) para Adicionar Fundos
const DollarSignIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

// NOVO: Ícone de Envio (seta para cima e direita - como "caixa de saída") para Enviar Fundos
const SendNewIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
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

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
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
// Adicionado onMenuChange prop para notificar o pai sobre o estado do menu
const HeaderMenu = ({ onLock, onToggleTheme, onNavigate, onMenuChange, currentTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    // Notifica o componente pai (WalletDashboard) sobre a mudança de estado
    if (onMenuChange) {
      onMenuChange(isOpen);
    }

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onMenuChange]);

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
            <DollarSignIcon /> {/* Substituído AddFundsIcon por DollarSignIcon */}
            <span>Adicionar Fundos</span>
          </button>
          <button className="dropdown-item" onClick={() => handleNavigation('sendFunds')}>
            <SendNewIcon /> {/* Substituído SendFundsIcon por SendNewIcon */}
            <span>Enviar Fundos</span>
          </button>
          <button className="dropdown-item" onClick={() => handleNavigation('security')}>
            <ShieldIcon />
            <span>Segurança</span>
          </button>
          <button className="dropdown-item" onClick={handleToggleTheme}>
            {currentTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
            <span>{currentTheme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
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
    // ADICIONADO: Novo estado para o preço do ETH em BRL
    const [ethPriceBrl, setEthPriceBrl] = useState(null);
    // ADICIONADO: Novo estado para o saldo convertido em BRL
    const [convertedBalanceBrl, setConvertedBalanceBrl] = useState('0,00');

    // NOVO ESTADO: Controla a visibilidade do modal de desbloqueio
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [unlockPassword, setUnlockPassword] = useState('');
    const [unlockError, setUnlockError] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);

    // NOVO ESTADO: Controla se o menu hambúrguer está aberto
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const provider = useMemo(() => new ethers.JsonRpcProvider(ALCHEMY_URL), []);

    // Efeito para rolar para o topo ao mudar a view
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activeView]);

    // Efeito para adicionar/remover a classe 'menu-open' no body
    useEffect(() => {
      if (isMenuOpen) {
        document.body.classList.add('menu-open');
      } else {
        document.body.classList.remove('menu-open');
      }
      // Limpeza: garante que a classe seja removida ao desmontar o componente
      return () => {
        document.body.classList.remove('menu-open');
      };
    }, [isMenuOpen]);


    useEffect(() => {
        const storedName = localStorage.getItem('walletName');
        if (storedName) {
            setUserName(storedName);
        }

        const fetchBalanceAndPrice = async () => {
            setLoading(true);
            setError('');
            let addressToFetch = wallet?.address;

            if (!wallet) {
                const storedEncryptedWallet = localStorage.getItem('encryptedWallet');
                const storedUserAddress = localStorage.getItem('userAddress');

                if (storedEncryptedWallet && storedUserAddress) {
                    addressToFetch = storedUserAddress;
                    setShowUnlockModal(true);
                } else {
                    onLock();
                    setLoading(false);
                    return;
                }
            } else {
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

                // ADICIONADO: Buscar Preço do ETH em BRL da CoinGecko API
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=brl');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const price = data.ethereum.brl;
                setEthPriceBrl(price);

                // ADICIONADO: Calcular Saldo Convertido para BRL
                setConvertedBalanceBrl((parseFloat(balanceEth) * price).toFixed(2));

            } catch (err) {
                setError('Falha ao buscar saldo ou preço do ETH.');
          
                setEthPriceBrl(null);
                setConvertedBalanceBrl('0,00');
            } finally {
                setLoading(false);
            }
        };
        fetchBalanceAndPrice();
        // ADICIONADO: Atualiza o preço a cada 1 minuto (60 segundos)
        const intervalId = setInterval(fetchBalanceAndPrice, 60000);
        return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente
    }, [wallet, provider, onLock]);

    // ADICIONADO: Efeito para recalcular saldo convertido sempre que o balance ou ethPriceBrl mudar
    useEffect(() => {
        if (balance && ethPriceBrl !== null) {
            setConvertedBalanceBrl((parseFloat(balance) * ethPriceBrl).toFixed(2));
        } else {
            setConvertedBalanceBrl('0,00');
        }
    }, [balance, ethPriceBrl]);


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

            onWalletUnlocked(decryptedWallet);
            setShowUnlockModal(false);
            setUnlockPassword('');
        } catch (err) {
            setUnlockError('Senha incorreta. Tente novamente.');
            console.error("Erro ao desbloquear carteira via modal:", err);
        } finally {
            setIsUnlocking(false);
        }
    };

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
                        className="security-input"
                        style={{width: 'calc(100% - 32px)', margin: '1rem 0'}}
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
                    <button
                        onClick={onLock}
                        className="link-button"
                        style={{marginTop: '1rem', fontSize: '0.9rem'}}
                    >
                        Sair
                    </button>
                </div>
            </div>
        );
    };

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
                  onMenuChange={setIsMenuOpen}
                  currentTheme={currentTheme}
                />
            </header>

            {renderUnlockModal()}

            <main className="wallet-content" style={showUnlockModal ? {filter: 'blur(3px)', pointerEvents: 'none'} : {}}>
              {activeView === 'main' && (
                <>
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
                    {/* ADICIONADO: Conversor de Moedas para BRL */}
                    <div className="converted-balance">
                        {loading ? (
                            <p>Carregando preço...</p>
                        ) : ethPriceBrl !== null ? (
                            <p>
                                ≈ {
                                    // Formatação para BRL: R$ e vírgula como separador decimal, ponto para milhar
                                    parseFloat(convertedBalanceBrl).toLocaleString('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })
                                }
                            </p>
                        ) : (
                            <p className="error-message">Não foi possível carregar o preço do ETH em BRL.</p>
                        )}
                    </div>
                  </div>
                  <div className="chart-section">
                    <p className="address-label">ETHEREUM (USD) - ÚLTIMOS 7 DIAS</p>
                    <EthPriceChart />
                  </div>
                  {error && <p className="error-message" style={{textAlign: 'center'}}>{error}</p>}
                </>
              )}

              {activeView === 'security' && wallet && <SecurityScreen wallet={wallet} onNavigate={setActiveView} />}
              {activeView === 'addFunds' && <AddFundsScreen walletAddress={wallet?.address || localStorage.getItem('userAddress')} onNavigate={setActiveView} currentTheme={currentTheme} />}
              {activeView === 'sendFunds' && wallet && <SendFundsScreen wallet={wallet} provider={provider} onNavigate={setActiveView} currentBalance={balance} />}
            </main>
        </div>
    );
}

export default WalletDashboard;