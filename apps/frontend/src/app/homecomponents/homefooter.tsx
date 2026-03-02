import React from "react";
import ViewIcon from "../../icons/ViewIcon";
import Bitcoin from "@/icons/Bitcoin";

const HomeFooter = () => {
  const [depositShow, setDepositShow] = React.useState<any>(false);
  const depositCoin = () => {
    console.log("depositCoin");
    setDepositShow(!depositShow);
  };

  const [vaultShow, setvaultShow] = React.useState(false);
  const [transferShow, setTransferShow] = React.useState(false);
  const [transferAll , setTransferAll ] = React.useState(false);
  const [finalTransfer , setFinalTransfer ] = React.useState(false);
const [ confredend , setconfirmedend] = React.useState(false);
   
  

  const transfer = () => {
    setTransferShow((prev: boolean) => !prev);
    setDepositShow(false);
    setTransferAll(true);
  }

  const Transfernow = () => {
    setFinalTransfer((prev:boolean) => !prev)
  }

  const valshow = () => {
    setvaultShow((prev: boolean) => !prev);
  };

  const  confirmed = () => {
    setconfirmedend ((prev: boolean) => !prev);
  }

  const [isSwapped, setIsSwapped] = React.useState(false);

const handleSwap = () => {
  setIsSwapped((prev) => !prev);
};

const WalletCard = () => (
  <div>
    <p className="text-xs text-[#7c8799] mb-1">Wallet Balance</p>

    <div className="flex items-center justify-between gap-2 bg-[#04040A] border border-[#1e293b] py-1.5 px-3 rounded w-[187px] h-[29px]">
    


      <span className="text-white flex items-center gap-1 font-medium text-xs text-nowrap">
      <Bitcoin /> 0.0066012 BTC
      </span>

      <span className="text-[10px] bg-emerald-400 text-black px-[5px] rounded text-right font-semibold">
        MAX
      </span>
    </div>
  </div>
);

const PlayCard = () => (
  <div>
    <p className="text-xs text-[#7c8799] mb-1 text-left">Play Balance</p>

    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
      <span className="text-white flex items-center gap-1 font-medium text-xs text-nowrap">
      <Bitcoin /> 0.0066012 BTC
      </span>

      </div>

      <button className="bg-[#73FFD7] text-black px-[6px] text-[12px] w-[55px] h-[29px] rounded font-medium hover:opacity-90 transition">
        Transfer
      </button>
    </div>
  </div>
);


  return (
    <div className="relative">
      {" "}
      {/* ✅ FOOTER */}{" "}
      {depositShow && (
        <div className="w-full absolute bottom-14 z-50 max-w-md p-3 rounded bg-[#000000D1] border border-gray-800 shadow-2xl backdrop-blur-xl text-gray-400 ">
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
              <div className="flex items-center gap-[6px] cursor-pointer">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vaultShow}
                    onChange={valshow}
                    className="sr-only peer"
                  />

                  <div
                    className={`
      relative w-9 h-5 rounded-full transition-all duration-300
      ${vaultShow ? "bg-[#FFFFFF1F]" : "bg-[#FFFFFF1F]"}
    `}
                  >
                    <div
                      className={`
        absolute top-[2px] left-[2px] h-4 w-4 rounded-full transition-all duration-300
        ${vaultShow ? "translate-x-4 bg-[#73FFD7]" : "translate-x-0 bg-white"}
      `}
                    />
                  </div>
                </label>

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
              {vaultShow && (
                <div className="flex items-center space-x-2 cursor-pointer text-gray-400 hover:text-white transition">
                  <img src="/images/refresh-balance.svg" />
                  <span className="text-sm ">Play Balance</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 text-gray-500 cursor-pointer hover:text-gray-300">
              <img src="/images/close-eye.svg" />
              <span className="text-xs">Less Amount</span>
            </div>
          </div>
        </div>
      )}
      {transferShow && (
        <div className="left-[187px] w-[428px] h-[307px] overflow-hidden absolute bottom-14 z-50 max-w-md p-3 rounded bg-[#73FFD70F] border border-[#31313F] shadow-2xl backdrop-blur-3xl text-gray-400 ">
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

          <div className="rounded">

  {!confredend && <div className="flex items-center justify-between gap-4 mb-4">

    {/* LEFT SIDE */}
    <div className="flex-1 transition-all duration-300">
      {!isSwapped ? <WalletCard /> : <PlayCard />}
    </div>

    {/* SWAP BUTTON */}
    {/* <button
      onClick={handleSwap}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0f1b2e] hover:bg-[#13233b] transition-all duration-300 group"
    > */}
      {/* <svg
        className={`w-5 h-5 text-emerald-400 transition-transform duration-300 ${
          isSwapped ? "rotate-180" : ""
        }`}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M7 7h10M7 7l3-3M7 7l3 3M17 17H7m10 0l-3-3m3 3l-3 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg> */}

      <svg  onClick={handleSwap} className={` text-emerald-400 transition-transform duration-300 ${
          isSwapped ? "rotate-180" : ""
        }`} width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.0452539 3.47833C-0.0465664 3.25924 0.00418359 3.00708 0.173797 2.8394L2.8726 0.171795C3.10434 -0.0572648 3.47985 -0.0572648 3.71156 0.171795C3.94321 0.400719 3.94321 0.772025 3.71156 1.00095L2.02541 2.66761H13.4068C13.7344 2.66761 14 2.9301 14 3.25397C14 3.57785 13.7344 3.84034 13.4068 3.84034H0.593277C0.353336 3.84034 0.137074 3.69742 0.0452539 3.47833ZM13.4067 5.15967H0.593223C0.265617 5.15967 0 5.42216 0 5.74603C0 6.0699 0.265617 6.3324 0.593223 6.3324H11.9746L10.2884 7.99906C10.0568 8.22798 10.0567 8.59929 10.2884 8.82821C10.4042 8.94273 10.556 9 10.7079 9C10.8597 9 11.0115 8.94273 11.1273 8.82821L13.8262 6.16061C13.9958 5.99296 14.0466 5.74076 13.9547 5.52168C13.8629 5.30259 13.6467 5.15967 13.4067 5.15967Z" fill="#73FFD7"/>
</svg>

    {/* </button> */}

    {/* RIGHT SIDE */}
   { <div className="flex-1 transition-all duration-300 text-right">
      {!isSwapped ? <PlayCard /> : <WalletCard />}
    </div>
}
   

  </div>}


</div>


         {!confredend && <div className="space-y-1 w-[404px] h-[178px] overflow-y-auto scrollbar-hidden bg-[#73FFD70F]">
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
          </div>}

  { confredend &&

  <div>
    <div className="flex items-center justify-between">
    <p className="text-xs text-[#7c8799] mb-1">Wallet Balance</p>

    <svg className={` text-emerald-400 transition-transform duration-300 ${
          isSwapped ? "rotate-180" : ""
        }`} width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.0452539 3.47833C-0.0465664 3.25924 0.00418359 3.00708 0.173797 2.8394L2.8726 0.171795C3.10434 -0.0572648 3.47985 -0.0572648 3.71156 0.171795C3.94321 0.400719 3.94321 0.772025 3.71156 1.00095L2.02541 2.66761H13.4068C13.7344 2.66761 14 2.9301 14 3.25397C14 3.57785 13.7344 3.84034 13.4068 3.84034H0.593277C0.353336 3.84034 0.137074 3.69742 0.0452539 3.47833ZM13.4067 5.15967H0.593223C0.265617 5.15967 0 5.42216 0 5.74603C0 6.0699 0.265617 6.3324 0.593223 6.3324H11.9746L10.2884 7.99906C10.0568 8.22798 10.0567 8.59929 10.2884 8.82821C10.4042 8.94273 10.556 9 10.7079 9C10.8597 9 11.0115 8.94273 11.1273 8.82821L13.8262 6.16061C13.9958 5.99296 14.0466 5.74076 13.9547 5.52168C13.8629 5.30259 13.6467 5.15967 13.4067 5.15967Z" fill="#73FFD7"/>
</svg>


    <p className="text-xs text-[#7c8799] mb-1">Wallet Balance</p>



    </div>
  { [1, 2, 3].map((_, index) => ( <div key={index}>
     <div className="flex items-center justify-between space-y-2">


    <div className="flex flex-col w-[198px] rounded items-left ">
      <span className="text-white flex items-center gap-1.5 font-normal text-sm text-nowrap">
     <Bitcoin /> 0.0066012 BTC
      </span>

      <div className="text-[12px] pl-[15px] text-gray-500">~ 3819.75 INR </div>

      </div>
    
     <div className="flex w-[198px] h-[40px] bg-[#73FFD70F] rounded p-[11px] items-center gap-1.5">
      <span className="text-white flex items-center gap-1.5 font-normal text-sm text-nowrap">
     <Bitcoin /> 0.0066012 BTC
      </span>

      <div className="text-[12px] text-gray-500">~ 3819.75 INR </div>

      </div>
      </div>
      </div> ))}</div>
    }


          <div className="flexxx hidden items-center justify-between pt-4 border-t border-gray-800">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-[6px] cursor-pointer">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vaultShow}
                    onChange={valshow}
                    className="sr-only peer"
                  />

                  <div
                    className={`
      relative w-9 h-5 rounded-full transition-all duration-300
      ${vaultShow ? "bg-[#FFFFFF1F]" : "bg-[#FFFFFF1F]"}
    `}
                  >
                    <div
                      className={`
        absolute top-[2px] left-[2px] h-4 w-4 rounded-full transition-all duration-300
        ${vaultShow ? "translate-x-4 bg-[#73FFD7]" : "translate-x-0 bg-white"}
      `}
                    />
                  </div>
                </label>

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
              {vaultShow && (
                <div className="flex items-center space-x-2 cursor-pointer text-gray-400 hover:text-white transition">
                  <img src="/images/refresh-balance.svg" />
                  <span className="text-sm ">Play Balance</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 text-gray-500 cursor-pointer hover:text-gray-300">
              <img src="/images/close-eye.svg" />
              <span className="text-xs">Less Amount</span>
            </div>
          </div>
        </div>
      )}

      {finalTransfer && (
        <div>infafs</div>
      )}


      <div className="flex  items-center justify-between w-full px-4 py-2  text-gray-400">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
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

        <div className="flex items-center gap-[12px] min-w-[233px] h-[41px]">
             { !transferAll &&  <div
              onClick={() => depositCoin()}
              className="flex w-[146px] h-[41px] items-center gap-1.5 px-3 py-1.5 bg-[#1a1c2e] border border-gray-800 rounded cursor-pointer hover:bg-[#252841] text-nowrap"
            >
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
          }


{transferAll && <button
            
                className=" w-[41px] h-[41px] flex items-center justify-center text-center gap-1.5  bg-[#73FFD70F] font-medium rounded text-sm  transition border border-[#31313F]"
              >
                <svg width="5" height="3" viewBox="0 0 5 3" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.5 0.5L2.5 2.5L4.5 0.5" stroke="#73FFD7" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

              </button>}


{transferAll && <div className={`relative ${confredend ? "w-[200px]" : "w-[186px]"} h-[1px] bg-[#31313F]`}>
  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#31313F]" />
</div>}




            {depositShow && !vaultShow && (
              <button
                // onClick={() => depositCoin()}
                className=" w-[75px] h-[41px] flex items-center justify-center text-center gap-1.5  bg-[#31313F] font-medium rounded text-sm hover:bg-[#494c4b] transition shadow-lg shadow-emerald-500/10"
              >
                Withdraw
              </button>
            )}

            {vaultShow && !transferAll && (
              <button
                onClick={() => transfer()}
                className=" w-[75px] h-[41px] flex items-center justify-center text-center gap-1.5  bg-[#31313F] font-medium rounded text-sm hover:bg-[#494c4b] transition shadow-lg shadow-emerald-500/10"
              >
                Transfer
              </button>
            )}


{transferAll && (
              <button
                onClick={() => window.location.reload()}
                className=" w-[75px] h-[41px] flex items-center justify-center text-center gap-1.5  bg-[#31313F] font-normal rounded text-sm hover:bg-[#494c4b] transition shadow-lg shadow-emerald-500/10"
              >
               <svg width="7" height="7" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.5 0.5L6.5 6.5M6.5 0.5L0.5 6.5" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
 Cancel
              </button>
            )}



           {transferAll ?   <button
              onClick={() => confirmed()}
              className=" min-w-[75px] h-[41px] px-1 flex items-center justify-center text-center gap-1.5  bg-[#a2ffda] text-[#0a0b14] font-medium rounded text-sm hover:bg-[#85eec5] transition shadow-lg shadow-emerald-500/10 text-nowrap"
            >
              <svg
                className="h-2 w-2"
                width="8"
                height="8"
                viewBox="0 0 8 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 0.5V7.5M0.5 4H7.5"
                  stroke="black"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            {!confredend ?   "Transfer All" : "Confirm"}
            </button> : <button
              // onClick={() => depositCoin()}
              className=" w-[75px] h-[41px] flex items-center justify-center text-center gap-1.5  bg-[#a2ffda] text-[#0a0b14] font-medium rounded text-sm hover:bg-[#85eec5] transition shadow-lg shadow-emerald-500/10"
            >
              <svg
                className="h-2 w-2"
                width="8"
                height="8"
                viewBox="0 0 8 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 0.5V7.5M0.5 4H7.5"
                  stroke="black"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Deposit
            </button> }
          </div>

          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/images/profile-badge.svg" />
          </div>
        </div>

        <div className={`hidden relative group xl:flex items-center justify-between p-3 border-[#31313F] border hover:rounded-t-none hover:bg-[#000000f6] bg-[#FFFFFF08] rounded ${transferAll ?  "min-w-[600px]" :" min-w-[706.79px]" } h-[41px]`}>
          {/* 🔥 Hover List */}
          <div
            className={`
  absolute top- bottom-full -left-[1.2px] mt-1 ${transferAll ?  "min-w-[600px]" :" min-w-[706.79px]" }
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
  h-[200px] overflow-y-auto scrollbar-hidden
`}
          >
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex items-center group/row relative justify-between p-3 hover:bg-[#FFFFFF0F] cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <img src="/images/avatar1.jpg" className="w-6 h-6 rounded" />
                  <span className="text-sm tracking-wider text-white font-light">
                    RealBob
                  </span>

                  <div className="flex items-center space-x-1">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5.65655 0.294453C5.89863 0.565449 6.2807 0.660199 6.62026 0.53341C7.11216 0.349743 7.65378 0.635725 7.78298 1.14733C7.87215 1.50047 8.16671 1.76298 8.52591 1.80949C9.04631 1.87684 9.39378 2.38328 9.27186 2.8967C9.1877 3.25108 9.32723 3.62123 9.62382 3.83034C10.0535 4.13328 10.1272 4.74416 9.78211 5.14176C9.54387 5.4162 9.49645 5.80919 9.66248 6.13301C9.903 6.60214 9.68609 7.17752 9.19683 7.36821C8.85912 7.49983 8.63558 7.82564 8.633 8.18999C8.62926 8.71784 8.17141 9.1259 7.65011 9.066C7.29027 9.02467 6.94185 9.20864 6.77126 9.53004C6.52412 9.99569 5.93021 10.1429 5.49628 9.84619C5.19676 9.64135 4.80325 9.64135 4.50374 9.84619C4.06981 10.1429 3.47591 9.99567 3.22877 9.53004C3.05817 9.20864 2.70974 9.02465 2.34992 9.066C1.82861 9.1259 1.37077 8.71784 1.36703 8.18999C1.36445 7.82564 1.14091 7.49983 0.803199 7.36821C0.313934 7.17752 0.0970414 6.60214 0.337551 6.13301C0.503577 5.80919 0.456139 5.4162 0.217904 5.14176C-0.127229 4.74416 -0.0535043 4.13328 0.37619 3.83034C0.672779 3.62123 0.812314 3.25108 0.728147 2.8967C0.60621 2.38329 0.953681 1.87685 1.47408 1.80949C1.83329 1.76298 2.12784 1.50047 2.21702 1.14733C2.3462 0.635725 2.88782 0.349743 3.37974 0.53341C3.71928 0.660184 4.10135 0.565449 4.34343 0.294453C4.69414 -0.098151 5.30582 -0.098151 5.65655 0.294453Z"
                        fill="#01C1FF"
                      />
                      <path
                        d="M2.66675 5.85173L4.10265 7.33321L7.33341 3.99988"
                        stroke="black"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>

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

                <span className="text-xs group-hover/row:hidden block  text-gray-500">
                  6:26 PM
                </span>
                <span className="text-xs  items-center group-hover/row:flex gap-[7px] hidden text-gray-500">
                  View Bet
                  <ViewIcon />
                </span>
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

          <div className="flex group-hover:hidden items-center space-x-3 text-gray-500  pr-4">
            <img src="/images/profile-bars.svg" />

            <img src="/images/profile-headphone.svg" />
            <img src="/images/profile-chip.svg" />
          </div>

          <span className="text-xs text-nowrap group-hover:block hidden  text-gray-500">
            6:26 PM
          </span>

          <div className="absolute -bottom-6 left-6 flex items-center gap-2">
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6EF0C2] opacity-75"></span>
      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6EF0C2]"></span>
    </span>
    <span className="text-[13px] tracking-wide text-[#8A94A6]">
      Live
    </span>
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
