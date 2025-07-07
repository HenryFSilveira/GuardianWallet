// src/AddFundsScreen.jsx - Cores do QR Code ajustadas para melhor contraste

import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react'; 

function AddFundsScreen({ walletAddress, onNavigate, currentTheme }) { 
  const [copied, setCopied] = useState(false);

  const getInitialQrBgColor = () => (currentTheme === 'dark' ? '#000000' : '#FFFFFF'); // Fundo PRETO no tema escuro
  const getInitialQrFgColor = () => (currentTheme === 'dark' ? '#FFFFFF' : '#212529'); // Padrão BRANCO no tema escuro

  const [qrBgColor, setQrBgColor] = useState(getInitialQrBgColor());
  const [qrFgColor, setQrFgColor] = useState(getInitialQrFgColor());

  useEffect(() => {
    if (currentTheme === 'dark') {
      setQrBgColor('#000000'); // Fundo do QR Code PRETO
      setQrFgColor('#FFFFFF'); // Padrão do QR Code BRANCO
    } else {
      setQrBgColor('#FFFFFF'); // Fundo do QR Code BRANCO
      setQrFgColor('#212529'); // Padrão do QR Code ESCURO
    }
  }, [currentTheme]);


  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); 
      })
      .catch(err => {
        console.error('Falha ao copiar endereço: ', err);
        alert('Falha ao copiar endereço. Por favor, copie manualmente.');
      });
  };

  if (!walletAddress) {
    return (
      <main className="wallet-content add-funds-screen">
        <p>Endereço da carteira não disponível.</p>
        <button className="back-button" onClick={() => onNavigate('main')}>
          &larr; Voltar para Início
        </button>
      </main>
    );
  }

  return (
    <main className="wallet-content add-funds-screen">
      <button className="back-button" onClick={() => onNavigate('main')}>
        &larr; Voltar para Início
      </button>
      <h2>Adicionar Fundos</h2>
      <p className="funds-note">
        Envie Ethereum (ETH) para o endereço abaixo.
      </p>

      <div className="address-display-card">
        <h3 className="address-display-label">Endereço da sua carteira</h3>
        <div className="address-text-funds">
          <span>{walletAddress}</span>
        </div>
        <button onClick={handleCopyAddress} className="button primary copy-button-funds">
          {copied ? 'Copiado!' : 'Copiar Endereço'}
        </button>
      </div>

      <div className="qr-code-card">
        <h3>Escanear QR Code</h3>
        <div className="qr-code-container-funds"> 
          <QRCodeCanvas 
            value={walletAddress} 
            size={200} 
            level="H" 
            includeMargin={true} 
            bgColor={qrBgColor} 
            fgColor={qrFgColor} 
          />
        </div>
        <p className="qr-code-note">
          Use este QR code para enviar fundos de outra carteira ou exchange.
        </p>
      </div>
    </main>
  );
}

export default AddFundsScreen;