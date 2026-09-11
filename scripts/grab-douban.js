const https = require("https");
const fs = require("fs");
 
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15";
const items = [];
let done = 0;
const TOTAL_PAGES = 4;
 
for (let page = 0; page < TOTAL_PAGES; page++) {
  const start = page * 25;
  const url = start === 0
    ? "https://movie.douban.com/top250"
    : "https://movie.douban.com/top250?start=" + start;
 
  const req = https.get(url, { headers: { "User-Agent": UA } }, (res) => {
    let html = "";
    res.on("data", (d) => { html += d; });
    res.on("end", () => {
      const regex = /<a href="https:\/\/movie\.douban\.com\/subject\/(\d+)\/"[^>]*>[\s\S]*?<img[^>]*(?:data-src|src)="([^"]+)"[^>]*>[\s\S]*?<span class="title">([^<]+)<\/span>[\s\S]*?<span class="rating_num"[^>]*>\s*([\d.]+)\s*<\/span>[\s\S]*?(?:<span class="inq">([^<]*)<\/span>)?/g;
      let m;
      while ((m = regex.exec(html)) !== null) {
        let cover = m[2];
        if (cover.startsWith("//")) cover = "https:" + cover;
        items.push({
          id: Number(m[1]),
          title: "【" + m[4] + "】" + m[3],
          cover: cover,
          desc: m[5] || "",
          url: "https://movie.douban.com/subject/" + m[1] + "/"
        });
      }
      done++;
      if (done === TOTAL_PAGES) finish();
    });
  });
 
  req.on("error", (e) => {
    console.error("Page " + page + " error:", e.message);
    done++;
    if (done === TOTAL_PAGES) finish();
  });
 
  req.setTimeout(10000, () => {
    req.destroy();
    done++;
    if (done === TOTAL_PAGES) finish();
  });
}
 
function finish() {
  items.sort((a, b) => {
    const sa = parseFloat(a.title.match(/【([\d.]+)】/)?.[1] || "0");
    const sb = parseFloat(b.title.match(/【([\d.]+)】/)?.[1] || "0");
    return sb - sa;
  });
  fs.mkdirSync("server/core/data", { recursive: true });
  fs.writeFileSync("server/core/data/top250.json", JSON.stringify(items, null, 2));
  console.log("Fetched " + items.length + " items");
  if (items.length === 0) {
    console.error("ERROR: 0 items fetched, Douban may be blocking requests");
    process.exit(1);
  }
}
