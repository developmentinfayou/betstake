import Premium from "@/icons/Premium";
import Sparkle from "@/icons/Sparkle";
import Vip from "@/icons/Vip";
import React, { useState } from "react";

const TopCards = () => {
  const [boosts, showBoosts] = useState<any>(false);

  const [activeEdge, setActiveEdge] = React.useState<"premium" | "vip">(
    "premium"
  );

  return (
    <section className="grid gap-[32px] lg:grid-cols-[592px_335px_385px] mx-[32px]">
      {/* Jackpot card */}
      <div className="flex flex-col gap-1.5">
        <div className="relative h-[86px] w-full rounded overflow-hidden border border-[#31313F]">
          {/* Glow effect */}
          <div
            className="absolute top-[47px] left-[490px] w-[3px] h-[3px] rounded"
            style={{ boxShadow: "0px 0px 48px 14px #DB5506" }}
            aria-hidden="true"
            
          />

          {/* Game cards row - left side */}
          <div className="absolute top-3 left-[-109px] inline-flex h-[62px] items-center gap-3">
            {[
              "/images/plinko.png",
              "/images/dice.png",
              "/images/plinko.png",
              "/images/mines.png",
              "/images/limbo.png",
              "/images/wheel.png",
            ].map((img, i) => (
              <div
                key={i}
                className={`relative group self-stretch w-[48.22px] h-[62px] aspect-[0.78] rounded overflow-hidden ${
                  i === 0 ? "mt-[-145px]" : ""
                }`}
              >
                <img
                  src={img}
                  alt=""
                  className={`h-full w-full object-cover `}
                />
                {/* {i < 5 && <div className="absolute inset-0 bg-black/70" />} */}
                <div
                  className="
          absolute inset-0
          bg-black/70
          opacity-0
          transition-opacity duration-200
          group-hover:opacity-100
          pointer-events-none
        "
                />
              </div>
            ))}
          </div>

          {/* Orange glow on right */}
          {/* <div
                className="absolute top-14 left-[484px] w-0.5 h-[3px] bg-[#d9d9d9] rounded"
                style={{ boxShadow: '0px 0px 48px 14px #db5506' }}
                aria-hidden="true"
              /> */}

          {/* Crypto tabs */}
          <nav className="absolute top-[18px] left-[267px] flex w-[307px] h-[14px] items-center gap-[16px] overflow-x-auto scrollbar-hidden">
            {[
              "Bitcoin",
              "Tron",
              "Dash",
              "Litecoin",
              "Dogecoin",
              "Tron",
              "Dogecoin",
            ].map((crypto, index) => (
              <button
                key={index}
                className={`
    relative w-fit mt-[-1px] 
    text-[12px] leading-[14px] tracking-[0.08em]
    transition-all duration-200

    ${
      index === 0
        ? "font-semibold text-[#FF9169]"
        : `
          font-light text-white opacity-[0.24]
          hover:opacity-100
          hover:text-[#828282]
          hover:font-normal
        `
    }
  `}
                
              >
                {crypto}
              </button>
            ))}
          </nav>

          {/* Jackpot amount */}
          <div
            className="absolute top-[38px] left-[266px] w-[146px] h-[33px] flex "
            style={{
              borderBottom: "1px solid",
              borderImage:
                "repeating-linear-gradient(to right, #818181 0 6px, transparent 6px 12px) 1",
            }}
          >
            <span className="w-36 h-[29px] text-nowrap  font-semibold text-white text-2xl leading-normal tracking-[2.5px]  ">
              0.0021780 BTC
            </span>
          </div>

          {/* Treasure illustration - stylized with gradient */}
          <img
            src="/images/gems.svg"
            className="absolute  top-[63.84px] left-[400px] -translate-y-1/2"
           
          />
        </div>

        {/* Jackpot label */}
        <p className=" text-xs tracking-[0.96px] leading-normal text-[#5b5b79]">
          Jackpot!
        </p>
      </div>

      {/* Rakeback card */}

      <div className="flex flex-col gap-1.5">
        <div className="relative w-full  rounded border border-[#2A2A3C] p-3">
          {/* Top Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/images/percent.svg" alt="percent" />

              <span className="relative text-sm font text-white tracking-widest">
                14.18%
                <span className="pointer-events-none absolute left-0 bottom-[1px] w-full h-px bg-[repeating-linear-gradient(to_right,#818181_0_2px,transparent_2px_4px)]" />
              </span>

              <span className="flex items-center gap-1 px-[3px] rounded-[3px] bg-[#1F8F55] w-[50px] h-[17px] text-sm tracking-widest text-white">
                <span className="text-[6px]">▲</span> 23.1%
              </span>
            </div>
            <div
              onClick={() => {
                showBoosts(!boosts);
              }}
            >
              {!boosts ? (
                <div className="flex items-center gap-1 text-xs text-[#A1A1B3] cursor-pointer">
                  <img src="/images/booster.svg" alt="boosts" />
                  <span>See Boosts</span>
                  <svg
                    width="5"
                    height="3"
                    viewBox="0 0 5 3"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.5 0.5L2.5 2.5L4.5 0.5"
                      stroke="#555555"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
              ) : (
                <span className="text-[#A1A1B3] text-xs cursor-pointer">
                  Close
                </span>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="mt-3 flex items-center gap-3 ">
            <div className="flex items-center justify-between gap-2 rounded bg-[#FFFFFF0F] px-3 py-1.5 w-[243px] h-[29px]">
              <div className="flex items-center gap-2">
                <img src="/images/inr.svg" alt="inr" />
                <span className="text-sm text-[#C1C1C1]">5412.81 INR</span>
              </div>

              <img
                src="/images/refresh.svg"
                alt="refresh"
                className=" cursor-pointer"
              />
            </div>

            <button className="rounded bg-[#FF4500] text-sm font-medium text-white hover:opacity-90 w-[56px] h-[29px] tracking-wide  ">
              Claim
            </button>
          </div>

          {boosts && (
            <>
              <div className="inline-flex mt-3 w-[311px] items-center gap-3 px-3 py-2 bg-white/[0.06] rounded rounded-b-none">
                {/* LEFT SIDE */}
                <div className="flex items-center gap-[7px] shrink-0">
                  <Premium />
                  <span className="text-sm tracking-[1.12px] text-white">
                    Premium
                  </span>
                </div>

                {/* CENTER LINE */}
                <div className="flex-1 h-[1px] bg-white/20" />

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-[6px] shrink-0">
                  {/* Sparkle SVG */}
                  <Sparkle color={"#FF6A00"} />

                  <span className="text-white text-sm tracking-[1.12px]">
                    16%
                  </span>
                </div>
              </div>
              <div className="inline-flex  w-[311px] items-center gap-3 px-3 py-2 bg-white/[0.06] rounded rounded-t-none">
                {/* LEFT SIDE */}
                <div className="flex items-center gap-[7px] shrink-0">
                  <Vip color={"#13AEF0"} />
                  <span className="text-sm tracking-[1.12px] text-white">
                    VIP
                  </span>
                </div>

                {/* CENTER LINE */}
                <div className="flex-1 h-[1px] bg-white/20" />

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-[6px] shrink-0">
                  {/* Sparkle SVG */}
                  <Sparkle color={"#13AEF0"} />

                  <span className="text-white text-sm tracking-[1.12px]">
                    16%
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <p className="text-xs tracking-[0.96px] text-[#5B5B79]">Rakeback</p>
      </div>

      {/* House Edge card */}
      <div className="flex flex-col gap-1.5">
        <div className="relative h-[86px]">
          <div className="flex flex-col w-full items-start h-[86px] gap-1.5 p-2 rounded overflow-hidden border border-[#31313F]">
            {/* Header with badges and stats */}
            <div className="flex items-center justify-between w-full">
              {/* Premium/VIP badge tabs */}
              <div
                className="inline-flex items-center  gap-3 p-1.5 rounded overflow-hidden"
                style={{
                  background:
                    "linear-gradient(148deg, rgba(255, 229, 0, 0.06) 0%, rgba(255, 106, 0, 0.06) 100%)",
                }}
              >
                {/* Premium badge - active */}
                <button
                  onClick={() => setActiveEdge("premium")}
                  className={`inline-flex items-center gap-[7px] px-3 py-1.5 rounded transition-all duration-300 ${
                    activeEdge === "premium"
                      ? "bg-white/[0.06] text-white scale-100"
                      : "bg-transparent text-[#818181] hover:bg-white/[0.04]"
                  }`}
                >
                  <div>
                    <Premium />
                  </div>
                  <span className=" text-sm tracking-[1.12px] text-white">
                    Premium
                  </span>
                </button>

                {/* VIP badge - inactive */}
                <button
                  onClick={() => setActiveEdge("vip")}
                  className={`inline-flex items-center gap-[7px] px-3 py-1.5 rounded transition-all duration-300 ${
                    activeEdge === "vip"
                      ? "bg-white/[0.06] text-white scale-100"
                      : "bg-transparent text-[#818181] hover:bg-white/[0.04]"
                  }`}
                >
                  <Vip color={"#828282"} />

                  <span className=" text-sm tracking-[1.12px] text-[#818181]">
                    VIP
                  </span>
                </button>
              </div>

              {/* Stats */}
              <div className="inline-flex items-center gap-4">
                {/* Percentage icon + value */}
                <div className="inline-flex items-center gap-1.5">
                  <img src="/images/circuit.svg" />

                  <div className="inline-flex items-center border-b border-dashed border-[#818181]">
                    <span className=" font-semibold text-white text-sm tracking-[1.12px]">
                      9.01%
                    </span>
                  </div>
                </div>

                {/* Growth badge */}
                <div className="inline-flex w-[50px] h-[17px] items-center gap-1 px-[3px] bg-[#24a654] rounded-[3px]">
                  <svg
                    width="6"
                    height="5"
                    viewBox="0 0 6 5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M3 5L0 0H6L3 5Z" fill="white" />
                  </svg>
                  <span className=" text-white text-sm tracking-[1.12px]">
                    18.6%
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {activeEdge == "premium" ? (
              <p className="barlow-condensed-light font-light text-[#818181] text-xs tracking-[0.96px]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit
              </p>
            ) : (
              <div className="flex w-full items-center justify-between gap-4">
                {/* LEFT - LEVEL */}
                <span className="text-white text-xs tracking-[2px] uppercase">
                  LVL 4
                </span>

                {/* CENTER - PROGRESS BAR */}
                <div className="flex-1 h-[4px] bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
                    style={{ width: "65%" }} // 👈 change dynamically
                    // style={{ width: `${progress}%` }}
                  />
                </div>

                {/* RIGHT - TEXT */}
                <span className="text-xs text-[#A1A1AA] whitespace-nowrap">
                  Wager{" "}
                  <span className="text-emerald-400 font-medium">$34.02</span>{" "}
                  more reach <span className="underline">lvl 5</span>
                </span>
              </div>
            )}
          </div>
          <span className=" text-xs tracking-[0.96px] text-[#5b5b79]">
            House Edge
          </span>
        </div>

        {/* House Edge label */}
      </div>
    </section>
  );
};

export default TopCards;
