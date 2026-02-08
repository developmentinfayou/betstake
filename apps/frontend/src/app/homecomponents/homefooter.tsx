import React from "react";

const HomeFooter = () => {
  const [depositShow, setDepositShow] = React.useState<any>(false);
  const depositCoin = () => {
    console.log("depositCoin");
    setDepositShow(!depositShow);
  };
  return (
    <div className="relative">
      {" "}
      {/* ✅ FOOTER */}{" "}
      {depositShow && (
        <div className="w-full absolute bottom-14 z-50 max-w-md p-3 rounded bg-[#0d121d]/95 border border-gray-800 shadow-2xl backdrop-blur-md text-gray-400 ">
          <div className="flex items-center justify-between mb-6 space-x-3">
            <div className="flex w-[155px] h-[31px] p-1 bg-[#73FFD70F] rounded ">
              <button className="flex gap-1.5 items-center px-3 py-1.5 text-sm text-white bg-[#FFFFFF0F] rounded shadow-sm">
                <img src="/images/crypto.svg" /> Crypto
              </button>
              <button className="flex gap-1.5 items-center px-3 py-1.5 text-sm tracking-wider hover:text-gray-200 transition">
                <img src="/images/fiat.svg" /> Fiat
              </button>
            </div>

            <div className="relative flex-grow w-[187px] h-[31px]">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.16657 5.83217C9.16657 3.99122 7.67419 2.49884 5.83324 2.49884"
                    stroke="#34d399"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M12.5 12.5L9.6 9.6M11.1667 5.83333C11.1667 8.77885 8.77885 11.1667 5.83333 11.1667C2.88781 11.1667 0.5 8.77885 0.5 5.83333C0.5 2.88781 2.88781 0.5 5.83333 0.5C8.77885 0.5 11.1667 2.88781 11.1667 5.83333Z"
                    stroke="white"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search here..."
                className="w-full bg-[#04040A] border border-gray-800 rounded py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-emerald-500/50 transition"
              />
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <svg
                className=" cursor-pointer hover:text-emerald-400"
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.53367 4.49984H2.16667C1.24619 4.49984 0.5 3.75364 0.5 2.83317C0.5 1.9127 1.24619 1.1665 2.16667 1.1665H8.53367M4.46633 11.8332H10.8333C11.7538 11.8332 12.5 11.087 12.5 10.1665C12.5 9.24603 11.7538 8.49984 10.8333 8.49984H4.46633"
                  stroke="#13222A"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M2.83333 12.5C1.54467 12.5 0.5 11.4553 0.5 10.1667C0.5 8.878 1.54467 7.83333 2.83333 7.83333C4.122 7.83333 5.16667 8.878 5.16667 10.1667C5.16667 11.4553 4.122 12.5 2.83333 12.5Z"
                  stroke="#73FFD7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M10.1667 5.16667C11.4553 5.16667 12.5 4.122 12.5 2.83333C12.5 1.54467 11.4553 0.5 10.1667 0.5C8.878 0.5 7.83333 1.54467 7.83333 2.83333C7.83333 4.122 8.878 5.16667 10.1667 5.16667Z"
                  stroke="#73FFD7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <svg
                className="cursor-pointer hover:text-red-400"
                width="15"
                height="13"
                viewBox="0 0 15 13"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.3778 0.5C12.8433 0.5 14.5 2.735 14.5 4.82C14.5 9.0425 7.62444 12.5 7.5 12.5C7.37556 12.5 0.5 9.0425 0.5 4.82C0.5 2.735 2.15667 0.5 4.62222 0.5C6.03778 0.5 6.96333 1.1825 7.5 1.7825C8.03667 1.1825 8.96222 0.5 10.3778 0.5Z"
                  stroke="#13222A"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-1 mb-6">
            <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-800/30 cursor-pointer group">
              <div className="flex items-center space-x-2">
                <img src="/images/dogecoin.svg" />
                <span className="text-sm font-normal group-hover:text-white">
                  Dogecoin
                </span>
              </div>
              <div className="text-right flex items-center gap-2">
                <div className="text-[12px] text-gray-500">3819.75 INR ~</div>
                <div className="text-sm  text-gray-300">266.00000 DOGE</div>
              </div>
            </div>

            <div className="relative flex items-center justify-between px-2 py-1 bg-[#1a1c2e]/50 border-l-2 border-emerald-500 rounded-r cursor-pointer">
              <div className="flex items-center space-x-2">
                <img src="/images/fiat.svg" />
                <span className="text-sm font-normal text-white">Bitcoin</span>
              </div>
              <div className="text-right flex items-center gap-2">
                <div className="text-[12px] text-gray-500">17319.47 INR ~</div>
                <div className="text-sm  font-medium text-white">
                  0.0021780 BTC
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-800/30 cursor-pointer group">
              <div className="flex items-center space-x-2">
                <img src="/images/tether.svg" />
                <span className="text-sm font-normal group-hover:text-white">
                  Tether
                </span>
              </div>
              <div className="text-right flex items-center gap-2">
                <div className="text-[12px] text-gray-500">3819.75 INR ~</div>
                <div className="text-sm  text-gray-300">266.00000 DOGE</div>
              </div>
            </div>

            <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-800/30 cursor-pointer group">
              <div className="flex items-center space-x-2">
                <img src="/images/binance.svg" />
                <span className="text-sm font-normal group-hover:text-white">
                  Binance Coin
                </span>
                <svg
                  className="cursor-pointer text-emerald-400"
                  width="15"
                  height="13"
                  viewBox="0 0 15 13"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.3778 0.5C12.8433 0.5 14.5 2.735 14.5 4.82C14.5 9.0425 7.62444 12.5 7.5 12.5C7.37556 12.5 0.5 9.0425 0.5 4.82C0.5 2.735 2.15667 0.5 4.62222 0.5C6.03778 0.5 6.96333 1.1825 7.5 1.7825C8.03667 1.1825 8.96222 0.5 10.3778 0.5Z"
                    stroke="#13222A"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div className="text-right flex items-center gap-2">
                <div className="text-[12px] text-gray-500">27288.61 INR ~</div>
                <div className="text-sm  text-gray-300">0.5 BNB</div>
              </div>
            </div>

            <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-800/30 cursor-pointer group">
              <div className="flex items-center space-x-2">
                <img src="/images/litecoin.svg" />
                <span className="text-sm font-normal group-hover:text-white">
                  Litecoin
                </span>
              </div>
              <div className="text-right flex items-center gap-2">
                <div className="text-[10px] text-gray-500">3819.75 INR ~</div>
                <div className="text-sm  text-gray-300">266.00000 DOGE</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap.2 cursor-pointer">
                <img src="/images/deposit-switch.svg" />
                <span
                  style={{
                    borderBottom: "1px",
                    borderStyle: "dashed",
                    strokeDasharray: "1 1",
                  }}
                  className="text-sm  text-white   tracking-widest"
                >
                  Vault
                </span>
              </div>
              <div className="flex items-center space-x-2 cursor-pointer text-gray-400 hover:text-white transition">
                <img src="/images/refresh-balance.svg" />
                <span className="text-sm ">Play Balance</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-gray-500 cursor-pointer hover:text-gray-300">
              <img src="/images/close-eye.svg" />
              <span className="text-xs">Less Amount</span>
            </div>
          </div>
        </div>
      )}
      <div className="flex  items-center justify-between w-full px-4 py-2  text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src="/images/footer-men.png"
                alt="Avatar"
                className="w-10 h-10 rounded object-cover"
              />
              {/* <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#0a0b14] rounded-full"></div> */}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-normal text-sm tracking-wide">
                  CrispyPotato
                </span>
              </div>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <img src="/images/verified.svg" />
                <img src="/images/color-star.svg" />
                <span className="px-1 text-[8px] font-black bg-yellow-400 rounded text-black uppercase leading-tight tracking-wider">
                  Vip
                </span>
              </div>
            </div>
            <svg
              width="3"
              height="13"
              viewBox="0 0 3 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.5 2.88895C0.672687 2.88895 0 2.2412 0 1.44456C0 0.64792 0.672687 0 1.5 0C2.32695 0 3 0.647747 3 1.44439C3 2.24103 2.32695 2.88895 1.5 2.88895ZM1.5 13C0.672687 13 0 12.3519 0 11.5556C0 10.7593 0.672687 10.1112 1.5 10.1112C2.32695 10.1112 3 10.7593 3 11.5556C3 12.3519 2.32695 13 1.5 13ZM1.5 7.94439C0.672687 7.94439 0 7.29629 0 6.5C0 5.70336 0.672687 5.05561 1.5 5.05561C2.32695 5.05561 3 5.70336 3 6.5C3 7.29629 2.32695 7.94439 1.5 7.94439ZM1.5 2.88895C0.672687 2.88895 0 2.2412 0 1.44456C0 0.64792 0.672687 0 1.5 0C2.32695 0 3 0.647747 3 1.44439C3 2.24103 2.32695 2.88895 1.5 2.88895ZM1.5 13C0.672687 13 0 12.3519 0 11.5556C0 10.7593 0.672687 10.1112 1.5 10.1112C2.32695 10.1112 3 10.7593 3 11.5556C3 12.3519 2.32695 13 1.5 13ZM1.5 7.94439C0.672687 7.94439 0 7.29629 0 6.5C0 5.70336 0.672687 5.05561 1.5 5.05561C2.32695 5.05561 3 5.70336 3 6.5C3 7.29629 2.32695 7.94439 1.5 7.94439Z"
                fill="#828282"
              />
            </svg>
          </div>

          <div className="flex w-[146px] h-[41px] items-center gap-1.5 px-3 py-1.5 bg-[#1a1c2e] border border-gray-800 rounded cursor-pointer hover:bg-[#252841] text-nowrap">
            <img src="/images/bitcoin.svg" />
            <span className="text-sm tracking-widest  text-white">
              0.0021780 BTC
            </span>
            <svg
              width="5"
              height="3"
              viewBox="0 0 5 3"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.5 2.5L2.5 0.5L4.5 2.5"
                stroke="#73FFD7"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <button
            onClick={() => depositCoin()}
            className=" w-[75px] h-[41px] flex items-center px-3 gap-1.5 py-[3px] bg-[#a2ffda] text-[#0a0b14] font-medium rounded text-sm hover:bg-[#85eec5] transition shadow-lg shadow-emerald-500/10"
          >
            <span className="  leading-none">+</span> Deposit
          </button>

          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/images/profile-badge.svg" />
          </div>
        </div>

        <div className="hidden relative group xl:flex items-center justify-between p-3 border-[#31313F] border hover:rounded-t-none hover:bg-[#000000f6] bg-[#FFFFFF08] rounded w-[764.79px]">
          {/* 🔥 Hover List */}
          <div
            className="
  absolute top- bottom-full -left-[1.2px] mt-1 w-[764.7px]
  bg-[#000000f6]
  border border-[#31313F] border-b-0
  rounded
  rounded-b-none
  opacity-0 scale-95
  pointer-events-none
  transition-all duration-200
  group-hover:opacity-100
  group-hover:scale-100
  group-hover:pointer-events-auto
  z-50
"
          >
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 hover:bg-[#FFFFFF0F] cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <img src="/images/avatar1.jpg" className="w-6 h-6 rounded" />
                  <span className="text-sm tracking-wider text-white font-light">
                    RealBob
                  </span>

                  <div className="flex items-center space-x-1">
                    <img src="/images/verified.svg" />
                    <img src="/images/color-star.svg" />
                    <span className="px-1 text-[8px] font-black bg-yellow-400 rounded text-black">
                      VIP
                    </span>
                  </div>

                  <span className="text-gray-700">|</span>

                  <div className="flex items-center space-x-1">
                    <img src="/images/poker-card.svg" />
                    <span className="text-[10px]">Poker</span>
                  </div>

                  <span className="text-gray-700">|</span>

                  <div className="flex items-center space-x-2">
                    <img src="/images/trx-currency.svg" />
                    <span className="text-xs text-white">342 TRX</span>
                    <span className="px-2 text-[10px] bg-emerald-400 text-black font-bold rounded">
                      12x
                    </span>
                  </div>
                </div>

                <span className="text-xs text-gray-500">6:26 PM</span>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-3 w-full">
            <img src="/images/avatar1.jpg" className="rounded w-6 h-6" />
            <span className="text-sm tracking-wider text-white font-light">
              RealBob
            </span>
            <div className="flex items-center space-x-1">
              <img src="/images/verified.svg" />
              <img src="/images/color-star.svg" />
              <span className="px-1 text-[8px] font-black bg-yellow-400 rounded text-black uppercase leading-tight tracking-wider">
                Vip
              </span>
            </div>
            <span className="text-gray-700">|</span>
            <div className="flex items-center space-x-1">
              <img src="/images/poker-card.svg" />{" "}
              <span className="text-[10px]"> Poker</span>
            </div>
            <span className="text-gray-700">|</span>
            <div className="flex items-center space-x-2">
              <img src="/images/trx-currency.svg" />
              <span className="text-xs  text-white">342 TRX</span>
              <span className="px-2 py- text-[10px]  bg-emerald-400 text-black font-bold rounded">
                12x
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-500  pr-4">
            <img src="/images/profile-bars.svg" />

            <img src="/images/profile-headphone.svg" />
            <img src="/images/profile-chip.svg" />
          </div>

          <div className="absolute top-[48px]">
            <div className="inline-flex items-center gap-2">
              <span className="relative flex h-1 w-1">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-1 w-1 rounded-full bg-emerald-400"></span>
              </span>

              <span className="text-xs font-normal tracking-wider text-gray-200">
                Live
              </span>
            </div>
          </div>

          <div className="absolute right-[7px] top-[50px] ">
            <span className="text-xs font-normal tracking-wide text-gray-500">
              v0.1.23
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img src="/images/notice-bell.svg" />

              {/* <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full"></span> */}
            </div>
            <img src="/images/profile-web.svg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeFooter;
