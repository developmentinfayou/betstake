import React from "react";

const Challenge = () => {
  return (
    <div className="mt-2">
      <div className="w-full p-6 text-gray-300 ">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4  relative left-[110px]">
            <div className="flex space-x-1 items-center">
              <button className=" py-1.5 px-2 w-[19px] h-[18px] bg-[#1a1c2e] rounded hover:bg-gray-700 transition">
                <svg
                  width="4"
                  height="7"
                  viewBox="0 0 4 7"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.5 6.5L0.5 3.5L3.5 0.5"
                    stroke="#FEFEFE"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <button className="py-1.5 px-2 w-[19px] h-[18px] bg-white text-black rounded transition">
                <svg
                  width="4"
                  height="7"
                  viewBox="0 0 4 7"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.5 6.5L3.5 3.5L0.5 0.5"
                    stroke="#060612"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="flex space-x-1 items-center relative left-[51px]">
              <span className="text-xs tracking-wider text-gray-500">
                Challenges
              </span>
              <span className="text-xs tracking-wider  text-orange-500  underline border-orange-500 cursor-pointer">
                View All
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex relative left-[110px] flex-col md:flex-row gap-6 items-start">
            <div className="relative flex-shrink-0">
              <img
                className="w-[86px] h-[113px] rounded bg-gradient-to-b from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center overflow-hidden shadow-lg"
                src="images/limbo.png"
              />

              <div className="mt-3 w-full h-1 bg-gray-700 rounded overflow-hidden">
                <div className="w-2/3 h-full bg-white"></div>
              </div>
            </div>

            <div className="flex-grow max-w-[719px]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <p className="text-sm font-semibold text-white tracking-widest">
                    Boom Balloon
                  </p>
                  <span className="px-2 py-0.5 text-[10px] font-semibold tracking-widest  text-gray-400 bg-[#FFFFFF0F] border border-gray-700 rounded flex items-center">
                    <span className="text-orange-500 mr-1 ">✦</span> ORBEiT
                    Originals
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <img src="/images/winners.svg" />
                  <div
                    className="flex"
                    style={{
                      borderBottom: "1px solid",
                      borderImage:
                        "repeating-linear-gradient(to right, #828282 0 3px, transparent 3px 6px) 1",
                    }}
                  >
                    <span className="text-white">27.8K</span>
                  </div>

                  <span className="tracking-wider">~Winners</span>
                </div>
              </div>

              <p className="text-sm leading-snug tracking-widest text-gray-400 mb-6 max-w-3xl">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo conseq...
                <span className="text-orange-500 cursor-pointer border-b border-orange-500/30 hover:border-orange-500">
                  see more
                </span>
              </p>

              <div className="flex items-center space-x-6">
                <button className="py-[5px] text-center text-xs px-3 w-[123px] tracking-wider text-nowrap h-[24px] bg-[#ff4d00] text-white rounded hover:bg-orange-600 transition shadow-lg shadow-orange-900/20">
                  Complete Challenge
                </button>
                <div className="flex items-center space-x-2">
                  <img src="/images/gift.svg" />
                  <span className="text-sm tracking-widest text-gray-200">
                    0.01000000 BTC
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenge;
