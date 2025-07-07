// src/SendFundsScreen.jsx - NOVO ARQUIVO

import React, { useState } from 'react';
import { ethers } from 'ethers';

function SendFundsScreen({ wallet, provider, onNavigate, currentBalance }) {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSend = async () => {
    setError('');
    setSuccess('');

    // Validação dos campos
    if (!ethers.isAddress(toAddress)) {
      setError('O endereço do destinatário é inválido.');
      return;
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('O valor deve ser um número positivo.');
      return;
    }

    setLoading(true);
    try {
      const amountWei = ethers.parseEther(amount);
      const balanceWei = ethers.parseEther(currentBalance);

      if (amountWei > balanceWei) {
        setError('Saldo insuficiente.');
        setLoading(false);
        return;
      }
      
      // Conecta a carteira ao provedor para poder enviar transações
      const connectedWallet = wallet.connect(provider);

      const tx = await connectedWallet.sendTransaction({
        to: toAddress,
        value: amountWei,
      });

      setSuccess('Transação enviada! Aguardando confirmação...');
      
      // Aguarda a transação ser confirmada na blockchain
      await tx.wait();

      setSuccess(`Transação confirmada com sucesso! Hash: ${tx.hash}`);
      setToAddress('');
      setAmount('');

    } catch (err) {
      console.error("Erro ao enviar transação:", err);
      setError('Falha ao enviar transação. Verifique o console para detalhes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="wallet-content send-funds-screen">
      <button className="back-button" onClick={() => onNavigate('main')}>
        &larr; Voltar para Início
      </button>
      <h2>Enviar Fundos</h2>

      <div className="send-funds-form">
        <div className="form-group">
          <label htmlFor="toAddress">Endereço do Destinatário</label>
          <input
            id="toAddress"
            type="text"
            placeholder="0x..."
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Valor em ETH</label>
          <input
            id="amount"
            type="text"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />
          <p className="balance-info">
            Saldo: {parseFloat(currentBalance).toFixed(5)} ETH
          </p>
        </div>

        <button onClick={handleSend} disabled={loading || !toAddress || !amount} className="button primary">
          {loading ? 'Enviando...' : 'Enviar'}
        </button>

        <div className="send-feedback">
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </div>
      </div>

       <p className="security-note">
          Certifique-se que o endereço está correto e que você está na rede desejada. Transações na blockchain são irreversíveis.
       </p>
    </main>
  );
}

export default SendFundsScreen;