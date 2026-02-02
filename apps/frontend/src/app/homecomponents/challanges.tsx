import React from "react";

const Challenge = () => {
  return (
    <div className="mt-2">
      <div className="w-full max-w-5xl p-6 text-gray-300 ">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              <button className="p-1.5 bg-[#1a1c2e] rounded hover:bg-gray-700 transition">
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
                    d="M15 19l-7-7 7-7"
                  ></path>
                </svg>
              </button>
              <button className="p-1.5 bg-white text-black rounded transition">
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
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </button>
            </div>
            <span className="text-sm font-semibold text-gray-500">
              Challenges
            </span>
            <span className="text-sm font-semibold text-orange-500 border-b border-orange-500 cursor-pointer">
              View All
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="relative flex-shrink-0">
            <img
              className="w-32 h-44 rounded-lg bg-gradient-to-b from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center overflow-hidden shadow-lg"
              src="images/limbo.png"
            />

            <div className="mt-3 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-white"></div>
            </div>
          </div>

          <div className="flex-grow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Boom Balloon
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold text-gray-400 bg-gray-800/50 border border-gray-700 rounded flex items-center uppercase">
                  <span className="text-orange-500 mr-1">✦</span> ORBEiT
                  Originals
                </span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-400">
              <img src="/images/winners.svg"/>
                <span className="text-white">27.8K</span>
                <span>~Winners</span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-gray-400 mb-6 max-w-3xl">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo conseq...
              <span className="text-orange-500 cursor-pointer border-b border-orange-500/30 hover:border-orange-500">
                see more
              </span>
            </p>

            <div className="flex items-center space-x-6">
              <button className="px-6 py-2 bg-[#ff4d00] text-white rounded-md hover:bg-orange-600 transition shadow-lg shadow-orange-900/20">
                Complete Challenge
              </button>
              <div className="flex items-center space-x-2">
              <img src="/images/gift.svg"/>
                <span className="text-sm text-gray-200">
                  0.01000000 BTC
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenge;
