import {
  type LatLon,
  fmtCoord,
  fmtLat,
  fmtLon,
  nsHemisphere,
  ewHemisphere,
  latZone,
  antipode,
  mirrorEquator,
  mirrorPrime,
  directionFrom,
  normLon,
  randInt,
  pick,
} from "./coords";
import { PROVINCES } from "../data/china";

export type QuestionKind =
  | "lineType"
  | "readCoord"
  | "hemisphere"
  | "zone"
  | "symmetry"
  | "direction"
  | "clickCoord"
  | "clickProvince"
  | "provinceAbbr"
  | "provinceCapital"
  | "territory"
  | "population"
  | "ethnic";

export type ChinaVisual = {
  highlights?: string[];
  showLine?: boolean;
  showExtremes?: boolean;
  showNames?: boolean;
  markers?: { lon: number; lat: number; label?: string; kind?: "point" | "target" }[];
};

export type Visual =
  | { type: "marker"; at: LatLon; label?: string }
  | { type: "line"; line: "lat" | "lon"; value: number };

export type Question = {
  kind: QuestionKind;
  tag: string;
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
  visual?: Visual;
  target?: LatLon;
  targetProvince?: string;
  chinaVisual?: ChinaVisual;
  /** 内部去重用的签名，不显示给学生 */
  sig?: string;
};

const TAGS: Record<QuestionKind, string> = {
  lineType: "经线纬线辨认",
  readCoord: "经纬度读数",
  hemisphere: "半球判断",
  zone: "低中高纬",
  symmetry: "对称点",
  direction: "方向判断",
  clickCoord: "在球上定位",
  clickProvince: "省份位置",
  provinceAbbr: "省份简称",
  provinceCapital: "行政中心",
  territory: "疆域",
  population: "人口",
  ethnic: "民族",
};

function shuffleWithAnswer(correct: string, distractors: string[]): { options: string[]; answer: number } {
  const uniq = [correct];
  for (const d of distractors) {
    if (!uniq.includes(d)) uniq.push(d);
  }
  for (let i = uniq.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uniq[i], uniq[j]] = [uniq[j], uniq[i]];
  }
  return { options: uniq, answer: uniq.indexOf(correct) };
}

// ---------- 去重：最近出过的题不再出 ----------
const recentSigs: string[] = [];
const RECENT_MAX = 30;

/** 洗牌袋：固定小池子先把每一项都出完，再重新洗牌 */
const bags = new Map<string, number[]>();
const lastPick = new Map<string, number>();

function drawBag(key: string, size: number): number {
  let bag = bags.get(key);
  if (!bag || bag.length === 0) {
    bag = Array.from({ length: size }, (_, i) => i);
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    const last = lastPick.get(key);
    if (last !== undefined && bag.length > 1 && bag[bag.length - 1] === last) {
      [bag[bag.length - 1], bag[0]] = [bag[0], bag[bag.length - 1]];
    }
    bags.set(key, bag);
  }
  const idx = bag.pop()!;
  lastPick.set(key, idx);
  return idx;
}

function randomPoint(): LatLon {
  const lat = randInt(5, 65) * (Math.random() < 0.5 ? -1 : 1);
  const lon = randInt(5, 170) * (Math.random() < 0.5 ? -1 : 1);
  return { lat, lon };
}

const LINE_COMBOS: { isLat: boolean; value: number }[] = [];
for (let lat = 15; lat <= 75; lat += 15) {
  LINE_COMBOS.push({ isLat: true, value: lat }, { isLat: true, value: -lat });
}
for (let lon = 0; lon < 180; lon += 15) {
  LINE_COMBOS.push({ isLat: false, value: lon });
}

export function makeLineType(): Question {
  const { isLat, value } = LINE_COMBOS[drawBag("line", LINE_COMBOS.length)];
  const correct = isLat ? "纬线" : "经线";
  const wrong = isLat ? "经线" : "纬线";
  const { options, answer } = shuffleWithAnswer(correct, [wrong]);
  return {
    kind: "lineType",
    tag: TAGS.lineType,
    prompt: "图中高亮的这条线，是经线还是纬线？",
    options,
    answer,
    sig: `lt:${isLat ? "lat" : "lon"}:${value}`,
    explain: isLat
      ? "它和赤道平行、是一个完整的圆圈，所以是纬线。纬线永远互相平行，不会相交。"
      : "它从北极连到南极、是半个圆圈，所有经线都在南北极汇合，所以是经线。",
    visual: { type: "line", line: isLat ? "lat" : "lon", value },
  };
}

export function makeReadCoord(): Question {
  const p = randomPoint();
  const correct = fmtCoord(p);
  const distractors = [
    fmtCoord({ lat: -p.lat, lon: p.lon }),
    fmtCoord({ lat: p.lat, lon: -p.lon }),
    fmtCoord({ lat: -p.lat, lon: -p.lon }),
  ];
  const { options, answer } = shuffleWithAnswer(correct, distractors);
  return {
    kind: "readCoord",
    tag: TAGS.readCoord,
    prompt: "图中标记点的经纬度是多少？",
    options,
    answer,
    explain: `先看南北：点在赤道${p.lat > 0 ? "以北，是北纬" : "以南，是南纬"}；再看东西：点在本初子午线${p.lon > 0 ? "以东，是东经" : "以西，是西经"}。所以是 ${correct}。`,
    visual: { type: "marker", at: p, label: "？" },
    sig: `rc:${p.lat}:${p.lon}`,
  };
}

export function makeHemisphere(): Question {
  const p = randomPoint();
  const ns = nsHemisphere(p.lat);
  const ew = ewHemisphere(p.lon);
  const correct = `${ns}、${ew}`;
  const { options, answer } = shuffleWithAnswer(correct, [
    `${ns === "北半球" ? "南半球" : "北半球"}、${ew}`,
    `${ns}、${ew === "东半球" ? "西半球" : "东半球"}`,
    `${ns === "北半球" ? "南半球" : "北半球"}、${ew === "东半球" ? "西半球" : "东半球"}`,
  ]);
  return {
    kind: "hemisphere",
    tag: TAGS.hemisphere,
    prompt: `点（${fmtCoord(p)}）位于哪两个半球？`,
    options,
    answer,
    explain: `南北半球看赤道：${p.lat > 0 ? "赤道以北，北半球" : "赤道以南，南半球"}。东西半球看 20°W 和 160°E：${ew === "东半球" ? "20°W 向东到 160°E 之间，是东半球" : "不在 20°W 向东到 160°E 之间，是西半球"}。`,
    visual: { type: "marker", at: p },
    sig: `hm:${p.lat}:${p.lon}`,
  };
}

export function makeZone(): Question {
  const p = randomPoint();
  const z = latZone(p.lat);
  const correct = z;
  const others = ["低纬度", "中纬度", "高纬度"].filter((x) => x !== z);
  const { options, answer } = shuffleWithAnswer(correct, others);
  return {
    kind: "zone",
    tag: TAGS.zone,
    prompt: `点（${fmtCoord(p)}）属于哪个纬度带？`,
    options,
    answer,
    explain: `${Math.abs(p.lat)}° 位于 ${z} 的范围（0°–30° 低纬、30°–60° 中纬、60°–90° 高纬）。判断时只看纬度，和经度无关。`,
    visual: { type: "marker", at: p },
    sig: `zn:${p.lat}`,
  };
}

export function makeSymmetry(): Question {
  const p = randomPoint();
  const mode = pick(["antipode", "equator", "prime"] as const);
  let correct: string;
  let explain: string;
  if (mode === "antipode") {
    correct = fmtCoord(antipode(p));
    explain = "关于地心对称：纬度南北互换，经度相加等于 180°（东经变西经、西经变东经）。";
  } else if (mode === "equator") {
    correct = fmtCoord(mirrorEquator(p));
    explain = "关于赤道对称：经度不变，纬度南北互换（北纬变南纬，南纬变北纬）。";
  } else {
    correct = fmtCoord(mirrorPrime(p));
    explain = "关于本初子午线对称：纬度不变，经度东西互换（东经变西经，西经变东经）。";
  }
  const wrongPool = [
    fmtCoord(antipode(p)),
    fmtCoord(mirrorEquator(p)),
    fmtCoord(mirrorPrime(p)),
    fmtCoord({ lat: p.lat, lon: normLon(p.lon + 90) }),
  ];
  const { options, answer } = shuffleWithAnswer(correct, wrongPool);
  return {
    kind: "symmetry",
    tag: TAGS.symmetry,
    prompt: `点（${fmtCoord(p)}）${mode === "antipode" ? "关于地心" : mode === "equator" ? "关于赤道" : "关于本初子午线"}对称的点是？`,
    options,
    answer,
    explain,
    visual: { type: "marker", at: p },
    sig: `sy:${mode}:${p.lat}:${p.lon}`,
  };
}

export function makeDirection(): Question {
  const sameLat = Math.random() < 0.5;
  let a: LatLon;
  let b: LatLon;
  if (sameLat) {
    const lat = randInt(5, 60) * (Math.random() < 0.5 ? -1 : 1);
    const lon1 = randInt(-150, 150);
    const d = randInt(20, 90) * (Math.random() < 0.5 ? -1 : 1);
    a = { lat, lon: normLon(lon1 + d) };
    b = { lat, lon: lon1 };
  } else {
    const lon = randInt(-170, 170);
    const lat1 = randInt(-60, 60);
    const d = randInt(10, 40) * (Math.random() < 0.5 ? -1 : 1);
    a = { lat: lat1 + d, lon };
    b = { lat: lat1, lon };
  }
  const correct = directionFrom(a, b);
  const all = ["正东", "正西", "正北", "正南"];
  const { options, answer } = shuffleWithAnswer(correct, all.filter((x) => x !== correct));
  return {
    kind: "direction",
    tag: TAGS.direction,
    prompt: `A 点（${fmtCoord(a)}）位于 B 点（${fmtCoord(b)}）的什么方向？`,
    options,
    answer,
    explain: sameLat
      ? "两点纬度相同，在同一个纬线圈上，只需比较东西：东经度数大的在东边。"
      : "两点经度相同，在同一条经线上，只需比较南北：北纬度数大的在北边。",
    visual: { type: "marker", at: a, label: "A" },
    sig: `dir:${a.lat}:${a.lon}:${b.lat}:${b.lon}`,
  };
}

function explainClick(target: LatLon): string {
  const latAbs = Math.abs(target.lat);
  const lonAbs = Math.abs(target.lon);
  const latLo = Math.floor(latAbs / 15) * 15;
  const latHi = Math.min(90, latLo + 15);
  const lonLo = Math.floor(lonAbs / 15) * 15;
  const lonHi = Math.min(180, lonLo + 15);
  const latNote =
    latAbs % 15 === 0
      ? `正好落在 ${latAbs}° 这条纬线上`
      : `${latAbs}° 在 ${latLo}° 和 ${latHi}° 两条纬线之间`;
  const lonNote =
    lonAbs % 15 === 0
      ? `正好落在 ${lonAbs}° 这条经线上`
      : `${lonAbs}° 在 ${lonLo}° 和 ${lonHi}° 两条经线之间`;
  return [
    `目标：${fmtCoord(target)}。球上的经纬线每 15° 一条，可以拿它们当尺子。`,
    `① 定纬度：先找赤道 0°，从赤道往${target.lat > 0 ? "北" : "南"}数。${latNote}，所以是${fmtLat(target.lat)}。`,
    `② 定经度：先找本初子午线 0°，从 0° 往${target.lon > 0 ? "东" : "西"}数。${lonNote}，所以是${fmtLon(target.lon)}。`,
    `③ 找交点：沿 ${fmtLat(target.lat)} 这条纬线走，和 ${fmtLon(target.lon)} 这条经线的交点，就是目标。`,
  ].join("\n");
}

export function makeClickCoord(): Question {
  const target: LatLon = {
    lat: randInt(10, 55) * (Math.random() < 0.5 ? -1 : 1),
    lon: randInt(10, 160) * (Math.random() < 0.5 ? -1 : 1),
  };
  return {
    kind: "clickCoord",
    tag: TAGS.clickCoord,
    prompt: `请在地球仪或地图上点出（${fmtCoord(target)}）的大致位置`,
    options: [],
    answer: -1,
    explain: explainClick(target),
    target,
    sig: `cc:${target.lat}:${target.lon}`,
  };
}

// ---------- 第 3 章：中国的疆域和人口 ----------

function provincePool(exclude: string, key: "abbr" | "capital"): string[] {
  const self = PROVINCES.find((p) => p.name === exclude);
  const seen = new Set<string>(self ? [self[key]] : []);
  const out: string[] = [];
  for (const p of PROVINCES) {
    if (p.name === exclude) continue;
    const v = p[key];
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
    if (out.length >= 3) break;
  }
  return out;
}

export function makeClickProvince(): Question {
  const pool = PROVINCES.filter((p) => p.kind !== "特别行政区");
  const p = pool[drawBag("clickProv", pool.length)];
  return {
    kind: "clickProvince",
    tag: TAGS.clickProvince,
    prompt: `在中国地图上找到${p.name}`,
    options: [],
    answer: -1,
    targetProvince: p.name,
    explain: `${p.name}的简称是“${p.abbr}”，行政中心是${p.capital}。记位置时可以先定大区：东北、华北、华东、华中、华南、西南、西北。`,
    chinaVisual: {},
    sig: `cp:${p.name}`,
  };
}

export function makeProvinceAbbr(): Question {
  const p = PROVINCES[drawBag("abbrProv", PROVINCES.length)];
  const { options, answer } = shuffleWithAnswer(p.abbr, provincePool(p.name, "abbr"));
  return {
    kind: "provinceAbbr",
    tag: TAGS.provinceAbbr,
    prompt: `${p.name}的简称是？`,
    options,
    answer,
    explain: `${p.name}的简称是“${p.abbr}”，行政中心是${p.capital}。`,
    chinaVisual: { highlights: [p.name] },
    sig: `pa:${p.name}`,
  };
}

export function makeProvinceCapital(): Question {
  const p = PROVINCES[drawBag("capProv", PROVINCES.length)];
  const { options, answer } = shuffleWithAnswer(p.capital, provincePool(p.name, "capital"));
  return {
    kind: "provinceCapital",
    tag: TAGS.provinceCapital,
    prompt: `${p.name}的行政中心是？`,
    options,
    answer,
    explain: `${p.name}（简称 ${p.abbr}）的行政中心是${p.capital}。`,
    chinaVisual: { highlights: [p.name] },
    sig: `pc:${p.name}`,
  };
}

type Tpl = { prompt: string; correct: string; pool: string[]; explain: string; extremes?: boolean };

const TERRITORY_TPL: Tpl[] = [
  {
    prompt: "我国领土的最北端位于？",
    correct: "漠河以北的黑龙江主航道中心线",
    pool: [
      "漠河以北的黑龙江主航道中心线",
      "曾母暗沙",
      "帕米尔高原",
      "黑龙江与乌苏里江主航道中心线汇合处",
    ],
    explain: "最北端在漠河以北的黑龙江主航道中心线，约 53°N；最南端是曾母暗沙，约 4°N。",
    extremes: true,
  },
  {
    prompt: "我国领土的最南端是？",
    correct: "曾母暗沙",
    pool: [
      "曾母暗沙",
      "漠河以北的黑龙江主航道中心线",
      "帕米尔高原",
      "黑龙江与乌苏里江主航道中心线汇合处",
    ],
    explain: "最南端是曾母暗沙，约 4°N，属于海南省。",
    extremes: true,
  },
  {
    prompt: "我国领土的最东端位于？",
    correct: "黑龙江与乌苏里江主航道中心线汇合处",
    pool: [
      "黑龙江与乌苏里江主航道中心线汇合处",
      "漠河以北的黑龙江主航道中心线",
      "曾母暗沙",
      "帕米尔高原",
    ],
    explain: "最东端在黑龙江与乌苏里江主航道中心线汇合处，约 135°E。",
    extremes: true,
  },
  {
    prompt: "我国领土的最西端位于？",
    correct: "帕米尔高原",
    pool: [
      "帕米尔高原",
      "漠河以北的黑龙江主航道中心线",
      "曾母暗沙",
      "黑龙江与乌苏里江主航道中心线汇合处",
    ],
    explain: "最西端在帕米尔高原，约 73°E。",
    extremes: true,
  },
  {
    prompt: "我国陆地面积约为多少万平方千米？",
    correct: "960 万",
    pool: ["960 万", "860 万", "1060 万", "1200 万"],
    explain: "我国陆地面积约 960 万平方千米，仅次于俄罗斯和加拿大，居世界第三位。",
  },
  {
    prompt: "我国陆上邻国共有多少个？",
    correct: "14 个",
    pool: ["14 个", "6 个", "12 个", "15 个"],
    explain: "陆上邻国 14 个，隔海相望的国家 6 个。",
  },
  {
    prompt: "我国隔海相望的国家共有多少个？",
    correct: "6 个",
    pool: ["6 个", "14 个", "4 个", "8 个"],
    explain: "隔海相望的国家有 6 个：韩国、日本、菲律宾、马来西亚、文莱、印度尼西亚。",
  },
  {
    prompt: "我国濒临的海域，自北向南依次是？",
    correct: "渤海、黄海、东海、南海",
    pool: [
      "渤海、黄海、东海、南海",
      "黄海、渤海、南海、东海",
      "渤海、东海、黄海、南海",
      "黄海、东海、渤海、南海",
    ],
    explain: "自北向南依次是渤海、黄海、东海、南海；渤海是我国的内海。",
  },
  {
    prompt: "我国领土大部分位于哪个温度带？",
    correct: "北温带",
    pool: ["北温带", "热带", "北寒带", "南温带"],
    explain: "我国大部分位于北温带，南部一小部分在热带，没有寒带。",
  },
  {
    prompt: "我国领土最北端所在的省级行政区是？",
    correct: "黑龙江省",
    pool: ["黑龙江省", "内蒙古自治区", "吉林省", "新疆维吾尔自治区"],
    explain: "最北端在漠河以北的黑龙江主航道中心线，属于黑龙江省。",
    extremes: true,
  },
  {
    prompt: "我国面积最大的岛屿是？",
    correct: "台湾岛",
    pool: ["台湾岛", "海南岛", "崇明岛", "舟山岛"],
    explain: "台湾岛是我国面积最大的岛屿，海南岛第二。",
  },
  {
    prompt: "我国面积最大的半岛是？",
    correct: "山东半岛",
    pool: ["山东半岛", "辽东半岛", "雷州半岛", "胶东半岛"],
    explain: "山东半岛是我国面积最大的半岛，辽东半岛第二。",
  },
  {
    prompt: "我国的内海是？",
    correct: "渤海",
    pool: ["渤海", "黄海", "东海", "南海"],
    explain: "渤海被辽东半岛和山东半岛环抱，是我国的内海。",
  },
  {
    prompt: "我国陆地面积居世界第几位？",
    correct: "第三位",
    pool: ["第三位", "第一位", "第二位", "第四位"],
    explain: "我国陆地面积约 960 万平方千米，仅次于俄罗斯和加拿大，居世界第三位。",
  },
  {
    prompt: "我国东面隔海相望的群岛国家是？",
    correct: "日本",
    pool: ["日本", "韩国", "菲律宾", "马来西亚"],
    explain: "日本位于我国东面，是隔海相望的群岛国家。",
  },
  {
    prompt: "我国陆上邻国中，面积最大的是？",
    correct: "俄罗斯",
    pool: ["俄罗斯", "印度", "哈萨克斯坦", "蒙古"],
    explain: "俄罗斯是世界上面积最大的国家，也是我国陆上邻国中面积最大的。",
  },
];

export function makeTerritory(): Question {
  const t = TERRITORY_TPL[drawBag("terr", TERRITORY_TPL.length)];
  const { options, answer } = shuffleWithAnswer(t.correct, t.pool.filter((x) => x !== t.correct));
  return {
    kind: "territory",
    tag: TAGS.territory,
    prompt: t.prompt,
    options,
    answer,
    explain: t.explain,
    chinaVisual: { showExtremes: !!t.extremes },
    sig: `tr:${t.prompt}`,
  };
}

const POP_TPL: Tpl[] = [
  {
    prompt: "我国人口地理分界线是？",
    correct: "黑河—腾冲线",
    pool: ["黑河—腾冲线", "秦岭—淮河线", "大兴安岭—太行山线", "400 毫米等降水量线"],
    explain: "黑河（黑龙江）—腾冲（云南）线以东人口稠密，以西人口稀疏。",
  },
  {
    prompt: "黑河—腾冲线说明我国人口分布？",
    correct: "东多西少",
    pool: ["东多西少", "西多东少", "南北均匀", "南少北多"],
    explain: "线以东面积约占一半，人口却占九成以上，所以是东多西少。",
  },
  {
    prompt: "我国人口分布的特点是？",
    correct: "东南部稠密，西北部稀疏",
    pool: ["东南部稠密，西北部稀疏", "西北部稠密，东南部稀疏", "全国均匀分布", "北部稠密，南部稀疏"],
    explain: "受地形、气候、经济等因素影响，我国人口东南稠密、西北稀疏。",
  },
  {
    prompt: "2020 年我国人口约为？",
    correct: "14.1 亿",
    pool: ["14.1 亿", "12.1 亿", "16.1 亿", "10.1 亿"],
    explain: "2020 年第七次全国人口普查，我国人口约 14.1 亿，是世界上人口众多的国家。",
  },
  {
    prompt: "2020 年我国人口最多的省级行政区是？",
    correct: "广东省",
    pool: ["广东省", "山东省", "河南省", "四川省"],
    explain: "2020 年第七次人口普查，广东省人口最多。",
  },
  {
    prompt: "黑河—腾冲线以东地区的人口约占全国人口的？",
    correct: "90% 以上",
    pool: ["90% 以上", "50% 左右", "30% 左右", "70% 左右"],
    explain: "线以东面积约占全国一半，人口却占九成以上。",
  },
  {
    prompt: "我国目前实行的人口政策是？",
    correct: "三孩生育政策",
    pool: ["三孩生育政策", "一对夫妻一个孩子", "二孩政策", "鼓励晚婚晚育"],
    explain: "我国从 2021 年开始实施三孩生育政策及配套支持措施。",
  },
  {
    prompt: "人口增长过快可能带来的问题是？",
    correct: "资源、环境压力增大",
    pool: ["资源、环境压力增大", "劳动力严重不足", "国防兵源不足", "人口老龄化加剧"],
    explain: "人口增长过快会给资源、环境和社会经济带来压力；增长过慢则容易出现老龄化和劳动力不足。",
  },
];

export function makePopulation(): Question {
  const t = POP_TPL[drawBag("pop", POP_TPL.length)];
  const { options, answer } = shuffleWithAnswer(t.correct, t.pool.filter((x) => x !== t.correct));
  return {
    kind: "population",
    tag: TAGS.population,
    prompt: t.prompt,
    options,
    answer,
    explain: t.explain,
    chinaVisual: { showLine: true },
    sig: `po:${t.prompt}`,
  };
}

const ETHNIC_TPL: Tpl[] = [
  {
    prompt: "我国共有多少个民族？",
    correct: "56 个",
    pool: ["56 个", "55 个", "50 个", "60 个"],
    explain: "我国共有 56 个民族，其中汉族人口最多，其余 55 个是少数民族。",
  },
  {
    prompt: "我国人口最多的少数民族是？",
    correct: "壮族",
    pool: ["壮族", "回族", "满族", "维吾尔族"],
    explain: "壮族人口最多，主要分布在广西壮族自治区。",
  },
  {
    prompt: "我国少数民族主要分布在？",
    correct: "西南、西北和东北地区",
    pool: ["西南、西北和东北地区", "东南沿海地区", "长江中下游地区", "华北平原"],
    explain: "少数民族主要分布在西南、西北和东北地区。",
  },
  {
    prompt: "我国民族分布的特点是？",
    correct: "大散居、小聚居、交错杂居",
    pool: ["大散居、小聚居、交错杂居", "各民族均匀分布", "汉族只分布在东部", "少数民族只在西部"],
    explain: "汉族遍布全国，少数民族主要分布在西南、西北、东北，形成了大散居、小聚居、交错杂居的分布特点。",
  },
  {
    prompt: "我国在少数民族聚居地区实行什么制度？",
    correct: "民族区域自治",
    pool: ["民族区域自治", "高度自治", "特别行政区", "民族迁徙"],
    explain: "我国在少数民族聚居的地方实行民族区域自治，设立了 5 个自治区。",
    extremes: false,
  },
  {
    prompt: "我国少数民族共有多少个？",
    correct: "55 个",
    pool: ["55 个", "56 个", "54 个", "50 个"],
    explain: "我国共有 56 个民族，其中汉族以外的 55 个统称少数民族。",
  },
  {
    prompt: "我国少数民族种类最多的省级行政区是？",
    correct: "云南省",
    pool: ["云南省", "广西壮族自治区", "新疆维吾尔自治区", "西藏自治区"],
    explain: "云南省少数民族种类最多，有 25 个世居少数民族。",
  },
  {
    prompt: "我国分布最广的少数民族是？",
    correct: "回族",
    pool: ["回族", "壮族", "维吾尔族", "蒙古族"],
    explain: "回族分布最广，在全国大多数地区都有分布。",
  },
  {
    prompt: "我国汉族主要分布在？",
    correct: "东部和中部",
    pool: ["东部和中部", "西南和西北", "东北地区", "青藏高原"],
    explain: "汉族遍布全国，主要集中在东部和中部。",
  },
  {
    prompt: "我国 5 个自治区中，面积最大的是？",
    correct: "新疆维吾尔自治区",
    pool: ["新疆维吾尔自治区", "西藏自治区", "内蒙古自治区", "广西壮族自治区"],
    explain: "新疆维吾尔自治区面积约 166 万平方千米，是我国面积最大的省级行政区。",
  },
];

export function makeEthnic(): Question {
  const t = ETHNIC_TPL[drawBag("eth", ETHNIC_TPL.length)];
  const { options, answer } = shuffleWithAnswer(t.correct, t.pool.filter((x) => x !== t.correct));
  return {
    kind: "ethnic",
    tag: TAGS.ethnic,
    prompt: t.prompt,
    options,
    answer,
    explain: t.explain,
    chinaVisual: t.prompt.includes("自治区")
      ? {
          highlights: [
            "新疆维吾尔自治区",
            "西藏自治区",
            "内蒙古自治区",
            "广西壮族自治区",
            "宁夏回族自治区",
          ],
        }
      : {},
    sig: `et:${t.prompt}`,
  };
}

const MAKERS: Record<QuestionKind, () => Question> = {
  lineType: makeLineType,
  readCoord: makeReadCoord,
  hemisphere: makeHemisphere,
  zone: makeZone,
  symmetry: makeSymmetry,
  direction: makeDirection,
  clickCoord: makeClickCoord,
  clickProvince: makeClickProvince,
  provinceAbbr: makeProvinceAbbr,
  provinceCapital: makeProvinceCapital,
  territory: makeTerritory,
  population: makePopulation,
  ethnic: makeEthnic,
};

export const GEO_KINDS: QuestionKind[] = [
  "lineType",
  "readCoord",
  "hemisphere",
  "zone",
  "symmetry",
  "direction",
  "clickCoord",
];

export const CHINA_KINDS: QuestionKind[] = [
  "clickProvince",
  "provinceAbbr",
  "provinceCapital",
  "territory",
  "population",
  "ethnic",
];

function fresh(kind: QuestionKind): Question {
  let q = MAKERS[kind]();
  for (let i = 0; i < 25 && q.sig && recentSigs.includes(q.sig); i++) {
    q = MAKERS[kind]();
  }
  if (q.sig) {
    recentSigs.push(q.sig);
    if (recentSigs.length > RECENT_MAX) recentSigs.shift();
  }
  return q;
}

export function makeQuestion(kind?: QuestionKind): Question {
  const k = kind ?? pick(Object.keys(MAKERS) as QuestionKind[]);
  return fresh(k);
}

export function makeVariant(kind: QuestionKind): Question {
  return fresh(kind);
}

export function coordLabel(p: LatLon): string {
  return `${fmtLat(p.lat)} ${fmtLon(p.lon)}`;
}
