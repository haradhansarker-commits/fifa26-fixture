const isoByFifa: Record<string, string> = {
  MEX: "mx",
  KOR: "kr",
  USA: "us",
  FRA: "fr",
  CAN: "ca",
  GER: "de",
  BRA: "br",
  ENG: "gb-eng",
  ITA: "it",
  NGA: "ng",
  JPN: "jp",
  AUS: "au",
  ARG: "ar",
  ESP: "es",
  POR: "pt",
  BEL: "be",
  COL: "co",
  MAR: "ma",
  URU: "uy",
  SEN: "sn",
  NED: "nl",
  CRO: "hr",
  SUI: "ch",
  DEN: "dk",
  RSA: "za",
  CZE: "cz",
};

export function flagUrl(code: string, width = 80): string {
  const iso = isoByFifa[code] ?? code.slice(0, 2).toLowerCase();
  return `https://flagcdn.com/w${width}/${iso}.png`;
}
