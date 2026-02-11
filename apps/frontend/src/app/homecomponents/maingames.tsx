import React from 'react'
import TrendingText from './trendingtext';
import Link from 'next/link';

const Maingames = () => {

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
  )
}

export default Maingames