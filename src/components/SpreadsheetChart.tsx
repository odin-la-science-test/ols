import { useState } from 'react';
import { Line, Bar, Pie, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions
} from 'chart.js';
import { X, TrendingUp, BarChart3, PieChart, ScatterChart } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface SpreadsheetChartProps {
  data: any;
  onClose: () => void;
}

const SpreadsheetChart = ({ data, onClose }: SpreadsheetChartProps) => {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie' | 'scatter'>('line');
  const [selectedRange, setSelectedRange] = useState('A1:B10');

  // Parse range and extract data
  const parseRange = (range: string) => {
    // Simple parser for ranges like A1:B10
    const [start, end] = range.split(':');
    // This is a simplified version - in production you'd parse the actual spreadsheet data
    return {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
      datasets: [{
        label: 'Données',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 2,
      }]
    };
  };

  const chartData = parseRange(selectedRange);

  const options: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'var(--text-primary)',
          font: { size: 12 }
        }
      },
      title: {
        display: true,
        text: 'Graphique des données',
        color: 'var(--text-primary)',
        font: { size: 16, weight: 'bold' }
      },
    },
    scales: chartType !== 'pie' ? {
      y: {
        ticks: { color: 'var(--text-secondary)' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      x: {
        ticks: { color: 'var(--text-secondary)' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    } : undefined
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'scatter':
        return <Scatter data={chartData} options={options} />;
      default:
        return <Line data={chartData} options={options} />;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: '1rem',
        border: '1px solid var(--border-color)',
        width: '90%',
        maxWidth: '1200px',
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
            Créer un graphique
          </h2>
          <button
            onClick={onClose}
            className="btn"
            style={{ padding: '0.5rem', background: 'transparent' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Controls */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setChartType('line')}
              className="btn"
              style={{
                background: chartType === 'line' ? 'var(--accent-hugin)' : 'transparent',
                color: chartType === 'line' ? 'white' : 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <TrendingUp size={18} /> Ligne
            </button>
            <button
              onClick={() => setChartType('bar')}
              className="btn"
              style={{
                background: chartType === 'bar' ? 'var(--accent-hugin)' : 'transparent',
                color: chartType === 'bar' ? 'white' : 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <BarChart3 size={18} /> Barres
            </button>
            <button
              onClick={() => setChartType('pie')}
              className="btn"
              style={{
                background: chartType === 'pie' ? 'var(--accent-hugin)' : 'transparent',
                color: chartType === 'pie' ? 'white' : 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <PieChart size={18} /> Camembert
            </button>
            <button
              onClick={() => setChartType('scatter')}
              className="btn"
              style={{
                background: chartType === 'scatter' ? 'var(--accent-hugin)' : 'transparent',
                color: chartType === 'scatter' ? 'white' : 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <ScatterChart size={18} /> Nuage
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Plage de données:
            </label>
            <input
              type="text"
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="input-field"
              placeholder="A1:B10"
              style={{ width: '150px', marginBottom: 0 }}
            />
          </div>
        </div>

        {/* Chart Area */}
        <div style={{
          flex: 1,
          padding: '2rem',
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ width: '100%', height: '100%', minHeight: '400px' }}>
            {renderChart()}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.5rem'
        }}>
          <button onClick={onClose} className="btn" style={{ color: 'white' }}>
            Annuler
          </button>
          <button className="btn btn-primary" style={{ color: 'white' }}>
            Insérer dans la feuille
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetChart;
