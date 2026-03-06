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

  const [hover, setHover] = React.useState<any>("");
  const [activeGameTab, setActiveGameTab] = React.useState<string>("blackjack");
  const navRef = React.useRef<HTMLDivElement>(null);

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

  // Underline slider state kept

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
    <div className="game_wrapper_4821">
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
                  } aria-label={`Navigate to ${tab.name}`}
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

    </div>
  );
};

export default GameTab;
