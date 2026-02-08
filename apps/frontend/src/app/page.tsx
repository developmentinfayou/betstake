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
        return (
          // <svg
          //   width="12"
          //   height="12"
          //   viewBox="0 0 12 12"
          //   fill="none"
          //   xmlns="http://www.w3.org/2000/svg"
          // >
          //   {/* Two playing cards overlapping - like in Figma */}
          //   <path d="M2 2L4 10L6 9L4 1L2 2Z" fill={color} />
          //   <path d="M10 2L8 10L6 9L8 1L10 2Z" fill={color} />
          // </svg>
          <svg width="12" height="12" viewBox="0 0 12 12" fill={color} xmlns="http://www.w3.org/2000/svg">
          <path d="M4.49469 2.52779C4.58685 2.52794 4.6772 2.55348 4.75581 2.60159C4.83443 2.6497 4.89827 2.71853 4.94035 2.80053L5.0549 3.03727L3.50245 7.70445L3.48554 7.777C3.46681 7.89406 3.48989 8.01397 3.55073 8.11571C3.61157 8.21745 3.7063 8.29452 3.81828 8.3334L8.06162 9.75711H8.12653L8.12544 9.7593C8.08027 9.83542 8.0147 9.8974 7.93616 9.93822L3.9312 11.9489C3.81258 12.007 3.67585 12.0159 3.55066 11.9739C3.42547 11.9318 3.32191 11.8421 3.26243 11.7241L0.0457045 5.24486L0.0467955 5.24813C-0.00734663 5.13126 -0.0147994 4.99812 0.0259611 4.87594C0.0667216 4.75376 0.152616 4.65177 0.266081 4.59082L4.27431 2.57907L4.27104 2.58016C4.34035 2.54507 4.417 2.52748 4.49469 2.52779Z" fill={color}/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M7.26145 0C7.316 0 7.36945 0.00872779 7.41527 0.0240014L11.6581 1.43736L11.6624 1.43845C11.7882 1.48196 11.8917 1.57354 11.9502 1.69314C12.0087 1.81275 12.0174 1.95065 11.9744 2.07666L9.6894 8.94215L9.68831 8.94542C9.64433 9.06764 9.55467 9.16803 9.43819 9.22551C9.32171 9.28299 9.18749 9.29306 9.06373 9.25362L4.81985 7.83045L4.81658 7.82936C4.69294 7.78624 4.59105 7.69651 4.53265 7.57931C4.47425 7.46211 4.46398 7.32672 4.50402 7.20205L6.78906 0.336565L6.79015 0.332746C6.82494 0.235539 6.88886 0.151426 6.9732 0.091879C7.05755 0.0323314 7.1582 0.000246839 7.26145 0ZM9.08392 3.66512C9.06652 3.67812 9.0528 3.69541 9.04409 3.7153L8.95845 3.95259V3.95423C8.95845 3.98805 8.98191 4.01587 9.01355 4.02296L9.3643 4.15387L8.75826 5.85906C8.75374 5.86743 8.75148 5.87683 8.75172 5.88634C8.75172 5.91852 8.77353 5.94525 8.80244 5.95398L9.22356 6.10508C9.23096 6.10825 9.23897 6.10974 9.24702 6.10944C9.26194 6.10936 9.27646 6.10457 9.28851 6.09576C9.30056 6.08694 9.30952 6.07455 9.31411 6.06035L10.1809 3.64985C10.1871 3.63123 10.186 3.61094 10.1776 3.59316C10.1693 3.57538 10.1545 3.5615 10.1362 3.55439L9.79032 3.42892L9.08392 3.66512ZM7.77311 2.69906C7.57583 2.69846 7.38173 2.74881 7.20963 2.84525C7.19273 2.8551 7.18025 2.87106 7.17477 2.88984C7.16929 2.90861 7.17122 2.92878 7.18017 2.94617L7.31545 3.29855C7.32467 3.3173 7.34071 3.33182 7.36028 3.33912C7.37986 3.34642 7.40148 3.34596 7.42073 3.33783L7.41855 3.33946C7.48371 3.30038 7.55606 3.27478 7.6313 3.26419C7.70655 3.2536 7.78315 3.25824 7.85657 3.27782H7.85875C7.90028 3.28747 7.93943 3.3054 7.97385 3.33055C8.00827 3.3557 8.03726 3.38755 8.05906 3.42418C8.08087 3.46081 8.09504 3.50147 8.10074 3.54372C8.10644 3.58597 8.10354 3.62893 8.09222 3.67003L8.09059 3.67385C8.04783 3.77272 7.97925 3.85827 7.89203 3.9215C7.54128 4.15824 6.71487 4.72118 6.38922 4.92737V5.00756C6.38281 5.02624 6.38389 5.04668 6.39223 5.06458C6.40057 5.08248 6.41552 5.09645 6.43395 5.10357L7.93676 5.64687H7.93567C7.94234 5.64911 7.94938 5.65003 7.9564 5.6496C7.99076 5.6496 8.02022 5.62778 8.03167 5.59668L8.15168 5.26012C8.15797 5.24076 8.15682 5.21974 8.14845 5.20118C8.14008 5.18262 8.12509 5.16785 8.1064 5.15975L7.44528 4.92301C7.71093 4.73754 8.16204 4.43971 8.36224 4.26897L8.36442 4.26734C8.50775 4.15132 8.61753 3.99918 8.68244 3.82658C8.72138 3.71726 8.73742 3.60096 8.72846 3.48525C8.7195 3.36954 8.68628 3.25701 8.63097 3.15498C8.57566 3.05296 8.4995 2.96371 8.40743 2.89306C8.31536 2.8224 8.20945 2.77192 8.09659 2.74488L8.10477 2.74707C7.99717 2.71489 7.88542 2.69872 7.77311 2.69906Z" fill={color}/>
          </svg>
          
        );
      case "slots":
        return (
          <svg width="18" height="12" viewBox="0 0 18 12" fill={color} xmlns="http://www.w3.org/2000/svg">
<path d="M5.715 4.94568C5.24885 5.90539 4.88432 6.91225 4.6275 7.94948C4.40953 8.84381 4.40953 9.77829 4.6275 10.6726L4.7625 11.2415L1.71 12.0001C1.30908 10.3486 1.50043 8.60689 2.25 7.08475L0 7.62331V5.40839L5.505 4.07336L5.715 4.94568ZM18 5.78765L17.8275 6.66755C17.0145 7.33803 16.2684 8.08751 15.6 8.90523C15.0362 9.62748 14.6506 10.4751 14.475 11.3781L14.3625 11.947L11.25 11.3705C11.5701 9.70893 12.4566 8.2137 13.755 7.14543L11.505 6.6979L12.45 4.68019L18 5.78765Z" fill={color}/>
<path d="M13.5001 1.47156C12.4048 2.82006 11.4497 4.27909 10.6501 5.82555C9.96411 7.16143 9.60409 8.64391 9.60009 10.1492V11.0974H6.06009C6.06764 9.60785 6.38715 8.13686 6.99759 6.7813C7.64414 5.32968 8.4955 3.98061 9.52509 2.77624H4.27509V0H13.5001V1.47156Z" fill={color}/>
</svg>

        );
      case "poker":
        return (
          <svg width="12" height="12" viewBox="0 0 12 12" fill={color} xmlns="http://www.w3.org/2000/svg">
<path d="M10.6091 2.16L9.44182 3.32728C10.0372 4.0912 10.3615 5.03148 10.3636 6C10.3636 7.00909 10.02 7.93091 9.44182 8.67273L10.6091 9.84C11.4764 8.79818 12 7.46182 12 6C12 4.53818 11.4764 3.20182 10.6091 2.16ZM6 1.63637C7.00909 1.63637 7.93091 1.98 8.67273 2.55818L9.84 1.39091C8.76297 0.490863 7.40359 -0.00152571 6 3.55148e-06C4.53818 3.55148e-06 3.20182 0.52364 2.16 1.39091L3.32728 2.55818C4.0912 1.96282 5.03148 1.63851 6 1.63637ZM6 10.3636C4.99091 10.3636 4.06909 10.02 3.32728 9.44182L2.16 10.6091C3.20182 11.4764 4.53818 12 6 12C7.46182 12 8.79818 11.4764 9.84 10.6091L8.67273 9.44182C7.90881 10.0372 6.96852 10.3615 6 10.3636ZM1.63637 6C1.63637 4.99091 1.98 4.06909 2.55818 3.32728L1.39091 2.16C0.490863 3.23703 -0.00152571 4.59641 3.55148e-06 6C3.55148e-06 7.46182 0.52364 8.79818 1.39091 9.84L2.55818 8.67273C1.96282 7.90881 1.63851 6.96852 1.63637 6ZM8.59091 7.33637C8.86871 7.05642 9.02459 6.67802 9.02459 6.28364C9.02459 5.88925 8.86871 5.51085 8.59091 5.23091L6.08182 2.72182L3.57273 5.23091C3.29493 5.51085 3.13905 5.88925 3.13905 6.28364C3.13905 6.67802 3.29493 7.05642 3.57273 7.33637C4.15091 7.92 5.05091 7.91455 5.63455 7.36909L5.12727 8.72182H7.03637L6.52909 7.36909C7.11273 7.90909 8.02364 7.90364 8.59091 7.33637Z" fill={color}/>
</svg>

        );
      case "baccarat":
        return (
          <svg width="12" height="12" viewBox="0 0 12 12" fill={color} xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M9.31468 0.0453835C9.37155 0.0454995 9.4278 0.0571623 9.48002 0.0796647C9.53225 0.102167 9.57936 0.135041 9.6185 0.176292L11.3078 1.93156L9.6185 3.68574C9.3349 3.98008 9.1772 4.37337 9.17886 4.7821C9.17886 5.21628 9.35123 5.60955 9.62995 5.89046L11.3192 7.64464L7.25396 11.873C7.21414 11.9132 7.16674 11.9452 7.1145 11.967C7.06226 11.9888 7.00621 12 6.9496 12C6.89299 12 6.83694 11.9888 6.7847 11.967C6.73245 11.9452 6.68505 11.9132 6.64524 11.873L2.50197 7.56282C2.4205 7.479 2.37508 7.36662 2.37543 7.24973C2.37543 7.12755 2.42397 7.01682 2.50197 6.93718L9.01032 0.176838C9.04948 0.135421 9.09666 0.102407 9.14898 0.0798078C9.20131 0.0572084 9.25768 0.0454958 9.31468 0.0453835ZM5.91378 7.31191C5.88697 7.31318 5.86169 7.32481 5.84328 7.34434C5.82486 7.36387 5.81474 7.38979 5.81506 7.41664C5.8149 7.44257 5.82399 7.46771 5.84069 7.48755L6.70251 8.39954C6.72072 8.41698 6.74493 8.42674 6.77014 8.42682C6.79615 8.42617 6.82096 8.41578 6.83965 8.39769C6.85835 8.3796 6.86955 8.35515 6.87105 8.32918V7.51645C6.87178 7.46321 6.85144 7.41183 6.81446 7.37351C6.77747 7.3352 6.72684 7.31306 6.6736 7.31191H5.91378ZM6.30215 5.42846C6.19305 5.42846 6.10524 5.5201 6.10524 5.633V6.46318C6.10524 6.57664 6.19305 6.66827 6.30215 6.66827H7.32214C7.34989 6.67096 7.37681 6.67921 7.40129 6.69254C7.42577 6.70587 7.44731 6.724 7.46462 6.74584C7.48194 6.76769 7.49467 6.7928 7.50205 6.81968C7.50943 6.84656 7.51132 6.87465 7.5076 6.90227V7.93154C7.5076 8.04445 7.59487 8.13663 7.70396 8.13663H8.50359C8.55743 8.1355 8.60871 8.11347 8.64659 8.07518C8.68446 8.03691 8.70595 7.98539 8.7065 7.93154V5.633C8.70723 5.57976 8.68689 5.52838 8.64991 5.49006C8.61292 5.45175 8.56229 5.42961 8.50905 5.42846H6.30215Z" fill={color}/>
          <path d="M12 6.94307L10.8393 5.71417L10.2938 5.14799C10.1956 5.04363 10.1409 4.90567 10.1411 4.76235C10.1411 4.61181 10.2 4.47544 10.2938 4.37617L11.9836 2.62145V2.6389L12 2.62145V6.94307ZM4.48909 0C4.66472 0 4.82399 0.074727 4.93963 0.194181L6.28526 1.59218L1.53273 6.52853L0.187098 5.13053C0.0662815 5.00478 -0.000822129 4.83692 7.60396e-06 4.66253C7.60396e-06 4.47926 0.0720074 4.31344 0.187098 4.19399L4.038 0.194181C4.15309 0.0741816 4.31345 0 4.48909 0Z" fill={color}/>
          </svg>
          
        );
      case "roulette":
        return (
          <svg width="12" height="12" viewBox="0 0 12 12" fill={color} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 6C12 4.34182 11.3291 2.84182 10.2436 1.75637C9.68682 1.19855 9.02529 0.756239 8.29704 0.454829C7.56879 0.153418 6.78816 -0.00114828 6 6.42223e-06C4.34182 6.42223e-06 2.84182 0.670915 1.75637 1.75637C1.19855 2.31318 0.756239 2.97471 0.454829 3.70297C0.153418 4.43122 -0.00114828 5.21184 6.42223e-06 6C6.42223e-06 7.65818 0.670915 9.15818 1.75637 10.2436C2.84182 11.3291 4.34182 12 6 12C7.65818 12 9.15818 11.3291 10.2436 10.2436C11.3291 9.15818 12 7.65818 12 6ZM10.9091 6H8.18182C8.18182 5.30728 7.85455 4.69637 7.34728 4.29819C7.41273 4.35273 7.48364 4.39637 7.54364 4.45637L9.46909 2.53091C9.9258 2.98579 10.2881 3.52643 10.5352 4.12177C10.7824 4.71711 10.9094 5.35541 10.9091 6ZM6 1.09091V3.81819C5.30728 3.81819 4.69637 4.15091 4.29273 4.65273C4.34728 4.58728 4.39637 4.51637 4.45637 4.45637L2.53091 2.53091C2.98579 2.07421 3.52643 1.71188 4.12177 1.46476C4.71711 1.21764 5.35541 1.09059 6 1.09091ZM1.09091 6H3.81819C3.81819 6.69273 4.14546 7.30364 4.65273 7.70182C4.58728 7.65273 4.51637 7.60364 4.45637 7.54364L2.53091 9.46909C2.07421 9.01421 1.71188 8.47357 1.46476 7.87823C1.21764 7.2829 1.09059 6.64459 1.09091 6ZM6 10.9091V8.18182C6.69273 8.18182 7.30364 7.85455 7.70182 7.34728C7.65273 7.41273 7.60364 7.48364 7.54364 7.54364L9.46909 9.46909C9.01421 9.9258 8.47357 10.2881 7.87823 10.5352C7.2829 10.7824 6.64459 10.9094 6 10.9091Z" fill={color}/>
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

            <svg width="12" height="12" viewBox="0 0 12 12" fill={color} xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0ZM2.72727 6C2.72727 4.19252 4.19252 2.72727 6 2.72727C6.30125 2.72727 6.54545 2.48306 6.54545 2.18182C6.54545 1.88057 6.30125 1.63636 6 1.63636C3.59003 1.63636 1.63636 3.59003 1.63636 6C1.63636 6.30125 1.88057 6.54545 2.18182 6.54545C2.48306 6.54545 2.72727 6.30125 2.72727 6ZM8.84017 3.93115C9.05319 3.71814 9.05319 3.37277 8.84017 3.15976C8.62716 2.94675 8.2818 2.94675 8.06878 3.15976L6.28252 4.94603C6.19241 4.92194 6.0977 4.90909 6 4.90909C5.39751 4.90909 4.90909 5.39751 4.90909 6C4.90909 6.60249 5.39751 7.09091 6 7.09091C6.60249 7.09091 7.09091 6.60249 7.09091 6C7.09091 5.90226 7.07805 5.80752 7.05394 5.71738L8.84017 3.93115Z" fill= {isActive ? "#73FFD7" : "#828282"}/>
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
              height="12"
              viewBox="0 0 12 12"
              fill={color}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.6526 4.31742C8.77907 2.85493 7.06028 0.971865 6.34753 0.157452C6.16379 -0.0524839 5.83625 -0.0524839 5.65252 0.157452C4.93975 0.971841 3.22097 2.85491 1.34749 4.31742C0.497458 4.98098 0 5.97875 0 7.03594C0 8.91225 1.57103 10.4333 3.50898 10.4333C4.16441 10.4333 4.76061 10.1881 5.20536 9.78741V10.4499C5.20536 11.2564 4.62449 11.3564 4.17377 11.733C4.06537 11.8236 4.13193 12 4.27347 12H7.71465C7.85569 12 7.92233 11.8248 7.8151 11.7336C7.36901 11.3542 6.79464 11.2696 6.79464 10.4559V9.78738C7.23939 10.1881 7.83559 10.4333 8.49102 10.4333C10.429 10.4333 12 8.91223 12 7.03591C12 5.97875 11.5026 4.98098 10.6526 4.31742Z" />
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
            <svg width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.699997 7.70102H8.70053M8.70053 7.70102L6.7004 5.70078M8.70053 7.70102L6.7004 9.70127" stroke="#73FFD7" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.70053 2.70024H0.699997M0.699997 2.70024L2.70013 0.700001M0.699997 2.70024L2.70013 4.70048" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

          </div>

          {/* Center Navigation */}
          <div className="hidden relative items-center gap-4 lg:flex">
            {/* Primary Nav Tabs */}
            <nav
              className="inline-flex items-start gap-3 p-1.5 bg-[#73ffd70f] h-[41px] w-[326px] rounded overflow-hidden"
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
              className="relative  h-[41px] w-[462px] rounded overflow-hidden border border-[#31313F]"
              role="navigation"
              aria-label="Casino games navigation"
            >
              <div className="flex items-center h-full gap-1.5 px-3">
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
                    className={`relative self-stretch w-[48.22px] h-[62px] aspect-[0.78] rounded overflow-hidden ${
                      i === 0 ? "mt-[-145px]" : ""
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className={`h-full w-full object-cover `}
                    />
                     {i < 5 && (
      <div className="absolute inset-0 bg-black/70" />
    )}
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
              <div
                className="absolute top-[38px] left-[266px] w-[146px] h-[31px] flex "
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
            <div className="relative w-full h-[88px] rounded border border-[#2A2A3C] p-3">
              {/* Top Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/images/percent.svg" alt="percent" />

                  <span className="relative text-sm font text-white tracking-widest">
                    14.18%
                    <span className="pointer-events-none absolute left-0 bottom-[1px] w-full h-px bg-[repeating-linear-gradient(to_right,#818181_0_2px,transparent_2px_4px)]" />
                  </span>

                  <span className="flex items-center gap-1 px-[3px] rounded-[3px] bg-[#1F8F55] w-[50px] h-[17px] text-sm tracking-widest text-white">
                    <span className="text-[6px]">▲</span> 23.1%
                  </span>
                </div>

                <div className="flex items-center gap-1 text-sm text-[#A1A1B3] cursor-pointer">
                  <img src="/images/booster.svg" alt="boosts" />
                  <span>See Boosts</span>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="mt-3 flex items-center gap-3 ">
                <div className="flex items-center gap-2 rounded bg-[#FFFFFF0F] px-3 py-1.5 w-[243px] h-[29px]">
                  <img src="/images/inr.svg" alt="inr" />
                  <span className="text-sm text-[#C1C1C1]">5412.81 INR</span>
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
          <div className=" flex items-center gap-4 justify-between">
            <div className=" flex items-center  overflow-x-auto scrollbar-hidden">
              {games?.slice(0,7)?.map((g, i) => (
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
                <span className="ml-1 cursor-pointer text-[#FF4500] hover:underline">
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

          <div className="text-xs tracking-[0.08em] text-[#5B5B79]">
            Recently Played
          </div>
        </section>

        {/* ✅ MAIN GRID + TRENDING */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_385px]">
          {/* LEFT: games */}
          <div>
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
              <div className="flex items-center gap-3 min-w-[200px]">
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
              <button   className="py-1.5 px-2 w-[19px] h-[18px] bg-[#1a1c2e] text-white hover:bg-white/50  rounded transition">
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
          <aside className=" p-4">
            <TrendingText />

            <p className="mt-3 text-xs text-[#828282]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit...
            </p>
            <button className="mt-4 flex items-center gap-2 rounded-[3px] bg-[#FF45001F] px-1 py-1 text-xs">
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
