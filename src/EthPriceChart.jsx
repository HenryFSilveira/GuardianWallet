import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

// Registra os componentes necessários do Chart.js para a renderização do gráfico
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const EthPriceChart = () => {
  // Inicializa o estado com uma estrutura de dados vazia para o gráfico
  const [chartData, setChartData] = useState({ datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      setError(null);
      try {
        // A API da CoinGecko retorna dados horários para a consulta de 7 dias
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/coins/ethereum/market_chart', {
            params: {
              vs_currency: 'usd',
              days: '7',
            },
          }
        );
        
        // Verifica se a resposta da API contém os dados de preços esperados
        if (response.data && response.data.prices && response.data.prices.length > 0) {
          const prices = response.data.prices;
          
          const formattedData = {
            // Formata os timestamps para datas legíveis (ex: dd/mm)
            labels: prices.map(price => new Date(price[0]).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit'})),
            datasets: [
              {
                label: 'Preço (USD)',
                data: prices.map(price => price[1]),
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.15)',
                fill: true,
                tension: 0.4,
                pointRadius: 0, // Pontos podem poluir um gráfico com muitos dados
                pointHoverRadius: 5,
                pointBackgroundColor: '#007bff',
              },
            ],
          };
          setChartData(formattedData);
        } else {
          // Define um erro se a API não retornar dados
          setError('Nenhum dado de preço foi retornado pela API.');
        }

      } catch (err) {
        setError('Não foi possível carregar os dados do gráfico.');
        console.error('Erro ao buscar dados da CoinGecko:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []); // O array de dependências vazio faz com que o useEffect execute apenas uma vez

  // Opções de customização para a aparência do gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Oculta a legenda do dataset
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#212529',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 4,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              // Formata o valor do tooltip como moeda (USD)
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6c757d', // Cor dos labels do eixo X
          maxTicksLimit: 8, // Limita o número de labels para não sobrepor
        }
      },
      y: {
        grid: {
          color: 'rgba(222, 226, 230, 0.5)', // Cor das linhas de grade do eixo Y
        },
        ticks: {
          color: '#6c757d', // Cor dos labels do eixo Y
          callback: function(value) {
            return '$' + value.toLocaleString(); // Adiciona '$' aos labels
          }
        }
      },
    },
  };
  
  // Renderiza a mensagem de carregamento
  if (loading) {
    return <div className="chart-feedback">Carregando gráfico...</div>;
  }
  
  // Renderiza a mensagem de erro
  if (error) {
    return <div className="chart-feedback">{error}</div>;
  }

  // Renderiza o gráfico quando os dados estiverem prontos
  return (
    <div className="chart-container">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default EthPriceChart;