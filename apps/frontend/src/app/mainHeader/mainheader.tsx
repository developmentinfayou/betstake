import React, { useState } from "react";
import Logo from "@/icons/Logo";
import LogoToggle from "@/icons/LogoToggle";
import Spin from "@/icons/Spin";
import { useLocation } from "react-router-dom";
import PrimaryTab from "./headercomponents/primaryTab";
import GameTab from "./headercomponents/gameTab";

const MainHeader = () => {
  const [themes, showThemes] = React.useState<any>(false);
  const [hover, setHover] = React.useState<any>("");

  // Navigation items configuration

  // State for game category tabs
  const [activeGameTab, setActiveGameTab] = React.useState<string>("blackjack");

  const [dotPosition, setDotPosition] = React.useState(0);

  // Game category tabs configuration

  // Get underline position based on active game tab

  // Render game icon based on id and active state

  // Render icon based on id and active state
  const { pathname } = useLocation();
  return (
    <div className={`${pathname.includes("game") ? "bg-gray-900" : ""}`}>
      {/* ✅ HEADER */}
      <header className="mx-[32px] mt-[28px] flex h-[41px] min-w-[1376px] items-center   ">
        <div className="flex items-center gap-[38.5px]">
          <div className="flex items-center gap-[16px]">
            <div className=" relative lg:flex items-center gap-[64px]">
              {/* Logo */}
              <div className=" relative group  flex items-center gap-8 w-[163px] h-[32px] after:absolute after:top-0 after:left-full after:w-[30px] after:h-full after:content-['']">
                <div className="flex flex-col relative items-end">
                  <Logo color={"#73FFD7"} />
                  <span className=" text-[#73FFD7] text-[14px] tracking-[0.08em] -top-[9px] relative ">
                    ~Play
                  </span>
                </div>
                <button
                // onClick={() => {
                //   showThemes(!themes);
                // }}
                // onMouseEnter={() => showThemes(true)}
                // onMouseLeave={() => showThemes(false)}
                >
                  <LogoToggle />
                </button>

                <div className="hidden group-hover:block  absolute   backdrop-blur-xl rounded w-[321px] h-[178.5px] -top-[11.5px] left-full ml-[28px] bg-[#73FFD70F] px-[16px] pt-[16px] z-50 group/menu ">
                  <div className=" group/item relative flex w-[289px] h-[41.5] items-center justify-between opacity-[0.24] transition-opacity duration-200 hover:opacity-100 group-hover/menu:opacity-[0.24] hover:!opacity-100 ">
                    <div className="flex flex-col relative items-end">
                      <Logo color={"#FFC100"} />
                      <span className=" text-[#FFC100] text-[12px] tracking-[0.08em] -top-[9px] relative">
                        ~Wallet
                      </span>
                    </div>

                    <span className="transition-all duration-200 group-hover/item:underline">
                      Select
                    </span>
                  </div>

                  <div className="relative flex w-[289px] h-[41.5] items-center justify-between opacity-100 transition-opacity duration-200 group-hover/menu:opacity-[0.24] hover:!opacity-100 ">
                    <div className="flex flex-col relative items-end">
                      <Logo color={"#73FFD7"} />
                      <span className=" text-[#73FFD7] text-[12px] tracking-[0.08em] -top-[9px] relative">
                        ~Play
                      </span>
                    </div>

                    <span>Current</span>
                  </div>

                  <div className=" group/item relative flex w-[289px] h-[41.5] items-center justify-between opacity-[0.24] transition-opacity duration-200 hover:opacity-100 group-hover/menu:opacity-[0.24] hover:!opacity-100 ">
                    <div className="flex flex-col relative items-end">
                      <Logo color={"#73B7FF"} />
                      <span className=" text-[#73B7FF] text-[12px] tracking-[0.08em] -top-[9px] relative ">
                        ~Connect
                      </span>
                    </div>

                    <span className="transition-all duration-200 group-hover/item:underline">
                      Select
                    </span>
                  </div>
                </div>
              </div>

              <PrimaryTab />
            </div>

            <GameTab />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-[24px]">
            {/* Spin Button */}
            <button className="flex group relative items-center gap-1.5 rounded border border-[#31313F] h-[41px] px-3">
              <Spin />
              <div className="absolute w-[28px] h-[28px] left-[2px] bg-[#73FFD7] rounded-full blur-xl border-2 p-2 opacity-0 group-hover:opacity-100 "></div>

              <span className=" text-sm tracking-[1.12px] text-white">
                Spin
              </span>
            </button>

            {/* Winner Notification */}
            <div className="flex h-[41px] w-[181px] items-center gap-1.5 rounded border border-[#31313F] px-3 py-3 overflow-hidden">
              <img src="/images/winner.svg" />

              <p className=" flex text-sm  gap-[2px]">
                <span className="text-white">Winner </span>
                <span className="text-[#73FFD7]">CrispyPotato</span>
                <span className="text-white"> 🎉</span>
              </p>
            </div>

            {/* Bell Notification */}
            <button className="relative">
              <img src="/images/blub.svg" />
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default MainHeader;
