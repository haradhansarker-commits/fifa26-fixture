function Text() {
  return (
    <div className="h-[21px] relative shrink-0 w-[37.545px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Lexend:SemiBold',sans-serif] font-semibold leading-[21px] left-0 text-[14px] text-white top-[-0.78px] whitespace-nowrap">15:00</p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[17.998px] relative shrink-0 w-[33.356px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Lexend:Regular',sans-serif] font-normal leading-[18px] left-0 text-[#d0d5dd] text-[12px] top-[-0.78px] whitespace-nowrap">Grp A</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[42.996px] relative shrink-0 w-[51.994px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.997px] items-center justify-center relative size-full">
        <Text />
        <Text1 />
      </div>
    </div>
  );
}

function Container2() {
  return <div className="bg-[#40444d] h-full relative shrink-0 w-[0.995px]" data-name="Container" />;
}

function Container4() {
  return (
    <div className="bg-[#40444d] relative rounded-[20536500px] shrink-0 size-[27.991px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="[word-break:break-word] font-['Lexend:SemiBold',sans-serif] font-semibold leading-[15px] relative shrink-0 text-[10px] text-white whitespace-nowrap">MEX</p>
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[21px] relative shrink-0 w-[48.791px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="[word-break:break-word] absolute font-['Lexend:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-white top-[-0.78px] whitespace-nowrap">Mexico</p>
      </div>
    </div>
  );
}

function TeamRow() {
  return (
    <div className="h-[27.991px] relative shrink-0 w-[197.946px]" data-name="TeamRow">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.992px] items-center relative size-full">
        <Container4 />
        <Text2 />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-[#40444d] relative rounded-[20536500px] shrink-0 size-[27.991px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="[word-break:break-word] font-['Lexend:SemiBold',sans-serif] font-semibold leading-[15px] relative shrink-0 text-[10px] text-white whitespace-nowrap">KOR</p>
      </div>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[21px] relative shrink-0 w-[85.436px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="[word-break:break-word] absolute font-['Lexend:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-white top-[-0.78px] whitespace-nowrap">South Korea</p>
      </div>
    </div>
  );
}

function TeamRow1() {
  return (
    <div className="h-[27.991px] relative shrink-0 w-[197.946px]" data-name="TeamRow">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.992px] items-center relative size-full">
        <Container5 />
        <Text3 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="flex-[197.946_0_0] h-[63.977px] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[7.995px] items-start relative size-full">
        <TeamRow />
        <TeamRow1 />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[17.998px] relative shrink-0 w-[10.414px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Lexend:Regular',sans-serif] font-normal leading-[18px] left-0 text-[#d0d5dd] text-[12px] top-[-0.78px] whitespace-nowrap">—</p>
      </div>
    </div>
  );
}

function MatchRow() {
  return (
    <div className="absolute content-stretch flex gap-[15.999px] h-[95.975px] items-center left-0 p-[15.999px] top-0 w-[341.344px]" data-name="MatchRow">
      <Container1 />
      <Container2 />
      <Container3 />
      <Container6 />
    </div>
  );
}

function Container7() {
  return <div className="absolute bg-[#40444d] h-[0.995px] left-[16px] top-[95.97px] w-[309.346px]" data-name="Container" />;
}

function Text4() {
  return (
    <div className="h-[21px] relative shrink-0 w-[37.286px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Lexend:SemiBold',sans-serif] font-semibold leading-[21px] left-0 text-[14px] text-white top-[-0.78px] whitespace-nowrap">19:00</p>
      </div>
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[17.998px] relative shrink-0 w-[33.126px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Lexend:Regular',sans-serif] font-normal leading-[18px] left-0 text-[#d0d5dd] text-[12px] top-[-0.78px] whitespace-nowrap">Grp B</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[42.996px] relative shrink-0 w-[51.994px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.997px] items-center justify-center relative size-full">
        <Text4 />
        <Text5 />
      </div>
    </div>
  );
}

function Container9() {
  return <div className="bg-[#40444d] h-full relative shrink-0 w-[0.995px]" data-name="Container" />;
}

function Container11() {
  return (
    <div className="bg-[#40444d] relative rounded-[20536500px] shrink-0 size-[27.991px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="[word-break:break-word] font-['Lexend:SemiBold',sans-serif] font-semibold leading-[15px] relative shrink-0 text-[10px] text-white whitespace-nowrap">USA</p>
      </div>
    </div>
  );
}

function Text6() {
  return (
    <div className="h-[21px] relative shrink-0 w-[28.9px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="[word-break:break-word] absolute font-['Lexend:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-white top-[-0.78px] whitespace-nowrap">USA</p>
      </div>
    </div>
  );
}

function TeamRow2() {
  return (
    <div className="h-[27.991px] relative shrink-0 w-[197.946px]" data-name="TeamRow">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.992px] items-center relative size-full">
        <Container11 />
        <Text6 />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="bg-[#40444d] relative rounded-[20536500px] shrink-0 size-[27.991px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="[word-break:break-word] font-['Lexend:SemiBold',sans-serif] font-semibold leading-[15px] relative shrink-0 text-[10px] text-white whitespace-nowrap">FRA</p>
      </div>
    </div>
  );
}

function Text7() {
  return (
    <div className="h-[21px] relative shrink-0 w-[47.232px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="[word-break:break-word] absolute font-['Lexend:Medium',sans-serif] font-medium leading-[21px] left-0 text-[14px] text-white top-[-0.78px] whitespace-nowrap">France</p>
      </div>
    </div>
  );
}

function TeamRow3() {
  return (
    <div className="h-[27.991px] relative shrink-0 w-[197.946px]" data-name="TeamRow">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.992px] items-center relative size-full">
        <Container12 />
        <Text7 />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="flex-[197.946_0_0] h-[63.977px] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[7.995px] items-start relative size-full">
        <TeamRow2 />
        <TeamRow3 />
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[17.998px] relative shrink-0 w-[10.414px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Lexend:Regular',sans-serif] font-normal leading-[18px] left-0 text-[#d0d5dd] text-[12px] top-[-0.78px] whitespace-nowrap">—</p>
      </div>
    </div>
  );
}

function MatchRow1() {
  return (
    <div className="absolute content-stretch flex gap-[15.999px] h-[95.975px] items-center left-0 p-[15.999px] top-[96.97px] w-[341.344px]" data-name="MatchRow">
      <Container8 />
      <Container9 />
      <Container10 />
      <Container13 />
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[#1d1f23] border-[#40444d] border-[0.612px] border-solid overflow-clip relative rounded-[8px] size-full" data-name="Container">
      <MatchRow />
      <Container7 />
      <MatchRow1 />
    </div>
  );
}