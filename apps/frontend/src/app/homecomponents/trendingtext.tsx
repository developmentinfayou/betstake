import { useEffect, useState } from "react";

export default function TrendingText() {
 




const text = ["T", "R", "E", "N", "D", "I", "N", "G"];


  const positions = [
    { top: "50%", left: "5%", width: "3px", height: "1rem" },
    { top: "38%", left: "5%", width: "3px", height: "1rem" },
    { top: "37%", left: "5%", width: "11px", height: "2px" },
    { top: "29%", left: "8%", width: "2px", height: "9px" },
    { top: "29%", left: "4%", width: "12px", height: "2px" },
    { top: "29%", left: "1%", width: "12px", height: "2px" },
    { top: "29%", left: "0%", width: "3px", height: "9px" },
    { top: "36%", left: "0%", width: "3px", height: "3px" },
    { top: "36%", left: "0%", width: "11px", height: "3px" },
    { top: "36%", left: "2.5%", width: "3px", height: "3px" },
    { top: "40%", left: "2.5%", width: "3px", height: "3px" },
    { top: "46%", left: "2.5%", width: "3px", height: "3px" },
    { top: "50%", left: "2.5%", width: "3px", height: "3px" },
    { top: "54%", left: "2.5%", width: "3px", height: "3px" },
    { top: "58%", left: "2.5%", width: "3px", height: "3px" },
    { top: "62%", left: "2.5%", width: "3px", height: "3px" },
    { top: "63%", left: "2.5%", width: "3px", height: "3px" },
    { top: "64%", left: "2.5%", width: "3px", height: "3px" },
    { top: "65%", left: "2.5%", width: "3px", height: "3px" },
    { top: "66%", left: "2.5%", width: "3px", height: "3px" },
    { top: "67%", left: "2.5%", width: "3px", height: "3px" },
    { top: "68%", left: "2.5%", width: "3px", height: "3px" },
    { top: "69%", left: "2.5%", width: "3px", height: "3px" },
    { top: "70%", left: "2.5%", width: "3px", height: "3px" },
    { top: "71%", left: "2.5%", width: "3px", height: "3px" },
    { top: "72%", left: "2.5%", width: "3px", height: "3px" },
    { top: "73%", left: "2.5%", width: "3px", height: "3px" },
    { top: "74%", left: "2.5%", width: "3px", height: "3px" },
    { top: "74%", left: "3%", width: "3px", height: "3px" },
    { top: "74%", left: "3.5%", width: "3px", height: "3px" },
    { top: "74%", left: "4%", width: "3px", height: "3px" },
    { top: "74%", left: "4.5%", width: "3px", height: "3px" },
    { top: "74%", left: "5%", width: "3px", height: "3px" },
    { top: "73%", left: "5%", width: "3px", height: "3px" },
    { top: "72%", left: "5%", width: "3px", height: "3px" },
    { top: "71%", left: "5%", width: "3px", height: "3px" },
    { top: "70%", left: "5%", width: "3px", height: "3px" },
    { top: "69%", left: "5%", width: "3px", height: "3px" },
    { top: "68%", left: "5%", width: "3px", height: "3px" },
    { top: "67%", left: "5%", width: "3px", height: "3px" },
    { top: "66%", left: "5%", width: "3px", height: "3px" },
    { top: "65%", left: "5%", width: "3px", height: "3px" },
    { top: "64%", left: "5%", width: "3px", height: "3px" },
    { top: "63%", left: "5%", width: "3px", height: "3px" },
    { top: "62%", left: "5%", width: "3px", height: "3px" },
    { top: "61%", left: "5%", width: "3px", height: "3px" },


   
  ];
  const [beamIndex, setBeamIndex] = useState(0);
  const [filledCount, setFilledCount] = useState(0);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBeamIndex((prev) => {
        const next = prev + 1;
  
        // cycle complete
        if (next == positions.length) {
          
          setFilledCount((c) =>
            c == text.length ? 0 : c + 1
          );
          return 0;
        }

         // if (filledCount == text.length) {
        //   setFilledCount(0);
        // }
  
       
        return next;


        
      });
    }, 100);
  
    return () => clearInterval(interval);
  }, []);
  

  return (
    <div className="">
    <div
  style={{
    letterSpacing: "7px",
    WebkitTextStroke: "1px #31313F",
    fontWeight: 900,
  }}
  className="relative text-[5rem] text-transparent"
>
  {text.map((char, i) => (
    <span
      key={i}
      className="transition-colors duration-300"
      style={{
        color: i < filledCount ? "#FFFFFF0F" : "",
      }}
    >
      {char}
    </span>
  ))}

  <span
    className="beam-dot absolute"
    style={positions[beamIndex]}
  />
</div>

    </div>
  );
}
