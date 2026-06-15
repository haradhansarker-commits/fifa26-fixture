import svgPaths from "./svg-btkdiabbvj";

function VuesaxLinearArrowLeft() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/arrow-left">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="arrow-left">
          <path d={svgPaths.p2a5cd480} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
          <g id="Vector_2" opacity="0" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute content-stretch flex items-center left-0 px-[24px] py-[8px] top-0 w-[393px]">
      <div className="relative shrink-0 size-[24px]" data-name="vuesax/linear/arrow-left">
        <VuesaxLinearArrowLeft />
      </div>
    </div>
  );
}

export default function Frame1() {
  return (
    <div className="relative size-full">
      <Frame />
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Lexend:Bold',sans-serif] font-bold justify-center leading-[0] left-[24px] text-[28px] text-white top-[66px] w-[345px]">
        <p className="leading-[36px]">FIFA World Cup 2026™</p>
      </div>
    </div>
  );
}