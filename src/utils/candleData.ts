import { CandleData, CandleAnalysisResult, Symbol, TimeInterval } from '../types/CandleTypes';

export const availableSymbols: Symbol[] = [
  { id: 'AAPL', name: 'Apple Inc.', basePrice: 175, volatility: 2 },
  { id: 'GOOGL', name: 'Alphabet Inc.', basePrice: 140, volatility: 2.5 },
  { id: 'TSLA', name: 'Tesla, Inc.', basePrice: 250, volatility: 4 },
  { id: 'SPY', name: 'S&P 500 ETF', basePrice: 450, volatility: 1.5 },
  { id: 'QQQ', name: 'Nasdaq 100 ETF', basePrice: 380, volatility: 1.8 },
  { id: 'DIA', name: 'Dow Jones ETF', basePrice: 350, volatility: 1.3 },
];

export const timeIntervals: TimeInterval[] = [
  { id: '1m', label: '1 Minute', minutes: 1 },
  { id: '5m', label: '5 Minutes', minutes: 5 },
  { id: '15m', label: '15 Minutes', minutes: 15 },
  { id: '30m', label: '30 Minutes', minutes: 30 },
  { id: '1h', label: '1 Hour', minutes: 60 },
  { id: '4h', label: '4 Hours', minutes: 240 },
  { id: '1d', label: '1 Day', minutes: 1440 },
];

export const generateMockData = (symbol: Symbol, interval: TimeInterval): CandleData[] => {
  const data: CandleData[] = [];
  const now = new Date();
  let basePrice = symbol.basePrice;
  
  // Calculate number of candles based on interval
  const totalMinutes = 30 * 24 * 60; // 30 days in minutes
  const numCandles = Math.floor(totalMinutes / interval.minutes);
  
  for (let i = numCandles; i >= 0; i--) {
    const date = new Date(now.getTime() - (i * interval.minutes * 60 * 1000));
    
    // Adjust volatility based on time interval
    const intervalVolatilityFactor = Math.sqrt(interval.minutes / 1440); // Scale volatility based on square root of time
    const adjustedVolatility = symbol.volatility * intervalVolatilityFactor;
    
    const volatility = Math.random() * adjustedVolatility + (adjustedVolatility / 2);
    const changePercent = (Math.random() - 0.5) * volatility;
    const change = basePrice * changePercent / 100;
    
    const open = basePrice;
    const close = Number((basePrice + change).toFixed(2));
    
    const highFromOpenClose = Math.max(open, close);
    const lowFromOpenClose = Math.min(open, close);
    const high = Number((highFromOpenClose + Math.random() * (adjustedVolatility * 2)).toFixed(2));
    const low = Number((lowFromOpenClose - Math.random() * (adjustedVolatility * 2)).toFixed(2));
    
    data.push({ date, open, high, low, close });
    
    basePrice = close;
  }
  
  return data;
};

export const analyzeCandleData = (data: CandleData[]): CandleAnalysisResult => {
  if (data.length === 0) {
    throw new Error('Cannot analyze empty data set');
  }
  
  const latestCandle = data[data.length - 1];
  const isPositive = latestCandle.close > latestCandle.open;
  
  let streakCount = 1;
  const streakType = isPositive ? 'positive' : 'negative';
  
  for (let i = data.length - 2; i >= 0; i--) {
    const candle = data[i];
    const candleIsPositive = candle.close > candle.open;
    
    if (candleIsPositive === isPositive) {
      streakCount++;
    } else {
      break;
    }
  }
  
  const change = Number((latestCandle.close - latestCandle.open).toFixed(2));
  const percentChange = Number(((change / latestCandle.open) * 100).toFixed(2));
  
  return {
    latestCandle: {
      isPositive,
      date: latestCandle.date,
      open: latestCandle.open,
      close: latestCandle.close,
      change,
      percentChange,
    },
    streak: {
      count: streakCount,
      type: streakType,
    },
  };
};