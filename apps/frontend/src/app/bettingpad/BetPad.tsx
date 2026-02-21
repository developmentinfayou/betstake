import Bitcoin from "@/icons/Bitcoin";
import React from "react";

const BetPad = () => {
    const [mode, setMode] = React.useState<"manual" | "auto">("manual");
  return (

    <>
    <div className="flex items-center w-[154px] h-[33px] mb-[45px]  rounded border border-gray-800">
    <button
          onClick={() => setMode("manual")}
          className={`flex-1    text-xs tracking-wider rounded transition-all duration-200
          ${
            mode === "manual"
              ? "bg-[#31313F] text-white h-[41px]  "
              : "text-white/50 hover:text-white h-[33px]"
          }`}
        >
          Manual
        </button>

        <button
          onClick={() => setMode("auto")}
          className={`flex-1 w-[58px]  text-xs tracking-wider rounded transition-all duration-200
          ${
            mode === "auto"
              ? "bg-[#31313F] text-white h-[41px]  "
              : "text-white/50 hover:text-white h-[33px]"
          }`}
        >
          Auto
        </button>
      </div>

      {/* manula bet panel  */}
      {mode === "manual" && ( 
        <div className="w-[501px] h-[484px] rounded bg-gradient-to-b from-[#FFFFFF08] to-[#FFFFFF08] text-white ">
      <div className="p-4">

              {/* Top Header */}
              <div className="flex justify-between font-light items-center text-xs text-[#5B5B79]">
                  <span>Bet Amount</span>
                  <span>~ 2310.8 INR</span>
              </div>

              {/* Input Box */}
              <div className="mt-4 w-[469px] h-[37px] flex items-center justify-between border border-white/10 rounded px-3 py-2.5">
                  <div className="flex items-center gap-3">
                      <Bitcoin />
                      <span className="text-[#424252] text-sm">0.0000000</span>
                  </div>

                  <div className="flex gap-2 text-xs">
                      <button className="px-1.5 bg-[#FFFFFF0F] rounded text-white/70 font-semibold">1/2</button>
                      <button className="px-1.5 bg-[#FFFFFF0F] rounded text-white/70 font-semibold">2x</button>
                        <button className="px-1.5 bg-[#FF450029] rounded text-[#FF9169] font-semibold">MAX</button>
                  </div>
              </div>

              {/* Slider */}
              <div className="flex mt-4 gap-[16px] items-center justify-between">
              
                  <div className="relative w-[259px] h-[1px] bg-[#31313F]">
                      <div className="absolute left-1/3 -top-[4px] w-2 h-2 bg-[#FF4500] rounded-full"></div>
                  </div>
        

              {/* Quick Buttons */}
              <div className=" flex gap-1.5">
                  {["0.00009", "0.00001", "0.002", "0.01"].map((val) => (
                      <button
                          key={val}
                          className="px-[9px] py-[3px] text-xs bg-[#FFFFFF0F] rounded text-white/70"
                      >
                          {val}
                      </button>
                  ))}
              </div>

              </div>

              {/* Buttons Section */}
              <div className="mt-6 flex gap-1.5">
                  <button className="w-[350px] h-[37px] flex-1 py-2.5 px-3 bg-[#FF4500] hover:bg-orange-500 transition rounded text-sm font-semibold">
                      Place Bet
                  </button>

                  <button className="w-[103px] h-[37px] py-3 bg-[#82828229] rounded text-white/50 flex items-center justify-center gap-1.5">
                  <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3.57754 0.000330314L3.5573 0.00019611C3.48391 -0.000487267 3.33167 -0.00190462 3.18728 0.0450466C3.06567 0.08459 2.95491 0.149125 2.86301 0.233981C2.75389 0.334735 2.68715 0.46373 2.65498 0.525925L2.64605 0.54305L0.207851 5.14016C0.159641 5.231 0.107438 5.32935 0.0715066 5.41608C0.033835 5.507 -0.0207867 5.66249 0.00813393 5.84702C0.0430251 6.06965 0.17365 6.2689 0.36927 6.39788C0.531415 6.5048 0.703363 6.52827 0.806475 6.53717C0.904822 6.54566 1.02149 6.54563 1.12923 6.5456L3.9603 6.5456L2.44802 11.2978C2.37129 11.5389 2.47956 11.7982 2.71003 11.9253C2.94051 12.0525 3.23333 12.0144 3.41868 11.8332L10.4881 4.92175C10.5942 4.81811 10.6991 4.7156 10.7759 4.6257C10.8454 4.54447 10.982 4.37586 10.9981 4.14493C11.0162 3.88569 10.9027 3.63375 10.6922 3.4661C10.5046 3.31676 10.2811 3.29242 10.1708 3.28316C10.0488 3.27292 9.89776 3.27294 9.74502 3.27296L6.44067 3.27296L7.44932 0.737285C7.51595 0.569783 7.49121 0.382127 7.38312 0.23509C7.27504 0.0880535 7.09734 0.000330314 6.90758 0.000330314H3.57754Z" fill="#828282"/>
</svg>
 Zap Mode
                  </button>
              </div>

             

          </div>
           {/* Bottom Profit Bar */}
              <div className="mt-[240px] w-[501px] px-4 py-3 bg-gradient-to-r from-[#25A6550F] to-[#25A6550F] flex justify-between items-center">
                  <div className="flex text-sm items-center gap-3 text-green-400">
                      <Bitcoin />
                      <span>0.0000000</span>
                  </div>

                  <span className="text-white/40 text-sm">Profit on Win</span>
              </div>

          </div>
        
        )}

          {/* autobet panel  */}



        {mode === "auto" && ( 
        <div className="w-[501px] min-h-[484px] rounded bg-gradient-to-b from-[#FFFFFF08] to-[#FFFFFF08] text-white ">
      <div className="p-4">

              {/* Top Header */}
              <div className="flex justify-between font-light items-center text-xs text-[#5B5B79]">
                  <span>Bet Amount</span>
                  <span>~ 2310.8 INR</span>
              </div>

              {/* Input Box */}
              {/* Input Box */}
              <div className="mt-4 w-[469px] h-[37px] flex items-center justify-between border border-white/10 rounded px-3 py-2.5">
                  <div className="flex items-center gap-3">
                      <Bitcoin />
                      <span className="text-[#424252] text-sm">0.0000000</span>
                  </div>

                  <div className="flex gap-2 text-xs">
                      <button className="px-1.5 bg-[#FFFFFF0F] rounded text-white/70 font-semibold">1/2</button>
                      <button className="px-1.5 bg-[#FFFFFF0F] rounded text-white/70 font-semibold">2x</button>
                        <button className="px-1.5 bg-[#FF450029] rounded text-[#FF9169] font-semibold">MAX</button>
                  </div>
              </div>

              {/* Slider */}
              <div className="flex mt-4 gap-[16px] items-center justify-between">
              
                  <div className="relative w-[259px] h-[1px] bg-[#31313F]">
                      <div className="absolute left-1/3 -top-[4px] w-2 h-2 bg-[#FF4500] rounded-full"></div>
                  </div>
        

              {/* Quick Buttons */}
              <div className=" flex gap-1.5">
                  {["0.00009", "0.00001", "0.002", "0.01"].map((val) => (
                      <button
                          key={val}
                          className="px-[9px] py-[3px] text-xs bg-[#FFFFFF0F] rounded text-white/70"
                      >
                          {val}
                      </button>
                  ))}
              </div>

              </div>

              {/* Number of Bets */}
<div className="mt-6 text-sm text-white/60">Number of Bets</div>
<div className="w-[469px] h-[37px] mt-2 flex items-center justify-between border border-white/10 rounded px-4 py-3">
  <span className="text-white/40">0</span>
  <span className="text-white/40 text-xl">∞</span>
</div>

{/* Advanced Toggle */}
<div className="mt-5 flex items-center gap-2 text-sm">
  <div className="w-8 h-4 bg-white/10 rounded-full relative">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-orange-500 rounded-full"></div>
  </div>
  <span className="border-b  border-dashed border-white/30">
    Advanced
  </span>
</div>

{/* Advanced Box */}
<div className="mt-6 p-4 bg-[#00000033] rounded  space-y-6">

  {/* On Win */}
  <div>
    <div className="text-white/60 text-sm mb-2">On Win</div>
    <div className="flex gap-3">
        <div className="flex items-center bg-[#FFFFFF0F] p-[3px] rounded w-[156px] h-[37px] ">
      <button className=" px-3 bg-white/10 rounded text-white w-[55px] h-[31px] text-nowrap">
        Reset
      </button>
      <button className="  px-3 rounded text-white/50 w-[95px] h-[31px] text-nowrap">
        Increase by:
      </button>
      </div>

      <div className="flex-1 w-[265px] h-[37px] flex items-center justify-between  border border-white/10 rounded px-3">
        <span className="text-white/40">0</span>
        <span className="text-white/40">%</span>
      </div>
    </div>
  </div>

  {/* On Loss */}
  <div>
    <div className="text-white/60 text-sm mb-2">On Loss</div>
    <div className="flex gap-3">
        <div className="flex items-center bg-[#FFFFFF0F] p-[3px] rounded w-[156px] h-[37px] ">
      <button className=" px-3 bg-white/10 rounded text-white w-[55px] h-[31px] text-nowrap">
        Reset
      </button>
      <button className="  px-3 rounded text-white/50 w-[95px] h-[31px] text-nowrap">
        Increase by:
      </button>
      </div>

      <div className="flex-1 w-[265px] h-[37px] flex items-center justify-between  border border-white/10 rounded px-3">
        <span className="text-white/40">0</span>
        <span className="text-white/40">%</span>
      </div>
    </div>
  </div>

</div>

              {/* Buttons Section */}
              <div className="mt-6 flex gap-1.5">
                  <button className="w-[350px] h-[37px] flex-1 py-2.5 px-3 bg-[#FF4500] hover:bg-orange-500 transition rounded text-sm font-semibold">
                      Start Auto Bet
                  </button>

                  <button className="w-[103px] h-[37px] py-3 bg-[#82828229] rounded text-white/50 flex items-center justify-center gap-1.5">
                  <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3.57754 0.000330314L3.5573 0.00019611C3.48391 -0.000487267 3.33167 -0.00190462 3.18728 0.0450466C3.06567 0.08459 2.95491 0.149125 2.86301 0.233981C2.75389 0.334735 2.68715 0.46373 2.65498 0.525925L2.64605 0.54305L0.207851 5.14016C0.159641 5.231 0.107438 5.32935 0.0715066 5.41608C0.033835 5.507 -0.0207867 5.66249 0.00813393 5.84702C0.0430251 6.06965 0.17365 6.2689 0.36927 6.39788C0.531415 6.5048 0.703363 6.52827 0.806475 6.53717C0.904822 6.54566 1.02149 6.54563 1.12923 6.5456L3.9603 6.5456L2.44802 11.2978C2.37129 11.5389 2.47956 11.7982 2.71003 11.9253C2.94051 12.0525 3.23333 12.0144 3.41868 11.8332L10.4881 4.92175C10.5942 4.81811 10.6991 4.7156 10.7759 4.6257C10.8454 4.54447 10.982 4.37586 10.9981 4.14493C11.0162 3.88569 10.9027 3.63375 10.6922 3.4661C10.5046 3.31676 10.2811 3.29242 10.1708 3.28316C10.0488 3.27292 9.89776 3.27294 9.74502 3.27296L6.44067 3.27296L7.44932 0.737285C7.51595 0.569783 7.49121 0.382127 7.38312 0.23509C7.27504 0.0880535 7.09734 0.000330314 6.90758 0.000330314H3.57754Z" fill="#828282"/>
</svg>
 Zap Mode
                  </button>
              </div>

             

          </div>
           {/* Bottom Profit Bar */}
              <div className="mt-[20px] w-[501px] px-4 py-3 bg-gradient-to-r from-[#25A6550F] to-[#25A6550F] flex justify-between items-center">
                  <div className="flex text-sm items-center gap-3 text-green-400">
                      <Bitcoin />
                      <span>0.0000000</span>
                  </div>

                  <span className="text-white/40 text-sm">Profit on Win</span>
              </div>

          </div>
        
        )}

         
          
          </>
  );
};

export default BetPad;
