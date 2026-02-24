import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CoinPrice {
  id: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

const COINS = [
  'bitcoin', 'ethereum', 'tether', 'ripple', 'binancecoin',
  'usd-coin', 'solana', 'tron', 'dogecoin', 'bitcoin-cash',
];

const SYMBOL_MAP: Record<string, string> = {
  bitcoin: 'BTC', ethereum: 'ETH', tether: 'USDT', ripple: 'XRP',
  binancecoin: 'BNB', 'usd-coin': 'USDC', solana: 'SOL',
  tron: 'TRX', dogecoin: 'DOGE', 'bitcoin-cash': 'BCH',
};

const formatPrice = (price: number) => {
  if (price >= 1) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${price.toFixed(4)}`;
};

const CryptoTicker = () => {
  const [coins, setCoins] = useState<CoinPrice[]>([]);
  const cacheRef = useRef<CoinPrice[] | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('crypto-prices');
        if (!error && Array.isArray(data)) {
          setCoins(data);
          cacheRef.current = data;
          return;
        }
      } catch {}

      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COINS.join(',')}&order=market_cap_desc&sparkline=false`
        );
        if (res.ok) {
          const data = await res.json();
          setCoins(data);
          cacheRef.current = data;
          return;
        }
      } catch {}

      if (cacheRef.current) {
        setCoins(cacheRef.current);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  if (coins.length === 0) {
    return (
      <div className="py-6 overflow-hidden border-y border-border/30">
        <div className="marquee flex whitespace-nowrap gap-12">
          {[...COINS, ...COINS].map((c, i) => (
            <span key={i} className="text-lg md:text-xl font-light text-muted-foreground/30 select-none">
              {SYMBOL_MAP[c] || c.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const items = [...coins, ...coins];

  return (
    <div className="py-6 overflow-hidden border-y border-border/30">
      <div className="marquee flex whitespace-nowrap gap-10">
        {items.map((coin, i) => {
          const isUp = coin.price_change_percentage_24h >= 0;
          return (
            <span
              key={i}
              className="inline-flex items-center gap-2 text-base md:text-lg font-light select-none cursor-default"
            >
              <img src={coin.image} alt={coin.symbol} className="w-5 h-5 rounded-full" loading="lazy" />
              <span className="text-foreground/60 text-sm">{SYMBOL_MAP[coin.id] || coin.symbol.toUpperCase()}</span>
              <span className="text-foreground/80">{formatPrice(coin.current_price)}</span>
              <span className={`text-xs font-mono ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                {isUp ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default CryptoTicker;
