import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useBridge } from '../hooks/useBridge';

export function EconomyPanel() {
  const { publicKey } = useWallet();
  const {
    depositSol,
    withdrawSol,
    getUserBalance,
    getExchangeRate,
    loading,
    error,
    solToPokecoins,
    pokecoinsToSol,
  } = useBridge();

  const [pokecoinsBalance, setPokecoinsBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0.1);
  const [withdrawAmount, setWithdrawAmount] = useState(1000);
  const [exchangeRate, setExchangeRate] = useState({ pokecoinsPerSol: 10000, solPerPokecoin: 0.0001 });
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);

  useEffect(() => {
    if (publicKey) {
      loadUserData();
    }
  }, [publicKey]);

  const loadUserData = async () => {
    try {
      const balance = await getUserBalance(publicKey!.toString());
      setPokecoinsBalance(balance);

      const rate = await getExchangeRate();
      setExchangeRate(rate);

      // Load transaction history (mock for now)
      setTransactionHistory([
        {
          id: '1',
          type: 'deposit',
          amount: 1000,
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
        },
        {
          id: '2',
          type: 'battle_win',
          amount: 500,
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        },
      ]);
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  const handleDeposit = async () => {
    try {
      const result = await depositSol(depositAmount);
      console.log('Deposit successful:', result);
      await loadUserData(); // Reload balance
      setDepositAmount(0.1); // Reset form
    } catch (err) {
      console.error('Deposit failed:', err);
    }
  };

  const handleWithdraw = async () => {
    try {
      const result = await withdrawSol(withdrawAmount);
      console.log('Withdraw successful:', result);
      await loadUserData(); // Reload balance
      setWithdrawAmount(1000); // Reset form
    } catch (err) {
      console.error('Withdraw failed:', err);
    }
  };

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Economy Panel</h1>
        <p className="mb-4">Connect your wallet to manage your economy!</p>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Economy Panel</h1>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">PokéCoins Balance</h2>
          <p className="text-3xl font-bold text-blue-600">{pokecoinsBalance.toLocaleString()}</p>
          <p className="text-sm text-gray-600">
            ≈ {(pokecoinsToSol(pokecoinsBalance) * 1_000_000_000).toFixed(0)} lamports
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Exchange Rate</h2>
          <p className="text-lg font-semibold">
            {exchangeRate.pokecoinsPerSol.toLocaleString()} PC = 1 SOL
          </p>
          <p className="text-sm text-gray-600">
            1 PC = {exchangeRate.solPerPokecoin} SOL
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">SOL Equivalent</h2>
          <p className="text-2xl font-bold text-orange-600">
            ≈ {pokecoinsToSol(pokecoinsBalance).toFixed(4)} SOL
          </p>
          <p className="text-sm text-gray-600">
            Current value in SOL
          </p>
        </div>
      </div>

      {/* Bridge Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Deposit SOL */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Deposit SOL</h2>
          <p className="text-sm text-gray-600 mb-4">
            Convert SOL to PokéCoins for in-game purchases
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">SOL Amount</label>
              <input
                type="number"
                step="0.01"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full p-2 border rounded"
                min="0.01"
                max="10"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm">
                You will receive: <strong>{solToPokecoins(depositAmount).toLocaleString()} PokéCoins</strong>
              </p>
            </div>

            <button
              onClick={handleDeposit}
              disabled={loading || depositAmount <= 0}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Depositing...' : 'Deposit SOL'}
            </button>
          </div>
        </div>

        {/* Withdraw SOL */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Withdraw SOL</h2>
          <p className="text-sm text-gray-600 mb-4">
            Convert PokéCoins back to SOL
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">PokéCoins Amount</label>
              <input
                type="number"
                step="100"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="w-full p-2 border rounded"
                min="1000"
                max={pokecoinsBalance}
              />
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm">
                You will receive: <strong>{pokecoinsToSol(withdrawAmount).toFixed(6)} SOL</strong>
              </p>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={loading || withdrawAmount <= 0 || withdrawAmount > pokecoinsBalance}
              className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Withdrawing...' : 'Withdraw SOL'}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>

        {transactionHistory.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {transactionHistory.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium capitalize">{tx.type.replace('_', ' ')}</p>
                  <p className="text-sm text-gray-600">
                    {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    tx.type === 'deposit' || tx.type === 'battle_win'
                      ? 'text-orange-600'
                      : 'text-red-600'
                  }`}>
                    {tx.type === 'deposit' || tx.type === 'battle_win' ? '+' : '-'}
                    {tx.amount.toLocaleString()} PC
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Bonus */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">Daily Bonus</h2>
        <p className="text-sm text-gray-600 mb-4">
          Claim your daily PokéCoins bonus! Streak bonuses available.
        </p>

        <button
          className="bg-yellow-500 text-white py-2 px-6 rounded hover:bg-yellow-600"
          onClick={() => alert('Daily bonus claimed! +100 PokéCoins')}
        >
          Claim Daily Bonus (+100 PC)
        </button>
      </div>

      {/* Economy Tips */}
      <div className="bg-blue-50 p-6 rounded-lg mt-6">
        <h2 className="text-xl font-semibold mb-4">💡 Economy Tips</h2>
        <ul className="space-y-2 text-sm">
          <li>• <strong>Deposit SOL</strong> to get PokéCoins for purchasing packs and items</li>
          <li>• <strong>Win battles</strong> to earn PokéCoins through victories</li>
          <li>• <strong>Daily bonuses</strong> provide free PokéCoins every day</li>
          <li>• <strong>Withdraw anytime</strong> to convert PokéCoins back to SOL</li>
          <li>• <strong>Build streaks</strong> for bonus multipliers on daily rewards</li>
        </ul>
      </div>
    </div>
  );
}
