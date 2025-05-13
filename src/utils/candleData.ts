import { CandleData, CandleAnalysisResult, Symbol, TimeInterval } from '../types/CandleTypes';

export const availableSymbols: Symbol[] = [
  { id: 'I:SPX', name: 'S&P 500' },
  { id: 'I:NDX', name: 'Nasdaq 100' },
  { id: 'I:RUT', name: 'Russell 2000' },
  { id: 'X:BTC-USD', name: 'Bitcoin / U.S.Dollar' },
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

interface PolygonResponse {
  status: string;
  results: Array<{
    t: number; // timestamp in milliseconds
    o: number; // open
    h: number; // high
    l: number; // low
    c: number; // close
    v?: number; // volume
  }>;
}

export const getPolygonData = async (
  symbol: Symbol,
  interval: TimeInterval,
  date: string
): Promise<CandleData[]> => {
  const apiKey = import.meta.env.VITE_POLYGON_API_KEY;
  if (!apiKey) {
    throw new Error('Polygon API key is not configured.');
  }
  const apiUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol.id}/range/${interval.minutes}/minute/${date}/${date}?sort=desc&limit=5000&apiKey=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
    }

    const result: PolygonResponse = await response.json();
    if (result.status !== 'OK' || !Array.isArray(result.results)) {
      throw new Error('Invalid Polygon API response: ' + JSON.stringify(result));
    }

    if (result.results.length === 0) {
      return [];
    }

    return result.results
      .filter((item) => item.t && item.o && item.h && item.l && item.c)
      .map((item) => ({
        date: new Date(item.t),
        open: item.o,
        high: item.h,
        low: item.l,
        close: item.c,
        volume: item.v,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch (error) {
    console.error('Error fetching Polygon data:', error);
    throw error;
  }
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