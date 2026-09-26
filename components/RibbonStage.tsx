import Image from "next/image";

const ribbons = [
  { name: "yellow", src: "/ribbons/ribbon-yellow.svg" },
  { name: "blue", src: "/ribbons/ribbon-blue.svg" },
  { name: "teal", src: "/ribbons/ribbon-teal.svg" },
  { name: "red", src: "/ribbons/ribbon-red.svg" },
  { name: "crazy-good", src: "/ribbons/ribbon-crazy-good.svg" },
] as const;

export function RibbonStage() {
  return (
    <div className="ribbon-stage" aria-hidden="true">
      {ribbons.map((ribbon) => (
        <div
          className={`ribbon ribbon--${ribbon.name}`}
          key={ribbon.name}
        >
          <Image
            src={ribbon.src}
            alt=""
            width={3788}
            height={144}
            sizes="(max-width: 639px) 260vw, (max-width: 1023px) 200vw, 170vw"
            priority
            draggable="false"
          />
        </div>
      ))}
    </div>
  );
}
