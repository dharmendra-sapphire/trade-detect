import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
  createChart,
  IChartApi,
  Time,
  DeepPartial,
  TimeChartOptions,
  CandlestickData,
  LineWidth,
} from 'lightweight-charts';
import { debounce } from 'lodash';
import { CandleData } from '../types/CandleTypes';
import '../styles/CandlestickChart.css';

interface CandlestickChartProps {
  data: CandleData[];
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedResize = useMemo(
    () =>
      debounce(() => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      }, 200),
    []
  );

  const chartOptions = useMemo<DeepPartial<TimeChartOptions>>(
    () => ({
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      height: 400,
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1 as LineWidth,
          color: '#758696',
          style: 3,
        },
        horzLine: {
          width: 1 as LineWidth,
          color: '#758696',
          style: 3,
        },
      },
      timeScale: {
        borderColor: '#f0f0f0',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#f0f0f0',
      },
    }),
    []
  );

  useEffect(() => {
    if (!chartContainerRef.current || !data.length) return;

    try {
      const chart = createChart(chartContainerRef.current, {
        ...chartOptions,
        width: chartContainerRef.current.clientWidth,
      });
      chartRef.current = chart;

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      });

      const formattedData: CandlestickData<Time>[] = data.map((candle) => ({
        time: (candle.date.getTime() / 1000) as Time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));

      candlestickSeries.setData(formattedData);
      chart.timeScale().fitContent();

      window.addEventListener('resize', debouncedResize);

      return () => {
        window.removeEventListener('resize', debouncedResize);
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error rendering chart:', error);
      setError('Failed to render chart. Please try again.');
      return () => {};
    }
  }, [data, chartOptions, debouncedResize]);

  if (error) {
    return (
      <div className="w-full mx-auto max-w-4xl bg-white rounded-lg shadow-md p-4 mb-6 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full mx-auto max-w-4xl bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Stock Price Chart</h2>
      <div ref={chartContainerRef} className="candlestick-chart-container" />
    </div>
  );
};

export default React.memo(CandlestickChart);