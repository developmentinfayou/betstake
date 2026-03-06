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
    <section className="w-full flex justify-between gap-[32px] lg:grid lg:grid-cols-[592px_335px_385px]">
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
          {/* Game cards row - left side */}
          <div className="absolute top-3 pl-[13.44px] inline-flex h-[62px] items-center gap-3">
            {[
              "/images/dice.png",
              "/images/plinko.png",
              "/images/mines.png",
              "/images/limbo.png",
            ].map((img, i) => (
              <div
                key={i}
                className="relative w-[48.22px] h-[62px] rounded overflow-hidden"
              >
                <img
                  src={img}
                  alt=""
                  className="h-full w-full object-cover opacity-[12%] hover:opacity-100 transition-opacity duration-200"
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

    ${index === 0
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
        <div
          className={`relative w-[335px]  rounded border border-[#2A2A3C] p-3  ${boosts
            ? "border-b-0 rounded-b-none bg-[#FF7873]/[6%]  backdrop-blur-[64px] backdrop-saturate-150 shadow-lg z-50 "
            : ""
            }`}
        >
          {/* Top Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <img src="/images/percent.svg" alt="percent" />

                <span className="relative text-sm font-semibold text-white tracking-widest">
                  14.18%
                  <span className="pointer-events-none absolute left-0 bottom-[1px] w-full h-px bg-[repeating-linear-gradient(to_right,#818181_0_2px,transparent_2px_4px)]" />
                </span>
              </div>

              <span className="flex w-[50px] h-[17px] items-center gap-1 px-[3px] rounded-[3px] bg-[#1F8F55] w-[50px] h-[17px] text-sm tracking-widest text-white">
                <span className="text-[6px]">▲</span> 23.1%
              </span>
            </div>
            <div
              onClick={() => {
                showBoosts(!boosts);
              }}
            >
              {!boosts ? (
                <div className="flex items-center gap-1 text-xs text-[#828282] cursor-pointer">
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
                <span className="text-[#A1A1B3] flex items-center gap-[6px] text-xs cursor-pointer">
                  Close{" "}
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

            <button className="rounded bg-[#FF4500] opacity-[84%] hover:opacity-[100%] text-sm font-medium text-white  w-[56px] h-[29px] tracking-wide  ">
              Claim
            </button>
          </div>




          {boosts && (
            // <div className="absolute w-[335px]  bg-[#FF7873]/[0.06] z-50 backdrop:blur-3xl grid top-[219px] p-3 rounded border border-t-0 rounded-t-none  border-[#2A2A3C]">
            <div
              className="absolute w-[335px] z-50 top-[85px] left-[-1px] px-3 pb-[12px]
  rounded rounded-t-none border border-t-0 border-white/10
 bg-[#FF7873]/[6%]
 "
            >
              <div className="inline-flex mt-[2px] w-[311px] items-center gap-3 px-3 py-2 bg-white/[0.06] rounded rounded-b-none">
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
                  <svg
                    width="15"
                    height="11"
                    viewBox="0 0 15 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.0424 3.34383L12.4086 9.63319C12.3611 9.81533 12.2545 9.97659 12.1057 10.0918C11.9568 10.207 11.774 10.2697 11.5858 10.27H2.48444C2.2962 10.2697 2.11338 10.207 1.96451 10.0918C1.81565 9.97659 1.70913 9.81533 1.6616 9.63319L0.0278403 3.34383C-0.0118874 3.19245 -0.0090482 3.03303 0.0360448 2.88315C0.0811378 2.73328 0.166734 2.59876 0.2834 2.49443C0.400065 2.39009 0.543271 2.32 0.697234 2.29186C0.851197 2.26372 1.00994 2.27864 1.15597 2.33496L3.86299 3.37722C3.89037 3.38787 3.92044 3.38944 3.94878 3.38172C3.97711 3.37399 4.00222 3.35736 4.0204 3.33429L6.3649 0.329139C6.44403 0.22671 6.54559 0.143782 6.66177 0.0867251C6.77795 0.0296681 6.90566 0 7.0351 0C7.16453 0 7.29225 0.0296681 7.40843 0.0867251C7.52461 0.143782 7.62616 0.22671 7.7053 0.329139L10.0498 3.33429C10.068 3.35736 10.0931 3.37399 10.1214 3.38172C10.1498 3.38944 10.1798 3.38787 10.2072 3.37722L12.9142 2.33496C13.0602 2.28111 13.2181 2.26803 13.3709 2.29712C13.5237 2.32621 13.6658 2.39638 13.7817 2.50009C13.8977 2.6038 13.9832 2.73714 14.0292 2.88579C14.0751 3.03444 14.0796 3.19279 14.0424 3.34383Z"
                      fill="url(#paint0_linear_1_16498)"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_1_16498"
                        x1="0.000175528"
                        y1="5.13495"
                        x2="14.0671"
                        y2="5.13495"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stop-color="#6FE970" />
                        <stop offset="1" stop-color="#13AEF0" />
                      </linearGradient>
                    </defs>
                  </svg>

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
            </div>
          )}
        </div>
        {!boosts && (
          <p className="text-xs tracking-[0.96px] text-[#5B5B79]">Rakeback</p>
        )}{" "}
      </div>

      {/* House Edge card */}
      <div className="flex flex-col gap-1.5">
        <div className="relative h-[86px] w-[385px]">
          <div className="flex flex-col w-full items-start h-[86px] gap-1.5 p-[12px] rounded overflow-hfidden border border-[#31313F]">
            {/* Header with badges and stats */}
            <div className="flex items-center justify-between w-full">
              {/* Premium/VIP badge tabs */}
              <div
                className="inline-flex items-center w-[182px] h-[41px]  gap-3 p-1.5 rounded overflow-hidcden"
                style={{
                  background:
                    activeEdge === "premium" ? "linear-gradient(148deg, rgba(255, 229, 0, 0.06) 0%, rgba(255, 106, 0, 0.06) 100%)"
                      : "linear-gradient(90deg, rgba(111, 233, 112, 0.06) 0%, rgba(19, 174, 240, 0.06) 100%)"

                }}
              >

                {/* Premium badge - active */}
                <button
                  onClick={() => setActiveEdge("premium")}
                  className={`inline-flex group items-center gap-[7px] px-3 py-1.5 rounded transition-all duration-300 ${activeEdge === "premium"
                    ? "bg-white/[0.06] text-white scale-100"
                    : "bg-transparent text-[#818181] "
                    }`}
                >
                  <div>
                    {activeEdge === "premium" ? <Premium /> : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="7" cy="7" r="7" fill="#828282" />
                      <path d="M6.60935 2.3372C6.73488 2.07047 6.79764 1.9371 6.88284 1.89449C6.95697 1.85742 7.04309 1.85742 7.11723 1.89449C7.20243 1.9371 7.26519 2.07047 7.39071 2.3372L8.58159 4.86775C8.61865 4.94649 8.63717 4.98587 8.66425 5.01643C8.68823 5.0435 8.71698 5.06543 8.74892 5.08101C8.78499 5.09861 8.82642 5.10496 8.90926 5.11766L11.5731 5.52605C11.8536 5.56906 11.9938 5.59056 12.0587 5.66242C12.1152 5.72495 12.1418 5.81086 12.131 5.89625C12.1187 5.99439 12.0171 6.09813 11.814 6.3056L9.88722 8.2741C9.82715 8.33546 9.79712 8.36614 9.77774 8.40265C9.76058 8.43497 9.74957 8.47048 9.74533 8.50721C9.74053 8.54869 9.74762 8.59203 9.76179 8.67871L10.2164 11.4591C10.2644 11.7524 10.2884 11.899 10.2433 11.986C10.2041 12.0617 10.1344 12.1148 10.0537 12.1305C9.96083 12.1486 9.8353 12.0793 9.58423 11.9408L7.20282 10.6272C7.12862 10.5863 7.09152 10.5659 7.05244 10.5578C7.01783 10.5507 6.98223 10.5507 6.94763 10.5578C6.90854 10.5659 6.87144 10.5863 6.79724 10.6272L4.41583 11.9408C4.16477 12.0793 4.03923 12.1486 3.94641 12.1305C3.86565 12.1148 3.79596 12.0617 3.75676 11.986C3.7117 11.899 3.73568 11.7524 3.78363 11.4591L4.23827 8.67871C4.25245 8.59203 4.25953 8.54869 4.25474 8.50721C4.25049 8.47048 4.23948 8.43497 4.22233 8.40265C4.20295 8.36614 4.17291 8.33546 4.11285 8.2741L2.18602 6.3056C1.98294 6.09813 1.8814 5.99439 1.86905 5.89625C1.85829 5.81086 1.88485 5.72495 1.94133 5.66242C2.00624 5.59056 2.14649 5.56906 2.427 5.52605L5.09081 5.11766C5.17365 5.10496 5.21507 5.09861 5.25114 5.08101C5.28308 5.06543 5.31184 5.0435 5.33581 5.01643C5.36289 4.98587 5.38142 4.94649 5.41848 4.86775L6.60935 2.3372Z" fill="#252525" />
                    </svg>
                    }
                    <div
                      className={`absolute top-[18px] w-[28px] h-[28px] bg-[#FFA701] 
  rounded-full blur-xl border-2 p-2 transition-opacity duration-300
  ${activeEdge === "premium"
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                        }`}
                    />
                  </div>
                  <span className={`text-sm tracking-[1.12px] ${activeEdge == "premium" ? "text-white" : "text-[#828282]"}`}>
                    Premium
                  </span>
                </button>

                {/* VIP badge - inactive */}
                <button
                  onClick={() => setActiveEdge("vip")}
                  className={`inline-flex group items-center w-[62.07px] h-[29px] gap-[7px] px-3 py-1.5 rounded transition-all duration-300 ${activeEdge === "vip"
                    ? "bg-white/[0.06] text-white scale-100"
                    : "bg-transparent text-[#818181]"
                    }`}
                >
                  {activeEdge == "vip" ? (
                    <svg
                      width="15"
                      height="11"
                      viewBox="0 0 15 11"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.0424 3.34383L12.4086 9.63319C12.3611 9.81533 12.2545 9.97659 12.1057 10.0918C11.9568 10.207 11.774 10.2697 11.5858 10.27H2.48444C2.2962 10.2697 2.11338 10.207 1.96451 10.0918C1.81565 9.97659 1.70913 9.81533 1.6616 9.63319L0.0278403 3.34383C-0.0118874 3.19245 -0.0090482 3.03303 0.0360448 2.88315C0.0811378 2.73328 0.166734 2.59876 0.2834 2.49443C0.400065 2.39009 0.543271 2.32 0.697234 2.29186C0.851197 2.26372 1.00994 2.27864 1.15597 2.33496L3.86299 3.37722C3.89037 3.38787 3.92044 3.38944 3.94878 3.38172C3.97711 3.37399 4.00222 3.35736 4.0204 3.33429L6.3649 0.329139C6.44403 0.22671 6.54559 0.143782 6.66177 0.0867251C6.77795 0.0296681 6.90566 0 7.0351 0C7.16453 0 7.29225 0.0296681 7.40843 0.0867251C7.52461 0.143782 7.62616 0.22671 7.7053 0.329139L10.0498 3.33429C10.068 3.35736 10.0931 3.37399 10.1214 3.38172C10.1498 3.38944 10.1798 3.38787 10.2072 3.37722L12.9142 2.33496C13.0602 2.28111 13.2181 2.26803 13.3709 2.29712C13.5237 2.32621 13.6658 2.39638 13.7817 2.50009C13.8977 2.6038 13.9832 2.73714 14.0292 2.88579C14.0751 3.03444 14.0796 3.19279 14.0424 3.34383Z"
                        fill="url(#paint0_linear_1_16515)"
                      />
                      <defs>
                        <linearGradient
                          id="paint0_linear_1_16515"
                          x1="0.000175528"
                          y1="5.13495"
                          x2="14.0671"
                          y2="5.13495"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stop-color="#6FE970" />
                          <stop offset="1" stop-color="#13AEF0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  ) : (
                    <Vip color={"#828282"} />
                  )}

                  <div
                    className={`absolute top-[18px] w-[28px] h-[28px] bg-[#FFA701] 
  rounded-full blur-xl border-2 p-2 transition-opacity duration-300
  ${activeEdge === "vip" ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                  />

                  <span className={`text-sm tracking-[1.12px] ${activeEdge == "vip" ? "text-white" : "text-[#828282]"}`}>
                    VIP
                  </span>
                </button>
              </div>

              {/* Stats */}
              <div className="inline-flex items-center gap-4">
                {/* Percentage icon + value */}
                <div className="inline-flex items-center gap-1.5">
                  {activeEdge == "premium" ? <img src="/images/circuit.svg" /> : <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.41815 0.0536417C8.14431 -0.0178806 7.85569 -0.0178806 7.58185 0.0536417C7.26396 0.13667 6.99633 0.339363 6.78273 0.501136L6.72302 0.546218L1.23509 4.66366C0.933789 4.88922 0.668341 5.08794 0.470537 5.34593C0.296946 5.57233 0.167631 5.82739 0.0889432 6.09857C-0.000720112 6.40757 -0.000357049 6.7317 5.51238e-05 7.09961L0.000110818 12.7886C9.65127e-05 13.1954 8.41141e-05 13.5463 0.0245668 13.8354C0.0504072 14.1405 0.107459 14.4439 0.261692 14.7359C0.491785 15.1715 0.858934 15.5257 1.31052 15.7477C1.61322 15.8964 1.92779 15.9515 2.24406 15.9764C2.54371 16 2.90751 16 3.32921 16H12.6708C13.0925 16 13.4563 16 13.7559 15.9764C14.0722 15.9515 14.3868 15.8964 14.6895 15.7477C15.1411 15.5257 15.5082 15.1715 15.7383 14.7359C15.8925 14.4439 15.9496 14.1405 15.9754 13.8354C15.9999 13.5463 15.9999 13.1954 15.9999 12.7886L15.9999 7.09961C16.0004 6.7317 16.0007 6.40758 15.9111 6.09857C15.8324 5.82739 15.7031 5.57233 15.5295 5.34593C15.3317 5.08794 15.0662 4.88922 14.7649 4.66366L9.27698 0.546218L9.21728 0.50114C9.00367 0.339365 8.73604 0.13667 8.41815 0.0536417ZM5.6756 9.63396C5.56547 9.22121 5.12933 8.97273 4.70145 9.07897C4.27358 9.1852 4.01599 9.60592 4.12612 10.0187C4.57011 11.6827 6.13509 12.9132 8 12.9132C9.86491 12.9132 11.4299 11.6827 11.8739 10.0187C11.984 9.60592 11.7264 9.1852 11.2985 9.07897C10.8707 8.97273 10.4345 9.22121 10.3244 9.63396C10.0579 10.6327 9.11719 11.3697 8 11.3697C6.88281 11.3697 5.94206 10.6327 5.6756 9.63396Z" fill="url(#paint0_linear_1_16519)" />
                    <defs>
                      <linearGradient id="paint0_linear_1_16519" x1="0.000199644" y1="7.99993" x2="15.9998" y2="7.99993" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#6FE970" />
                        <stop offset="1" stop-color="#13AEF0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  }

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
              <p className=" font-light text-[#818181] text-xs tracking-[0.96px] text-nowrap">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod.{" "}
              </p>
            ) : (
              <div className="flex w-full items-center justify-between gap-4">
                <div className="flex w-[174] h-[14px] items-center gap-[12px]">
                  {/* LEFT - LEVEL */}
                  <span className="text-white text-xs tracking-[2px] uppercase">
                    LVL 4
                  </span>



                  {/* CENTER - PROGRESS BAR */}
                  <div className="flex-1 w-[138px] h-[4px] bg-white/10 rounded overflow-hidden">
                    <div
                      className="h-full rounded-[5px] transition-all duration-500"
                      style={{
                        width: "65%", background: "linear-gradient(90deg, #6FE970 0%, #13AEF0 100%)"
                      }} // 👈 change dynamically
                    // style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* RIGHT - TEXT */}
                <span className="text-xs text-[#828282] whitespace-nowrap">
                  Wager{" "}
                  <span className="text-[#25A655] font-medium">$34.02</span>{" "}
                  more reach <span className="underline text-[#CACACA]">lvl 5</span>
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
