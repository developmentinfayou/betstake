import React, { useState } from "react";
import Logo from "@/icons/Logo";
import LogoToggle from "@/icons/LogoToggle";
import Spin from "@/icons/Spin";
import { useLocation } from "react-router-dom";
import PrimaryTab from "./headercomponents/primaryTab";
import GameTab from "./headercomponents/gameTab";
import "./mainHeader.css";

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
      <header className="header_3452 ">
        <div className="div_7812">
          <div className="div_4926">
            <div className="div_9034">
              {/* Logo */}
              <div className="relative group  flex items-center gap-8 w-[163px] h-[32px] after:absolute after:top-0 after:left-full after:w-[30px] after:h-full after:content-['']">
                <div className="custom_4581">
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
                    <div className="div_6147">
                      <Logo color={"#FFC100"} />
                      <span className="span_8293 text-[#FFC100]">~Wallet</span>
                    </div>

                    <span className="transition-all duration-200 group-hover/item:underline">
                      Select
                    </span>
                  </div>

                  <div className="relative flex w-[289px] h-[41.5] items-center justify-between opacity-100 transition-opacity duration-200 group-hover/menu:opacity-[0.24] hover:!opacity-100 ">
                    <div className="div_6147">
                      <Logo color={"#73FFD7"} />
                      <span className=" text-[#73FFD7] span_8293">~Play</span>
                    </div>

                    <span>Current</span>
                  </div>

                  <div className=" group/item relative flex w-[289px] h-[41.5] items-center justify-between opacity-[0.24] transition-opacity duration-200 hover:opacity-100 group-hover/menu:opacity-[0.24] hover:!opacity-100 ">
                    <div className="div_6147">
                      <Logo color={"#73B7FF"} />
                      <span className=" text-[#73B7FF] span_8293 ">
                        ~Connect
                      </span>
                    </div>

                    <span className="transition-all duration-200 group-hover/item:underline">
                      Select
                    </span>
                  </div>
                </div>
              </div>

              <div className="group">
                <PrimaryTab />
              </div>
            </div>

            <GameTab />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-[24px]">
            {/* Spin Button */}
            <button className="spin_5392">
              <Spin />

              <div className="spin_glow_1847"></div>

              <span className="spin_text_7721">Spin</span>
            </button>

            {/* Winner Notification */}
            <div className="winner_4821">
              <img src="/images/winner.svg" className="winner_icon_7391" />

              <div className="winner_glow_1843"></div>

              <p className="winner_text_5927">
                <span className="winner_white">Winner </span>
                <span className="winner_green">CrispyPotato</span>
                <span className="winner_white"> 🎉 </span>
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
