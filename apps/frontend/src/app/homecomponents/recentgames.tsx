import React from 'react'

const Recentgames = () => {
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

  return (
    <section className="mt-[64px]">
      <div className=" flex items-center gap-[32px]">
        <div className=" flex items-center  overflow-x-auto scrollbar-hidden">
          {games?.slice(0, 7)?.map((g, i) => (
            <div
              key={i}
              className="group relative w-[147px] h-[187px] flex-shrink-0 p-[12px]"
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
      
    "
                />

                <div className=" absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 " />

                {/* TOP - 1px Blur */}
                <img
                  src={g.image}
                  alt=""
                  className="
      absolute inset-0 h-full w-full object-cover
      opacity-0 group-hover:opacity-100
      transition-all duration-300
      blur-[1px]
      [mask-image:linear-gradient(to_bottom,black_0%,black_33%,transparent_33%)]
    "
                />

                {/* MIDDLE - 2px Blur */}
                <img
                  src={g.image}
                  alt=""
                  className="
      absolute inset-0 h-full w-full object-cover
      opacity-0 group-hover:opacity-100
      transition-all duration-300
      blur-[2px]
      [mask-image:linear-gradient(to_bottom,transparent_33%,black_33%,black_66%,transparent_66%)]
    "
                />

                {/* BOTTOM - 3px Blur */}
                <img
                  src={g.image}
                  alt=""
                  className="
      absolute inset-0 h-full w-full object-cover
      opacity-0 group-hover:opacity-100
      transition-all duration-300
      blur-[3px]
      [mask-image:linear-gradient(to_bottom,transparent_66%,black_66%,black_100%)]
    "
                />
              </div>

              {/* CONTINUE BUTTON */}
              <button
                className="
    absolute left-[29px] top-[118px]
    w-[88px] h-[29px]
    flex items-center justify-center gap-[6px]
    rounded bg-[#FF4500]
     text-white
    opacity-0 group-hover:opacity-100
    transition-all duration-300
    font-normal text-sm
  "
              >
                <svg width="7" height="9" viewBox="0 0 7 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M1.73139 0.41445C1.73656 0.417991 1.74174 0.421543 1.74694 0.425106L6.30581 3.54889C6.43772 3.63925 6.56003 3.72304 6.65396 3.80091C6.75199 3.88216 6.86756 3.99484 6.93407 4.15969C7.02198 4.37757 7.02198 4.62243 6.93407 4.84031C6.86756 5.00516 6.75199 5.11784 6.65396 5.19909C6.56004 5.27695 6.43774 5.36074 6.30584 5.4511L1.7314 8.58554C1.57017 8.69604 1.42518 8.7954 1.30216 8.86392C1.17905 8.9325 1.01006 9.01086 0.812831 8.99875C0.560548 8.98327 0.327497 8.85508 0.175023 8.64792C0.0558196 8.48596 0.0255196 8.29798 0.0127432 8.15466C-2.39523e-05 8.01144 -1.22056e-05 7.83234 8.28673e-07 7.63317L1.65298e-06 1.38604C1.65298e-06 1.37962 1.24083e-06 1.37322 8.28673e-07 1.36683C-1.22056e-05 1.16766 -2.39523e-05 0.988562 0.0127432 0.845344C0.0255196 0.702023 0.0558196 0.514042 0.175023 0.352085C0.327497 0.144923 0.560548 0.0167286 0.812831 0.00124642C1.01006 -0.0108575 1.17905 0.0675029 1.30216 0.136077C1.42518 0.204602 1.57016 0.303957 1.73139 0.41445Z" fill="white" />
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
                <svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.3778 0.5C12.8433 0.5 14.5 2.735 14.5 4.82C14.5 9.0425 7.62444 12.5 7.5 12.5C7.37556 12.5 0.5 9.0425 0.5 4.82C0.5 2.735 2.15667 0.5 4.62222 0.5C6.03778 0.5 6.96333 1.1825 7.5 1.7825C8.03667 1.1825 8.96222 0.5 10.3778 0.5Z" stroke="#CECECE" stroke-linecap="round" stroke-linejoin="round" />
                </svg>

              </div>
            </div>
          ))}
        </div>

        <div className="w-[339px] h-[163px] rounded bg-[#FFFFFF0F] px-[24px] py-[18px] shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between flex-row p-0 gap-[16px] w-[291px] h-[17px]">
            <span className="text-sm font-medium text-white">
              Boom Balloon
            </span>




            <div className="flex items-center gap-2 text-[#CFCFE6]">
              <img src="/images/users.svg" alt="users" />
              <span className="text-xs underline underline-offset-1">
                58.8K
              </span>
            </div>
          </div>

          {/* Description */}



          <p className="mt-[24px] text-xs text-[#B8B8B8] font-thin w-[291px] h-[42px]" style={{ lineHeight: "14px", letterSpacing: "0.08em" }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
            enim ad minim veniam, quis n...
            <span className="ml-1 cursor-pointer text-[#FF9169] underline">
              see more
            </span>
          </p>

          {/* Footer Button */}



          <button className="flex mt-[24px] w-[109px] h-[20px] text-xs items-center gap-[6px] rounded-[3px] bg-[#FF4500] px-[3px] py-[6px] font-semibold text-white hover:opacity-90">
            <img src="/images/whitestar.svg" alt="star" />
            ORBEIT Originals
          </button>



        </div>
      </div>

      <div className="text-xs relative left-[12px] top-[6px] tracking-[0.08em] text-[#5B5B79]">
        Recently Played
      </div>
    </section>

  )
}

export default Recentgames
