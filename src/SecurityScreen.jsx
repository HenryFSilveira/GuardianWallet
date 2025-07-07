/* ==================================================================
 * ARQUIVO: src/SecurityScreen.jsx
 * (Versão final com diálogo de confirmação e bloqueio persistente)
 * ================================================================== */

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MnemonicDisplayModal from './MnemonicDisplayModal';

/**
 * Este componente gerencia o bloqueio da visualização do mnemônico
 * usando o localStorage para persistência.
 */
function SecurityScreen({ wallet, onNavigate }) {
  // Chave única para o localStorage baseada no endereço da carteira
  const blockKey = `mnemonic_viewed_${wallet?.address}`;

  // Estado que controla se a função está bloqueada. Inicia lendo o localStorage.
  const [isBlocked, setIsBlocked] = useState(localStorage.getItem(blockKey) === 'true');

  // --- Estado para controlar o diálogo de confirmação ---
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Efeito que garante que o estado de bloqueio esteja sincronizado ao carregar
  useEffect(() => {
    if (localStorage.getItem(blockKey) === 'true') {
      setIsBlocked(true);
    }
  }, [blockKey]);

  // --- Estados para a seção "Ver Frase de Recuperação" ---
  const [passwordForMnemonic, setPasswordForMnemonic] = useState('');
  const [mnemonicPhrase, setMnemonicPhrase] = useState('');
  const [showMnemonicModal, setShowMnemonicModal] = useState(false);
  const [mnemonicError, setMnemonicError] = useState('');
  const [isMnemonicLoading, setIsMnemonicLoading] = useState(false);

  // --- Estados para a seção "Alterar Senha" ---
  const [currentPasswordForChange, setCurrentPasswordForChange] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');
  const [isChangePasswordLoading, setIsChangePasswordLoading] = useState(false);

  /**
   * Inicia o processo de visualização, abrindo o modal de confirmação.
   */
  const handleInitiateViewMnemonic = () => {
    setMnemonicError('');
    if (!passwordForMnemonic) {
      setMnemonicError('Por favor, digite sua senha atual para continuar.');
      return;
    }
    setShowConfirmation(true);
  };

  /**
   * Tenta descriptografar a carteira. Chamado apenas após a confirmação do usuário.
   */
  const handleViewMnemonic = async () => {
    setShowConfirmation(false);
    if (isMnemonicLoading) return;
    setIsMnemonicLoading(true);

    try {
      const encryptedJson = localStorage.getItem('encryptedWallet');
      const decryptedWallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, passwordForMnemonic);

      // --- SUCESSO ---
      setMnemonicPhrase(decryptedWallet.mnemonic.phrase);
      setShowMnemonicModal(true);
      
      // Salva o bloqueio permanente no navegador
      localStorage.setItem(blockKey, 'true');
      setIsBlocked(true);

    } catch (error) {
      // --- FALHA (SENHA INCORRETA) ---
      setMnemonicError('Senha incorreta. Por favor, tente novamente.');
      console.error("Erro ao tentar ver o mnemônico:", error);
      setIsMnemonicLoading(false); // Reativa o botão para nova tentativa
    }
  };

  /**
   * Altera a senha da carteira.
   */
  const handleChangePassword = async () => {
    setChangePasswordError('');
    setChangePasswordSuccess('');

    if (!currentPasswordForChange || !newPassword || !confirmNewPassword) {
      setChangePasswordError('Todos os campos são obrigatórios.');
      return;
    }
    if (newPassword.length < 8) {
      setChangePasswordError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setChangePasswordError('As novas senhas não coincidem.');
      return;
    }
    if (newPassword === currentPasswordForChange) {
      setChangePasswordError('A nova senha deve ser diferente da senha atual.');
      return;
    }

    setIsChangePasswordLoading(true);
    try {
      const encryptedJson = localStorage.getItem('encryptedWallet');
      const decryptedWallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, currentPasswordForChange);
      const newEncryptedJson = await decryptedWallet.encrypt(newPassword);
      
      localStorage.setItem('encryptedWallet', newEncryptedJson);
      setChangePasswordSuccess('Senha alterada com sucesso! Você usará a nova senha no próximo login.');
      
      setCurrentPasswordForChange('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      setChangePasswordError('Senha atual incorreta.');
      console.error("Erro ao alterar senha:", error);
    } finally {
      setIsChangePasswordLoading(false);
    }
  };

  return (
    <main className="wallet-content security-screen">
      <button className="back-button" onClick={() => onNavigate('main')}>
        &larr; Voltar para Início 
      </button>
      <h2>Segurança da Carteira</h2>

      {/* --- Seção para Ver Frase de Recuperação --- */}
      <div className="security-section">
        <h3>Frase de Recuperação</h3>
        <p className="security-note">
          A visualização da sua frase de recuperação é permitida apenas uma vez por motivos de segurança.
        </p>
        
        {isBlocked ? (
          <p className="error-message" style={{textAlign: 'center'}}>
            A frase de recuperação desta carteira já foi visualizada.
          </p>
        ) : (
          <>
            <input
              type="password"
              placeholder="Digite sua senha atual"
              value={passwordForMnemonic}
              onChange={(e) => setPasswordForMnemonic(e.target.value)}
              className="security-input"
            />
            <button 
              onClick={handleInitiateViewMnemonic} 
              disabled={isMnemonicLoading} 
              className="button primary security-button"
            >
              {isMnemonicLoading ? 'Verificando...' : 'Ver Frase de Recuperação'}
            </button>
          </>
        )}
        
        {mnemonicError && !isBlocked && <p className="error-message">{mnemonicError}</p>}
      </div>

      {showMnemonicModal && (
        <MnemonicDisplayModal
          mnemonic={mnemonicPhrase}
          onConfirm={() => setShowMnemonicModal(false)}
        />
      )}

      {/* --- Modal de Confirmação com Estilos e Texto Atualizados --- */}
      {showConfirmation && (
        <div className="modal-overlay">
          <div className="card" style={{maxWidth: '420px', textAlign: 'center', border: '1px solid var(--error-color)'}}>
            <h2 style={{color: 'var(--error-color)'}}>Ação Irreversível</h2>
            <p style={{color: 'var(--text-secondary)'}}>
              Você está prestes a usar sua única chance de visualizar a frase de recuperação para esta carteira.
            </p>
            <p>
              Tem certeza de que deseja continuar?
            </p>
            <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
               <button 
                  onClick={() => setShowConfirmation(false)} 
                  className="button primary" 
                  // ATUALIZADO: Estilo do botão de cancelar
                  style={{backgroundColor: '#000000', borderColor: '#000000', color: '#FFFFFF'}}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleViewMnemonic} 
                  className="button primary"
                  style={{backgroundColor: 'var(--error-color)', borderColor: 'var(--error-color)'}}
                >
                  {/* ATUALIZADO: Texto do botão de confirmação */}
                  Sim, estou ciente
                </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Seção para Alterar Senha --- */}
      <div className="security-section">
        <h3>Alterar Senha</h3>
        <p className="security-note">
          Isto apenas muda a senha local para acessar sua carteira. Não altera sua frase de recuperação.
        </p>
        <input
          type="password"
          placeholder="Senha Atual"
          value={currentPasswordForChange}
          onChange={(e) => setCurrentPasswordForChange(e.target.value)}
          className="security-input"
        />
        <input
          type="password"
          placeholder="Nova Senha (mín. 8 caracteres)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="security-input"
        />
        <input
          type="password"
          placeholder="Confirmar Nova Senha"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          className="security-input"
        />
        <button 
          onClick={handleChangePassword} 
          disabled={isChangePasswordLoading}
          className="button primary security-button"
        >
          {isChangePasswordLoading ? 'Alterando...' : 'Alterar Senha'}
        </button>
        {changePasswordError && <p className="error-message">{changePasswordError}</p>}
        {changePasswordSuccess && <p className="success-message">{changePasswordSuccess}</p>}
      </div>
    </main>
  );
}

export default SecurityScreen;
