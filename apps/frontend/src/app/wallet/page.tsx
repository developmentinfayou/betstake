'use client';

import { useEffect, useState } from 'react';
import { walletAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function WalletPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      const response = await walletAPI.getAll();
      setWallets(response.data);
    } catch (error) {
      toast.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const addDemoBalance = async (currency: string) => {
    try {
      await walletAPI.addBalance(currency, 10000);
      toast.success(`Added 10,000 ${currency} demo balance!`);
      loadWallets();
    } catch (error) {
      toast.error('Failed to add balance');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold gradient-text">← Back to Home</Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold gradient-text">My Wallet</h1>
          <div className="flex gap-2">
            <button onClick={() => addDemoBalance('USD')} className="btn-secondary">+ $10K USD</button>
            <button onClick={() => addDemoBalance('BTC')} className="btn-secondary">+ 1 BTC</button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">{wallet.currency}</h3>
                <span className="text-sm text-gray-400">Balance</span>
              </div>
              <div className="text-3xl font-bold text-primary mb-2">
                {wallet.balance.toFixed(wallet.currency === 'BTC' ? 8 : 2)}
              </div>
              {wallet.lockedBalance > 0 && (
                <div className="text-sm text-gray-400">
                  Locked: {wallet.lockedBalance.toFixed(2)}
                </div>
              )}
            </div>
          ))}

          {wallets.length === 0 && (
            <div className="card col-span-full text-center py-12">
              <p className="text-gray-400 mb-4">No wallets found</p>
              <p className="text-sm text-gray-500">Wallets will be created automatically when you receive funds</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
