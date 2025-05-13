import { useState, useEffect, useCallback, useMemo } from 'react';
import CandlestickChart from './components/CandlestickChart';
import CandleAnalysis from './components/CandleAnalysis';
import { getPolygonData, analyzeCandleData, availableSymbols, timeIntervals } from './utils/candleData';
import { CandleData, CandleAnalysisResult, Symbol, TimeInterval } from './types/CandleTypes';
import { BarChart3, ChevronDown } from 'lucide-react';

const getYesterdayDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
};

interface DropdownProps<T extends { id: string }> {
  items: T[];
  selectedItem: T;
  onSelect: (item: T) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  getLabel: (item: T) => string;
  closeOtherDropdown: () => void;
}

const Dropdown = <T extends { id: string }>({
  items,
  selectedItem,
  onSelect,
  isOpen,
  setIsOpen,
  getLabel,
  closeOtherDropdown,
}: DropdownProps<T>) => (
  <div className="relative inline-block text-left">
    <button
      type="button"
      className="inline-flex items-center justify-between w-48 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      onClick={() => {
        setIsOpen(!isOpen);
        closeOtherDropdown();
      }}
    >
      <span>{getLabel(selectedItem)}</span>
      <ChevronDown size={16} className="ml-2" />
    </button>
    {isOpen && (
      <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="py-1">
          {items.map((item) => (
            <button
              key={item.id}
              className={`block w-full text-left px-4 py-2 text-sm ${
                selectedItem.id === item.id ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                onSelect(item);
                setIsOpen(false);
              }}
            >
              {getLabel(item)}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState<Symbol>(availableSymbols[3]);
  const [selectedInterval, setSelectedInterval] = useState<TimeInterval>(timeIntervals[0]);
  const [selectedDate, setSelectedDate] = useState<string>(getYesterdayDate());
  const [analysis, setAnalysis] = useState<CandleAnalysisResult | null>(null);
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSymbolDropdownOpen, setIsSymbolDropdownOpen] = useState(false);
  const [isIntervalDropdownOpen, setIsIntervalDropdownOpen] = useState(false);

  const fetchData = useCallback(
    async (symbol: Symbol, interval: TimeInterval, date: string) => {
      setLoading(true);
      setError(null);
      try {
        const newData = await getPolygonData(symbol, interval, date);
        if (newData.length === 0) {
          setError('No data available for the selected parameters.');
          setCandleData([]);
          setAnalysis(null);
        } else {
          setCandleData(newData);
          setAnalysis(analyzeCandleData(newData));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to fetch market data: ${message}`);
        setCandleData([]);
        setAnalysis(null);
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData(selectedSymbol, selectedInterval, selectedDate);
  }, [fetchData, selectedSymbol, selectedInterval, selectedDate]);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (!newDate || isNaN(Date.parse(newDate))) {
      setError('Invalid date selected.');
      return;
    }
    if (newDate > getYesterdayDate()) {
      setError('Cannot select a future date.');
      return;
    }
    setSelectedDate(newDate);
    setError(null);
  }, []);

  const resetToDefaults = useCallback(() => {
    setSelectedSymbol(availableSymbols[0]);
    setSelectedInterval(timeIntervals[4]);
    setSelectedDate(getYesterdayDate());
    setError(null);
    setIsSymbolDropdownOpen(false);
    setIsIntervalDropdownOpen(false);
  }, []);

  const symbolDropdownProps = useMemo(
    () => ({
      items: availableSymbols,
      selectedItem: selectedSymbol,
      onSelect: setSelectedSymbol,
      isOpen: isSymbolDropdownOpen,
      setIsOpen: setIsSymbolDropdownOpen,
      getLabel: (symbol: Symbol) => `${symbol.name} (${symbol.id})`,
      closeOtherDropdown: () => setIsIntervalDropdownOpen(false),
    }),
    [selectedSymbol, isSymbolDropdownOpen]
  );

  const intervalDropdownProps = useMemo(
    () => ({
      items: timeIntervals,
      selectedItem: selectedInterval,
      onSelect: setSelectedInterval,
      isOpen: isIntervalDropdownOpen,
      setIsOpen: setIsIntervalDropdownOpen,
      getLabel: (interval: TimeInterval) => interval.label,
      closeOtherDropdown: () => setIsSymbolDropdownOpen(false),
    }),
    [selectedInterval, isIntervalDropdownOpen]
  );

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

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <div className="mt-4 space-x-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={() => fetchData(selectedSymbol, selectedInterval, selectedDate)}
            >
              Retry
            </button>
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              onClick={resetToDefaults}
            >
              Reset
            </button>
          </div>
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
            <Dropdown {...symbolDropdownProps} />
            <div className="relative inline-block">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-40 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                max={getYesterdayDate()}
              />
            </div>
            <Dropdown {...intervalDropdownProps} />
          </div>
        </header>
        <main className="space-y-6">
          {candleData.length > 0 ? (
            <>
              <CandlestickChart data={candleData} />
              {analysis && <CandleAnalysis analysis={analysis} />}
            </>
          ) : (
            <div className="text-center text-slate-600">
              No data available for the selected parameters.
            </div>
          )}
        </main>
        <footer className="mt-10 text-center text-sm text-slate-500">
          <p>© 2025 Market Analysis. Demo data for educational purposes only.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;