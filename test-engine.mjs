import { instantAnalyze, extractUrls } from "./shield-engine.js";
const cases = [
  ["http://sbi-kyc-verify.tk/update?account=blocked", "scam"],
  ["https://www.onlinesbi.com", "safe"],
  ["CONGRATS! You won Rs.500000 lottery, pay Rs.2000 fee to claim: http://bit.ly/x", "scam"],
  ["https://www.google.com", "safe"],
  ["http://hdfc-netbanking-secure.top/login", "scam"],
  ["https://www.icicibank.com", "safe"],
  ["https://paypalsecurity.com/login", "scam"],
  ["https://whatsapp-gift-claim-verify.top/free", "scam"],
  ["https://www.whatsapp.com", "safe"],
  ["https://this-link-definitely-does-not-exist-xyz12345.com/login", null], // dead decided by live DNS, instant may say suspicious/scam
];
let fail = 0;
for (const [input, want] of cases) {
  const r = instantAnalyze(input);
  const okMs = r.ms < 50;
  const okVerdict = want === null ? true : r.verdict === want || (want === "scam" && r.verdict === "suspicious");
  console.log((okVerdict && okMs ? "PASS" : "FAIL"), JSON.stringify(input.slice(0, 50)), "->", r.verdict, r.score, r.ms + "ms", "|", (r.hits[0] || "no-hit"));
  if (!(okVerdict && okMs)) fail++;
}
// typing simulation: partial URL must still be fast
const t0 = Date.now();
for (let i = 0; i < 50; i++) instantAnalyze("http://sbi-kyc-verify.tk/upd");
console.log("typing x50:", Date.now() - t0 + "ms total");
console.log("extractUrls:", extractUrls("see https://evil.tk/a and www.google.com hi"));
if (fail) { console.error(fail + " FAILURES"); process.exit(1); }
console.log("ALL ENGINE TESTS PASS");
