import Baccart from "@/icons/Baccart";
import BlackJack from "@/icons/BlackJack";
import Casino from "@/icons/Casino";
import DashBoard from "@/icons/DashBoard";
import MultiPlayer from "@/icons/MultiPlayer";
import Poker from "@/icons/Poker";
import Roulette from "@/icons/Roulette";
import Slots from "@/icons/Slots";
import React from "react";
import "./gameTab.css";

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
     <div className="game_wrapper_4821"   onPointerEnter={() => setShowTrack(true)}
onPointerLeave={(e) => {
  const next = e.relatedTarget as Node;
  if (!e.currentTarget.contains(next)) {
    setShowTrack(false);
  }
}}>
      <nav
        ref={navRef}
        className="game_nav_7392"
        role="navigation"
        aria-label="Casino games navigation"
      >
        <div className="game_nav_inner_1847 ">
          {gameTabs?.map((tab, index) => {
            const isActive = activeGameTab === tab.id;
            return (
              <div key={tab.id} className="game_tab_item_6621">
                <button
                  onClick={() => setActiveGameTab(tab.id)}
                  onMouseEnter={() => !isActive && setHover(tab.id)}
                  onMouseLeave={() => setHover("")}
                  className="game_tab_btn_9214"
style={
  gameTabs.length - 1 === index
    ? { paddingRight: "12px" }
    : {}
}                  aria-label={`Navigate to ${tab.name}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {renderGameIcon(tab.id, isActive)}
                  <span className={`game_tab_label_3351 ${isActive ? "active" : ""}`}>
                    {tab.name}
                  </span>
                </button>
                {/* Separator - don't show after last item */}
                {index < gameTabs.length - 1 && (
                  <div className="game_separator_5521" />
                )}
              </div>
            );
          })}
        </div>

        {/* Animated glowing underline indicator */}
        <div
          className="game_underline_7731"
          style={{
            transform: `translateX(${getUnderlinePosition()}px)`,
            boxShadow: "0px 0px 16px 2px rgba(115, 255, 215, 0.64)",
          }}
          aria-hidden="true"
        />
      </nav>
      <div
        ref={trackRef}
       className={`game_track_9182 ${showTrack ? "show" : ""}`}
      >
        {/* Line */}
        <div className="game_track_line_1112" />

        {/* Dot */}
        <div
          className="game_dot_wrapper_4421"
          style={{
            left: `${(dotPosition / maxSteps) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <button
            onClick={() => handleDotMove("left")}
            className="game_dot_left_1122"
          />
          <button
            onClick={() => handleDotMove("right")}
            className="game_dot_right_1123"
          />

          <span className="game_dot_core_5532">
            <span
              style={{
                boxShadow: "0px 0px 12px 3px rgba(115, 255, 215, 0.64)",
              }}
              className=""
            ></span>
            <span className=""></span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameTab;
