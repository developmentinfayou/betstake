import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
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
import LogoToggle from "@/icons/LogoToggle";
import Recentgames from "./homecomponents/recentgames";
import Maingames from "./homecomponents/maingames";
import TopCards from "./homecomponents/topcards";
import Logo from "@/icons/Logo";

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

  const [themes, showThemes] = useState<any>(false);

  const [activeEdge, setActiveEdge] = React.useState<"premium" | "vip">(
    "premium"
  );

  // console.log(activeEdge, "active edger");

  const currentLevel = 4;
  const nextLevel = 5;
  const remaining = 34.02;
  const progress = 65; // %

  const [boosts, showBoosts] = useState<any>(false);

  // Navigation items configuration
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "/images/dashicon.svg" },
    { id: "casino", label: "Casino" },
    { id: "multiplayer", label: "Multiplayer" },
  ];

  // State for game category tabs
  const [activeGameTab, setActiveGameTab] = useState<string>("blackjack");
  const navRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [dotPosition, setDotPosition] = useState(0);

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
  };

  return (
    <div
      className="min-h-screen text-white"
      
    >
   

      {/* ✅ PAGE CONTAINER */}
      <main className=" pb-10 pt-10">
        {/* ✅ TOP CARDS ROW */}

        <TopCards />

        {/* ✅ RECENTLY PLAYED */}
        <Recentgames />

        {/* ✅ MAIN GRID + TRENDING */}
        <Maingames />

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
            <Link to="#" className="text-xs text-[#FF9169] underline">
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
