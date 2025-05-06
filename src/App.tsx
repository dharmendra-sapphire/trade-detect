import React, { useState, useEffect } from 'react';
import CandlestickChart from './components/CandlestickChart';
import CandleAnalysis from './components/CandleAnalysis';
import { generateMockData, analyzeCandleData, availableSymbols, timeIntervals } from './utils/candleData';
import { CandleAnalysisResult } from './types/CandleTypes';
import { BarChart3, ChevronDown } from 'lucide-react';

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState(availableSymbols[0]);
  const [selectedInterval, setSelectedInterval] = useState(timeIntervals[4]); // Default to 1h
  const [analysis, setAnalysis] = useState<CandleAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [candleData, setCandleData] = useState(generateMockData(selectedSymbol, selectedInterval));
  const [isSymbolDropdownOpen, setIsSymbolDropdownOpen] = useState(false);
  const [isIntervalDropdownOpen, setIsIntervalDropdownOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const newData = generateMockData(selectedSymbol, selectedInterval);
      setCandleData(newData);
      setAnalysis(analyzeCandleData(newData));
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [selectedSymbol, selectedInterval]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BarChart3 size={28} className="text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Market Analysis Dashboard</h1>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto mb-6">
            Track candlestick patterns and analyze market trends with our interactive chart
          </p>
          
          <div className="flex justify-center gap-4">
            {/* Symbol Dropdown */}
            <div className="relative inline-block text-left">
              <div>
                <button
                  type="button"
                  className="inline-flex items-center justify-between w-48 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => {
                    setIsSymbolDropdownOpen(!isSymbolDropdownOpen);
                    setIsIntervalDropdownOpen(false);
                  }}
                >
                  <span>{selectedSymbol.name} ({selectedSymbol.id})</span>
                  <ChevronDown size={16} className="ml-2" />
                </button>
              </div>

              {isSymbolDropdownOpen && (
                <div 
                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                >
                  <div className="py-1" role="none">
                    {availableSymbols.map((symbol) => (
                      <button
                        key={symbol.id}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          selectedSymbol.id === symbol.id
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSelectedSymbol(symbol);
                          setIsSymbolDropdownOpen(false);
                        }}
                        role="menuitem"
                      >
                        {symbol.name} ({symbol.id})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interval Dropdown */}
            <div className="relative inline-block text-left">
              <div>
                <button
                  type="button"
                  className="inline-flex items-center justify-between w-36 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => {
                    setIsIntervalDropdownOpen(!isIntervalDropdownOpen);
                    setIsSymbolDropdownOpen(false);
                  }}
                >
                  <span>{selectedInterval.label}</span>
                  <ChevronDown size={16} className="ml-2" />
                </button>
              </div>

              {isIntervalDropdownOpen && (
                <div 
                  className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                >
                  <div className="py-1" role="none">
                    {timeIntervals.map((interval) => (
                      <button
                        key={interval.id}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          selectedInterval.id === interval.id
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSelectedInterval(interval);
                          setIsIntervalDropdownOpen(false);
                        }}
                        role="menuitem"
                      >
                        {interval.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="space-y-6">
          <CandlestickChart data={candleData} />
          {analysis && <CandleAnalysis analysis={analysis} />}
        </main>

        <footer className="mt-10 text-center text-sm text-slate-500">
          <p>© 2025 Market Analysis. Demo data for educational purposes only.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;