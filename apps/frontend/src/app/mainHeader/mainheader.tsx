"use client"
import React, { useState } from 'react'
import Baccart from '@/icons/Baccart';
import BlackJack from '@/icons/BlackJack';
import Casino from '@/icons/Casino';
import DashBoard from '@/icons/DashBoard';
import Logo from '@/icons/Logo';
import LogoToggle from '@/icons/LogoToggle';
import MultiPlayer from '@/icons/MultiPlayer';
import Poker from '@/icons/Poker';
import Roulette from '@/icons/Roulette';
import Slots from '@/icons/Slots';
import Spin from '@/icons/Spin';
import { usePathname } from 'next/navigation';


const MainHeader = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const [themes, showThemes] = React.useState<any>(false);

  

  // console.log(activeEdge, "active edger");

  


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

  // Game category tabs configuration
  const gameTabs = [
    { id: "blackjack", name: "Blackjack" },
    { id: "slots", name: "Slots" },
    { id: "poker", name: "Poker" },
    { id: "baccarat", name: "Baccarat" },
    { id: "roulette", name: "Roulette" },
    { id: "racks", name: "Racks" },
    { id: "goals", name: "Goals" },
  ];

  const totalItems = gameTabs.length;
  const maxSteps = totalItems - 1;

  const handleDotMove = (direction: "left" | "right") => {
    if (!navRef.current || !trackRef.current) return;

    const trackWidth = trackRef.current.offsetWidth;
    const stepWidth = trackWidth / maxSteps;

    setDotPosition((prev) => {
      let newStep =
        direction === "right"
          ? Math.min(prev + 1, maxSteps)
          : Math.max(prev - 1, 0);

      const newX = newStep * stepWidth;

      // Scroll nav proportionally
      const nav: any = navRef.current;
      const maxScroll = nav.scrollWidth - nav.clientWidth;
      const scrollAmount = (newStep / maxSteps) * maxScroll;

      nav.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      });

      return newStep;
    });
  };

  // Get underline position based on active game tab
  const getUnderlinePosition = () => {
    switch (activeGameTab) {
      case "blackjack":
        return 10;
      case "slots":
        return 101;
      case "poker":
        return 182;
      case "baccarat":
        return 275;
      case "roulette":
        return 373;
        case "racks":
        return 462;
        case "goals":
          return 540;
        
      default:
        return 0;
    }
  };

  // Render game icon based on id and active state
  const renderGameIcon = (id: string, isActive: boolean) => {
    const activeColor = "#73FFD7";
    const inactiveColor = "#828282";
    const color = isActive ? activeColor : inactiveColor;

    switch (id) {
      case "blackjack":
        return <BlackJack color={color} />;
      case "slots":
        return <Slots color={color} />;
      case "poker":
        return <Poker color={color} />;
      case "baccarat":
        return <Baccart color={color} />;
      case "roulette":
        return <Roulette color={color} />;
      case "racks":
        return <Roulette color={color} />;
      case "goals":
        return <Roulette color={color} />;

      default:
        return null;
    }
  };

  // Render icon based on id and active state
  const renderNavIcon = (id: string, isActive: boolean, icon: any) => {
    const activeColor = "#73FFD7";
    const inactiveColor = "#818181";
    const color = isActive ? activeColor : inactiveColor;

    switch (id) {
      case "dashboard":
        return (
          <div
            className="relative flex items-center justify-center"
            style={
              isActive ? { filter: `drop-shadow(0 0 6px ${activeColor})` } : {}
            }
          >
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

            <DashBoard color={color} />
          </div>
        );
      case "casino":
        return (
          <div
            className="relative flex items-center justify-center"
            style={
              isActive ? { filter: `drop-shadow(0 0 6px ${activeColor})` } : {}
            }
          >
            <Casino color={color} />
          </div>
        );
      case "multiplayer":
        return (
          <div
            className="relative flex items-center justify-center"
            style={
              isActive ? { filter: `drop-shadow(0 0 6px ${activeColor})` } : {}
            }
          >
            <MultiPlayer color={color} />
          </div>
        );
      default:
        return null;
    }
  }
  const pathname = usePathname();
  return (
    <div className={`${pathname.includes("game") ? "bg-gray-900" : ""}`}>
        {/* ✅ HEADER */}
        <header className="border-bk bordejjr-[#31313F]">
        <nav className="mx-auto flex h-[81px] max-w-[1440px] items-center justify-between px-8">
          {/* Logo */}
          <div className=" relative flex items-center gap-8 w-[163px]">
            <div className="flex relative items-baseline gap-1">
              <Logo color={"#73FFD7"} />
              <span className=" text-[#73FFD7] text-[14px] tracking-[0.08em] absolute left-[80px] top-[22px]">
                ~Play
              </span>
            </div>
            <button
              onClick={() => {
                showThemes(!themes);
              }}
            >
              <LogoToggle />
            </button>

            {themes && (
              <div className="absolute grid gap-4 backdrop-blur-xl rounded w-[381px] h-[188px] top-0 left-[160px] bg-[#73FFD70F] p-[16px] z-50">
                <div className="relative flex items-center justify-between ">
                  <div className="flex relative items-baseline gap-1">
                    <Logo color={"#FFC100"} />
                    <span className=" text-[#FFC100] text-[14px] tracking-[0.08em] absolute left-[80px] top-[22px]">
                      ~Wallet
                    </span>
                  </div>

                  <span>Select</span>
                </div>

                <div className="relative flex items-center justify-between ">
                  <div className="flex relative items-baseline gap-1">
                  <Logo color={"#73FFD7"} />
                    <span className=" text-[#73FFD7] text-[14px] tracking-[0.08em] absolute left-[80px] top-[22px]">
                      ~Play
                    </span>
                  </div>

                  <span>Current</span>
                </div>

                <div className="relative flex items-center justify-between ">
                  <div className="flex relative items-baseline gap-1">
                  <Logo color={"#73B7FF"} />
                    <span className=" text-[#73B7FF] text-[14px] tracking-[0.08em] absolute left-[80px] top-[22px]">
                      ~Connect
                    </span>
                  </div>

                  <span>Select</span>
                </div>
              </div>
            )}
          </div>

          {/* Center Navigation */}
          <div className="hidden relative items-center gap-4 lg:flex">
            {/* Primary Nav Tabs */}
            <nav
              className="inline-flex items-start p-[6px] gap-[12px] bg-[#73ffd70f] h-[41px] w-[326px] rounded overflow-hidden"
              role="navigation"
              aria-label="Main navigation"
            >
              {navItems?.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`inline-flex items-center w-[102px] h-[29px] gap-1.5 px-3 py-1.5 rounded transition-all duration-200 ${
                      isActive
                        ? "bg-[#ffffff0f]"
                        : "bg-transparent hover:bg-[#ffffff08]"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                    type="button"
                  >
                    {renderNavIcon(item.id, isActive, item.icon)}
                    <span
                      className={` text-sm tracking-[1.12px] ${
                        isActive ? "text-white" : "text-[#818181]"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Game Category Tabs */}

            <nav
              ref={navRef}
              className="relative  h-[41px] w-[462px] rounded overflow-x-auto scrollbar-hidden border border-[#31313F]"
              role="navigation"
              aria-label="Casino games navigation"
            >
              <div className="flex items-center h-full gap-1.5 px-3">
                {gameTabs?.map((tab, index) => {
                  const isActive = activeGameTab === tab.id;
                  return (
                    <div key={tab.id} className="flex items-center">
                      <button
                        onClick={() => setActiveGameTab(tab.id)}
                        className="flex items-center gap-1.5 px-2 cursor-pointer transition-colors duration-200 hover:opacity-80"
                        aria-label={`Navigate to ${tab.name}`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {renderGameIcon(tab.id, isActive)}
                        <span
                          className={` text-sm tracking-[1.12px] ${
                            isActive ? "text-white" : "text-[#818181]"
                          }`}
                        >
                          {tab.name}
                        </span>
                      </button>
                      {/* Separator - don't show after last item */}
                      {index < gameTabs.length - 1 && (
                        <div className="w-px h-4 bg-[#31313F] mx-1" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Animated glowing underline indicator */}
              <div
                className="absolute bottom-0 left-3 w-[73px] h-px bg-[#73FFD7] transition-all duration-300"
                style={{
                  transform: `translateX(${getUnderlinePosition()}px)`,
                  boxShadow: "0px 0px 16px 2px rgba(115, 255, 215, 0.64)",
                }}
                aria-hidden="true"
              />
            </nav>
            <div
              className="absolute right-[134px] top-[53.5px] z-50 w-[221px]"
              ref={trackRef}
            >
              {/* Line */}
              <div className="absolute top-1/2 -translate-y-1/2 w-full h-px bg-[#31313F]" />

              {/* Dot */}
              <div
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-300"
                style={{
                  left: `${(dotPosition / maxSteps) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <button
                  onClick={() => handleDotMove("left")}
                  className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-3"
                />
                <button
                  onClick={() => handleDotMove("right")}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 w-3 h-3"
                />

                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
                </span>
              </div>
            </div>

            {/* <div className="absolute right-[134px] top-[53.5px] z-50">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute image-dot inline-flex h-full w-full  rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              </span>
            </div>

            <hr className="w-[221px] absolute right-0 top-[56px] border-[#31313F]" /> */}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            {/* Spin Button */}
            <button className="flex items-center gap-1.5 rounded border border-[#31313F] h-[41px] px-3">
              <Spin />

              <span className=" text-sm tracking-[1.12px] text-white">
                Spin
              </span>
            </button>

            {/* Winner Notification */}
            <div className="flex h-[41px] items-center gap-1.5 rounded border border-[#31313F] px-3 overflow-hidden">
              <img src="/images/winner.svg" />

              <p className=" text-sm tracking-[1.12px]">
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
        </nav>
      </header>
    </div>
  )
}

export default MainHeader