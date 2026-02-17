"use client";

import { useParams, usePathname } from "next/navigation";
import BetPad from "../bettingpad/BetPad";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const slug = pathname.split("/")[2];

  console.log(slug, "slug");

  return (
    <>
    {/* <h1 className="bg-red-400"> Header</h1> */}


    <div className="bg-gray-900" style={{ display: "flex" }}>

      {/* LEFT SIDE */}
      <div className="pl-3 " style={{ width: "520px" , marginTop:"35px"  }}>
        {/* <h2>Betting Pad</h2>x */}

        { <BetPad />}
        {/* {slug === "dice" && <div>Dice Controls</div>} */}
      </div>

      {/* RIGHT SIDE */}
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
    </>
  );
}
