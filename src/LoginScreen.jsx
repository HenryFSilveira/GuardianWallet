// src/LoginScreen.jsx - ATUALIZADO para definir 'isLoggedIn' no localStorage

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MnemonicDisplayModal from './MnemonicDisplayModal';
import logo from './assets/logo.png';

function LoginScreen({ onWalletUnlocked }) {
  const [password, setPassword] = useState('');
  const [walletName, setWalletName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [authMode, setAuthMode] = useState('unlock'); // Pode ser 'unlock' ou 'create'
  const [hasWallet, setHasWallet] = useState(false); // Mantido para exibir/ocultar a opção de "Acessar"

  const [showMnemonicModal, setShowMnemonicModal] = useState(false);
  const [newWallet, setNewWallet] = useState(null);

  // Efeito para verificar o localStorage e DEFINIR SE HÁ CARTEIRA, mas não muda o modo inicial
  useEffect(() => {
    const encryptedJson = localStorage.getItem('encryptedWallet');
    if (encryptedJson) {
      setHasWallet(true); // Apenas marca que existe uma carteira
      setAuthMode('unlock'); // Garante que o modo seja desbloquear se já existir carteira ao recarregar
    } else {
      setHasWallet(false); // Marca que não existe
      setAuthMode('create'); // Se não tem carteira, já começa na criação para não mostrar "desbloquear" sem ter o que desbloquear
    }
    // Preenche o nome da carteira se já existir no localStorage
    const storedName = localStorage.getItem('walletName');
    if (storedName) {
        setWalletName(storedName); // Pré-preenche o campo de nome, se existir
    }
  }, []); 


  const handleCreateWallet = async () => {
    if (!walletName.trim()) {
      setError('Por favor, diga como quer ser chamado.');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    setError('');
    setLoading(true);
    
    const generatedWallet = ethers.Wallet.createRandom();
    setNewWallet(generatedWallet);
    setShowMnemonicModal(true);
    setLoading(false);
  };

  const handleConfirmMnemonicAndSave = async () => {
    setLoading(true);
    const encryptedJson = await newWallet.encrypt(password);
    
    localStorage.setItem('walletName', walletName);
    localStorage.setItem('encryptedWallet', encryptedJson);
    localStorage.setItem('userAddress', newWallet.address);
    localStorage.setItem('isLoggedIn', 'true'); // NOVIDADE: Marca como logado
    
    setShowMnemonicModal(false);
    onWalletUnlocked(newWallet);
    setLoading(false);
  };

  const handleUnlockWallet = async () => {
    if (!password) {
      setError('Por favor, digite sua senha.');
      return;
    }
    setLoading(true);
    setError('');

    const encryptedJson = localStorage.getItem('encryptedWallet');
    try {
      const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);
      localStorage.setItem('isLoggedIn', 'true'); // NOVIDADE: Marca como logado
      onWalletUnlocked(wallet);
    } catch (error) {
      setError('Senha incorreta.');
    }
    setLoading(false);
  };

  return (
    <div className="login-screen-container">
      {/* SEÇÃO DA LOGO E TÍTULO */}
      <div className="login-header">
        <img src={logo} alt="Guardian Wallet Logo" className="logo" />
        <h1>
          <strong>Guardian</strong>
          <span> Wallet</span>
        </h1>
      </div>

      <div className="card">
        {authMode === 'unlock' ? (
          <>
            <h2>Acessar carteira</h2>
            <p>Bem-vindo de volta!</p>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUnlockWallet()}
            />
            {error && <p className="error-message">{error}</p>}
            <button className="primary" onClick={handleUnlockWallet} disabled={loading}>
              {loading ? 'Desbloqueando...' : 'Desbloquear'}
            </button>
            <p className="auth-switch">
              Ou <button className="link-button" onClick={() => setAuthMode('create')}>Crie uma nova carteira</button>
            </p>
          </>
        ) : (
          <>
            <h2>Crie sua carteira</h2>
            <p>Seja bem-vindo(a)! </p>
            
            <input
              type="text"
              placeholder="Como você quer ser chamado?"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
            />
            
            <input
              type="password"
              placeholder="Crie sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="error-message">{error}</p>}
            <button className="primary" onClick={handleCreateWallet} disabled={loading}>
              {loading ? 'Criando...' : 'Criar Carteira'}
            </button>
            {/* Agora a opção de "Acessar" só aparece se a carteira JÁ EXISTE no localStorage */}
            {hasWallet && (
              <p className="auth-switch">
                Já tem uma carteira? <button className="link-button" onClick={() => setAuthMode('unlock')}>Acessar</button>.
              </p>
            )}
          </>
        )}
      </div>

      {showMnemonicModal && (
        <MnemonicDisplayModal
          mnemonic={newWallet.mnemonic.phrase}
          onConfirm={handleConfirmMnemonicAndSave}
        />
      )}
    </div>
  );
}

export default LoginScreen;