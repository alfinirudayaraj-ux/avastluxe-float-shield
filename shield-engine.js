/* AvastLuxe Float Shield — shared instant engine (page + SW + tests) */
const URL_RULES = [
  { re: /(^|[^a-z0-9])(bit\.ly|tinyurl\.com|t\.co|goo\.gl|rebrand\.ly|cutt\.ly|is\.gd|s\.id|ow\.ly|buff\.ly|rb\.gy|tiny\.cc|shorturl\.at|wa\.me|jio\.sh)([^a-z0-9]|$)/i, w: 22, label: "URL shortener hides the final destination" },
  { re: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, w: 25, label: "Raw IP host — no legitimate brand uses this" },
  { re: /https?:\/\/[^\s]*@/i, w: 30, label: "'@' trick — browser ignores everything before @" },
  { re: /[а-яё]|xn--/i, w: 30, label: "Lookalike domain (IDN/punycode homoglyph)" },
  { re: /(hdfc|sbi|icici|axis|paytm|phonepe|amazon|flipkart|apple|microsoft|netflix|paypal|whatsapp|instagram|facebook|google)[-_.]?[a-z0-9]*\.(xyz|top|shop|click|loan|tk|ml|ga|gq|cf|buzz|store|online|sbs|site|live)/i, w: 35, label: "Famous brand on a suspicious cheap domain" },
  { re: /(login|secure|security|verify|update|banking|wallet|alert|kyc|support|account|auth|confirm|netbank|portal|signin|password|otp)[a-z0-9-]*\.[a-z]{2,}/i, w: 22, label: "Domain imitates a login/security page" },
  { re: /https?:\/\/(?!(www\.)?(google|youtube|github|microsoft|apple|amazon)\.com)[\w-]+\.(xyz|top|click|shop|tk|ml|ga|gq|cf|buzz|loan)/i, w: 32, label: "High-risk TLD (xyz/top/click/tk…)" },
];
const MSG_RULES = [
  { re: /prize|won|winner|congratulat|lottery|gift card|reward points|spin (to|and) win|free iphone|free gift/i, w: 25, label: "Claims an unbelievable prize or reward" },
  { re: /pay\s*(rs|₹|\$|fee|deposit|registration|advance)|registration fee|processing fee|claim.*fee|refundable deposit/i, w: 30, label: "Advance-fee demand (pay to receive money)" },
  { re: /urgent|immediately|within 24|last (day|chance|warning)|account (blocked|suspended|deactivated|locked)|verify now|act now|final notice/i, w: 20, label: "Urgency / threats to rush you" },
  { re: /otp|pin number|\bcvv\b|password|login credentials|verify your account|share (your|the) (otp|code)/i, w: 30, label: "Asks for OTP / password / code" },
  { re: /kyc|pan\s*(card)?\s*link|aadhaar\s*update|rbi\s*notice|income\s*tax\s*refund|electricity\s*(bill|disconnection)|cibil/i, w: 22, label: "Impersonates KYC / RBI / tax / utility authority" },
  { re: /guaranteed return|double your money|\b10x\b|pump group|earn\s*\d+.*\/\s*day|part.?time job.*\d{4,}|like (videos?|youtube).*(earn|rs)/i, w: 30, label: "Fake job / guaranteed-returns lure" },
  { re: /parcel|customs (duty|fee)|courier.*held|delivery failed.*fee|package.*pay/i, w: 25, label: "Fake parcel / customs-fee scam" },
  { re: /qr.*scan.*(receive|refund)|upi.*(collect|request)|send ₹?1 (to verify|for verification)/i, w: 30, label: "UPI/QR reversal trick (paying disguised as receiving)" },
  { re: /click this link to (claim|get|verify)|claim.*(reward|cashback|offer).*link/i, w: 22, label: "Classic bait-to-link phrasing" },
];
const TRUSTED = ["google.com","youtube.com","github.com","microsoft.com","apple.com","amazon.in","amazon.com","hdfcbank.com","icicibank.com","axisbank.com","kotak.com","sbi.co.in","onlinesbi.com","paypal.com","netflix.com","phonepe.com","paytm.com","npci.org.in","cybercrime.gov.in","reddit.com","whatsapp.com","facebook.com","instagram.com","flipkart.com","irctc.co.in"];
const BRANDS = [
  { pat: /icici/i, name: "ICICI Bank", official: ["icicibank.com"] },
  { pat: /hdfc/i, name: "HDFC Bank", official: ["hdfcbank.com"] },
  { pat: /(^|[^a-z])sbi([^a-z]|$)/i, name: "SBI", official: ["onlinesbi.com","sbi.co.in"] },
  { pat: /(^|[^a-z])axis([^a-z]|$)/i, name: "Axis Bank", official: ["axisbank.com"] },
  { pat: /kotak/i, name: "Kotak Bank", official: ["kotak.com"] },
  { pat: /(^|[^a-z])pnb([^a-z]|$)/i, name: "PNB", official: ["pnb.co.in"] },
  { pat: /bankofbaroda|(^|[^a-z])bob([^a-z]|$)/i, name: "Bank of Baroda", official: ["bankofbaroda.in"] },
  { pat: /canara/i, name: "Canara Bank", official: ["canarabank.com"] },
  { pat: /paytm/i, name: "Paytm", official: ["paytm.com"] },
  { pat: /phonepe/i, name: "PhonePe", official: ["phonepe.com"] },
  { pat: /paypal/i, name: "PayPal", official: ["paypal.com"] },
  { pat: /amazon/i, name: "Amazon", official: ["amazon.com","amazon.in"] },
  { pat: /flipkart/i, name: "Flipkart", official: ["flipkart.com"] },
  { pat: /(^|[^a-z])apple([^a-z]|$)/i, name: "Apple", official: ["apple.com","icloud.com"] },
  { pat: /microsoft|outlook|office365/i, name: "Microsoft", official: ["microsoft.com","office.com","outlook.com"] },
  { pat: /netflix/i, name: "Netflix", official: ["netflix.com"] },
  { pat: /instagram/i, name: "Instagram", official: ["instagram.com"] },
  { pat: /facebook|(^|[^a-z0-9])fb([^a-z0-9]|$)/i, name: "Facebook", official: ["facebook.com"] },
  { pat: /telegram/i, name: "Telegram", official: ["telegram.org"] },
  { pat: /binance/i, name: "Binance", official: ["binance.com"] },
  { pat: /zerodha/i, name: "Zerodha", official: ["zerodha.com"] },
  { pat: /groww/i, name: "Groww", official: ["groww.in"] },
  { pat: /irctc/i, name: "IRCTC", official: ["irctc.co.in"] },
  { pat: /(^|[^a-z])jio([^a-z]|$)/i, name: "Jio", official: ["jio.com"] },
  { pat: /airtel/i, name: "Airtel", official: ["airtel.in"] },
  { pat: /(^|[^a-z])dhl([^a-z]|$)/i, name: "DHL", official: ["dhl.com"] },
  { pat: /whatsapp/i, name: "WhatsApp", official: ["whatsapp.com","whatsapp.net"] },
  { pat: /google/i, name: "Google", official: ["google.com","google.co.in","googleapis.com"] },
  { pat: /youtube|youtu\.be/i, name: "YouTube", official: ["youtube.com","youtu.be"] },
  { pat: /swiggy/i, name: "Swiggy", official: ["swiggy.com"] },
  { pat: /zomato/i, name: "Zomato", official: ["zomato.com"] },
  { pat: /(^|[^a-z])uber([^a-z]|$)/i, name: "Uber", official: ["uber.com"] },
  { pat: /(^|[^a-z])ola([^a-z]|$)|olacabs/i, name: "Ola", official: ["olacabs.com"] },
  { pat: /linkedin/i, name: "LinkedIn", official: ["linkedin.com"] },
];
const RISKY_TLDS = /^(io|xyz|top|tk|ml|ga|gq|cf|buzz|sbs|loan|click|shop|store|online|site|live|vip|rest)$/;
const OFFICIALS = [...new Set(TRUSTED.concat(BRANDS.flatMap(b => b.official)))];

function lev(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = new Array(n + 1), cur = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const c = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + c);
    }
    const t = prev; prev = cur; cur = t;
  }
  return prev[n];
}
function brandCheck(uh, path) {
  const b = BRANDS.find(x => x.pat.test(uh + " " + (path || "")));
  if (!b) return null;
  return { b, home: b.official.some(o => uh === o || uh.endsWith("." + o)) };
}
function extractUrls(text) {
  if (!text) return [];
  const out = [];
  for (const m of (String(text).match(/https?:\/\/[^\s"'<>)\]]+/gi) || [])) {
    try { const u = new URL(m.replace(/[.,;!?]+$/, "")); out.push(u.href); } catch {}
  }
  for (const m of (String(text).match(/(^|[\s"'(\[])(www\.[^\s"'<>)\]]+)/gi) || [])) {
    const t = m.trim().replace(/^[("'\[]/, "").replace(/[.,;!?]+$/, "");
    try { const u = new URL("https://" + t); out.push(u.href); } catch {}
  }
  return [...new Set(out)].slice(0, 4);
}
function instantAnalyze(input) {
  const t0 = (typeof performance !== "undefined" ? performance.now() : Date.now());
  if (!input || !String(input).trim()) return { score: 0, verdict: "safe", hits: [], trusted: false, kind: "empty", host: "", ms: 0 };
  const t = String(input).trim();
  let score = 0; const hits = [];
  const isUrl = /https?:\/\/|www\.|\.(com|in|net|org|xyz|top|click|shop|tk|io|co)\b/i.test(t);
  for (const r of (isUrl ? URL_RULES.concat(MSG_RULES) : MSG_RULES)) {
    if (r.re.test(t)) { score += r.w; hits.push(r.label); }
  }
  let trusted = false, host = "", impersonated = false;
  try {
    const first = (t.match(/https?:\/\/[^\s"'<>]+/i) || [t.split(/\s/)[0]])[0];
    const u = new URL(/^https?:\/\//i.test(first) ? first : "https://" + first);
    host = u.hostname.toLowerCase();
    trusted = TRUSTED.some(x => host === x || host.endsWith("." + x));
    if (u.protocol === "http:") { score += 10; hits.push("Not encrypted (http) — logins can be stolen"); }
    if ((host.match(/-/g) || []).length >= 3) { score += 12; hits.push("Excessive hyphens — typosquat pattern"); }
    if (host.split(".").length > 3) { score += 10; hits.push("Deep subdomain hides the true brand"); }
    if (/whatsapp/i.test(t) && !host.endsWith("whatsapp.com") && !host.endsWith("whatsapp.net")) { score += 28; hits.push("Impersonates WhatsApp on a foreign domain"); }
    const bc = brandCheck(host, u.pathname || "");
    if (bc && !bc.home) {
      impersonated = true;
      score += 40; hits.push("Uses " + bc.b.name + "'s name but is NOT " + bc.b.official[0] + " — the real " + bc.b.name + " never operates from here");
      const tld = (host.split(".").pop() || "");
      if (RISKY_TLDS.test(tld)) { score += 15; hits.push("Bank/brand lure parked on risky suffix (." + tld + ")"); }
      if (/(login|verify|dashboard|secure|account|update|kyc|bank)([-_.]|$)/i.test(u.pathname || "")) { score += 15; hits.push("Banking-action page on a non-official domain — credential-harvest layout"); }
    } else if (bc && bc.home) { score = Math.max(0, score - 15); hits.push("Confirmed on " + bc.b.name + "'s real official domain"); }
    if (t.length > 140) { score += 8; hits.push("Abnormally long text/URL — obfuscation"); }
    if (host && !trusted && /^[\w.-]+$/.test(host)) {
      let near = null, nd = 99;
      for (const o of OFFICIALS) {
        if (host === o || host.endsWith("." + o)) continue;
        const d = lev(host, o), lim = o.length >= 10 ? 2 : 1;
        if (d <= lim && d < nd) { nd = d; near = o; }
      }
      if (near) { score += 25; hits.push("Typosquat of " + near + " — only " + nd + " edit(s) away from the real one"); }
    }
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) { score += 15; hits.push("Host is a raw IP — no verified brand operates from one"); }
  } catch {}
  const seen = new Set([host]);
  for (const m of (t.match(/https?:\/\/[^\s"'<>]+/gi) || []).slice(0, 4)) {
    let uh = ""; try { uh = new URL(m).hostname.toLowerCase(); } catch { continue; }
    if (!uh || seen.has(uh)) continue; seen.add(uh);
    const eb = brandCheck(uh, "");
    if (eb && !eb.home) { score += 40; hits.push("Links to " + eb.b.name + " impostor " + uh + " — real home: " + eb.b.official.join(", ")); }
  }
  if (trusted) score = Math.max(0, score - 60);
  // Famous brand claimed on a non-official domain + scam context = SCAM, not "maybe".
  if (impersonated) {
    const tld = (host.split(".").pop() || "");
    const riskyCtx = RISKY_TLDS.test(tld)
      || /(login|secure|security|verify|update|banking|wallet|alert|kyc|support|account|auth|confirm|netbank|portal|signin|password|otp)/i.test(host)
      || (host.match(/-/g) || []).length >= 2
      || /(login|verify|account|secure|update|kyc|bank|otp|password)([-_.\/?&]|$)/i.test(t);
    if (riskyCtx && score < 60) { score = 60; hits.push("Brand impersonation + scam context — auto-classified SCAM"); }
  }
  score = Math.min(100, Math.round(score));
  const t1 = (typeof performance !== "undefined" ? performance.now() : Date.now());
  return { score, verdict: score >= 60 ? "scam" : score > 20 ? "suspicious" : "safe", hits: [...new Set(hits)], trusted, host, kind: isUrl ? "url" : "message", ms: Math.round((t1 - t0) * 10) / 10 };
}
if (typeof module !== "undefined") { module.exports = { instantAnalyze, extractUrls, TRUSTED, BRANDS }; }
