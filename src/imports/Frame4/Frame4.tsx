export default function Frame() {
  return (
    <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
      <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-w-px relative" data-name="Tab item/Basic">
        <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.3)] border-b border-solid inset-0 pointer-events-none" />
        <div className="flex-[1_0_0] min-w-px relative" data-name=".Tab">
          <div aria-hidden="true" className="absolute border-0 border-[#40444d] border-solid inset-0 pointer-events-none" />
          <div className="flex flex-row items-center justify-center size-full">
            <div className="content-stretch flex gap-[8px] items-center justify-center px-[12px] py-[8px] relative size-full">
              <p className="[word-break:break-word] font-['Lexend:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#e4e7ec] text-[14px] whitespace-nowrap">Fixtures</p>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-w-px relative" data-name="Tab item/Basic">
        <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.3)] border-b border-solid inset-0 pointer-events-none" />
        <div className="flex-[1_0_0] min-w-px relative" data-name=".Tab">
          <div aria-hidden="true" className="absolute border-[#f2f4f7] border-b-2 border-solid inset-0 pointer-events-none" />
          <div className="flex flex-row items-center justify-center size-full">
            <div className="content-stretch flex gap-[8px] items-center justify-center px-[12px] py-[8px] relative size-full">
              <p className="[word-break:break-word] font-['Lexend:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#fcfcfd] text-[14px] whitespace-nowrap">Standings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}