// src/SendFundsScreen.jsx

import React, { useState } from 'react';
import { ethers } from 'ethers';

// Função para formatar o número com separador de milhar (ponto) e decimal (ponto) para o input
const formatNumberInput = (value) => {
  if (!value) return '';
  
  // Remove tudo que não for dígito ou ponto decimal
  const cleanedValue = value.replace(/[^\d.]/g, '');
  
  // Divide a parte inteira da parte decimal
  const parts = cleanedValue.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Formata a parte inteira com separador de milhar (ponto)
  integerPart = integerPart.split('').reverse().join('')
                 .replace(/(\d{3})(?=\d)/g, '$1.')
                 .split('').reverse().join('');

  // Retorna o número formatado
  if (decimalPart !== undefined) {
    return integerPart + '.' + decimalPart;
  }
  return integerPart;
};

function SendFundsScreen({ wallet, provider, onNavigate, currentBalance }) {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAmountChange = (e) => {
    const rawValue = e.target.value;
    
    // Para a lógica interna e ethers.js, precisamos de um ponto como decimal e sem separador de milhar.
    // Primeiro, remove todos os pontos que são separadores de milhar.
    // Segundo, se a intenção for usar vírgula como decimal (no input), substitua por ponto para ethers.js.
    // Por simplicidade, assumiremos que o input ainda usa ponto como decimal para corresponder a ethers.js diretamente.
    // A formatação de saída (do saldo) é que usará a vírgula.
    const numericalValueForEthers = rawValue.replace(/\./g, ''); // Garante que não haja separadores de milhar.

    // Apenas para exibição, podemos reformatar se necessário.
    // Para um input de texto, é melhor não forçar a vírgula, pois ethers.js usa ponto.
    const formattedValueForDisplay = formatNumberInput(numericalValueForEthers);
    
    setAmount(formattedValueForDisplay);
  };

  const handleSend = async () => {
    setError('');
    setSuccess('');

    // Prepara o valor do input para ser usado por ethers.parseEther
    // Remove os pontos de milhar e garante que o decimal seja um ponto, se houver
    const amountToParse = amount.replace(/\./g, ''); 

    if (!ethers.isAddress(toAddress)) {
      setError('O endereço do destinatário é inválido.');
      return;
    }
    if (isNaN(parseFloat(amountToParse)) || parseFloat(amountToParse) <= 0) {
      setError('O valor deve ser um número positivo.');
      return;
    }

    setLoading(true);
    try {
      const amountWei = ethers.parseEther(amountToParse); // Usa o valor limpo para o ethers.js
      
      // Limpa o currentBalance também para comparação precisa, se ele tiver formatação de vírgula ou ponto
      const cleanedCurrentBalance = String(currentBalance).replace(/\./g, '').replace(',', '.');
      const balanceWei = ethers.parseEther(cleanedCurrentBalance);

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
            onChange={handleAmountChange}
            disabled={loading}
          />
          <p className="balance-info">
            Saldo: {
              // Formatação para exibir com vírgula decimal e 5 casas fixas
              parseFloat(currentBalance).toLocaleString('pt-BR', {
                minimumFractionDigits: 5,
                maximumFractionDigits: 5,
                useGrouping: false // **Importante**: Desativa o separador de milhar para valores menores que 1
              })
            } ETH
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
          Certifique-se que o endereço está correto. Transações na blockchain são irreversíveis.
       </p>
    </main>
  );
}

export default SendFundsScreen;