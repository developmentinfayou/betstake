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

  )
}

export default Recentgames
