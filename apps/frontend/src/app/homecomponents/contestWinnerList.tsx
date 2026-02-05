import React from "react";

const ContestWinnerList = () => {
  return (
    <div className="mt-2 mb-2">
      <div className="flex mb-2 mt-12 flex-wrap items-center justify-between w-full h-[29px] gap-4 text-gray-400 ">
        <div className="flex items-center space-x-4 overflow-x-auto ">
          <div className="flex items-center w-[154px] h-[29px]   rounded border border-gray-800">
            <button className=" h-[26px] w-[86px] text-xs  tracking-wider rounded transition hover:text-white">
              Leaderboard
            </button>
            <button className=" w-[68px] h-[29px] text-sm  tracking-wider bg-[#ff4d00] text-white rounded ">
              Contest
            </button>
          </div>

          <button className="flex w-[79px] h-[29px] items-center space-x-2 px-4 py-2 text-xs tracking-widest border border-gray-800 rounded  hover:border-gray-600 transition">
            <span className="text-sm">Wins</span>
            <svg
              width="6"
              height="4"
              viewBox="0 0 6 4"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.142521 0.456215L0.4313 0.150673C0.531373 0.050234 0.648251 0 0.781668 0C0.917836 0 1.03333 0.050234 1.12833 0.150673L2.99999 2.13039L4.87163 0.150731C4.96662 0.0502911 5.08214 5.71454e-05 5.21825 5.71454e-05C5.35173 5.71454e-05 5.46859 0.0502911 5.56867 0.150731L5.85366 0.456272C5.95124 0.559408 6 0.683002 6 0.826942C6 0.973563 5.95118 1.09576 5.85367 1.1935L3.34662 3.84523C3.25415 3.94838 3.13868 4 3 4C2.86393 4 2.74709 3.9484 2.6496 3.84523L0.142534 1.1935C0.0475335 1.09301 0 0.970824 0 0.826942C-1.38283e-05 0.685685 0.0475202 0.562161 0.142521 0.456215Z"
                fill="#FF4500"
              />
            </svg>
          </button>

          <div className="flex items-center space-x-2 ml-2">
            <div className="flex w-[114px] px-3 gap-2 py-1.5 text-nowrap items-center h-[29px] bg-orange-900/20 rounded">
              <img src="/images/gift.svg" />
              <span className="text-sm text-white tracking-widest">
                4h: 32m: 21s
              </span>
            </div>
            <span className="text-[12px] text-[#5B5B79] font-normal  tracking-widest">
              ~Prize Distribution
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center w-[120px] h-[29px]   rounded border border-gray-800">
            <button className=" w-[60px] h-[29px] text-sm  tracking-wider bg-[#ff4d00] text-white rounded ">
              Global
            </button>
            <button className=" h-[26px] w-[60px] text-xs  tracking-wider rounded transition hover:text-white">
              Friends
            </button>
          </div>

          <div className="flex items-center w-[123px] h-[29px]   rounded border border-gray-800">
            <button className=" h-[26px] w-[29.6px]  text-xs  tracking-wider rounded transition hover:text-white">
              D
            </button>

            <button className=" w-[34px] h-[29px] text-sm  tracking-wider bg-[#ff4d00] text-white rounded ">
              W
            </button>
            <button className=" relative h-[26px]   w-[29.6px] text-xs  tracking-wider transition hover:text-white">
              M
              <span className="absolute right-0 top-1/2 -translate-y-1/2 h-[10px] w-[1px] bg-gray-600 opacity-60"></span>
            </button>
            <button className=" h-[26px] w-[29.6px] text-xs  tracking-wider rounded transition hover:text-white">
              Y
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
        {[1, 2, 3, 4].map((i, idx) => (
          <div
            key={i}
            className="flex w-[326px] h-[74px] max-w-md overflow-hidden bg-[#0a0b14] bordedrrr border-gray-800ddd rounded group"
          >
            <div
              className={`flex items-center justify-center w-[26px] h-[74px]  ${
                idx === 0
                  ? "bg-[linear-gradient(180deg,#FF416C_0%,#FFA72B_100%)]"
                  : idx === 1
                  ? "bg-[linear-gradient(180deg,#4A00E0_0%,#8E2DE2_100%)]"
                  : idx === 2
                  ? "bg-[linear-gradient(180deg,#00B4DB_0%,#0083B0_100%)]"
                  : "bg-[linear-gradient(180deg,#5B5B5B_0%,#5B5B5B_100%)]"
              } border-r border-gray-800`}
            >
              <span className="font-medium text-sm text-white uppercase transform -rotate-90">
                {String(idx + 1).padStart(2, "0")}
              </span>
            </div>

            <div className="flex-grow px-4  bg-[#FFFFFF0F]">
              <div className="flex items-center pt-3 justify-between">
                <div className="flex items-center space-x-1.5">
                  <div className="w-4 h-4 overflow-hidden rounded">
                    <img
                      src="/images/avatar1.jpg"
                      alt="Avatar"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <p className="text-[14px] font-normal tracking-wider text-white ">
                    Samboxer
                  </p>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <img src="/images/verified.svg" />
                    <img src="/images/color-star.svg" />
                    <span className="px-1 text-[8px] font-black bg-yellow-400 rounded text-black uppercase leading-tight tracking-wider">
                      Vip
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline space-x-1">
                  <span className="text-[14px] font-semibold text-[#FFA72B] border-b border-[#FFA72B] leading-none">
                    202
                  </span>
                  <span className="text-[14px] font-semibold text-[#FFA72B]  tracking-widest">
                    Wins
                  </span>
                </div>
              </div>

              <div className="flex items-center pt-2.5 justify-between">
                <div className="flex items-center space-x-1.5 text-gray-500">
                  <img src="images/21.svg" alt="Reward" className=" w-3 h-3" />
                  <img
                    src="images/hukum.svg"
                    alt="Reward"
                    className=" w-3 h-3"
                  />
                  <img
                    src="images/wintag3.svg"
                    alt="Reward"
                    className=" w-3 h-3"
                  />
                  <span className="text-[14px] font-normal tracking-widest">
                    +4 more
                  </span>
                </div>

                <div className="flex items-center  space-x-2">
                  <div className="w-6 h-6 overflow-hidden border border-gray-700 rounded bg-red-900/30">
                    <img
                      src="images/rare-avatar.jpg"
                      alt="Reward"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <span className=" text-[14px] text-gray-400 font text-nowrap">
                    Rare Avatar
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="w-100 overflow-x-auto scrollbar-hide bg-rfed-400">
        <div className="mt-6 flex gap-6 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
          {[5, 6, 7, 8, 9].map((i, idx) => (
            <div
              key={i}
              className="flex min-w-[326px] h-[74px] max-w-md overflow-hidden bg-[#0a0b14] bordedrrr border-gray-800ddd rounded group"
            >
              <div
                className={`flex items-center justify-center w-[26px] h-[74px] bg-[linear-gradient(180deg,#5B5B5B_0%,#5B5B5B_100%)]
                 border-r border-gray-800`}
              >
                <span className="font-medium text-sm text-white uppercase transform -rotate-90">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="flex-grow px-4 bg-[#FFFFFF0F]">
                <div className="flex items-center pt-3 justify-between">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-4 h-4 overflow-hidden rounded">
                      <img
                        src="/images/avatar1.jpg"
                        alt="Avatar"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <p className="text-[14px] font-normal tracking-wider text-white ">
                      Samboxer
                    </p>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <img src="/images/verified.svg" />
                      <img src="/images/color-star.svg" />
                      <span className="px-1 text-[8px] font-black bg-yellow-400 rounded text-black uppercase leading-tight tracking-wider">
                        Vip
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline space-x-1">
                    <span className="text-[14px] font-semibold text-[#FFA72B] border-b border-[#FFA72B] leading-none">
                      202
                    </span>
                    <span className="text-[14px] font-semibold text-[#FFA72B]  tracking-widest">
                      Wins
                    </span>
                  </div>
                </div>

                <div className="flex items-center pt-2.5 justify-between">
                  <div className="flex items-center space-x-1.5 text-gray-500">
                    <img
                      src="images/21.svg"
                      alt="Reward"
                      className=" w-3 h-3"
                    />
                    <img
                      src="images/hukum.svg"
                      alt="Reward"
                      className=" w-3 h-3"
                    />
                    <img
                      src="images/wintag3.svg"
                      alt="Reward"
                      className=" w-3 h-3"
                    />
                    <span className="text-[14px] font-normal tracking-widest">
                      +4 more
                    </span>
                  </div>

                  <div className="flex items-center  space-x-2">
                    <div className="w-6 h-6 overflow-hidden border border-gray-700 rounded bg-red-900/30">
                      <img
                        src="images/rare-avatar.jpg"
                        alt="Reward"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <span className=" text-[14px] text-gray-400 font text-nowrap">
                      Rare Avatar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContestWinnerList;
