// src/MnemonicDisplayModal.jsx - AJUSTADO PARA O SCROLL NO MOBILE E NOVO DESIGN

import React, { useState } from 'react';
import './MnemonicDisplayModal.css'; // Importa o CSS da modal

function MnemonicDisplayModal({ mnemonic, onConfirm }) {
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const mnemonicWords = mnemonic.split(' ');

  const handleCopy = () => {
    navigator.clipboard.writeText(mnemonic);
    alert('Frase de segurança copiada!');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content mnemonic-modal">
        {/* Adicionamos uma div para o conteúdo que vai rolar */}
        <div className="modal-scrollable-content">
          <h2>Sua Frase de Segurança</h2>
          <p className="warning-text">
            Anote estas 12 palavras na ordem exata e guarde em um lugar seguro.
            <br />
            <span className="never-share-text">Nunca compartilhe!</span>
          </p>

          <div className="mnemonic-grid-container">
            <div className="mnemonic-grid">
              {mnemonicWords.map((word, index) => (
                <div key={index} className="mnemonic-word-item">
                  <span className="word-index">{index + 1}</span>
                  <span className="word-text">{word}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Adicionamos uma div para o rodapé que ficará fixo */}
        <div className="modal-footer">
          <button className="copy-button-modal" onClick={handleCopy}>
            Copiar Frase
          </button>

          <div className="confirmation-box">
            <input
              type="checkbox"
              id="confirm-backup"
              checked={hasConfirmed}
              onChange={() => setHasConfirmed(!hasConfirmed)}
            />
            <label htmlFor="confirm-backup">
              Eu anotei e guardei minha frase de segurança em um lugar seguro.
            </label>
          </div>

          <button className="confirm-button" onClick={onConfirm} disabled={!hasConfirmed}>
            Acessar Minha Carteira {/* REMOVIDO "Entendi," */}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MnemonicDisplayModal;