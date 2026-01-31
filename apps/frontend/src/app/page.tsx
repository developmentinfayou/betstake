"use client";

import { useState } from "react";
import Link from "next/link";
import Challenge from "./homecomponents/challanges";
import HomeFooter from "./homecomponents/homefooter";
import ContestWinnerList from "./homecomponents/contestWinnerList";
import { Rakeback } from "./homecomponents/rackback";
import TrendingText from "./homecomponents/trendingtext";

const games = [
  {
    id: "dice",
    name: "Dice",
    players: "58.8K",
    status: "live",
    image: "/images/dice.svg",
  },
  {
    id: "mines",
    name: "Mines",
    players: "58.8K",
    status: "live",
    image: "/images/mines.png",
  },
  {
    id: "plinko",
    name: "Plinko",
    players: "58.8K",
    status: "live",
    image: "/images/plinko.png",
  },
  {
    id: "coinflip",
    name: "Coin Flip",
    players: "27.8K",
    status: "live",
    image: "/images/flip.png",
  },
  {
    id: "limbo",
    name: "Limbo",
    players: "58.8K",
    status: "live",
    image: "/images/limbo.png",
  },
  {
    id: "pump",
    name: "Pump",
    players: "58.8K",
    status: "live",
    image: "/images/pump.png",
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Navigation items configuration
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "/images/dashicon.svg" },
    { id: "casino", label: "Casino" },
    { id: "multiplayer", label: "Multiplayer" },
  ];

  // State for game category tabs
  const [activeGameTab, setActiveGameTab] = useState<string>("blackjack");

  // Game category tabs configuration
  const gameTabs = [
    { id: "blackjack", name: "Blackjack" },
    { id: "slots", name: "Slots" },
    { id: "poker", name: "Poker" },
    { id: "baccarat", name: "Baccarat" },
    { id: "roulette", name: "Roulette" },
  ];

  // Get underline position based on active game tab
  const getUnderlinePosition = () => {
    switch (activeGameTab) {
      case "blackjack":
        return 0;
      case "slots":
        return 105;
      case "poker":
        return 189;
      case "baccarat":
        return 271;
      case "roulette":
        return 372;
      default:
        return 0;
    }
  };

  // Render game icon based on id and active state
  const renderGameIcon = (id: string, isActive: boolean) => {
    const activeColor = "white";
    const inactiveColor = "#818181";
    const color = isActive ? activeColor : inactiveColor;

    switch (id) {
      case "blackjack":
        return (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Two playing cards overlapping - like in Figma */}
            <path d="M2 2L4 10L6 9L4 1L2 2Z" fill={color} />
            <path d="M10 2L8 10L6 9L8 1L10 2Z" fill={color} />
          </svg>
        );
      case "slots":
        return (
          <svg
            width="18"
            height="12"
            viewBox="0 0 18 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 777 slot machine style */}
            <text
              x="0"
              y="10"
              fontFamily="Arial"
              fontSize="11"
              fontWeight="bold"
              fill={color}
            >
              7
            </text>
            <text
              x="6"
              y="10"
              fontFamily="Arial"
              fontSize="11"
              fontWeight="bold"
              fill={color}
            >
              7
            </text>
            <text
              x="12"
              y="10"
              fontFamily="Arial"
              fontSize="9"
              fontWeight="bold"
              fill={color}
            >
              7
            </text>
          </svg>
        );
      case "poker":
        return (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Poker chip / star */}
            <circle cx="6" cy="6" r="5" stroke={color} strokeWidth="1" />
            <circle cx="6" cy="6" r="2.5" stroke={color} strokeWidth="1" />
            <path d="M6 1V3" stroke={color} strokeWidth="0.8" />
            <path d="M6 9V11" stroke={color} strokeWidth="0.8" />
            <path d="M1 6H3" stroke={color} strokeWidth="0.8" />
            <path d="M9 6H11" stroke={color} strokeWidth="0.8" />
          </svg>
        );
      case "baccarat":
        return (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Diamond/gem shape for baccarat */}
            <path
              d="M6 1L10 5L6 11L2 5L6 1Z"
              stroke={color}
              strokeWidth="1"
              strokeLinejoin="round"
            />
            <path d="M2 5H10" stroke={color} strokeWidth="0.8" />
            <path d="M6 1L4 5L6 11" stroke={color} strokeWidth="0.8" />
            <path d="M6 1L8 5L6 11" stroke={color} strokeWidth="0.8" />
          </svg>
        );
      case "roulette":
        return (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Roulette wheel */}
            <circle cx="6" cy="6" r="5" stroke={color} strokeWidth="1" />
            <circle cx="6" cy="6" r="2" stroke={color} strokeWidth="1" />
            <path d="M6 1V4" stroke={color} strokeWidth="0.8" />
            <path d="M6 8V11" stroke={color} strokeWidth="0.8" />
            <path d="M1 6H4" stroke={color} strokeWidth="0.8" />
            <path d="M8 6H11" stroke={color} strokeWidth="0.8" />
          </svg>
        );
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
            <svg
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
            </svg>
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
            <svg
              width="12"
              height="14"
              viewBox="0 0 12 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 1C6 1 11 4 11 7.5C11 10 9 12 6 12C3 12 1 10 1 7.5C1 4 6 1 6 1Z"
                fill={color}
              />
              <ellipse cx="6" cy="12.5" rx="2" ry="1" fill={color} />
            </svg>
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
            <svg
              width="15"
              height="12"
              viewBox="0 0 15 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Front person (larger) */}
              <circle cx="5" cy="3" r="2.5" fill={color} />
              <path d="M0 11C0 8 2.5 6 5 6C7.5 6 10 8 10 11" fill={color} />
              {/* Back person (smaller, offset) */}
              <circle cx="11" cy="4" r="2" fill={color} />
              <path d="M7 11.5C7 9 9 7 11 7C13 7 15 9 15 11.5" fill={color} />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 0%, rgba(8,8,25,1) 100%)",
      }}
    >
      {/* ✅ HEADER */}
      <header className="border-b border-[#31313F]">
        <nav className="mx-auto flex h-[81px] max-w-[1440px] items-center justify-between px-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex relative items-baseline gap-1">
              <img
                src="/images/logo.svg"
                className=" text-[19px] tracking-[0.08em]"
              />
              <span className=" text-[#73FFD7] text-[14px] tracking-[0.08em] absolute left-[80px] top-[22px]">
                ~Play
              </span>
            </div>
          </div>

          {/* Center Navigation */}
          <div className="hidden items-center gap-4 lg:flex">
            {/* Primary Nav Tabs */}
            <nav
              className="inline-flex items-start gap-3 p-1.5 bg-[#73ffd70f] rounded overflow-hidden"
              role="navigation"
              aria-label="Main navigation"
            >
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded transition-all duration-200 ${
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
              className="relative  h-[41px] rounded overflow-hidden border border-[#31313F]"
              role="navigation"
              aria-label="Casino games navigation"
            >
              <div className="flex items-center h-full px-3">
                {gameTabs.map((tab, index) => {
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
                        <div className="w-px h-4 bg-[#31313F] mx-2" />
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
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Spin Button */}
            <button className="flex items-center gap-1.5 rounded border border-[#31313F] h-[41px] px-3">
              <img src="/images/spin.svg" />

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

      {/* ✅ PAGE CONTAINER */}
      <main className="mx-auto max-w-[1440px] px-8 pb-20 pt-8">
        {/* ✅ TOP CARDS ROW */}
        <section className="grid gap-3 lg:grid-cols-[592px_335px_1fr]">
          {/* Jackpot card */}
          <div className="flex flex-col gap-1.5">
            <div className="relative h-[86px] w-full rounded overflow-hidden border border-[#31313F]">
              {/* Glow effect */}
              <div
                className="absolute top-[45px] left-[490px] w-px h-px rounded"
                style={{ boxShadow: "0px 0px 24px 6px #ff4500" }}
                aria-hidden="true"
              />

              {/* Game cards row - left side */}
              <div className="absolute top-3 left-[-107px] inline-flex h-[62px] items-center gap-3">
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
                    className={`relative self-stretch w-[48px] aspect-[0.78] rounded overflow-hidden ${
                      i === 0 ? "mt-[-145px]" : ""
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover"
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
              <nav className="absolute top-[18px] left-[267px] flex w-[307px] h-3.5 items-center gap-4 overflow-x-auto scrollbar-hidden">
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
                    className="
          relative w-fit mt-[-1px] whitespace-nowrap
          text-xs tracking-[0.96px] leading-normal
           font-light
          text-white opacity-[0.24]
          transition-all duration-200
          hover:opacity-100
          hover:text-[#ff9168]
          
        "
                  >
                    {crypto}
                  </button>
                ))}
              </nav>

              {/* Jackpot amount */}
              <div className="absolute top-[38px] left-[266px] w-[146px] h-[31px] flex border-b border-dashed border-[#818181]">
                <span className="w-36 h-[29px] text-nowrap  font-semibold text-white text-2xl leading-normal">
                  0.0021780 BTC
                </span>
              </div>

              {/* Treasure illustration - stylized with gradient */}
              <img
                src="/images/gems.svg"
                className="absolute  top-[63.84px] left-[400px] -translate-y-1/2"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(255, 215, 0, 0.3) 0%, rgba(255, 165, 0, 0.2) 30%, transparent 70%)",
                }}
              />
            </div>

            {/* Jackpot label */}
            <p className=" text-xs tracking-[0.96px] leading-normal text-[#5b5b79]">
              Jackpot!
            </p>
          </div>

          {/* Rakeback card */}

          <div className="flex flex-col gap-1.5">
            <div className="relative w-full h-[88px] rounded border border-[#2A2A3C] p-3">
              {/* Top Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/images/percent.svg" alt="percent" />

                  <span className="text-sm font-medium underline decoration-dashed text-white">
                    14.18%
                  </span>

                  <span className="flex items-center rounded bg-[#1F8F55] px-2 py-0.5 text-[11px] font-medium text-white">
                    ▲ 23.1%
                  </span>
                </div>

                <div className="flex items-center gap-1 text-sm text-[#A1A1B3] cursor-pointer">
                  <img src="/images/booster.svg" alt="boosts" />
                  <span>See Boosts</span>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 rounded bg-[#FFFFFF0F] px-3 py-1.5">
                  <img src="/images/inr.svg" alt="inr" />
                  <span className="text-sm text-[#C1C1C1]">5412.81 INR</span>
                  <img
                    src="/images/refresh.svg"
                    alt="refresh"
                    className=" cursor-pointer"
                  />
                </div>

                <button className="rounded-md bg-[#FF4500] px-5 py-1.5 text-sm font-medium text-white hover:opacity-90">
                  Claim
                </button>
              </div>
            </div>

            <p className="text-xs tracking-[0.96px] text-[#5B5B79]">Rakeback</p>
          </div>

          {/* House Edge card */}
          <div className="flex flex-col gap-1.5">
            <div className="relative h-[86px]">
              {/* Glow effect */}
              <div
                className="absolute top-[27px] left-[38px] w-[3px] h-[3px] bg-[#d9d9d9] rounded"
                style={{ boxShadow: "0px 0px 64px 12px #ffa701" }}
                aria-hidden="true"
              />

              <div className="flex flex-col w-full items-start h-[86px] gap-1.5 p-2 rounded overflow-hidden border border-[#31313F]">
                {/* Header with badges and stats */}
                <div className="flex items-center justify-between w-full">
                  {/* Premium/VIP badge tabs */}
                  <div
                    className="inline-flex items-center gap-3 p-1.5 rounded overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(148deg, rgba(255, 229, 0, 0.06) 0%, rgba(255, 106, 0, 0.06) 100%)",
                    }}
                  >
                    {/* Premium badge - active */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] rounded">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(148deg, rgba(255, 229, 0, 1) 0%, rgba(255, 106, 0, 1) 100%)",
                        }}
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5 0L6.12 3.38L9.51 3.82L7.03 6.12L7.64 9.47L5 7.94L2.36 9.47L2.97 6.12L0.49 3.82L3.88 3.38L5 0Z"
                            fill="#1a1a1a"
                          />
                        </svg>
                      </div>
                      <span className=" text-sm tracking-[1.12px] text-white">
                        Premium
                      </span>
                    </div>

                    {/* VIP badge - inactive */}
                    <div className="inline-flex items-center gap-1.5 px-[9px] py-1.5">
                      <svg
                        width="14"
                        height="10"
                        viewBox="0 0 14 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M7 0L9.5 3H4.5L7 0Z" fill="#818181" />
                        <path d="M1 3H13L12 9H2L1 3Z" fill="#818181" />
                      </svg>
                      <span className=" text-sm tracking-[1.12px] text-[#818181]">
                        VIP
                      </span>
                    </div>
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
                    <div className="inline-flex items-center gap-1 px-[3px] bg-[#24a654] rounded-[3px]">
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
                <p className="barlow-condensed-light font-light text-[#818181] text-xs tracking-[0.96px]">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit
                </p>
              </div>
              <span className=" text-xs tracking-[0.96px] text-[#5b5b79]">
                House Edge
              </span>
            </div>

            {/* House Edge label */}
          </div>
        </section>

        {/* ✅ RECENTLY PLAYED */}
        <section className="mt-10">
          <div className="text-xs tracking-[0.08em] text-[#5B5B79]">
            Recently Played
          </div>

          <div className="mt-3 flex gap-6 overflow-x-auto pb-2">
     
              {games?.map((g, i) => (
                <div
                  key={i}
                  className="group relative h-[187px] w-[147px] flex-shrink-0 rounded
               border border-transparent bg-white/5 p-1
               transition-all duration-300
               group-hover:border-[#ffffff]"
                >
                  {/* IMAGE WRAPPER */}
                  <div className="relative h-full w-full overflow-hidden rounded">
                    {/* IMAGE */}
                    <img
                      src={g.image}
                      className="h-full w-full object-cover transition-all duration-300 group-hover:blur-sm"
                      alt=""
                    />

                    {/* CONTINUE OVERLAY */}
                    <div
                      className="absolute inset-0 flex items-end justify-center
                pb-6 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <button className="flex items-center gap-1 rounded bg-[#FF4500] px-3 py-1.5 text-xs text-white">
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        Continue
                      </button>
                    </div>

                    {/* HEART ICON (HOLLOW) */}
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <svg
                        className="h-5 w-5 text-white/80"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}


            {/* Boom Balloon Card */}
            <div className="w-full rounded-xl bg-gradient-to-br from-[#1A1A2B] via-[#0F0F1C] to-[#05050A] p-6 shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">
                  Boom Balloon
                </h2>

                <div className="flex items-center gap-2 text-[#CFCFE6]">
                  <img
                    src="/images/users.svg"
                    alt="users"
                    
                  />
                  <span className="text-xs underline decoration-dashed underline-offset-4">
                    58.8K
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="mt-4  text-xs text-[#B5B5C9]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis n...
                <span className="ml-1 cursor-pointer text-[#FF4500] hover:underline">
                  see more
                </span>
              </p>

              {/* Footer Button */}
              <div className="mt-6">
                <button className="flex text-xs items-center gap-2 rounded-md bg-[#FF4500] px-4 py-1.5 font-semibold text-white hover:opacity-90">
                  <img src="/images/whitestar.svg" alt="star" />
                  ORBEIT Originals
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ MAIN GRID + TRENDING */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_385px]">
          {/* LEFT: games */}
          <div>
            {/* search/filter row */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-[26px] items-center gap-3 rounded border border-[#31313F] px-3">
                  <img src="/images/search.svg" />
                  <input
                    placeholder="Search games..."
                    className="h-[26px] bg-transparent text-xs tracking-[0.08em] text-[#424252] outline-none"
                  />
                </div>

                <button className="h-[26px] flex items-center gap-1.5 rounded border border-[#31313F] px-4 text-xs text-[#424252]">
                <img src="/images/filter.svg" />  Filter
                </button>

                <span className="text-xs text-[#AEAEAE]">
                  Sort by: <span className="text-[#FF4500] underline"> Players Count</span>
                </span>
              </div>
            </div>

            {/* games grid */}
            <div className="mt-6 flex gap-6">
              {games.map((g) => {
                const isLive = g.status === "live";
                return (
                  <>
                    {/* <Link
                    key={g.id}
                    href={isLive ? `/game/${g.id}` : '#'}
                    className="group hidden relative h-[163px] w-[123px] overflow-hidden rounded border border-[#32323F] bg-white/10 hover:border-[#73FFD7]/60"
                  >
                    <div className="p-3">
                      <img src={g.image} className="h-[92px] rounded bg-white/10" />
                      <div className="mt-2 text-sm tracking-[0.08em]">
                        {g.name}
                      </div>
                      <div className="mt-1 text-xs text-[#828282]">
                        👤 {g.players}
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                      <div className="rounded text-nowrap bg-[#FF4500] px-4 py-2 text-sm opacity-0 group-hover:opacity-100 transition">
                        ► Play
                      </div>
                    </div>
                  </Link> */}
                    <Link
                      href={isLive ? `/game/${g.id}` : "#"}
                      className="group w-[86px] overflow-hidden rounded border border-white/10 bg-[#1a1b23] shadow-xl 
             transition-all duration-300 hover:-translate-y-1 hover:scale-[1.05]"
                    >
                      <div className="relative flex h-[114px] items-center justify-center bg-gradient-to-b from-[#2d2e4d] to-[#9245ff] overflow-hidden">
                        <img
                          src={g.image}
                          alt="Dice Game"
                          className="h-full w-full object-contain transition-all duration-300 group-hover:blur-sm group-hover:scale-110"
                        />

                        {/* Play Button Overlay */}
                        <div
                          className="absolute inset-0 pb-6 flex items-end justify-center 
                    opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <button className="flex text-xs pr-2 py-1 items-center justify-centfer rounded bg-[#FF4500] backdrop-blur">
                            <svg
                              className="h-5 w-5 text-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            <span>Play</span>
                          </button>
                        </div>

                        <div className="absolute bottom-3 right-3 text-white/40">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex items-center justify-center py-2 bg-[#14151a]">
                        <div className="flex items-center gap-2 text-gray-400">
                        <img src="/images/person.svg" alt="play"
                           />
                          <span className="text-xs font-semibold tracking-wide">
                            58.8K
                          </span>
                        </div>
                      </div>
                    </Link>
                  </>
                );
              })}
            </div>
          </div>

          {/* RIGHT: trending */}
          <aside className=" p-4">
            <TrendingText />

            <p className="mt-3 text-xs text-[#828282]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit...
            </p>
            <button className="mt-4 flex items-center gap-2 rounded bg-[#FF45001F] px-1 py-1 text-xs">
              <img src="/images/star.svg" />
              ORBEit Originals
            </button>
          </aside>
        </section>

        {/* ✅ LEADERBOARD */}
        {/* <section className="mt-10">
      

          <div className="mt-6 grid gap-6 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[74px] rounded border border-[#31313F] bg-white/5"
              />
            ))}
          </div>
        </section> */}

        {/* ✅ CHALLENGES */}
        {/* <section className="mt-10">
          <div className="flex items-center justify-between">
            <div className="text-xs tracking-[0.08em] text-[#5B5B79]">
              Challenges
            </div>
            <Link href="#" className="text-xs text-[#FF9169] underline">
              View All
            </Link>
          </div>

          <div className="mt-4 flex gap-6 overflow-x-auto pb-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-[114px] w-[86px] flex-shrink-0 rounded border border-[#32323F] bg-white/5"
              />
            ))}
          </div>
        </section> */}
        <ContestWinnerList />
        <Challenge />
        <HomeFooter />
      </main>
    </div>
  );
}
