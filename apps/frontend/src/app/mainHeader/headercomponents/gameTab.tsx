import Baccart from "@/icons/Baccart";
import BlackJack from "@/icons/BlackJack";
import Casino from "@/icons/Casino";
import DashBoard from "@/icons/DashBoard";
import MultiPlayer from "@/icons/MultiPlayer";
import Poker from "@/icons/Poker";
import Roulette from "@/icons/Roulette";
import Slots from "@/icons/Slots";
import React from "react";

const GameTab = () => {

  const [themes, showThemes] = React.useState<any>(false);
  const [hover, setHover] = React.useState<any>("");
  const [showTrack, setShowTrack] = React.useState(false);

  console.log(hover, "active hover");

  // Navigation items configuration

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
        return 0;
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
        return 550;

      default:
        return 0;
    }
  };

  // Render game icon based on id and active state
  const renderGameIcon = (id: string, isActive: boolean) => {
    const activeColor = "#73FFD7";
    const inactiveColor = "#828282";
    const color = isActive ? activeColor : inactiveColor;
    const finalColor = isActive
      ? "#73FFD7"
      : hover === id
        ? "#45A58A"
        : "#818181";

    switch (id) {
      case "blackjack":
        return <BlackJack color={finalColor} />;
      case "slots":
        return <Slots color={finalColor} />;
      case "poker":
        return <Poker color={finalColor} />;
      case "baccarat":
        return <Baccart color={finalColor} />;
      case "roulette":
        return <Roulette color={finalColor} />;
      case "racks":
        return <Roulette color={finalColor} />;
      case "goals":
        return <Roulette color={finalColor} />;

      default:
        return null;
    }
  };

  return (
     <div className="group relative hover:cursor-pointer"   onPointerEnter={() => setShowTrack(true)}
onPointerLeave={(e) => {
  const next = e.relatedTarget as Node;
  if (!e.currentTarget.contains(next)) {
    setShowTrack(false);
  }
}}>
      <nav
        ref={navRef}
        className="relative hover:cursor-pointer  h-[41px] w-[462px] p-[12px] rounded overflow-x-auto scrollbar-hidden border border-[#31313F]"
        role="navigation"
        aria-label="Casino games navigation"
      >
        <div className="flex relative  items-center h-full gap-[16px] ">
          {gameTabs?.map((tab, index) => {
            const isActive = activeGameTab === tab.id;
            return (
              <div key={tab.id} className="flex  items-center gap-[16px]">
                <button
                  onClick={() => setActiveGameTab(tab.id)}
                  onMouseEnter={() => !isActive && setHover(tab.id)}
                  onMouseLeave={() => setHover("")}
                  className="flex items-center gap-1.5  cursor-pointer transition-colors duration-200 "
style={
  gameTabs.length - 1 === index
    ? { paddingRight: "12px" }
    : {}
}                  aria-label={`Navigate to ${tab.name}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {renderGameIcon(tab.id, isActive)}
                  <span
                    className={`text-sm tracking-[1.12px] hover:text-[#B3B3B3] text-[#828282] ${
                      isActive ? "text-white" : "text-[#B3B3B3]"
                    }`}
                  >
                    {tab.name}
                  </span>
                </button>
                {/* Separator - don't show after last item */}
                {index < gameTabs.length - 1 && (
                  <div className="w-px h-4 bg-[#31313F]" />
                )}
              </div>
            );
          })}
        </div>

        {/* Animated glowing underline indicator */}
        <div
          className="absolute hover:cursor-pointer bottom-0 left-3 w-[73px] h-px bg-[#73FFD7] transition-all duration-300"
          style={{
            transform: `translateX(${getUnderlinePosition()}px)`,
            boxShadow: "0px 0px 16px 2px rgba(115, 255, 215, 0.64)",
          }}
          aria-hidden="true"
        />
      </nav>
      <div
        ref={trackRef}
       className={`
    absolute right-[0px] top-[50.5px] z-50 w-[221px]
    transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
    ${showTrack
      ? "opacity-100 -translate-y-0"
      : "opacity-0 -translate-y-3"}
  `}
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
            <span
              style={{
                boxShadow: "0px 0px 12px 3px rgba(115, 255, 215, 0.64)",
              }}
              className="absolute inline-flex h-full w-full rounded-full bg-[#73FFD7] opacity-75 "
            ></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#73FFD7]"></span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameTab;
