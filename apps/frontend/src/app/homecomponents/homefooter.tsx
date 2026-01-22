import React from "react";

const HomeFooter = () => {
  const [depositShow , setDepositShow] = React.useState<any>(false)
  const depositCoin= () => {
    console.log("depositCoin")
    setDepositShow(!depositShow)

  }
  return (
    <div>
      {" "}
      {/* ✅ FOOTER */} {depositShow && <div className="w-full max-w-md p-4 rounded-xl bg-[#0d121d]/95 border border-gray-800 shadow-2xl backdrop-blur-md text-gray-400 font-sans">
        <div className="flex items-center justify-between mb-6 space-x-3">
          <div className="flex p-1 bg-[#1a1c2e] rounded-lg border border-gray-800">
            <button className="flex items-center px-3 py-1.5 text-xs font-bold text-white bg-[#2a3042] rounded-md shadow-sm">
              <span className="mr-1.5 text-emerald-400">●</span> Crypto
            </button>
            <button className="flex items-center px-3 py-1.5 text-xs font-bold hover:text-gray-200 transition">
              <span className="mr-1.5">💵</span> Fiat
            </button>
          </div>

          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search here..."
              className="w-full bg-[#05070a] border border-gray-800 rounded-md py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-emerald-500/50 transition"
            />
          </div>

          <div className="flex items-center space-x-2 text-gray-600">
            <svg
              className="w-4 h-4 cursor-pointer hover:text-emerald-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5 4a1 1 0 00-2 0v12a1 1 0 102 0V4zM9 4a1 1 0 00-2 0v12a1 1 0 102 0V4zM13 4a1 1 0 00-2 0v12a1 1 0 102 0V4zM17 4a1 1 0 00-2 0v12a1 1 0 102 0V4z"></path>
            </svg>
            <svg
              className="w-4 h-4 cursor-pointer hover:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
          </div>
        </div>

        <div className="space-y-1 mb-6">
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-800/30 cursor-pointer group">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                Ð
              </div>
              <span className="text-sm font-medium group-hover:text-white">
                Dogecoin
              </span>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-500">3819.75 INR ~</div>
              <div className="text-sm font-mono text-gray-300">
                266.00000 DOGE
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-between p-2 bg-[#1a1c2e]/50 border-l-2 border-emerald-500 rounded-r-md cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                ₿
              </div>
              <span className="text-sm font-bold text-white">Bitcoin</span>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-500">17319.47 INR ~</div>
              <div className="text-sm font-mono font-bold text-white">
                0.0021780 BTC
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-800/30 cursor-pointer group">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                B
              </div>
              <span className="text-sm font-medium group-hover:text-white">
                Binance Coin
              </span>
              <span className="text-emerald-400 text-xs">♥</span>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-500">27288.61 INR ~</div>
              <div className="text-sm font-mono text-gray-300">0.5 BNB</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-4 bg-gray-700 rounded-full relative">
                <div className="absolute left-1 top-1 w-2 h-2 bg-emerald-400 rounded-full"></div>
              </div>
              <span className="text-sm font-bold text-white underline decoration-dotted underline-offset-4">
                Vault
              </span>
            </div>
            <div className="flex items-center space-x-2 cursor-pointer text-gray-400 hover:text-white transition">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
              <span className="text-sm font-bold">Play Balance</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-gray-500 cursor-pointer hover:text-gray-300">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              ></path>
            </svg>
            <span className="text-xs font-bold uppercase tracking-tighter">
              Less Amount
            </span>
          </div>
        </div>
      </div>}
      <div className="flex items-center justify-between w-full px-4 py-2 bg-[#0a0b14] border-b border-gray-800 text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src="/images/footer-men.png"
                alt="Avatar"
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#0a0b14] rounded-full"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold text-sm tracking-wide">
                  CrispyPotato
                </span>
                <svg
                  className="w-4 h-4 text-gray-500 cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                </svg>
              </div>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="text-blue-500">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L9 10.586l3.293-3.293a1 1 0 011.414 1.414z"></path>
                  </svg>
                </span>
                <span className="flex items-center justify-center w-3 h-3 text-[8px] font-bold text-white rounded-full bg-gradient-to-tr from-purple-400 to-blue-400">
                  ★
                </span>
                <span className="px-1 text-[8px] font-black bg-yellow-400 rounded text-black uppercase">
                  Vip
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center px-3 py-1.5 bg-[#1a1c2e] border border-gray-800 rounded-md cursor-pointer hover:bg-[#252841]">
            <div className="w-5 h-5 mr-2 bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
              ₿
            </div>
            <span className="text-sm font-mono font-bold text-white">
              0.0021780 BTC
            </span>
            <svg
              className="w-3 h-3 ml-2 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>

          <button onClick={() => depositCoin()} className="flex items-center px-4 py-1.5 bg-[#a2ffda] text-[#0a0b14] font-bold rounded-md hover:bg-[#85eec5] transition shadow-lg shadow-emerald-500/10">
            <span className="mr-1 text-lg leading-none">+</span> Deposit
          </button>

          <div className="w-10 h-10 flex items-center justify-center">
            <div className="relative w-8 h-8 bg-emerald-900/20 border border-emerald-500/50 rounded-full flex items-center justify-center">
              <span className="text-emerald-400 text-xs">★</span>
            </div>
          </div>
        </div>

        <div className="hidden xl:flex items-center px-4 py-1 bg-[#0d0e1b] border border-gray-800 rounded-lg min-w-[400px]">
          <div className="flex items-center space-x-3 w-full">
            <img src="/images/avatar1.jpg" className="rounded w-6 h-6" />
            <span className="text-xs text-white font-semibold">RealBob</span>
            <div className="flex items-center space-x-1">
              <span className="text-blue-500">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L9 10.586l3.293-3.293a1 1 0 011.414 1.414z"></path>
                </svg>
              </span>
              <span className="px-1 text-[8px] font-black bg-yellow-400 rounded text-black uppercase leading-tight">
                Vip
              </span>
            </div>
            <span className="text-gray-700">|</span>
            <div className="flex items-center space-x-1">
              <span className="text-[10px]">♠ Poker</span>
            </div>
            <span className="text-gray-700">|</span>
            <div className="flex items-center space-x-2">
              <span className="text-red-600 text-[10px]">▼</span>
              <span className="text-xs font-mono text-white">342 TRX</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 rounded">
                12x
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 text-gray-500 border-r border-gray-800 pr-4">
            <svg
              className="w-5 h-5 hover:text-white cursor-pointer"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <svg
              className="w-5 h-5 hover:text-white cursor-pointer"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 11.37 9.198 15.293 6 17.69"></path>
            </svg>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <svg
                className="w-5 h-5 hover:text-white cursor-pointer"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </div>
            <svg
              className="w-5 h-5 hover:text-white cursor-pointer"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
            </svg>
          </div>
        </div>
      </div>
    
    </div>
  );
};

export default HomeFooter;
