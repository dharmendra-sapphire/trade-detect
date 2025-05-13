import React, { useMemo } from 'react';
import { CandleAnalysisResult } from '../types/CandleTypes';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CandleAnalysisProps {
  analysis: CandleAnalysisResult;
}

const CandleAnalysis: React.FC<CandleAnalysisProps> = ({ analysis }) => {
  const { latestCandle, streak } = analysis;
  const { isPositive, date, open, close, change, percentChange } = latestCandle;

  const formattedDate = useMemo(
    () =>
      date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    [date]
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full mx-auto max-w-4xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Candle Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50 rounded-lg p-5 transition-all duration-300 hover:shadow-md">
          <h3 className="text-lg font-medium mb-3 text-gray-700">Latest Candle</h3>
          <div className="flex items-center mb-3">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              } mr-3`}
            >
              {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>
            <div>
              <p className="text-gray-600 text-sm">{formattedDate}</p>
              <p className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? 'Bullish' : 'Bearish'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-2 rounded border border-slate-200">
              <p className="text-xs text-gray-500">Open</p>
              <p className="font-medium">${open.toFixed(2)}</p>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <p className="text-xs text-gray-500">Close</p>
              <p className="font-medium">${close.toFixed(2)}</p>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <p className="text-xs text-gray-500">Change</p>
              <p className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(change).toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <p className="text-xs text-gray-500">% Change</p>
              <p className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : '-'}{Math.abs(percentChange).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-5 transition-all duration-300 hover:shadow-md">
          <h3 className="text-lg font-medium mb-3 text-gray-700">Current Streak</h3>
          <div className="flex flex-col items-center justify-center h-[calc(100%-2rem)]">
            <div
              className={`flex items-center justify-center w-16 h-16 rounded-full mb-3 ${
                streak.type === 'positive' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}
            >
              {streak.type === 'positive' ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
            </div>
            <p className="text-gray-700">{streak.count} consecutive</p>
            <p
              className={`text-xl font-bold ${
                streak.type === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {streak.type === 'positive' ? 'Bullish' : 'Bearish'} candles
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CandleAnalysis);