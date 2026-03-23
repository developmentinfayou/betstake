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
  const { pathname } = useLocation();

  return (
    <div className={`w-full ${pathname.includes("game")}`}>
      {/* ✅ HEADER - Expanded to full width with specific Figma padding */}
      <header className="header_3452 w-full h-[64px] flex items-center px-6 py-12">

        <div className="w-full flex items-center justify-between">

          {/* LEFT & CENTER CONTENT WRAPPER */}
          <div className="flex items-center flex-1 gap-10">

            {/* Logo Section */}
            <div className="relative group flex items-center gap-6 h-[32px]">
              <div className="flex items-center gap-1 cursor-pointer">
                <Logo color={"#73FFD7"} />
                <span className="text-[#73FFD7] text-[17px] font-bold tracking-[0.08em] relative top-[2px]">
                  ~Play
                </span>
              </div>

              <button className="hover:opacity-80 transition-opacity">
                <LogoToggle />
              </button>

              {/* Dropdown Menu - Glassmorphism matched to Figma */}
              <div className="hidden group-hover:block absolute top-full left-0 mt-2 backdrop-blur-2xl rounded-xl w-[320px] bg-[#0A0B14]/90 border border-white/10 p-4 z-50 shadow-2xl">
                {/* Wallet Item */}
                <div className="group/item flex items-center justify-between p-3 rounded-lg opacity-40 hover:opacity-100 hover:bg-white/5 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Logo color={"#FFC100"} />
                    <span className="text-[#FFC100] text-sm font-bold tracking-wider">~Wallet</span>
                  </div>
                  <span className="text-xs text-white/50 group-hover/item:underline">Select</span>
                </div>

                {/* Current Play Item */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#73FFD70A] border border-[#73FFD726] my-1">
                  <div className="flex items-center gap-3">
                    <Logo color={"#73FFD7"} />
                    <span className="text-[#73FFD7] text-sm font-bold tracking-wider">~Play</span>
                  </div>
                  <span className="text-xs text-[#73FFD7] font-medium">Current</span>
                </div>

                {/* Connect Item */}
                <div className="group/item flex items-center justify-between p-3 rounded-lg opacity-40 hover:opacity-100 hover:bg-white/5 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Logo color={"#73B7FF"} />
                    <span className="text-[#73B7FF] text-sm font-bold tracking-wider">~Connect</span>
                  </div>
                  <span className="text-xs text-white/50 group-hover/item:underline">Select</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs - Spacing expanded to fill gap */}
            <div className="flex items-center gap-8 flex-1">

              <PrimaryTab />
              {/* Vertical Divider matching Figma */}
              <div className="w-[1px] h-4 bg-white/10"></div>
              <GameTab />
            </div>
          </div>

          {/* RIGHT ACTIONS - Fixed alignment and exact Figma spacing */}
          <div className="flex items-center gap-[80px]">
            {/* Spin Button */}
            <button className="spin_5392 group relative flex items-center gap-2 bg-[#73FFD70F] border border-[#73FFD726] px-[32px] py-[12px] rounded-lg hover:bg-[#73FFD71A] transition-all">

              <span className="spin_text_7721 text-[#73FFD7] text-[17px] tracking-widest">Spin</span>
              <div className="spin_glow_1847 absolute inset-0 bg-[#73FFD7] opacity-0 group-hover:opacity-5 blur-md rounded-lg"></div>
            </button>

            {/* Winner Notification - Responsive width */}
            <div className="winner_5100 hidden lg:flex items-center gap-[20px] bg-[#ffffff05] border border-white/5 px-[6px] py-3 rounded-lg h-[46px]">
              <img src="/images/winner.svg" className="w-[18px] h-[18px]" alt="winner" />
              <p className="text-[17px] font-medium whitespace-nowrap">
                <span className="text-gray-400">Winner </span>
                <span className="text-[#73FFD7]">CrispyPotato</span>
                <span className="ml-2 text-white">🎉</span>
              </p>
            </div>

            {/* Utility Buttons */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-white/5 rounded-full transition-colors">
                <img src="/images/blub.svg" className="w-6 h-6 opacity-70 hover:opacity-100" alt="notification" />
                {/* Active Indicator */}
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#73FFD7] rounded-full shadow-[0_0_8px_#73FFD7]"></span>
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default MainHeader;