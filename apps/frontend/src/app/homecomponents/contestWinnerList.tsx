import React from "react";

const ContestWinnerList = () => {
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    const container:any = scrollRef.current;
    if (!container) return;

    let direction = "right";
    let intervalId:any;

    const startScrolling = () => {
      intervalId = setInterval(() => {
        if (direction === "right") {
          container.scrollLeft += 1;

          if (
            container.scrollLeft + container.clientWidth >=
            container.scrollWidth
          ) {
            clearInterval(intervalId);
            setTimeout(() => {
              direction = "left";
              startScrolling();
            }, 1000);
          }
        } else {
          container.scrollLeft -= 1;

          if (container.scrollLeft <= 0) {
            clearInterval(intervalId);
            setTimeout(() => {
              direction = "right";
              startScrolling();
            }, 1000);
          }
        }
      }, 10); // speed control
    };

    startScrolling();

    return () => clearInterval(intervalId);
  }, []);

  const STRIP_BACKGROUNDS = [
    "bg-[linear-gradient(180deg,#FF416C_0%,#FFA72B_100%)]",
    "bg-[linear-gradient(180deg,#4A00E0_0%,#8E2DE2_100%)]",
    "bg-[linear-gradient(180deg,#00B4DB_0%,#0083B0_100%)]",
    "bg-[linear-gradient(180deg,#5B5B5B_0%,#5B5B5B_100%)]",
  ];

  const STRIP_COLORS = [
    "#FF4500",
    "#4A00E0",
    "#00B4DB",
    "#828282",
  ];

  const TEXT_COLORS = [
    "#FF9169",
    "#C69BFF",
    "#69C4DD",
    "#5B5B5B",
  ];


  return (
    <div className="mt-2 mb-2">
      <div className="px-4 flex mb-2 mt-12 flex-wrap items-center justify-between w-full h-[29px] gap-4 text-gray-400 ">
        <div className="flex items-center space-x-4 overflow-x-auto ">
          <div className="flex items-center w-[154px] h-[29px]   rounded border border-gray-800">
            <button className=" h-[26px] w-[86px] text-xs  tracking-wider rounded transition hover:text-white">
              Leaderboard
            </button>
            <button className=" w-[68px] h-[29px] text-sm  tracking-wider bg-[#ff4d00] text-white rounded ">
              Contest
            </button>
          </div>

          <button className="flex w-[79px] h-[29px] items-center space-x-2 px-4 py-2 text-xs tracking-widest border border-gray-800 rounded  hover:border-gray-600 transition">
            <span className="text-sm">Wins</span>
            <svg
              width="6"
              height="4"
              viewBox="0 0 6 4"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.142521 0.456215L0.4313 0.150673C0.531373 0.050234 0.648251 0 0.781668 0C0.917836 0 1.03333 0.050234 1.12833 0.150673L2.99999 2.13039L4.87163 0.150731C4.96662 0.0502911 5.08214 5.71454e-05 5.21825 5.71454e-05C5.35173 5.71454e-05 5.46859 0.0502911 5.56867 0.150731L5.85366 0.456272C5.95124 0.559408 6 0.683002 6 0.826942C6 0.973563 5.95118 1.09576 5.85367 1.1935L3.34662 3.84523C3.25415 3.94838 3.13868 4 3 4C2.86393 4 2.74709 3.9484 2.6496 3.84523L0.142534 1.1935C0.0475335 1.09301 0 0.970824 0 0.826942C-1.38283e-05 0.685685 0.0475202 0.562161 0.142521 0.456215Z"
                fill="#FF4500"
              />
            </svg>
          </button>

          <div className="flex items-center space-x-2 ml-2">
            <div className="flex w-[114px] px-3 gap-2 py-1.5 text-nowrap items-center h-[29px] bg-orange-900/20 rounded">
              <img src="/images/gift.svg" />
              <span className="text-sm text-white tracking-widest">
                4h: 32m: 21s
              </span>
            </div>
            <span className="text-[12px] text-[#5B5B79] font-normal  tracking-widest">
              ~Prize Distribution
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center w-[120px] h-[29px]   rounded border border-gray-800">
            <button className=" w-[60px] h-[29px] text-sm  tracking-wider bg-[#ff4d00] text-white rounded ">
              Global
            </button>
            <button className=" h-[26px] w-[60px] text-xs  tracking-wider rounded transition hover:text-white">
              Friends
            </button>
          </div>

          <div className="flex items-center w-[123px] h-[29px]   rounded border border-gray-800">
            <button className=" h-[26px] w-[29.6px]  text-xs  tracking-wider rounded transition hover:text-white">
              D
            </button>

            <button className=" w-[34px] h-[29px] text-sm  tracking-wider bg-[#ff4d00] text-white rounded ">
              W
            </button>
            <button className=" relative h-[26px]   w-[29.6px] text-xs  tracking-wider transition hover:text-white">
              M
              <span className="absolute right-0 top-1/2 -translate-y-1/2 h-[10px] w-[1px] bg-gray-600 opacity-60"></span>
            </button>
            <button className=" h-[26px] w-[29.6px] text-xs  tracking-wider rounded transition hover:text-white">
              Y
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 grid gap-6 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
        {[1, 2, 3, 4].map((i, idx) => (

          <div
            key={i}
            className="flex w-[326px] h-[74px] max-w-md overflow-hidden bg-[#0a0b14] bordedrrr border-gray-800ddd rounded group"
          >
            <div
              className={`flex items-center justify-center w-[26px] h-[74px] ${STRIP_BACKGROUNDS[idx]} border-r border-gray-800`}
            >
              <span className="font-medium text-sm text-white uppercase transform -rotate-90">
                {String(idx + 1).padStart(2, "0")}
              </span>
            </div>

            <div className="flex-grow px-4  bg-[#FFFFFF0F]">
              <div className="flex items-center pt-3 justify-between">
                <div className="flex items-center space-x-1.5">
                  <div className="w-4 h-4 overflow-hidden rounded">
                    <img
                      src="/images/avatar1.jpg"
                      alt="Avatar"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <p className="text-[14px] font-normal tracking-wider text-white ">
                    Samboxer
                  </p>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                  {idx <= 2 && <img src="/images/verified.svg" />}
                  {idx <= 0 && <img src="/images/color-star.svg" />}
                    {idx <= 0 && (
    <span className="px-1 text-[8px] font-black bg-yellow-400 rounded text-black uppercase leading-tight tracking-wider">
      Vip
    </span>
  )}
                  </div>
                </div>

                <div className="flex items-baseline space-x-1">
                  <span  style={{
   color: idx === 3 ? "#fff" : TEXT_COLORS[idx],
    borderColor:  idx === 3 ? "#fff" : TEXT_COLORS[idx],
  }} className={`text-[14px] font-semibold  border-b  leading-none`}>
                    202
                  </span>
                  <span style={{
  color: idx === 3 ? "#fff" : TEXT_COLORS[idx],
}}
  className="text-[14px] font-semibold   tracking-widest">
                    Wins
                  </span>
                </div>
              </div>

              <div className="flex items-center pt-2.5 justify-between">
                <div className="flex items-center space-x-1.5 text-gray-500">
                  {/* <img src="images/21.svg" alt="Reward" className=" w-3 h-3" /> */}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill={STRIP_COLORS[idx]} xmlns="http://www.w3.org/2000/svg">
<path d="M4.49468 2.52777C4.58684 2.52792 4.67719 2.55346 4.7558 2.60157C4.83442 2.64968 4.89826 2.71851 4.94034 2.80051L5.05489 3.03726L3.50244 7.70444L3.48553 7.77699C3.4668 7.89404 3.48988 8.01396 3.55072 8.11569C3.61157 8.21743 3.70629 8.2945 3.81828 8.33338L8.0616 9.7571H8.12651L8.12542 9.75928C8.08025 9.83541 8.01469 9.89738 7.93614 9.9382L3.93119 11.9489C3.81257 12.0069 3.67584 12.0159 3.55065 11.9738C3.42546 11.9318 3.3219 11.842 3.26243 11.7241L0.0457044 5.24484L0.0467954 5.24811C-0.00734661 5.13124 -0.0147994 4.99811 0.0259611 4.87593C0.0667215 4.75375 0.152616 4.65175 0.26608 4.5908L4.2743 2.57905L4.27103 2.58014C4.34034 2.54505 4.41699 2.52746 4.49468 2.52777Z" fill="#828282"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.26162 0C7.31617 0 7.36963 0.0087278 7.41545 0.0240014L11.6582 1.43736L11.6626 1.43845C11.7884 1.48196 11.8919 1.57354 11.9504 1.69314C12.0088 1.81275 12.0175 1.95065 11.9746 2.07667L9.68958 8.94215L9.68848 8.94543C9.6445 9.06764 9.55484 9.16804 9.43836 9.22552C9.32189 9.28299 9.18766 9.29307 9.0639 9.25363L4.82004 7.83045L4.81676 7.82936C4.69312 7.78625 4.59123 7.69651 4.53283 7.57931C4.47444 7.46211 4.46416 7.32673 4.5042 7.20205L6.78923 0.336565L6.79033 0.332747C6.82511 0.235539 6.88904 0.151427 6.97338 0.091879C7.05772 0.0323315 7.15838 0.000246839 7.26162 0ZM9.08409 3.66512C9.0667 3.67812 9.05297 3.69541 9.04427 3.71531L8.95863 3.95259V3.95423C8.95863 3.98805 8.98208 4.01587 9.01372 4.02296L9.36447 4.15388L8.75843 5.85907C8.75391 5.86743 8.75166 5.87684 8.75189 5.88634C8.75189 5.91853 8.77371 5.94525 8.80262 5.95398L9.22373 6.10508C9.23113 6.10825 9.23914 6.10974 9.24719 6.10945C9.26212 6.10937 9.27664 6.10458 9.28868 6.09576C9.30073 6.08695 9.30969 6.07456 9.31428 6.06035L10.1811 3.64985C10.1873 3.63124 10.1861 3.61094 10.1778 3.59316C10.1695 3.57539 10.1546 3.5615 10.1363 3.55439L9.79049 3.42893L9.08409 3.66512ZM7.77329 2.69907C7.57601 2.69846 7.38191 2.74882 7.2098 2.84526C7.1929 2.8551 7.18043 2.87106 7.17495 2.88984C7.16947 2.90861 7.1714 2.92878 7.18035 2.94617L7.31563 3.29856C7.32484 3.31731 7.34088 3.33182 7.36046 3.33912C7.38003 3.34642 7.40166 3.34596 7.42091 3.33783L7.41872 3.33947C7.48389 3.30038 7.55624 3.27478 7.63148 3.2642C7.70672 3.25361 7.78333 3.25824 7.85675 3.27783H7.85893C7.90046 3.28747 7.9396 3.3054 7.97403 3.33055C8.00845 3.3557 8.03743 3.38755 8.05924 3.42418C8.08104 3.46081 8.09522 3.50147 8.10092 3.54372C8.10662 3.58597 8.10372 3.62893 8.0924 3.67003L8.09076 3.67385C8.04801 3.77273 7.97942 3.85827 7.8922 3.9215C7.54146 4.15824 6.71505 4.72118 6.38939 4.92738V5.00756C6.38299 5.02624 6.38407 5.04668 6.39241 5.06458C6.40075 5.08248 6.4157 5.09645 6.43412 5.10357L7.93693 5.64687H7.93584C7.94251 5.64911 7.94955 5.65004 7.95657 5.6496C7.99094 5.6496 8.02039 5.62778 8.03185 5.59669L8.15185 5.26012C8.15815 5.24076 8.157 5.21974 8.14863 5.20118C8.14025 5.18262 8.12526 5.16785 8.10658 5.15975L7.44545 4.92301C7.7111 4.73755 8.16222 4.43971 8.36241 4.26898L8.36459 4.26734C8.50792 4.15133 8.6177 3.99918 8.68261 3.82659C8.72155 3.71726 8.73759 3.60096 8.72863 3.48525C8.71967 3.36954 8.68646 3.25701 8.63115 3.15499C8.57584 3.05296 8.49967 2.96371 8.4076 2.89306C8.31553 2.8224 8.20962 2.77192 8.09676 2.74489L8.10494 2.74707C7.99734 2.7149 7.8856 2.69872 7.77329 2.69907Z" fill={STRIP_COLORS[idx]}/>
<defs>
<linearGradient id="paint0_linear_1_12019" x1="8.24084" y1="0" x2="8.24084" y2="9.27733" gradientUnits="userSpaceOnUse">
<stop stop-color={STRIP_COLORS[idx]}/>
<stop offset="1" stop-color={STRIP_COLORS[idx]}/>
</linearGradient>
</defs>
</svg>

<svg width="12" height="12" viewBox="0 0 12 12" fill={STRIP_COLORS[idx]} xmlns="http://www.w3.org/2000/svg">
<path d="M8.44866 7.16664C8.71011 6.90316 8.85683 6.54702 8.85683 6.17584C8.85683 5.80465 8.71011 5.44851 8.44866 5.18504L6.08716 2.82355L3.72567 5.18504C3.46422 5.44851 3.3175 5.80465 3.3175 6.17584C3.3175 6.54702 3.46422 6.90316 3.72567 7.16664C4.26984 7.71594 5.1169 7.71081 5.6662 7.19744L5.18877 8.47059H6.98556L6.50813 7.19744C7.05743 7.70567 7.91475 7.70054 8.44866 7.16664Z" fill={STRIP_COLORS[idx]}/>
<path d="M10.6091 2.16L9.44179 3.32727C10.0372 4.09118 10.3615 5.03147 10.3636 5.99998C10.3636 7.00907 10.02 7.93089 9.44179 8.6727L10.6091 9.83997C11.4763 8.79816 12 7.4618 12 5.99998C12 4.53817 11.4763 3.20181 10.6091 2.16ZM5.99998 1.63636C7.00907 1.63636 7.93089 1.98 8.6727 2.55818L9.83997 1.39091C8.76295 0.490862 7.40357 -0.00152571 5.99998 3.55147e-06C4.53817 3.55147e-06 3.20181 0.523638 2.16 1.39091L3.32727 2.55818C4.09118 1.96281 5.03147 1.63851 5.99998 1.63636ZM5.99998 10.3636C4.9909 10.3636 4.06908 10.02 3.32727 9.44179L2.16 10.6091C3.20181 11.4763 4.53817 12 5.99998 12C7.4618 12 8.79816 11.4763 9.83997 10.6091L8.6727 9.44179C7.90878 10.0372 6.9685 10.3615 5.99998 10.3636ZM1.63636 5.99998C1.63636 4.9909 1.98 4.06908 2.55818 3.32727L1.39091 2.16C0.490862 3.23702 -0.00152571 4.5964 3.55147e-06 5.99998C3.55147e-06 7.4618 0.523638 8.79816 1.39091 9.83997L2.55818 8.6727C1.96281 7.90878 1.63851 6.9685 1.63636 5.99998Z" fill="#828282"/>
<defs>
<linearGradient id="paint0_linear_1_12022" x1="6.08717" y1="2.82355" x2="6.08717" y2="8.47059" gradientUnits="userSpaceOnUse">
<stop stop-color={STRIP_COLORS[idx]}/>
<stop offset="1" stop-color={STRIP_COLORS[idx]}/>
</linearGradient>
</defs>
</svg>

<svg width="12" height="12" viewBox="0 0 12 12" fill={STRIP_COLORS[idx]} xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M9.31453 0.0454102C9.37139 0.0455262 9.42764 0.0571889 9.47987 0.0796913C9.53209 0.102194 9.5792 0.135067 9.61834 0.176319L11.3076 1.93158L9.61834 3.68575C9.33475 3.98009 9.17704 4.37338 9.17871 4.78211C9.17871 5.21629 9.35107 5.60956 9.6298 5.89047L11.3191 7.64464L7.25381 11.873C7.214 11.9132 7.1666 11.9452 7.11435 11.967C7.06211 11.9888 7.00606 12 6.94945 12C6.89284 12 6.8368 11.9888 6.78455 11.967C6.73231 11.9452 6.68491 11.9132 6.64509 11.873L2.50185 7.56282C2.42038 7.479 2.37496 7.36662 2.37531 7.24973C2.37531 7.12755 2.42385 7.01683 2.50185 6.93719L9.01016 0.176864C9.04932 0.135447 9.0965 0.102434 9.14883 0.0798344C9.20115 0.0572351 9.25753 0.0455225 9.31453 0.0454102ZM5.91364 7.31191C5.88683 7.31318 5.86155 7.32481 5.84314 7.34435C5.82472 7.36388 5.8146 7.3898 5.81492 7.41664C5.81476 7.44257 5.82385 7.46771 5.84055 7.48755L6.70236 8.39955C6.72057 8.41698 6.74479 8.42675 6.77 8.42682C6.796 8.42618 6.82082 8.41578 6.83951 8.39769C6.8582 8.37961 6.86941 8.35515 6.87091 8.32918V7.51646C6.87164 7.46321 6.8513 7.41183 6.81431 7.37352C6.77733 7.3352 6.7267 7.31306 6.67346 7.31191H5.91364ZM6.302 5.42847C6.19291 5.42847 6.1051 5.52011 6.1051 5.63302V6.46319C6.1051 6.57665 6.19291 6.66828 6.302 6.66828H7.322C7.34974 6.67097 7.37666 6.67922 7.40114 6.69255C7.42562 6.70587 7.44716 6.724 7.46448 6.74585C7.48179 6.76769 7.49452 6.79281 7.5019 6.81969C7.50929 6.84657 7.51117 6.87466 7.50745 6.90228V7.93155C7.50745 8.04446 7.59472 8.13664 7.70381 8.13664H8.50344C8.55728 8.13551 8.60856 8.11347 8.64643 8.07519C8.6843 8.03691 8.70579 7.98539 8.70635 7.93155V5.63302C8.70708 5.57977 8.68674 5.52839 8.64975 5.49007C8.61277 5.45176 8.56214 5.42962 8.5089 5.42847H6.302Z" fill={STRIP_COLORS[idx]}/>
<path d="M11.9999 6.94305L10.8392 5.71415L10.2937 5.14797C10.1955 5.04361 10.1409 4.90566 10.141 4.76234C10.141 4.61179 10.1999 4.47543 10.2937 4.37616L11.9835 2.62144V2.63889L11.9999 2.62144V6.94305ZM4.48906 0C4.6647 0 4.82397 0.0747268 4.93961 0.194181L6.28523 1.59217L1.53272 6.52851L0.187097 5.13052C0.0662812 5.00476 -0.000822125 4.8369 7.60392e-06 4.66252C7.60392e-06 4.47925 0.0720071 4.31343 0.187097 4.19398L4.03798 0.194181C4.15307 0.0741814 4.31343 0 4.48906 0Z" fill="#828282"/>
<defs>
<linearGradient id="paint0_linear_1_12025" x1="6.84718" y1="0.0454102" x2="6.84718" y2="12" gradientUnits="userSpaceOnUse">
<stop stop-color={STRIP_COLORS[idx]}/>
<stop offset="1" stop-color={STRIP_COLORS[idx]}/>
</linearGradient>
</defs>
</svg>

                  <span className="text-[14px] font-normal tracking-widest">
                    +4 more
                  </span>
                </div>

                <div className="flex items-center  space-x-2">
                  <div className="w-6 h-6 overflow-hidden border border-gray-700 rounded bg-red-900/30">
                    <img
                      src="images/rare-avatar.jpg"
                      alt="Reward"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <span className=" text-[14px] text-gray-400 font text-nowrap">
                    Rare Avatar
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div      ref={scrollRef} className="w-100 overflow-x-auto scrollbar-hidden bg-rfed-400">
        <div className="mt-6 flex gap-6 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
          {Array.from({ length: 45 }, (_, i) => i + 5).map((i, idx) => (
            <div
              key={i}
              className="flex min-w-[326px] h-[74px] max-w-md overflow-hidden bg-[#0a0b14] bordedrrr border-gray-800ddd rounded group"
            >
              <div
                className={`flex items-center justify-center w-[26px] h-[74px] bg-[linear-gradient(180deg,#5B5B5B_0%,#5B5B5B_100%)]
                 border-r border-gray-800`}
              >
                <span className="font-medium text-sm text-white uppercase transform -rotate-90">
                  {String(idx + 5).padStart(2, "0")}
                </span>
              </div>

              <div className="flex-grow px-4 bg-[#FFFFFF0F]">
                <div className="flex items-center pt-3 justify-between">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-4 h-4 overflow-hidden rounded">
                      <img
                        src="/images/avatar1.jpg"
                        alt="Avatar"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <p className="text-[14px] font-normal tracking-wider text-white ">
                      Samboxer
                    </p>
                    {/* <div className="flex items-center space-x-1.5 mt-0.5">
                      <img src="/images/verified.svg" />
                      <img src="/images/color-star.svg" />
                      <span className="px-1 text-[8px] font-black bg-yellow-400 rounded text-black uppercase leading-tight tracking-wider">
                        Vip
                      </span>
                    </div> */}
                  </div>

                  <div className="flex items-baseline space-x-1">
                    <span className="text-[14px] font-semibold  border-b  leading-none">
                      202
                    </span>
                    <span className="text-[14px] font-semibold   tracking-widest">
                      Wins
                    </span>
                  </div>
                </div>

                <div className="flex items-center pt-2.5 justify-between">
                  <div className="flex items-center space-x-1.5 text-gray-500">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.49468 2.52777C4.58684 2.52792 4.67719 2.55346 4.7558 2.60157C4.83442 2.64968 4.89826 2.71851 4.94034 2.80051L5.05489 3.03726L3.50244 7.70444L3.48553 7.77699C3.4668 7.89404 3.48988 8.01396 3.55072 8.11569C3.61157 8.21743 3.70629 8.2945 3.81828 8.33338L8.0616 9.7571H8.12651L8.12542 9.75928C8.08025 9.83541 8.01469 9.89738 7.93614 9.9382L3.93119 11.9489C3.81257 12.0069 3.67584 12.0159 3.55065 11.9738C3.42546 11.9318 3.3219 11.842 3.26243 11.7241L0.0457044 5.24484L0.0467954 5.24811C-0.00734661 5.13124 -0.0147994 4.99811 0.0259611 4.87593C0.0667215 4.75375 0.152616 4.65175 0.26608 4.5908L4.2743 2.57905L4.27103 2.58014C4.34034 2.54505 4.41699 2.52746 4.49468 2.52777Z" fill="#828282"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.26169 0C7.31623 0 7.36969 0.0087278 7.41551 0.0240014L11.6583 1.43736L11.6627 1.43845C11.7885 1.48196 11.8919 1.57354 11.9504 1.69314C12.0089 1.81275 12.0176 1.95065 11.9747 2.07667L9.68964 8.94215L9.68855 8.94543C9.64456 9.06764 9.5549 9.16804 9.43842 9.22552C9.32195 9.28299 9.18772 9.29307 9.06397 9.25363L4.8201 7.83045L4.81682 7.82936C4.69318 7.78625 4.59129 7.69651 4.53289 7.57931C4.4745 7.46211 4.46422 7.32673 4.50426 7.20205L6.7893 0.336565L6.79039 0.332747C6.82518 0.235539 6.8891 0.151427 6.97344 0.091879C7.05778 0.0323315 7.15844 0.000246839 7.26169 0ZM9.08415 3.66512C9.06676 3.67812 9.05304 3.69541 9.04433 3.71531L8.95869 3.95259V3.95423C8.95869 3.98805 8.98214 4.01587 9.01378 4.02296L9.36453 4.15388L8.75849 5.85907C8.75397 5.86743 8.75172 5.87684 8.75195 5.88634C8.75195 5.91853 8.77377 5.94525 8.80268 5.95398L9.22379 6.10508C9.23119 6.10825 9.2392 6.10974 9.24725 6.10945C9.26218 6.10937 9.2767 6.10458 9.28874 6.09576C9.30079 6.08695 9.30975 6.07456 9.31434 6.06035L10.1811 3.64985C10.1874 3.63124 10.1862 3.61094 10.1779 3.59316C10.1695 3.57539 10.1547 3.5615 10.1364 3.55439L9.79055 3.42893L9.08415 3.66512ZM7.77335 2.69907C7.57607 2.69846 7.38197 2.74882 7.20986 2.84526C7.19296 2.8551 7.18049 2.87106 7.17501 2.88984C7.16953 2.90861 7.17146 2.92878 7.18041 2.94617L7.31569 3.29856C7.3249 3.31731 7.34094 3.33182 7.36052 3.33912C7.38009 3.34642 7.40172 3.34596 7.42097 3.33783L7.41878 3.33947C7.48395 3.30038 7.5563 3.27478 7.63154 3.2642C7.70679 3.25361 7.78339 3.25824 7.85681 3.27783H7.85899C7.90052 3.28747 7.93967 3.3054 7.97409 3.33055C8.00851 3.3557 8.03749 3.38755 8.0593 3.42418C8.0811 3.46081 8.09528 3.50147 8.10098 3.54372C8.10668 3.58597 8.10378 3.62893 8.09246 3.67003L8.09082 3.67385C8.04807 3.77273 7.97948 3.85827 7.89227 3.9215C7.54152 4.15824 6.71511 4.72118 6.38946 4.92738V5.00756C6.38305 5.02624 6.38413 5.04668 6.39247 5.06458C6.40081 5.08248 6.41576 5.09645 6.43418 5.10357L7.937 5.64687H7.9359C7.94257 5.64911 7.94961 5.65004 7.95663 5.6496C7.991 5.6496 8.02045 5.62778 8.03191 5.59669L8.15192 5.26012C8.15821 5.24076 8.15706 5.21974 8.14869 5.20118C8.14031 5.18262 8.12532 5.16785 8.10664 5.15975L7.44551 4.92301C7.71116 4.73755 8.16228 4.43971 8.36247 4.26898L8.36465 4.26734C8.50798 4.15133 8.61776 3.99918 8.68267 3.82659C8.72161 3.71726 8.73766 3.60096 8.72869 3.48525C8.71973 3.36954 8.68652 3.25701 8.63121 3.15499C8.5759 3.05296 8.49973 2.96371 8.40766 2.89306C8.3156 2.8224 8.20969 2.77192 8.09682 2.74489L8.105 2.74707C7.9974 2.7149 7.88566 2.69872 7.77335 2.69907Z" fill="#828282"/>
</svg>

<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.44866 7.16664C8.71011 6.90316 8.85683 6.54702 8.85683 6.17584C8.85683 5.80465 8.71011 5.44851 8.44866 5.18504L6.08716 2.82355L3.72567 5.18504C3.46422 5.44851 3.3175 5.80465 3.3175 6.17584C3.3175 6.54702 3.46422 6.90316 3.72567 7.16664C4.26984 7.71594 5.1169 7.71081 5.6662 7.19744L5.18877 8.47059H6.98556L6.50813 7.19744C7.05743 7.70567 7.91475 7.70054 8.44866 7.16664Z" fill="#828282"/>
<path d="M10.6091 2.16L9.44179 3.32727C10.0372 4.09118 10.3615 5.03147 10.3636 5.99998C10.3636 7.00907 10.02 7.93089 9.44179 8.6727L10.6091 9.83997C11.4763 8.79816 12 7.4618 12 5.99998C12 4.53817 11.4763 3.20181 10.6091 2.16ZM5.99998 1.63636C7.00907 1.63636 7.93089 1.98 8.6727 2.55818L9.83997 1.39091C8.76295 0.490862 7.40357 -0.00152571 5.99998 3.55147e-06C4.53817 3.55147e-06 3.20181 0.523638 2.16 1.39091L3.32727 2.55818C4.09118 1.96281 5.03147 1.63851 5.99998 1.63636ZM5.99998 10.3636C4.9909 10.3636 4.06908 10.02 3.32727 9.44179L2.16 10.6091C3.20181 11.4763 4.53817 12 5.99998 12C7.4618 12 8.79816 11.4763 9.83997 10.6091L8.6727 9.44179C7.90878 10.0372 6.9685 10.3615 5.99998 10.3636ZM1.63636 5.99998C1.63636 4.9909 1.98 4.06908 2.55818 3.32727L1.39091 2.16C0.490862 3.23702 -0.00152571 4.5964 3.55147e-06 5.99998C3.55147e-06 7.4618 0.523638 8.79816 1.39091 9.83997L2.55818 8.6727C1.96281 7.90878 1.63851 6.9685 1.63636 5.99998Z" fill="#828282"/>
</svg>

<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M9.31446 0.0454102C9.37133 0.0455262 9.42758 0.0571889 9.4798 0.0796913C9.53203 0.102194 9.57914 0.135067 9.61828 0.176319L11.3075 1.93158L9.61828 3.68575C9.33469 3.98009 9.17698 4.37338 9.17865 4.78211C9.17865 5.21629 9.35101 5.60956 9.62973 5.89047L11.319 7.64464L7.25375 11.873C7.21394 11.9132 7.16653 11.9452 7.11429 11.967C7.06205 11.9888 7.006 12 6.94939 12C6.89278 12 6.83674 11.9888 6.78449 11.967C6.73225 11.9452 6.68485 11.9132 6.64503 11.873L2.50179 7.56282C2.42032 7.479 2.3749 7.36662 2.37525 7.24973C2.37525 7.12755 2.42379 7.01683 2.50179 6.93719L9.0101 0.176864C9.04926 0.135447 9.09644 0.102434 9.14876 0.0798344C9.20109 0.0572351 9.25747 0.0455225 9.31446 0.0454102ZM5.91358 7.31191C5.88677 7.31318 5.86149 7.32481 5.84307 7.34435C5.82466 7.36388 5.81454 7.3898 5.81486 7.41664C5.8147 7.44257 5.82379 7.46771 5.84049 7.48755L6.7023 8.39955C6.72051 8.41698 6.74473 8.42675 6.76994 8.42682C6.79594 8.42618 6.82075 8.41578 6.83945 8.39769C6.85814 8.37961 6.86935 8.35515 6.87085 8.32918V7.51646C6.87158 7.46321 6.85124 7.41183 6.81425 7.37352C6.77726 7.3352 6.72663 7.31306 6.67339 7.31191H5.91358ZM6.30194 5.42847C6.19285 5.42847 6.10504 5.52011 6.10504 5.63302V6.46319C6.10504 6.57665 6.19285 6.66828 6.30194 6.66828H7.32193C7.34968 6.67097 7.3766 6.67922 7.40108 6.69255C7.42556 6.70587 7.4471 6.724 7.46442 6.74585C7.48173 6.76769 7.49446 6.79281 7.50184 6.81969C7.50922 6.84657 7.51111 6.87466 7.50739 6.90228V7.93155C7.50739 8.04446 7.59466 8.13664 7.70375 8.13664H8.50338C8.55722 8.13551 8.6085 8.11347 8.64637 8.07519C8.68424 8.03691 8.70573 7.98539 8.70629 7.93155V5.63302C8.70702 5.57977 8.68668 5.52839 8.64969 5.49007C8.6127 5.45176 8.56208 5.42962 8.50883 5.42847H6.30194Z" fill="#828282"/>
<path d="M11.9999 6.94305L10.8392 5.71415L10.2937 5.14797C10.1955 5.04361 10.1409 4.90566 10.141 4.76234C10.141 4.61179 10.1999 4.47543 10.2937 4.37616L11.9835 2.62144V2.63889L11.9999 2.62144V6.94305ZM4.48906 0C4.6647 0 4.82397 0.0747268 4.93961 0.194181L6.28523 1.59217L1.53272 6.52851L0.187097 5.13052C0.0662812 5.00476 -0.000822125 4.8369 7.60392e-06 4.66252C7.60392e-06 4.47925 0.0720071 4.31343 0.187097 4.19398L4.03798 0.194181C4.15307 0.0741814 4.31343 0 4.48906 0Z" fill="#828282"/>
</svg>

                    <span className="text-[14px] font-normal tracking-widest">
                      +4 more
                    </span>
                  </div>

                  <div className="flex items-center  space-x-2">
                    <div className="w-6 h-6 overflow-hidden border border-gray-700 rounded bg-red-900/30">
                      <img
                        src="images/rare-avatar.jpg"
                        alt="Reward"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <span className=" text-[14px] text-gray-400 font text-nowrap">
                      Rare Avatar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContestWinnerList;
