import React from "react";

const ContestWinnerList = () => {
  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center justify-between w-full gap-4 p-4 bg-[#0a0b14] text-gray-400 font-sans">
        <div className="flex items-center space-x-4 overflow-x-auto ">
          <div className="flex p-1 bg-[#1a1c2e] rounded-md border border-gray-800">
            <button className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition hover:text-white">
              Leaderboard
            </button>
            <button className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#ff4d00] text-white rounded shadow-lg">
              Contest
            </button>
          </div>

          <button className="flex items-center space-x-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-gray-800 rounded-md bg-[#1a1c2e] hover:border-gray-600 transition">
            <span>Wins</span>
            <svg
              className="w-3 h-3 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>

          <div className="flex items-center space-x-2 ml-2">
            <div className="flex items-center px-3 py-1.5 space-x-2 bg-orange-900/20 border border-orange-900/30 rounded-md">
              <span className="text-orange-500 text-sm">🎁</span>
              <span className="text-sm  font-bold text-white tracking-tighter">
                4h: 32m: 21s
              </span>
            </div>
            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">
              ~Prize Distribution
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex p-1 bg-[#1a1c2e] rounded-md border border-gray-800">
            <button className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#ff4d00] text-white rounded shadow-lg">
              Global
            </button>
            <button className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition hover:text-white">
              Friends
            </button>
          </div>

          <div className="flex items-center p-1 bg-[#1a1c2e] rounded-md border border-gray-800">
            <button className="px-3 py-1 text-xs font-bold text-gray-600 hover:text-white transition">
              D
            </button>
            <button className="px-3 py-1 text-xs font-bold bg-[#ff4d00] text-white rounded shadow-sm">
              W
            </button>
            <button className="px-3 py-1 text-xs font-bold text-gray-600 hover:text-white transition border-l border-gray-800">
              M
            </button>
            <button className="px-3 py-1 text-xs font-bold text-gray-600 hover:text-white transition border-l border-gray-800">
              Y
            </button>
          </div>
        </div>
      </div>
<div className="mt-6 grid gap-6 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
      {[1, 2, 3, 4].map((i,idx) => (
        <div
          key={i}
          className="flex w-full max-w-md overflow-hidden bg-[#0a0b14] bordedrrr border-gray-800ddd rounded-lg group"
        >
          <div className={`flex items-center justify-center w-10 ${    idx === 0 || idx === 2 ? "bg-[linear-gradient(180deg,#4A00E0_0%,#8E2DE2_100%)]" : "bg-[linear-gradient(180deg,#FF416C_0%,#FFA72B_100%)]"} border-r border-gray-800`}>
            <span className="font-bold text-white uppercase transform -rotate-90">
            {String(idx + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="flex-grow px-4 py-2 bg-[#0d0e1b]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 overflow-hidden rounded-md">
                  <img
                    src="/imgs/avatar1.jpg"
                    alt="Avatar"
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-[14px] font-bold tracking-wider text-white ">
                  Samboxer
                </h3>
              </div>

              <div className="flex items-baseline space-x-1">
                <span className="text-[14px] font-bold text-[#FFA72B] border-b-2 border-white leading-none">
                  202
                </span>
                <span className="text-[14px] font-bold text-[#FFA72B] uppercase tracking-tighter">
                  Wins
                </span>
              </div>
            </div>





            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-500">
              <img
                    src="imgs/wintag3.png"
                    alt="Reward"
                    className=" w-3 h-3"
                  />
               <img
                    src="imgs/wintag2.png"
                    alt="Reward"
                    className=" w-3 h-3"
                  />
                <img
                    src="imgs/wintag1.png"
                    alt="Reward"
                    className=" w-3 h-3"
                  />
                <span className="text-[8px] font-bold uppercase tracking-widest">
                  +4 more
                </span>
              </div>

              <div className="flex items-center p-1 space-x-2">
                <div className="w-6 h-6 overflow-hidden border border-gray-700 rounded-md bg-red-900/30">
                  <img
                    src="imgs/rare-avatar.jpg"
                    alt="Reward"
                    className="object-cover w-full h-full"
                  />
                </div>
                <span className="pr-1 text-[14px] text-gray-400 font text-nowrap">
                  Rare Avatar
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      </div>
    </div>
  );
};

export default ContestWinnerList;
