export interface CandleData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface CandleAnalysisResult {
  latestCandle: {
    isPositive: boolean;
    date: Date;
    open: number;
    close: number;
    change: number;
    percentChange: number;
  };
  streak: {
    count: number;
    type: 'positive' | 'negative';
  };
}

export interface Symbol {
  id: string;
  name: string;
  basePrice: number;
  volatility: number;
}

export interface TimeInterval {
  id: string;
  label: string;
  minutes: number;
}