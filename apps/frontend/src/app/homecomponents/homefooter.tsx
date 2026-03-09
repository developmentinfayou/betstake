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
  const [transferAll, setTransferAll] = React.useState(false);
  const [finalTransfer, setFinalTransfer] = React.useState(false);
  const [confredend, setconfirmedend] = React.useState(false);

  const transfer = () => {
    setTransferShow((prev: boolean) => !prev);
    setDepositShow(false);
    setTransferAll(true);
  }

  const Transfernow = () => {
    setFinalTransfer((prev: boolean) => !prev)
  }

  const valshow = () => {
    setvaultShow((prev: boolean) => !prev);
  };

  const confirmed = () => {
    setconfirmedend((prev: boolean) => !prev);
  }

  const [isSwapped, setIsSwapped] = React.useState(false);

  const handleSwap = () => {
    setIsSwapped((prev) => !prev);
  };

  const WalletCard = () => (
    <div>
      <p className="text-[16px] text-[#7c8799] mb-1">Wallet Balance</p>
      <div className="flex items-center justify-between gap-2 bg-[#04040A] border border-[#1e293b] py-1.5 px-3 rounded w-[197px] h-[34px]">
        <span className="text-white flex items-center gap-1 text-[16px] text-nowrap">
          <Bitcoin /> 0.0066012 BTC
        </span>
        <span className="text-[14px] bg-emerald-400 text-black px-[5px] rounded text-right">
          MAX
        </span>
      </div>
    </div>
  );

  const PlayCard = () => (
    <div>
      <p className="text-[16px] text-[#7c8799] mb-1 text-left">Play Balance</p>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-white flex items-center gap-1 text-[16px] text-nowrap">
            <Bitcoin /> 0.0066012 BTC
          </span>
        </div>
        <button className="bg-[#73FFD7] text-black px-[8px] text-[16px] min-w-[75px] h-[34px] rounded hover:opacity-90 transition">
          Transfer
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Adjusted spacing from bottom-14 to bottom-20 for the Deposit/Wallet Box */}
      {depositShow && (
        <div className="absolute bottom-20 left-0 z-50 w-[630px] p-5 rounded-xl bg-[#0A0B14] border border-[#31313F] shadow-2xl backdrop-blur-3xl font-sans">
          <div className="flex items-center justify-between mb-6 space-x-3">
            <div className="flex bg-[#73FFD70F] rounded-lg p-1 items-center h-[38px] w-[155px]">
              <button className="flex flex-1 items-center justify-center gap-2 h-full bg-[#1A2624] text-[#73FFD7] rounded-md text-[14px] font-medium transition-all shadow-sm">
                <img src="/images/crypto.svg" className="w-[16px] h-[16px]" style={{ filter: "brightness(0) saturate(100%) invert(80%) sepia(50%) saturate(1000%) hue-rotate(110deg)" }} /> Crypto
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 h-full text-[#8A9098] hover:text-white rounded-md text-[14px] font-medium transition-all">
                <img src="/images/fiat.svg" className="w-[16px] h-[16px] opacity-70" /> Fiat
              </button>
            </div>
            <div className="relative flex-grow h-[38px]">
              <span className="absolute inset-y-0 left-3 flex items-center text-[#8A9098]">
                <svg width="14" height="14" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.16657 5.83217C9.16657 3.99122 7.67419 2.49884 5.83324 2.49884" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12.5 12.5L9.6 9.6M11.1667 5.83333C11.1667 8.77885 8.77885 11.1667 5.83333 11.1667C2.88781 11.1667 0.5 8.77885 0.5 5.83333C0.5 2.88781 2.88781 0.5 5.83333 0.5C8.77885 0.5 11.1667 2.88781 11.1667 5.83333Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <input type="text" placeholder="Search here..." className="w-full h-full bg-[#04040A] border border-[#31313F] rounded-lg py-1.5 pl-9 pr-3 text-[14px] text-white placeholder-[#8A9098] focus:outline-none focus:border-[#73FFD7]/50 transition" />
            </div>
            <div className="flex items-center space-x-3 text-[#8A9098] pl-1">
              <svg className="cursor-pointer text-[#73FFD7] hover:opacity-80" width="16" height="16" viewBox="0 0 13 13" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.53367 4.49984H2.16667C1.24619 4.49984 0.5 3.75364 0.5 2.83317C0.5 1.9127 1.24619 1.1665 2.16667 1.1665H8.53367M4.46633 11.8332H10.8333C11.7538 11.8332 12.5 11.087 12.5 10.1665C12.5 9.24603 11.7538 8.49984 10.8333 8.49984H4.46633" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2.83333 12.5C1.54467 12.5 0.5 11.4553 0.5 10.1667C0.5 8.878 1.54467 7.83333 2.83333 7.83333C4.122 7.83333 5.16667 8.878 5.16667 10.1667C5.16667 11.4553 4.122 12.5 2.83333 12.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.1667 5.16667C11.4553 5.16667 12.5 4.122 12.5 2.83333C12.5 1.54467 11.4553 0.5 10.1667 0.5C8.878 0.5 7.83333 1.54467 7.83333 2.83333C7.83333 4.122 8.878 5.16667 10.1667 5.16667Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <svg className="cursor-pointer hover:text-white transition-colors" width="16" height="15" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.3778 0.5C12.8433 0.5 14.5 2.735 14.5 4.82C14.5 9.0425 7.62444 12.5 7.5 12.5C7.37556 12.5 0.5 9.0425 0.5 4.82C0.5 2.735 2.15667 0.5 4.62222 0.5C6.03778 0.5 6.96333 1.1825 7.5 1.7825C8.03667 1.1825 8.96222 0.5 10.3778 0.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col gap-[8px] mb-6">
            <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-[#FFFFFF08] cursor-pointer group transition-all duration-200">
              <div className="flex items-center space-x-3">
                <img src="/images/dogecoin.svg" className="w-[20px] h-[20px]" />
                <span className="text-[15px] font-normal text-[#8A9098] group-hover:text-white transition-colors tracking-wide">Dogecoin</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[13px] text-[#4b5563] font-mono tracking-wider">3819.75 INR ~</div>
                <div className="text-[14px] text-[#8A9098] group-hover:text-white transition-colors font-mono w-[135px] text-right tracking-wider">266.00000 DOGE</div>
              </div>
            </div>

            <div className="relative flex items-center justify-between px-3 py-3 cursor-pointer transition-all duration-200">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] bg-[#73FFD7] rounded-r-md"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] bg-[#73FFD7] rounded-l-md"></div>
              <div className="flex items-center space-x-3 relative z-10 pl-1">
                <img src="/images/fiat.svg" className="w-[20px] h-[20px]" />
                <span className="text-[15px] font-medium text-white tracking-wide">Bitcoin</span>
              </div>
              <div className="flex items-center gap-3 relative z-10 pr-1">
                <div className="text-[13px] text-[#4b5563] font-mono tracking-wider">17319.47 INR ~</div>
                <div className="text-[14px] font-medium text-white font-mono w-[135px] text-right tracking-wider">0.0021780 BTC</div>
              </div>
            </div>

            <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-[#FFFFFF08] cursor-pointer group transition-all duration-200">
              <div className="flex items-center space-x-3">
                <img src="/images/litecoin.svg" className="w-[20px] h-[20px]" />
                <span className="text-[15px] font-normal text-[#8A9098] group-hover:text-white transition-colors tracking-wide">Litecoin</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[13px] text-[#4b5563] font-mono tracking-wider">2310.8 INR ~</div>
                <div className="text-[14px] text-[#8A9098] group-hover:text-white transition-colors font-mono w-[135px] text-right tracking-wider">0.28880000 LTC</div>
              </div>
            </div>

            <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-[#FFFFFF08] cursor-pointer group transition-all duration-200">
              <div className="flex items-center space-x-3">
                <img src="/images/binance.svg" className="w-[20px] h-[20px]" />
                <span className="text-[15px] font-normal text-[#8A9098] group-hover:text-white transition-colors tracking-wide flex items-center gap-2">
                  Binance Coin
                  <svg width="14" height="12" viewBox="0 0 15 13" fill="#73FFD7" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.3778 0.5C12.8433 0.5 14.5 2.735 14.5 4.82C14.5 9.0425 7.62444 12.5 7.5 12.5C7.37556 12.5 0.5 9.0425 0.5 4.82C0.5 2.735 2.15667 0.5 4.62222 0.5C6.03778 0.5 6.96333 1.1825 7.5 1.7825C8.03667 1.1825 8.96222 0.5 10.3778 0.5Z" />
                  </svg>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[13px] text-[#4b5563] font-mono tracking-wider">27288.61 INR ~</div>
                <div className="text-[14px] text-[#8A9098] group-hover:text-white transition-colors font-mono w-[135px] text-right tracking-wider">0.5 BNB</div>
              </div>
            </div>

            <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-[#FFFFFF08] cursor-pointer group transition-all duration-200">
              <div className="flex items-center space-x-3">
                <img src="/images/tether.svg" className="w-[20px] h-[20px]" />
                <span className="text-[15px] font-normal text-[#8A9098] group-hover:text-white transition-colors tracking-wide">Tether</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[13px] text-[#4b5563] font-mono tracking-wider">57.79 INR ~</div>
                <div className="text-[14px] text-[#8A9098] group-hover:text-white transition-colors font-mono w-[135px] text-right tracking-wider">0.672 USDT</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 pb-1 bg-[#141d24]/40 -mx-5 -mb-5 px-5 rounded-b-xl border-t border-[#31313F]/50 min-h-[50px]">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-[8px] cursor-pointer pt-1">
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={vaultShow} onChange={valshow} className="sr-only peer" />
                  <div className="relative w-9 h-[20px] rounded-full transition-all duration-300 bg-[#31313F]">
                    <div className={`absolute top-[2px] left-[2px] h-4 w-4 rounded-full transition-all duration-300 ${vaultShow ? "translate-x-[16px] bg-[#73FFD7]" : "translate-x-0 bg-[#8A9098]"}`} />
                  </div>
                </label>
                <span className="text-[14px] text-[#8A9098] tracking-widest border-b border-dashed border-[#8A9098]/40 pb-[1px] -mt-[2px]">Vault</span>
              </div>
              {vaultShow && (
                <div className="flex items-center space-x-2 cursor-pointer text-gray-400 hover:text-white transition pt-1">
                  <span className="text-[14px]">Play Balance</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 text-[#8A9098] cursor-pointer hover:text-white transition-colors pt-1">
              <img src="/images/close-eye.svg" className="w-[18px] h-[18px] opacity-70" />
              <span className="text-[14px] font-medium tracking-wide">Less Amount</span>
            </div>
          </div>
        </div>
      )}

      {/* Adjusted spacing from bottom-14 to bottom-20 for the Transfer Box */}
      {transferShow && (
        <div className="absolute left-[638px] w-[620px] max-w-[95vw] h-[400px] overflow-hidden bottom-20 bg-[#0A0B14] border border-[#31313F] rounded-xl p-5 shadow-2xl z-50">
          <div className="flex items-center justify-between mb-6 space-x-3">
            <div className="flex w-[155px] h-[31px] p-1 bg-[#73FFD70F] rounded ">
              <button className="flex gap-1.5 items-center px-3 py-1.5 text-[16px] text-white bg-[#FFFFFF0F] rounded shadow-sm">
                <img src="/images/crypto.svg" alt="crypto" /> Crypto
              </button>
              <button className="flex gap-1.5 items-center px-3 py-1.5 text-[16px] tracking-wider hover:text-gray-200 transition">
                <img src="/images/fiat.svg" alt="fiat" /> Fiat
              </button>
            </div>
            <div className="relative flex-grow w-[187px] h-[31px]">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.16657 5.83217C9.16657 3.99122 7.67419 2.49884 5.83324 2.49884" stroke="#34d399" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12.5 12.5L9.6 9.6M11.1667 5.83333C11.1667 8.77885 8.77885 11.1667 5.83333 11.1667C2.88781 11.1667 0.5 8.77885 0.5 5.83333C0.5 2.88781 2.88781 0.5 5.83333 0.5C8.77885 0.5 11.1667 2.88781 11.1667 5.83333Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <input type="text" placeholder="Search here..." className="w-full bg-[#04040A] border border-gray-800 rounded py-1.5 pl-9 pr-3 text-[14px] focus:outline-none focus:border-emerald-500/50 transition" />
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="cursor-pointer hover:text-emerald-400" width="13" height="13" viewBox="0 0 13 13" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.53367 4.49984H2.16667C1.24619 4.49984 0.5 3.75364 0.5 2.83317C0.5 1.9127 1.24619 1.1665 2.16667 1.1665H8.53367M4.46633 11.8332H10.8333C11.7538 11.8332 12.5 11.087 12.5 10.1665C12.5 9.24603 11.7538 8.49984 10.8333 8.49984H4.46633" stroke="#13222A" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2.83333 12.5C1.54467 12.5 0.5 11.4553 0.5 10.1667C0.5 8.878 1.54467 7.83333 2.83333 7.83333C4.122 7.83333 5.16667 8.878 5.16667 10.1667C5.16667 11.4553 4.122 12.5 2.83333 12.5Z" stroke="#73FFD7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.1667 5.16667C11.4553 5.16667 12.5 4.122 12.5 2.83333C12.5 1.54467 11.4553 0.5 10.1667 0.5C8.878 0.5 7.83333 1.54467 7.83333 2.83333C7.83333 4.122 8.878 5.16667 10.1667 5.16667Z" stroke="#73FFD7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <svg className="cursor-pointer hover:text-red-400" width="15" height="13" viewBox="0 0 15 13" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.3778 0.5C12.8433 0.5 14.5 2.735 14.5 4.82C14.5 9.0425 7.62444 12.5 7.5 12.5C7.37556 12.5 0.5 9.0425 0.5 4.82C0.5 2.735 2.15667 0.5 4.62222 0.5C6.03778 0.5 6.96333 1.1825 7.5 1.7825C8.03667 1.1825 8.96222 0.5 10.3778 0.5Z" stroke="#13222A" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="rounded">
            {!confredend && (
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex-1 transition-all duration-300">
                  {!isSwapped ? <WalletCard /> : <PlayCard />}
                </div>
                <svg onClick={handleSwap} className={`text-emerald-400 cursor-pointer transition-transform duration-300 ${isSwapped ? "rotate-180" : ""}`} width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.0452539 3.47833C-0.0465664 3.25924 0.00418359 3.00708 0.173797 2.8394L2.8726 0.171795C3.10434 -0.0572648 3.47985 -0.0572648 3.71156 0.171795C3.94321 0.400719 3.94321 0.772025 3.71156 1.00095L2.02541 2.66761H13.4068C13.7344 2.66761 14 2.9301 14 3.25397C14 3.57785 13.7344 3.84034 13.4068 3.84034H0.593277C0.353336 3.84034 0.137074 3.69742 0.0452539 3.47833ZM13.4067 5.15967H0.593223C0.265617 5.15967 0 5.42216 0 5.74603C0 6.0699 0.265617 6.3324 0.593223 6.3324H11.9746L10.2884 7.99906C10.0568 8.22798 10.0567 8.59929 10.2884 8.82821C10.4042 8.94273 10.556 9 10.7079 9C10.8597 9 11.0115 8.94273 11.1273 8.82821L13.8262 6.16061C13.9958 5.99296 14.0466 5.74076 13.9547 5.52168C13.8629 5.30259 13.6467 5.15967 13.4067 5.15967Z" fill="#73FFD7" />
                </svg>
                <div className="flex-1 transition-all duration-300 text-right">
                  {!isSwapped ? <PlayCard /> : <WalletCard />}
                </div>
              </div>
            )}
          </div>

          {!confredend && (
            <div className="space-y-1 w-[calc(100%+40px)] -mx-5 px-5 h-[240px] mt-2 overflow-y-auto scrollbar-hidden">
              <div className="flex items-center justify-between px-2 py-2 rounded hover:bg-[#1a1c2e]/50 border-l-[3px] border-emerald-500/0 hover:border-emerald-500 hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)] cursor-pointer group/row transition-all duration-200">
                <div className="flex items-center space-x-2">
                  <img src="/images/dogecoin.svg" className="w-5 h-5" alt="doge" />
                  <span className="text-[15px] tracking-wide font-normal text-gray-400 group-hover/row:text-white transition-colors">Dogecoin</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right flex items-center gap-2">
                    <div className="text-[14px] text-gray-500">3819.75 INR ~</div>
                    <div className="text-[15px] tracking-wide text-gray-300 group-hover/row:text-white transition-colors">266.00000 DOGE</div>
                  </div>
                  <div className="w-[3px] h-6 bg-white rounded-sm opacity-0 group-hover/row:opacity-100 transition-opacity"></div>
                </div>
              </div>

              <div className="relative flex items-center justify-between px-2 py-2 bg-[#1a1c2e]/50 border-l-[3px] border-emerald-500 rounded-r cursor-pointer shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] group/active">
                <div className="flex items-center space-x-2">
                  <img src="/images/fiat.svg" className="w-5 h-5" alt="fiat" />
                  <span className="text-[15px] tracking-wide font-normal text-white">Bitcoin</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right flex items-center gap-2">
                    <div className="text-[14px] text-gray-500">17319.47 INR ~</div>
                    <div className="text-[15px] tracking-wide text-white">0.0021780 BTC</div>
                  </div>
                  <div className="w-[3px] h-6 bg-white rounded-sm"></div>
                </div>
              </div>

              <div className="flex items-center justify-between px-2 py-2 rounded hover:bg-[#1a1c2e]/50 border-l-[3px] border-emerald-500/0 hover:border-emerald-500 hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)] cursor-pointer group/row transition-all duration-200">
                <div className="flex items-center space-x-2">
                  <img src="/images/tether.svg" className="w-5 h-5" alt="tether" />
                  <span className="text-[15px] tracking-wide font-normal text-gray-400 group-hover/row:text-white transition-colors">Tether</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right flex items-center gap-2">
                    <div className="text-[14px] text-gray-500">3819.75 INR ~</div>
                    <div className="text-[15px] tracking-wide text-gray-300 group-hover/row:text-white transition-colors">266.00000 DOGE</div>
                  </div>
                  <div className="w-[3px] h-6 bg-white rounded-sm opacity-0 group-hover/row:opacity-100 transition-opacity"></div>
                </div>
              </div>

              <div className="flex items-center justify-between px-2 py-2 rounded hover:bg-[#1a1c2e]/50 border-l-4 border-transparent hover:border-emerald-500 hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)] cursor-pointer group/row transition-all duration-200">
                <div className="flex items-center space-x-2">
                  <img src="/images/binance.svg" className="w-5 h-5" alt="binance" />
                  <span className="text-[18px] font-normal group-hover/row:text-white transition-colors">Binance Coin</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right flex items-center gap-2">
                    <div className="text-[16px] text-gray-500">27288.61 INR ~</div>
                    <div className="text-[18px] text-gray-300 group-hover/row:text-white transition-colors">0.5 BNB</div>
                  </div>
                  <div className="w-1 h-8 bg-white/90 rounded-sm opacity-0 group-hover/row:opacity-100 transition-opacity"></div>
                </div>
              </div>

              <div className="flex items-center justify-between px-2 py-2 rounded hover:bg-[#1a1c2e]/50 border-l-4 border-transparent hover:border-emerald-500 hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)] cursor-pointer group/row transition-all duration-200">
                <div className="flex items-center space-x-2">
                  <img src="/images/litecoin.svg" className="w-5 h-5" alt="lite" />
                  <span className="text-[18px] font-normal group-hover/row:text-white transition-colors">Litecoin</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right flex items-center gap-2">
                    <div className="text-[16px] text-gray-500">3819.75 INR ~</div>
                    <div className="text-[18px] text-gray-300 group-hover/row:text-white transition-colors">266.00000 DOGE</div>
                  </div>
                  <div className="w-1 h-8 bg-white/90 rounded-sm opacity-0 group-hover/row:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>
          )}

          {confredend && (
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[16px] text-[#7c8799] mb-1">Wallet Balance</p>
                <svg className={`text-emerald-400 transition-transform duration-300 ${isSwapped ? "rotate-180" : ""}`} width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.0452539 3.47833C-0.0465664 3.25924 0.00418359 3.00708 0.173797 2.8394L2.8726 0.171795C3.10434 -0.0572648 3.47985 -0.0572648 3.71156 0.171795C3.94321 0.400719 3.94321 0.772025 3.71156 1.00095L2.02541 2.66761H13.4068C13.7344 2.66761 14 2.9301 14 3.25397C14 3.57785 13.7344 3.84034 13.4068 3.84034H0.593277C0.353336 3.84034 0.137074 3.69742 0.0452539 3.47833ZM13.4067 5.15967H0.593223C0.265617 5.15967 0 5.42216 0 5.74603C0 6.0699 0.265617 6.3324 0.593223 6.3324H11.9746L10.2884 7.99906C10.0568 8.22798 10.0567 8.59929 10.2884 8.82821C10.4042 8.94273 10.556 9 10.7079 9C10.8597 9 11.0115 8.94273 11.1273 8.82821L13.8262 6.16061C13.9958 5.99296 14.0466 5.74076 13.9547 5.52168C13.8629 5.30259 13.6467 5.15967 13.4067 5.15967Z" fill="#73FFD7" />
                </svg>
                <p className="text-[14px] text-[#7c8799] mb-1">Wallet Balance</p>
              </div>
              {[1, 2, 3].map((_, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between space-y-2">
                    <div className="flex flex-col w-[198px] rounded items-left ">
                      <span className="text-white flex items-center gap-1.5 font-normal text-[16px] text-nowrap">
                        <Bitcoin /> 0.0066012 BTC
                      </span>
                      <div className="text-[14px] pl-[15px] text-gray-500">~ 3819.75 INR </div>
                    </div>
                    <div className="flex w-[198px] h-[40px] bg-[#73FFD70F] rounded p-[11px] items-center gap-1.5">
                      <span className="text-white flex items-center gap-1.5 font-normal text-[16px] text-nowrap">
                        <Bitcoin /> 0.0066012 BTC
                      </span>
                      <div className="text-[14px] text-gray-500">~ 3819.75 INR </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {finalTransfer && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 p-5 bg-[#0A0B14] border border-[#31313F] rounded-xl text-white">infafs</div>
      )}

      {/* Main Footer Toolbar */}
      <div className="flex items-center justify-between px-8 py-3">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="relative w-full overflow-x-hidden">
              <img src="/images/footer-men.png" alt="Avatar" className="w-10 h-10 rounded object-cover" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-normal text-[16px] tracking-wide">CrispyPotato</span>
              </div>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <img src="/images/verified.svg" alt="v" />
                <img src="/images/color-star.svg" alt="s" />
                <span className="px-1 text-[10px] bg-yellow-400 rounded text-black uppercase leading-tight tracking-wider">Vip</span>
              </div>
            </div>
            <svg width="3" height="13" viewBox="0 0 3 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.5 2.88895C0.672687 2.88895 0 2.2412 0 1.44456C0 0.64792 0.672687 0 1.5 0C2.32695 0 3 0.647747 3 1.44439C3 2.24103 2.32695 2.88895 1.5 2.88895ZM1.5 13C0.672687 13 0 12.3519 0 11.5556C0 10.7593 0.672687 10.1112 1.5 10.1112C2.32695 10.1112 3 10.7593 3 11.5556C3 12.3519 2.32695 13 1.5 13ZM1.5 7.94439C0.672687 7.94439 0 7.29629 0 6.5C0 5.70336 0.672687 5.05561 1.5 5.05561C2.32695 5.05561 3 5.70336 3 6.5C3 7.29629 2.32695 7.94439 1.5 7.94439Z" fill="#828282" />
            </svg>
          </div>

          <div className="flex items-center gap-[12px] min-w-0 h-[44px]">
            {!transferAll && (
              <div
                onClick={() => depositCoin()}
                className={`group/balance flex w-[210px] h-[44px] items-center justify-between gap-1.5 px-3 py-1.5 ${depositShow ? 'bg-[#151722] border-transparent' : 'bg-[#0A0B14] border-[#1e293b]'} border rounded-lg cursor-pointer transition-all duration-300 hover:border-[#73FFD7]/50 text-nowrap`}
              >
                <div className="flex items-center gap-2 pl-1">
                  <img src="/images/bitcoin.svg" className="w-[20px] h-[20px]" alt="btc" />
                  <span className="text-[20px] font-medium text-white tracking-wide">0.0021780 BTC</span>
                </div>
                <div className="pr-1">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#73FFD7] transition-transform duration-300" style={{ transform: depositShow ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            )}

            {transferAll && (
              <button className=" w-[41px] h-[41px] flex items-center justify-center text-center gap-1.5 bg-[#73FFD70F] rounded text-[16px] transition border border-[#31313F]">
                <svg width="5" height="3" viewBox="0 0 5 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.5 0.5L2.5 2.5L4.5 0.5" stroke="#73FFD7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            {transferAll && (
              <div className={`relative ${confredend ? "w-[200px]" : "w-[186px]"} h-[1px] bg-[#31313F]`}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#31313F]" />
              </div>
            )}

            {depositShow && !vaultShow && (
              <button className="w-[110px] h-[44px] flex items-center justify-center text-center gap-1.5 bg-[#31313F] text-white rounded-lg text-[15px] hover:bg-[#404050] transition-all duration-200 border-none font-medium tracking-wide">
                Withdraw
              </button>
            )}

            {vaultShow && !transferAll && (
              <button onClick={() => transfer()} className=" w-[75px] h-[41px] flex items-center justify-center text-center gap-1.5 bg-[#31313F] rounded text-[16px] hover:bg-[#494c4b] transition shadow-lg shadow-emerald-500/10">
                Transfer
              </button>
            )}

            {transferAll && (
              <button onClick={() => window.location.reload()} className=" w-[75px] h-[41px] flex items-center justify-center text-center gap-1.5 bg-[#31313F] font-normal rounded text-[16px] hover:bg-[#494c4b] transition shadow-lg shadow-emerald-500/10">
                <svg width="7" height="7" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.5 0.5L6.5 6.5M6.5 0.5L0.5 6.5" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Cancel
              </button>
            )}

            {transferAll ? (
              <button onClick={() => confirmed()} className=" min-w-[75px] h-[41px] px-1 flex items-center justify-center text-center gap-1.5 bg-[#a2ffda] text-[#0a0b14] rounded text-[16px] hover:bg-[#85eec5] transition shadow-lg shadow-emerald-500/10 text-nowrap">
                <svg className="h-2 w-2" width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 0.5V7.5M0.5 4H7.5" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {!confredend ? "Transfer All" : "Confirm"}
              </button>
            ) : (
              <button className="min-w-[124px] h-[44px] flex items-center justify-center text-center gap-2 bg-[#73FFD7] text-[#0A0B14] rounded-lg text-[16px] hover:bg-[#5eead4] transition-all duration-300 font-semibold tracking-wide">
                <span className="text-[20px] leading-none pb-[2px] mb-[1px] font-normal">+</span>
                Deposit
              </button>
            )}
          </div>
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/images/profile-badge.svg" alt="badge" />
          </div>
        </div>

        <div className="relative group xl:flex items-center justify-between p-3 border-[#31313F] border bg-[#FFFFFF08] rounded max-w-[1100px] flex-1 h-[41px]">
          {/* Hover List (Figma Design) */}
          <div className="absolute bottom-full -left-[1.2px] w-[calc(100%+2.4px)] bg-[#0A0B14] border border-[#31313F] border-b-0 rounded-t-lg opacity-0 scale-95 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto z-50 h-[500px] overflow-y-auto scrollbar-hidden">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`flex items-center justify-between p-2.5 px-4 hover:bg-[#FFFFFF0F] cursor-pointer border-b border-white/5 ${i === 2 ? 'bg-[#73FFD70A] border-l-2 border-l-[#73FFD7]' : ''}`}>
                <div className="flex items-center space-x-3">
                  <img src="/images/avatar1.jpg" className="w-4 h-4 rounded-sm object-cover" alt="av" />
                  <span className="text-[16px] tracking-wider text-white">RealBob</span>
                  <div className="flex items-center space-x-1">
                    <img src="/images/verified.svg" className="w-3" alt="v" />
                    <img src="/images/color-star.svg" className="w-3" alt="s" />
                    <span className="px-1 text-[10px] bg-yellow-400 rounded text-black">VIP</span>
                  </div>
                  <span className="text-gray-700 mx-1">|</span>
                  <div className="flex items-center space-x-1.5">
                    <img src="/images/poker-card.svg" className="w-3.5" alt="poker" />
                    <span className={`text-[13px] ${i === 2 ? 'text-[#73FFD7]' : 'text-gray-400'}`}>Poker</span>
                  </div>
                  <span className="text-gray-700 mx-1">|</span>
                  <div className="flex items-center space-x-2">
                    <img src="/images/trx-currency.svg" className="w-3.5" alt="trx" />
                    <span className="text-[14px] text-white">342 TRX</span>
                    <span className="px-1.5 py-0.5 text-[12px] bg-[#73FFD7] text-black rounded-[2px] leading-none">12x</span>
                  </div>
                </div>
                <div className="flex items-center">
                  {i === 2 ? (
                    <span className="text-[13px] flex items-center gap-2 text-[#73FFD7]">
                      View Bet <ViewIcon />
                    </span>
                  ) : (
                    <span className="text-[14px] text-gray-500 tabular-nums">6:26 PM</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-3 w-full">
            <img src="/images/avatar1.jpg" className="rounded-sm w-5 h-5 object-cover" alt="av" />
            <span className="text-[16px] tracking-wider text-white">RealBob</span>
            <div className="flex items-center space-x-1">
              <img src="/images/verified.svg" className="w-3" alt="v" />
              <img src="/images/color-star.svg" className="w-3" alt="s" />
              <span className="px-1 text-[8px] bg-yellow-400 rounded text-black uppercase">Vip</span>
            </div>
            <span className="text-gray-700">|</span>
            <div className="flex items-center space-x-1.5">
              <img src="/images/poker-card.svg" className="w-3.5" alt="pk" />
              <span className="text-[12px] text-gray-400">Poker</span>
            </div>
            <span className="text-gray-700">|</span>
            <div className="flex items-center space-x-2">
              <img src="/images/trx-currency.svg" className="w-3.5" alt="trx" />
              <span className="text-[16px] text-white">342 TRX</span>
              <span className="px-1.5 py-0.5 text-[14px] bg-[#73FFD7] text-black rounded-[2px] leading-none">12x</span>
            </div>
          </div>

          <div className="flex items-center ml-2">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="text-gray-500 group-hover:rotate-180 transition-transform">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="absolute -bottom-6 left-6 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6EF0C2] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6EF0C2]"></span>
            </span>
            <span className="text-[15px] tracking-wide text-[#8A94A6]">Live</span>
          </div>
        </div>

        <div className="flex items-center gap-6 backdrop-blur-md rounded-md px-4 py-3 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 text-white opacity-90 hover:opacity-100 transition cursor-pointer" fill="currentColor">
            <path d="M4 5a3 3 0 013-3h6a3 3 0 013 3v6a3 3 0 01-3 3H9l-4 4V5z" />
            <circle cx="18" cy="6" r="3" fill="#22C55E" />
          </svg>
          <img src="/images/notice-bell.svg" alt="bell" className="w-4 h-4 opacity-80 hover:opacity-100 cursor-pointer transition" />
          <img src="/images/profile-web.svg" alt="web" className="w-4 h-4 opacity-80 hover:opacity-100 cursor-pointer transition" />
        </div>

        <div className="relative flex items-center ml-4">
          <div className="flex items-center gap-3 bg-[#0B0F1A]/80 border border-white/10 backdrop-blur-md rounded-md px-3 py-1.5 transition-all duration-300 hover:border-white/20">
            <img src="/images/profile-bars.svg" alt="bars" className="w-4 h-4 opacity-80 hover:opacity-100 cursor-pointer transition" />
            <img src="/images/profile-headphone.svg" alt="help" className="w-4 h-4 opacity-80 hover:opacity-100 cursor-pointer transition" />
            <img src="/images/profile-chip.svg" alt="chip" className="w-4 h-4 opacity-80 hover:opacity-100 cursor-pointer transition" />
          </div>
          <span className="absolute top-full right-0 mt-2 text-[16px] tracking-wide text-gray-500">v0.1.23</span>
        </div>
      </div>
    </div>
  );
};

export default HomeFooter;