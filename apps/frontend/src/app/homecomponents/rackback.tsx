// import '/rackback.css'
interface BadgeData {
  id: string;
  label: string;
  icon?: string;
  isActive: boolean;
  gradient?: boolean;
}

interface StatData {
  id: string;
  icon: string;
  value: string;
  hasTooltip: boolean;
  changeIcon?: string;
  changeValue?: string;
  changeType?: "positive" | "negative";
}

export const Rakeback = (): JSX.Element => {
  const badges: BadgeData[] = [
    {
      id: "premium",
      label: "Premium",
    //   icon: icon,
      isActive: true,
      gradient: true,
    },
    {
      id: "vip",
      label: "VIP",
    //   icon: vector,
      isActive: false,
      gradient: false,
    },
  ];

  const stats: StatData[] = [
    {
      id: "percentage",
      icon: "solid",
      value: "9.01%",
      hasTooltip: true,
    },
    {
      id: "change",
      icon: "",
      value: "",
      hasTooltip: false,
    //   changeIcon: image,
      changeValue: "18.6%",
      changeType: "positive",
    },
  ];

  const cardDescription =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.";
  const footerLabel = "House Edge";

  return (
    <article className="flex flex-col w-[385px] items-start gap-1.5 relative">
      <section className="relative w-[385px] h-[85px]">
        <div
          className="absolute top-[27px] left-[38px] w-[3px] h-[3px] bg-[#d9d9d9] rounded shadow-[0px_0px_64px_12px_#ffa701]"
          aria-hidden="true"
        />

        <div className="flex flex-col w-[385px] items-start gap-1.5 p-3 absolute top-0 left-0 rounded overflow-hidden border border-solid border-[#31313f]">
          <header className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
            <div
              className="inline-flex items-center gap-3 p-1.5 relative flex-[0_0_auto] rounded overflow-hidden bg-[linear-gradient(148deg,rgba(255,229,0,0.06)_0%,rgba(255,106,0,0.06)_100%)]"
              role="group"
              aria-label="Membership badges"
            >
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`inline-flex items-center gap-1.5 ${
                    badge.id === "premium" ? "px-3 py-1.5" : "px-[9px] py-1.5"
                  } relative flex-[0_0_auto] ${
                    badge.isActive ? "bg-[#ffffff0f]" : ""
                  } rounded`}
                  role="status"
                  aria-label={`${badge.label} ${
                    badge.isActive ? "active" : "inactive"
                  }`}
                >
                  {badge.id === "premium" && badge.icon && (
                    <div className="relative w-3.5 h-3.5 rounded-[7px] aspect-[1] bg-[linear-gradient(148deg,rgba(255,229,0,1)_0%,rgba(255,106,0,1)_100%)]">
                      <img
                        className="absolute w-[73.33%] top-[calc(50.00%_-_5px)] left-[13.33%] h-2.5 aspect-[1]"
                        alt=""
                        src={badge.icon}
                        aria-hidden="true"
                      />
                    </div>
                  )}

                  {badge.id === "vip" && badge.icon && (
                    <img
                      className="relative w-[14.07px] h-[10.27px] aspect-[1.37]"
                      alt=""
                      src={badge.icon}
                      aria-hidden="true"
                    />
                  )}

                  <span
                    className={`relative w-fit mt-[-1.00px]  font-normal ${
                      badge.isActive ? "text-white" : "text-[#818181]"
                    } text-sm tracking-[1.12px] leading-[normal]`}
                  >
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="inline-flex items-center gap-4 relative flex-[0_0_auto]"
              role="group"
              aria-label="Statistics"
            >
              {stats.map((stat) => {
                if (stat.id === "percentage") {
                  return (
                    <div
                      key={stat.id}
                      className="inline-flex items-center gap-1.5 relative flex-[0_0_auto]"
                    >
                      <img
                        className="relative w-4 h-4"
                        alt=""
                        src={stat.icon}
                        aria-hidden="true"
                      />

                      <div
                        className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto] mt-[-1.00px] mb-[-1.00px] mr-[-1.00px] border-b [border-bottom-style:dashed] border-[#818181]"
                        role="tooltip"
                        aria-label="Percentage value with additional information"
                      >
                        <span className="relative w-fit  font-semibold text-white text-sm tracking-[1.12px] leading-[normal]">
                          {stat.value}
                        </span>
                      </div>
                    </div>
                  );
                }

                if (
                  stat.id === "change" &&
                  stat.changeIcon &&
                  stat.changeValue
                ) {
                  return (
                    <div
                      key={stat.id}
                      className={`inline-flex items-center gap-1 px-[3px] py-0 relative flex-[0_0_auto] ${
                        stat.changeType === "positive"
                          ? "bg-[#24a654]"
                          : "bg-[#d32f2f]"
                      } rounded-[3px]`}
                      role="status"
                      aria-label={`${stat.changeType === "positive" ? "Positive" : "Negative"} change of ${stat.changeValue}`}
                    >
                      <img
                        className="relative w-1.5 h-[5px] aspect-[1.29]"
                        alt=""
                        src={stat.changeIcon}
                        aria-hidden="true"
                      />

                      <span className="relative w-fit mt-[-1.00px]  font-normal text-white text-sm tracking-[1.12px] leading-[normal]">
                        {stat.changeValue}
                      </span>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </header>

          <p className="relative self-stretch font-light text-[#818181] text-xs tracking-[0.96px] leading-[normal]">
            {cardDescription}
          </p>
        </div>
      </section>

      <footer className="relative self-stretch  font-normal text-[#5b5b79] text-xs tracking-[0.96px] leading-[normal]">
        {footerLabel}
      </footer>
    </article>
  );
};
