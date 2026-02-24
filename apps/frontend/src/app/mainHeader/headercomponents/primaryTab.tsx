"use client";

import Casino from "@/icons/Casino";

import DashBoard from "@/icons/DashBoard";
import MultiPlayer from "@/icons/MultiPlayer";
import { usePathname } from "next/navigation";
import React from "react";

const PrimaryTab = () => {
  const [activeTab, setActiveTab] = React.useState<string>("dashboard");

  const [themes, showThemes] = React.useState<any>(false);
  const [hover, setHover] = React.useState<any>("");

  console.log(hover, "active hover");

  // Navigation items configuration
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "/images/dashicon.svg" },
    { id: "casino", label: "Casino" },
    { id: "multiplayer", label: "Multiplayer" },
  ];

  // State for game category tabs
  const [activeGameTab, setActiveGameTab] = React.useState<string>("blackjack");
  const navRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);

  const [dotPosition, setDotPosition] = React.useState(0);

  // Render game icon based on id and active state

  // Render icon based on id and active state
  const renderNavIcon = (id: string, isActive: boolean, icon: any) => {
    const activeColor = "#73FFD7";
    const inactiveColor = "#818181";
    const color = isActive ? activeColor : inactiveColor;

    const finalColor = isActive
      ? "#73FFD7"
      : hover === id
        ? "#45A58A"
        : "#818181";

    switch (id) {
      case "dashboard":
        return (
          <>
            <div className="relative flex items-center justify-center">
              {/* Glow effect */}

              {/* <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="6" cy="6" r="6" fill={color} />
      <path
        d="M3.5 6L5.5 8L8.5 4"
        stroke={isActive ? "#0a0a0a" : "#ffffff"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg> */}

              <DashBoard color={finalColor} />
            </div>
            {isActive && (
              <div className="absolute w-[28px] h-[28px] bg-[#73FFD7] rounded-full blur-xl border-2 p-2 opacity-100 "></div>
            )}
          </>
        );
      case "casino":
        return (
          <>
            <div
              className="relative flex items-center justify-center"
              style={
                isActive
                  ? { filter: `drop-shadow(0 0 6px ${activeColor})` }
                  : {}
              }
            >
              <Casino color={finalColor} />
            </div>{" "}
            {isActive && (
              <div className="absolute w-[28px] h-[28px] bg-[#73FFD7] rounded-full blur-xl border-4 p-2 opacity-100 "></div>
            )}
          </>
        );
      case "multiplayer":
        return (
          <>
            {" "}
            <div
              className="relative flex items-center justify-center"
              style={
                isActive
                  ? { filter: `drop-shadow(0 0 6px ${activeColor})` }
                  : {}
              }
            >
              <MultiPlayer color={finalColor} />
            </div>
            {isActive && (
              <div className="absolute w-[28px] h-[28px] bg-[#73FFD7] rounded-full blur-xl border-2 p-2 opacity-100 "></div>
            )}
          </>
        );
      default:
        return null;
    }
  };
  const pathname = usePathname();
  return (
    <nav
      className="inline-flex  items-start p-[6px] gap-[12px] bg-[#73ffd70f] h-[41px] w-[326px] rounded overflow-hidden"
      role="navigation"
      aria-label="Main navigation"
    >
      <div
        className="absolute top-[6px] left-[234px] h-[29px] w-[102px] 
bg-[#ffffff0f] rounded transition-all duration-500 ease-in-out"
        style={{
          transform: `translateX(${
            activeTab == "dashboard" ? 0 : activeTab == "casino" ? 104 : 210
          }px)`,
        }}
      />

      {navItems?.map((item, i) => {
        const isActive = activeTab === item.id;
        return (
          <button
            onMouseEnter={() => !isActive && setHover(item.id)}
            onMouseLeave={() => setHover("")}
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={` inline-flex group items-center w-[102px] h-[29px] gap-1.5 px-3 py-1.5 rounded`}
            aria-current={isActive ? "page" : undefined}
            type="button"
          >
            {hover === item.id && !isActive && (
              <div className="absolute w-10 h-10 bg-[#73FFD7] rounded-full blur-xl opacity-50" />
            )}

            {renderNavIcon(item.id, isActive, item.icon)}
            <span
              className={` text-sm tracking-[1.12px] ${
                isActive ? "text-white" : "text-[#828282]"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default PrimaryTab;
