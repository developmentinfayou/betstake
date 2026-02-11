"use client";

import React, { useState } from "react";
import Link from "next/link";
import Challenge from "./homecomponents/challanges";
import HomeFooter from "./homecomponents/homefooter";
import ContestWinnerList from "./homecomponents/contestWinnerList";
import { Rakeback } from "./homecomponents/rackback";
import TrendingText from "./homecomponents/trendingtext";
import BlackJack from "../icons/BlackJack";
import Slots from "../icons/Slots";
import Roulette from "../icons/Roulette";
import Baccart from "../icons/Baccart";
import Poker from "../icons/Poker";
import DashBoard from "../icons/DashBoard";
import MultiPlayer from "../icons/MultiPlayer";
import Casino from "../icons/Casino";
import Spin from "@/icons/Spin";
import Premium from "@/icons/Premium";
import Sparkle from "@/icons/Sparkle";
import Vip from "@/icons/Vip";

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
    id: "balloon",
    name: "Pump",
    players: "58.8K",
    status: "live",
    image: "/images/pump.png",
  },
  {
    id: "balloon",
    name: "Pump",
    players: "58.8K",
    status: "live",
    image: "/images/pump.png",
  },
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
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");



const [activeEdge, setActiveEdge] = React.useState<"premium" | "vip">("premium");

console.log(activeEdge , "active edger")

const currentLevel = 4;
const nextLevel = 5;
const remaining = 34.02;
const progress = 65; // %





  const [boosts ,showBoosts ] = useState<any>(false)

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
      <header className="border-bk bordejjr-[#31313F]">
        <nav className="mx-auto flex h-[81px] max-w-[1440px] items-center justify-between px-8">
          {/* Logo */}
          <div className="flex items-center gap-8 w-[163px]">
            <div className="flex relative items-baseline gap-1">
              <img
                src="/images/logo.svg"
                className=" text-[19px] tracking-[0.08em]"
              />
              <span className=" text-[#73FFD7] text-[14px] tracking-[0.08em] absolute left-[80px] top-[22px]">
                ~Play
              </span>
            </div>
            <svg
              width="10"
              height="11"
              viewBox="0 0 10 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.699997 7.70102H8.70053M8.70053 7.70102L6.7004 5.70078M8.70053 7.70102L6.7004 9.70127"
                stroke="#73FFD7"
                stroke-width="1.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8.70053 2.70024H0.699997M0.699997 2.70024L2.70013 0.700001M0.699997 2.70024L2.70013 4.70048"
                stroke="white"
                stroke-width="1.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
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
              className="relative  h-[41px] w-[462px] rounded overflow-hidden border border-[#31313F]"
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
            <div className="absolute right-[134px] top-[53.5px] z-50">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute image-dot inline-flex h-full w-full  rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              </span>
            </div>

            <hr className="w-[221px] absolute right-0 top-[56px] border-[#31313F]" />
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

      {/* ✅ PAGE CONTAINER */}
      <main className="mx-auto max-w-[1440px] px-8 pb-10 pt-10">
        {/* ✅ TOP CARDS ROW */}
        <section className="grid gap-3 lg:grid-cols-[592px_335px_385px]">
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
          hover:font-semibold"
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
<div onClick={() => {showBoosts(!boosts)}}>

               {!boosts ? <div  className="flex items-center gap-1 text-xs text-[#A1A1B3] cursor-pointer">

                  <img src="/images/booster.svg" alt="boosts" />
                  <span>See Boosts</span>
                  <svg  width="5" height="3" viewBox="0 0 5 3" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.5 0.5L2.5 2.5L4.5 0.5" stroke="#555555" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

                </div> :
                <span  className="text-[#A1A1B3] text-xs cursor-pointer">Close</span>}
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

              {boosts && 
             <><div className="inline-flex mt-3 w-[311px] items-center gap-3 px-3 py-2 bg-white/[0.06] rounded rounded-b-none">

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
                    <Sparkle />

                    <span className="text-white text-sm tracking-[1.12px]">
                      16%
                    </span>

                  </div>



                </div><div className="inline-flex  w-[311px] items-center gap-3 px-3 py-2 bg-white/[0.06] rounded rounded-t-none">

                    {/* LEFT SIDE */}
                    <div className="flex items-center gap-[7px] shrink-0">
                    <Vip />
                      <span className="text-sm tracking-[1.12px] text-white">
                        VIP
                      </span>
                    </div>

                    {/* CENTER LINE */}
                    <div className="flex-1 h-[1px] bg-white/20" />

                    {/* RIGHT SIDE */}
                    <div className="flex items-center gap-[6px] shrink-0">

                      {/* Sparkle SVG */}
                      <Sparkle />

                      <span className="text-white text-sm tracking-[1.12px]">
                        16%
                      </span>

                    </div>



                  </div></>
           }


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
                    <button onClick={() => setActiveEdge("premium")}
    className={`inline-flex items-center gap-[7px] px-3 py-1.5 rounded transition-all duration-300 ${
      activeEdge === "premium"
        ? "bg-white/[0.06] text-white scale-100"
        : "bg-transparent text-[#818181] hover:bg-white/[0.04]"
    }`}>
                      <div
                       
                      >
                      <Premium />
                      </div>
                      <span className=" text-sm tracking-[1.12px] text-white">
                        Premium
                      </span>
                    </button>

                    {/* VIP badge - inactive */}
                    <button onClick={() => setActiveEdge("vip")}
    className={`inline-flex items-center gap-[7px] px-3 py-1.5 rounded transition-all duration-300 ${
      activeEdge === "vip"
        ? "bg-white/[0.06] text-white scale-100"
        : "bg-transparent text-[#818181] hover:bg-white/[0.04]"
    }`} >
                    <Vip/>

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
                {activeEdge == "premium" ?  <p className="barlow-condensed-light font-light text-[#818181] text-xs tracking-[0.96px]">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit
                </p>
       :
                <div className="flex w-full items-center justify-between gap-4">

    {/* LEFT - LEVEL */}
    <span className="text-white text-xs tracking-[2px] uppercase">
      LVL 4
    </span>

    {/* CENTER - PROGRESS BAR */}
    <div className="flex-1 h-[4px] bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
        style={{ width: "65%" }}   // 👈 change dynamically
        // style={{ width: `${progress}%` }}
      />
    </div>

    {/* RIGHT - TEXT */}
    <span className="text-xs text-[#A1A1AA] whitespace-nowrap">
      Wager <span className="text-emerald-400 font-medium">$34.02</span> more reach <span className="underline">lvl 5</span>
    </span>

  </div>}
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
          <div className=" flex items-center gap-4 justify-between">
            <div className=" flex items-center  overflow-x-auto scrollbar-hidden">
              {games?.slice(0, 7)?.map((g, i) => (
                <div
                  key={i}
                  className="group relative w-[147px] h-[187px] flex-shrink-0"
                >
                  {/* HOVER FRAME */}
                  <div
                    className="
          absolute inset-0 rounded
          border border-[#32323F]
          opacity-0 group-hover:opacity-100
          transition-all duration-300
        "
                  />

                  {/* IMAGE WRAPPER */}
                  <div className="absolute left-[12px] top-[12px] w-[123px] h-[163px] overflow-hidden rounded">
                    {/* IMAGE */}
                    <img
                      src={g.image}
                      alt=""
                      className="
            h-full w-full object-cover
            transition-all duration-300
            group-hover:blur-[1px]
          "
                    />

                    {/* DARK OVERLAY */}
                    <div
                      className="
            absolute inset-0
            bg-black/20
            opacity-0 group-hover:opacity-100
            transition-all duration-300
          "
                    />
                  </div>

                  {/* CONTINUE BUTTON */}
                  <button
                    className="
          absolute left-[29px] top-[130px]
          w-[88px] h-[29px]
          flex items-center justify-center gap-[6px]
          rounded bg-[#FF4500]
          text-xs text-white
          opacity-0 group-hover:opacity-100
          transition-all duration-300
        "
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Continue
                  </button>

                  {/* HEART ICON */}
                  <div
                    className="
          absolute left-[109px] top-[24px]
          opacity-0 group-hover:opacity-100
          transition-all duration-300
        "
                  >
                    <svg
                      width="15"
                      height="13"
                      viewBox="0 0 15 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.3778 0.5C12.8433 0.5 14.5 2.735 14.5 4.82C14.5 9.0425 7.62444 12.5 7.5 12.5C7.37556 12.5 0.5 9.0425 0.5 4.82C0.5 2.735 2.15667 0.5 4.62222 0.5C6.03778 0.5 6.96333 1.1825 7.5 1.7825C8.03667 1.1825 8.96222 0.5 10.3778 0.5Z"
                        stroke="#828282"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-[339px] h-[163px] rounded bg-[#FFFFFF0F] p-3 shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">
                  Boom Balloon
                </h2>

                <div className="flex items-center gap-2 text-[#CFCFE6]">
                  <img src="/images/users.svg" alt="users" />
                  <span className="text-xs underline underline-offset-1">
                    58.8K
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="mt-4  text-xs text-[#B5B5C9]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis n...
                <span className="ml-1 cursor-pointer text-[#FF9169] underline">
                  see more
                </span>
              </p>

              {/* Footer Button */}
              <div className="mt-6">
                <button className="flex text-xs items-center gap-2 rounded-[3px] bg-[#FF4500] px-4 py-1.5 font-semibold text-white hover:opacity-90">
                  <img src="/images/whitestar.svg" alt="star" />
                  ORBEIT Originals
                </button>
              </div>
            </div>
          </div>

          <div className="text-xs relative left-[12px] tracking-[0.08em] text-[#5B5B79]">
            Recently Played
          </div>
        </section>

        {/* ✅ MAIN GRID + TRENDING */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_385px]">
          {/* LEFT: games */}
          <div className="mt-8">
            {/* search/filter row */}
            <div className="flex flex-wrapk items-center justify-between gap-4">
              <div className="flex flex-wrapk items-center gap-4">
                <div className="flex w-[291.57px] h-[26px] items-center gap-3 rounded border border-[#31313F] px-3">
                  <img src="/images/search.svg" />
                  <input
                    placeholder="Search games..."
                    className="h-[26px] bg-transparent text-xs tracking-[0.08em] text-[#424252] outline-none"
                  />
                </div>

                <button className="h-[26px] flex items-center gap-1.5 rounded border border-[#31313F] px-4 text-xs text-[#424252]">
                  <img src="/images/filter.svg" /> Filter
                </button>

                <span className="text-xs text-[#AEAEAE]">
                  Sort by:{" "}
                  <span className="text-[#FF4500] underline">
                    {" "}
                    Players Count
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-3 min-w-[177px]">
                <div className=" w-[111px] h-1 bg-gray-700 rounded overflow-hidden">
                  <div className="w-2/3 h-full bg-white"></div>
                </div>

                <div className="flex gap-1">
                  <button className=" py-1.5 px-2 w-[19px] h-[18px] bg-[#1a1c2e] text-white rounded hover:bg-white/50 transition">
                    <svg
                      width="4"
                      height="7"
                      viewBox="0 0 4 7"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.5 6.5L0.5 3.5L3.5 0.5"
                        stroke="#FEFEFE"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                  <button className="py-1.5 px-2 w-[19px] h-[18px] bg-[#1a1c2e] text-white hover:bg-white/50  rounded transition">
                    <svg
                      width="4"
                      height="7"
                      viewBox="0 0 4 7"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0.5 6.5L3.5 3.5L0.5 0.5"
                        stroke="#FEFEFE"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* games grid */}
            <div className="mt-6 flex gap-1">
              {games?.map((g) => {
                const isLive = g.status === "live";

                return (
                  <div key={g.id} className="relative w-[110px] h-[152px]">
                    <Link
                      href={isLive ? `/game/${g.id}` : "#"}
                      className="group absolute bottom-0 left-1/2 -translate-x-1/2
                     w-[86px] h-[152px]"
                    >
                      {/* HOVER CARD */}
                      <div
                        className="
              relative h-full rounded
              transition-all duration-100
              group-hover:w-[110px]
              group-hover:translate-x-[-12px]
            "
                      >
                        {/* IMAGE */}
                        <div
                          className="
                 absolute bottom-[38px] left-0 overflow-hidden rounded
                w-[86.02px] h-[114px]
                group-hover:w-[110px]
                group-hover:h-[126px]
                transition-all duration-100
              "
                        >
                          <img
                            src={g.image}
                            alt=""
                            className="
                  h-full w-full object-cover
                  transition-all duration-100
                  group-hover:blur-[1px]
                "
                          />

                          {/* DARK OVERLAY */}
                          <div
                            className="
                  absolute inset-0 bg-black/20
                  opacity-0 group-hover:opacity-100
                  transition-all duration-100
                "
                          />

                          {/* PLAY BUTTON */}
                          <button
                            className="
                  absolute left-1/2 top-[85px] -translate-x-1/2
                  w-[61px] h-[29px]
                  flex items-center justify-center gap-[6px]
                  rounded bg-[#FF4500]
                  text-xs text-white
                  opacity-0 group-hover:opacity-100
                  transition-all duration-100
                  tracking-widest
                "
                          >
                            <svg
                              width="7"
                              height="9"
                              viewBox="0 0 7 9"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M1.73139 0.41445C1.73656 0.417991 1.74174 0.421543 1.74694 0.425106L6.30581 3.54889C6.43772 3.63925 6.56003 3.72304 6.65396 3.80091C6.75199 3.88216 6.86756 3.99484 6.93407 4.15969C7.02198 4.37757 7.02198 4.62243 6.93407 4.84031C6.86756 5.00516 6.75199 5.11784 6.65396 5.19909C6.56004 5.27695 6.43774 5.36074 6.30584 5.4511L1.7314 8.58554C1.57017 8.69604 1.42518 8.7954 1.30216 8.86392C1.17905 8.9325 1.01006 9.01086 0.812831 8.99875C0.560548 8.98327 0.327497 8.85508 0.175023 8.64792C0.0558196 8.48596 0.0255196 8.29798 0.0127432 8.15466C-2.39523e-05 8.01144 -1.22056e-05 7.83234 8.28673e-07 7.63317L1.65298e-06 1.38604C1.65298e-06 1.37962 1.24083e-06 1.37322 8.28673e-07 1.36683C-1.22056e-05 1.16766 -2.39523e-05 0.988562 0.0127432 0.845344C0.0255196 0.702023 0.0558196 0.514042 0.175023 0.352085C0.327497 0.144923 0.560548 0.0167286 0.812831 0.00124642C1.01006 -0.0108575 1.17905 0.0675029 1.30216 0.136077C1.42518 0.204602 1.57016 0.303957 1.73139 0.41445Z"
                                fill="white"
                              />
                            </svg>
                            Play
                          </button>
                        </div>

                        {/* HEART ICON */}
                        <div
                          className="
    absolute top-[3px] right-[12px]
    opacity-0 group-hover:opacity-100
    transition-all duration-100
  "
                        >
                          <svg
                            width="15"
                            height="13"
                            viewBox="0 0 15 13"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.3778 0.5C12.8433 0.5 14.5 2.735 14.5 4.82C14.5 9.0425 7.62444 12.5 7.5 12.5C7.37556 12.5 0.5 9.0425 0.5 4.82C0.5 2.735 2.15667 0.5 4.62222 0.5C6.03778 0.5 6.96333 1.1825 7.5 1.7825C8.03667 1.1825 8.96222 0.5 10.3778 0.5Z"
                              stroke="#828282"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>

                        {/* BOTTOM USERS */}
                        <div
                          className="
              absolute bottom-[7.2px] left-0 h-[31.1px]
               w-[86px] h-[38
                border border-[#31313F] border-t-0 group-hover:border-0
                rounded-b
                flex items-center justify-center
                gap-[8px]
                mt-0
                transition-all duration-100
                group-hover:w-[110px]
                group-hover:bg-[#FFFFFF0F]
                group-hover:duration-100
              "
                        >
                          <svg
                            className="hidden group-hover:block"
                            width="11"
                            height="10"
                            viewBox="0 0 11 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M1.48167 2.74992C1.48167 1.23118 2.72007 0 4.24772 0C5.77537 0 7.01378 1.23118 7.01378 2.74992C7.01378 4.26866 5.77537 5.49985 4.24772 5.49985C2.72007 5.49985 1.48167 4.26866 1.48167 2.74992Z"
                              fill="#FF4500"
                            />
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M4.24772 5.99983C5.85517 5.99983 7.29216 6.90188 8.16904 8.20983C8.2463 8.32506 8.32868 8.44794 8.38628 8.56474C8.45561 8.70532 8.5054 8.8668 8.49375 9.05966C8.48446 9.21349 8.43314 9.35619 8.37212 9.46949C8.31109 9.58279 8.22007 9.70436 8.09644 9.79732C7.93082 9.92184 7.75234 9.96548 7.59457 9.98372C7.45565 9.99979 7.29112 9.99976 7.12539 9.99972C5.20769 9.99935 3.2885 9.99935 1.37005 9.99972C1.20432 9.99976 1.03979 9.99979 0.90087 9.98372C0.743102 9.96548 0.564622 9.92184 0.399004 9.79732C0.275371 9.70436 0.184355 9.58279 0.12333 9.46949C0.0623041 9.35619 0.0109803 9.21349 0.00169287 9.05966C-0.00995153 8.8668 0.0398375 8.70532 0.109163 8.56474C0.166762 8.44795 0.249144 8.32506 0.326399 8.20983C1.20328 6.90188 2.64028 5.99983 4.24772 5.99983Z"
                              fill="#FF4500"
                            />
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M8.07314 6.69381C8.19782 6.44706 8.5001 6.34752 8.7483 6.47147C9.57028 6.88199 10.2651 7.53553 10.768 8.34087C10.8442 8.46286 10.9551 8.62579 10.9895 8.84659C11.0264 9.08298 10.9618 9.30903 10.8656 9.48092C10.7695 9.6528 10.6103 9.82654 10.3889 9.92009C10.1783 10.009 9.94928 9.99972 9.77984 9.99972C9.50208 9.99972 9.27692 9.77587 9.27692 9.49974C9.27692 9.2236 9.50208 8.99975 9.77984 8.99975C9.88806 8.99975 9.94497 8.99944 9.98557 8.99668L9.98664 8.99483C9.99626 8.97763 9.92319 8.88391 9.91343 8.86828C9.49988 8.20598 8.9392 7.68586 8.29678 7.36503C8.04859 7.24108 7.94846 6.94056 8.07314 6.69381Z"
                              fill="#828282"
                            />
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M7.06633 0.511351C7.18994 0.264069 7.49178 0.163228 7.74052 0.286116C8.65008 0.735494 9.27692 1.66948 9.27692 2.74993C9.27692 3.83038 8.65008 4.76436 7.74052 5.21373C7.49178 5.33662 7.18994 5.23578 7.06633 4.9885C6.94272 4.74122 7.04415 4.44113 7.29289 4.31824C7.87369 4.03129 8.27108 3.43629 8.27108 2.74993C8.27108 2.06356 7.87369 1.46856 7.29289 1.18161C7.04415 1.05872 6.94272 0.758634 7.06633 0.511351Z"
                              fill="#828282"
                            />
                          </svg>

                          <svg
                            className="group-hover:hidden block"
                            width="11"
                            height="10"
                            viewBox="0 0 11 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M8.07313 6.69381C8.19781 6.44706 8.50009 6.34751 8.74829 6.47147C9.57028 6.88198 10.2651 7.53553 10.768 8.34087C10.8442 8.46286 10.9551 8.62579 10.9895 8.84658C11.0263 9.08297 10.9618 9.30903 10.8656 9.48092C10.7695 9.6528 10.6103 9.82654 10.3889 9.92009C10.1783 10.009 9.94928 9.99972 9.77983 9.99972C9.50208 9.99972 9.27691 9.77587 9.27691 9.49973C9.27691 9.2236 9.50208 8.99975 9.77983 8.99975C9.88805 8.99975 9.94496 8.99944 9.98557 8.99668L9.98663 8.99483C9.99625 8.97763 9.92319 8.88391 9.91342 8.86828C9.49987 8.20598 8.93919 7.68586 8.29678 7.36503C8.04858 7.24108 7.94845 6.94056 8.07313 6.69381Z"
                              fill="#828282"
                            />
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M7.06632 0.511349C7.18993 0.264067 7.49178 0.163226 7.74051 0.286115C8.65007 0.735492 9.27691 1.66947 9.27691 2.74992C9.27691 3.83037 8.65007 4.76435 7.74051 5.21373C7.49178 5.33662 7.18993 5.23578 7.06632 4.9885C6.94271 4.74121 7.04415 4.44113 7.29288 4.31824C7.87369 4.03129 8.27108 3.43628 8.27108 2.74992C8.27108 2.06356 7.87369 1.46856 7.29288 1.1816C7.04415 1.05872 6.94271 0.758632 7.06632 0.511349Z"
                              fill="#828282"
                            />
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M1.48167 2.74992C1.48167 1.23118 2.72007 0 4.24772 0C5.77537 0 7.01378 1.23118 7.01378 2.74992C7.01378 4.26866 5.77537 5.49985 4.24772 5.49985C2.72007 5.49985 1.48167 4.26866 1.48167 2.74992Z"
                              fill="#828282"
                            />
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M4.24772 5.99983C5.85517 5.99983 7.29216 6.90188 8.16904 8.20983C8.2463 8.32506 8.32868 8.44794 8.38628 8.56474C8.45561 8.70532 8.5054 8.8668 8.49375 9.05966C8.48446 9.21349 8.43314 9.35619 8.37212 9.46949C8.31109 9.58279 8.22007 9.70436 8.09644 9.79732C7.93082 9.92184 7.75234 9.96548 7.59457 9.98372C7.45565 9.99979 7.29112 9.99976 7.12539 9.99972C5.20769 9.99935 3.2885 9.99935 1.37005 9.99972C1.20432 9.99976 1.03979 9.99979 0.90087 9.98372C0.743102 9.96548 0.564622 9.92184 0.399004 9.79732C0.275371 9.70436 0.184355 9.58279 0.12333 9.46949C0.0623041 9.35619 0.0109803 9.21349 0.00169287 9.05966C-0.00995153 8.8668 0.0398375 8.70532 0.109163 8.56474C0.166762 8.44794 0.249144 8.32506 0.326399 8.20983C1.20328 6.90188 2.64028 5.99983 4.24772 5.99983Z"
                              fill="#828282"
                            />
                          </svg>

                          <span className="text-xs font-normal tracking-widest text-gray-400">
                            58.8K
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: trending */}
          <div className="">
            <TrendingText />

            <p className=" text-xs text-[#B5B5C9] h-[70px]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis n...
              <span className="ml-1 cursor-pointer text-[#FF9169] underline">
                see more
              </span>
            </p>
            <button className="mt-3 flex items-center gap-2 rounded-[3px] bg-[#FF45001F] px-1 py-1 text-xs">
              <img src="/images/star.svg" />
              ORBEit Originals
            </button>
          </div>
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
