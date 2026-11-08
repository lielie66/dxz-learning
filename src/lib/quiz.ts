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
import { CLIMATE_CITIES, CLIMATE_TYPES } from "../data/geo4";

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
  | "ethnic"
  | "terrainStep"
  | "climateType"
  | "climateFeature"
  | "river"
  | "boundary"
  | "earth"
  | "map"
  | "contour"
  | "adminExtreme";

export type ChinaVisual = {
  highlights?: string[];
  showLine?: boolean;
  showExtremes?: boolean;
  showNames?: boolean;
  markers?: { lon: number; lat: number; label?: string; kind?: "point" | "target" }[];
};

export type Geo4Visual = {
  polylines?: string[];
  labels?: "terrain" | "mountains" | "none";
  climateCity?: string;
  terrain?: 1 | 2 | 3;
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
  geo4Visual?: Geo4Visual;
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
  terrainStep: "三级阶梯",
  climateType: "气候类型",
  climateFeature: "气温与降水",
  river: "河流湖泊",
  boundary: "地理分界线",
  earth: "地球与五带",
  map: "地图三要素",
  contour: "等高线",
  adminExtreme: "行政区划之最",
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

// ---------- 第 4 章：中国的自然环境 ----------

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

type Geo4Tpl = Tpl & { visual?: Geo4Visual };

const TERRAIN_TPL: Geo4Tpl[] = [
  {
    prompt: "青藏高原位于我国地势的哪一级阶梯？",
    correct: "第一级",
    pool: ["第一级", "第二级", "第三级"],
    explain: "青藏高原平均海拔 4000 米以上，属于第一级阶梯。",
    visual: { terrain: 1 },
  },
  {
    prompt: "内蒙古高原位于我国地势的哪一级阶梯？",
    correct: "第二级",
    pool: ["第一级", "第二级", "第三级"],
    explain: "内蒙古高原、黄土高原、云贵高原和三大盆地都属于第二级阶梯。",
    visual: { terrain: 2 },
  },
  {
    prompt: "东北平原位于我国地势的哪一级阶梯？",
    correct: "第三级",
    pool: ["第一级", "第二级", "第三级"],
    explain: "东北平原、华北平原、长江中下游平原和东南丘陵都属于第三级阶梯。",
    visual: { terrain: 3 },
  },
  {
    prompt: "四川盆地位于我国地势的哪一级阶梯？",
    correct: "第二级",
    pool: ["第一级", "第二级", "第三级"],
    explain: "四川盆地属于第二级阶梯，海拔 1000—2000 米。",
    visual: { terrain: 2 },
  },
  {
    prompt: "我国地势的总特征是？",
    correct: "西高东低，呈三级阶梯分布",
    pool: ["西高东低，呈三级阶梯分布", "东高西低，呈三级阶梯分布", "南高北低，逐级下降", "中间高、四周低"],
    explain: "我国地势西高东低，像三级台阶一样逐级下降。",
    visual: { terrain: 1 },
  },
  {
    prompt: "第一、二级阶梯的分界线是？",
    correct: "昆仑山—祁连山—横断山",
    pool: ["昆仑山—祁连山—横断山", "大兴安岭—太行山—巫山—雪峰山", "秦岭—淮河", "天山—阴山—燕山"],
    explain: "第一、二级阶梯以昆仑山—祁连山—横断山为界。",
    visual: { polylines: ["step1"], labels: "none" },
  },
  {
    prompt: "第二、三级阶梯的分界线是？",
    correct: "大兴安岭—太行山—巫山—雪峰山",
    pool: ["大兴安岭—太行山—巫山—雪峰山", "昆仑山—祁连山—横断山", "秦岭—淮河", "长白山—武夷山—台湾山脉"],
    explain: "第二、三级阶梯以大兴安岭—太行山—巫山—雪峰山为界。",
    visual: { polylines: ["step2"], labels: "none" },
  },
];

export function makeTerrainStep(): Question {
  const t = TERRAIN_TPL[drawBag("terrain", TERRAIN_TPL.length)];
  const { options, answer } = shuffleWithAnswer(t.correct, t.pool.filter((x) => x !== t.correct));
  return {
    kind: "terrainStep",
    tag: TAGS.terrainStep,
    prompt: t.prompt,
    options,
    answer,
    explain: t.explain,
    geo4Visual: t.visual,
    sig: `ts:${t.prompt}`,
  };
}

export function makeClimateType(): Question {
  const city = pickN(CLIMATE_CITIES, 1)[0];
  const correct = city.type;
  const others = CLIMATE_TYPES.map((t) => t.name).filter((n) => n !== correct);
  const { options, answer } = shuffleWithAnswer(correct, pickN(others, 3));
  const info = CLIMATE_TYPES.find((t) => t.name === correct);
  return {
    kind: "climateType",
    tag: TAGS.climateType,
    prompt: "图中是某地的气温曲线和降水量柱状图，该地属于哪种气候类型？",
    options,
    answer,
    explain: `${city.name}：${info?.feature ?? ""}，属于${correct}。判断时先看最冷月气温，再看降水集中在哪个季节。`,
    geo4Visual: { climateCity: city.name },
    sig: `ct:${city.name}`,
  };
}

const CLIMATE_FEATURE_TPL: Geo4Tpl[] = [
  {
    prompt: "我国冬季气温分布的特点是？",
    correct: "南北温差大",
    pool: ["南北温差大", "南北温差小", "全国普遍高温", "东西温差大"],
    explain: "冬季我国南北气温差别很大，越往北越冷。",
  },
  {
    prompt: "我国夏季气温分布的特点是？",
    correct: "除青藏高原外，全国普遍高温",
    pool: ["除青藏高原外，全国普遍高温", "南北温差很大", "全国普遍低温", "东部高温、西部低温"],
    explain: "夏季除青藏高原等地势高的地区外，全国普遍高温。",
  },
  {
    prompt: "我国 1 月 0℃ 等温线大致经过哪里？",
    correct: "秦岭—淮河一线",
    pool: ["秦岭—淮河一线", "大兴安岭—太行山一线", "昆仑山—祁连山一线", "长江一线"],
    explain: "1 月 0℃ 等温线大致沿秦岭—淮河分布。",
  },
  {
    prompt: "我国年降水量的分布特点是？",
    correct: "从东南沿海向西北内陆递减",
    pool: ["从东南沿海向西北内陆递减", "从西北内陆向东南沿海递减", "南北均匀分布", "东部少、西部多"],
    explain: "受海陆位置和夏季风影响，我国年降水量从东南沿海向西北内陆递减。",
  },
  {
    prompt: "我国 800 毫米等降水量线大致经过哪里？",
    correct: "秦岭—淮河一线",
    pool: ["秦岭—淮河一线", "大兴安岭—太行山一线", "昆仑山—祁连山一线", "南岭一线"],
    explain: "800 毫米等降水量线大致沿秦岭—淮河分布。",
  },
  {
    prompt: "我国 400 毫米等降水量线大致经过？",
    correct: "大兴安岭—张家口—兰州—拉萨—喜马拉雅山东段",
    pool: [
      "大兴安岭—张家口—兰州—拉萨—喜马拉雅山东段",
      "秦岭—淮河一线",
      "昆仑山—祁连山—横断山",
      "长江一线",
    ],
    explain: "400 毫米等降水量线大致沿大兴安岭—张家口—兰州—拉萨—喜马拉雅山东段分布。",
    visual: { polylines: ["line400"], labels: "none" },
  },
];

export function makeClimateFeature(): Question {
  const t = CLIMATE_FEATURE_TPL[drawBag("climfeat", CLIMATE_FEATURE_TPL.length)];
  const { options, answer } = shuffleWithAnswer(t.correct, t.pool.filter((x) => x !== t.correct));
  return {
    kind: "climateFeature",
    tag: TAGS.climateFeature,
    prompt: t.prompt,
    options,
    answer,
    explain: t.explain,
    geo4Visual: t.visual,
    sig: `cf:${t.prompt}`,
  };
}

const RIVER_TPL: Geo4Tpl[] = [
  {
    prompt: "我国长度最长、水量最大的河流是？",
    correct: "长江",
    pool: ["长江", "黄河", "珠江", "黑龙江"],
    explain: "长江全长约 6300 千米，是我国第一长河，也是水量最大的河流。",
    visual: { polylines: ["changjiang"], labels: "none" },
  },
  {
    prompt: "长江发源于哪座山脉？",
    correct: "唐古拉山",
    pool: ["唐古拉山", "巴颜喀拉山", "昆仑山", "祁连山"],
    explain: "长江发源于唐古拉山，自西向东注入东海。",
    visual: { polylines: ["changjiang"], labels: "none" },
  },
  {
    prompt: "长江注入哪个海？",
    correct: "东海",
    pool: ["东海", "渤海", "黄海", "南海"],
    explain: "长江自西向东注入东海。",
    visual: { polylines: ["changjiang"], labels: "none" },
  },
  {
    prompt: "黄河发源于哪座山脉？",
    correct: "巴颜喀拉山",
    pool: ["巴颜喀拉山", "唐古拉山", "昆仑山", "秦岭"],
    explain: "黄河发源于巴颜喀拉山，自西向东注入渤海。",
    visual: { polylines: ["huanghe"], labels: "none" },
  },
  {
    prompt: "黄河注入哪个海？",
    correct: "渤海",
    pool: ["渤海", "黄海", "东海", "南海"],
    explain: "黄河自西向东注入渤海。",
    visual: { polylines: ["huanghe"], labels: "none" },
  },
  {
    prompt: "我国含沙量最大的河流是？",
    correct: "黄河",
    pool: ["黄河", "长江", "珠江", "黑龙江"],
    explain: "黄河中游流经黄土高原，携带大量泥沙，是我国含沙量最大的河流。",
    visual: { polylines: ["huanghe"], labels: "none" },
  },
  {
    prompt: "黄河下游形成“地上河”的主要原因是？",
    correct: "中游流经黄土高原，泥沙在下游淤积",
    pool: [
      "中游流经黄土高原，泥沙在下游淤积",
      "下游降水太多",
      "下游地势太高",
      "上游冰雪融水太多",
    ],
    explain: "黄河中游流经黄土高原，水土流失严重；下游地势平缓，泥沙淤积，河床抬高，形成“地上河”。",
    visual: { polylines: ["huanghe"], labels: "none" },
  },
  {
    prompt: "我国最大的淡水湖是？",
    correct: "鄱阳湖",
    pool: ["鄱阳湖", "洞庭湖", "太湖", "青海湖"],
    explain: "鄱阳湖是我国最大的淡水湖，青海湖是我国最大的湖泊（咸水湖）。",
  },
  {
    prompt: "外流区与内流区的分界线大致是？",
    correct: "400 毫米等降水量线",
    pool: ["400 毫米等降水量线", "800 毫米等降水量线", "秦岭—淮河一线", "1 月 0℃ 等温线"],
    explain: "外流区与内流区的分界线大致沿 400 毫米等降水量线。",
  },
];

export function makeRiver(): Question {
  const t = RIVER_TPL[drawBag("river", RIVER_TPL.length)];
  const { options, answer } = shuffleWithAnswer(t.correct, t.pool.filter((x) => x !== t.correct));
  return {
    kind: "river",
    tag: TAGS.river,
    prompt: t.prompt,
    options,
    answer,
    explain: t.explain,
    geo4Visual: t.visual,
    sig: `rv:${t.prompt}`,
  };
}

const BOUNDARY_TPL: Geo4Tpl[] = [
  {
    prompt: "秦岭—淮河一线大致与哪条等温线一致？",
    correct: "1 月 0℃ 等温线",
    pool: ["1 月 0℃ 等温线", "1 月 10℃ 等温线", "7 月 0℃ 等温线", "7 月 20℃ 等温线"],
    explain: "秦岭—淮河一线大致与 1 月 0℃ 等温线一致。",
    visual: { polylines: ["qinling"], labels: "none" },
  },
  {
    prompt: "秦岭—淮河一线大致与哪条等降水量线一致？",
    correct: "800 毫米等降水量线",
    pool: ["800 毫米等降水量线", "400 毫米等降水量线", "200 毫米等降水量线", "1600 毫米等降水量线"],
    explain: "秦岭—淮河一线大致与 800 毫米等降水量线一致。",
    visual: { polylines: ["qinling"], labels: "none" },
  },
  {
    prompt: "秦岭—淮河以南的耕地类型主要是？",
    correct: "水田",
    pool: ["水田", "旱地", "牧场", "林地"],
    explain: "秦岭—淮河以南降水多，以水田为主；以北以旱地为主。",
    visual: { polylines: ["qinling"], labels: "none" },
  },
  {
    prompt: "秦岭—淮河以北的主要粮食作物是？",
    correct: "小麦",
    pool: ["小麦", "水稻", "玉米", "青稞"],
    explain: "秦岭—淮河以北以旱地为主，主要粮食作物是小麦；以南以水田为主，主要粮食作物是水稻。",
    visual: { polylines: ["qinling"], labels: "none" },
  },
  {
    prompt: "秦岭—淮河是哪两个温度带的分界线？",
    correct: "亚热带与暖温带",
    pool: ["亚热带与暖温带", "热带与亚热带", "中温带与暖温带", "高原气候区与亚热带"],
    explain: "秦岭—淮河是亚热带与暖温带的分界线。",
    visual: { polylines: ["qinling"], labels: "none" },
  },
  {
    prompt: "秦岭—淮河是哪两个干湿区的分界线？",
    correct: "湿润区与半湿润区",
    pool: ["湿润区与半湿润区", "半湿润区与半干旱区", "半干旱区与干旱区", "湿润区与干旱区"],
    explain: "秦岭—淮河是湿润区与半湿润区的分界线，大致与 800 毫米等降水量线一致。",
    visual: { polylines: ["qinling"], labels: "none" },
  },
];

export function makeBoundary(): Question {
  const t = BOUNDARY_TPL[drawBag("boundary", BOUNDARY_TPL.length)];
  const { options, answer } = shuffleWithAnswer(t.correct, t.pool.filter((x) => x !== t.correct));
  return {
    kind: "boundary",
    tag: TAGS.boundary,
    prompt: t.prompt,
    options,
    answer,
    explain: t.explain,
    geo4Visual: t.visual,
    sig: `bd:${t.prompt}`,
  };
}

// ---------- 期中补充：地球、地图、等高线、行政区划之最 ----------

const EARTH_TPL: Geo4Tpl[] = [
  {
    prompt: "地球的真实形状是？",
    correct: "两极稍扁、赤道略鼓的不规则椭球体",
    pool: ["两极稍扁、赤道略鼓的不规则椭球体", "正球体", "两极略鼓、赤道稍扁的椭球体", "扁平的圆盘"],
    explain: "地球是一个两极稍扁、赤道略鼓的不规则椭球体。",
  },
  {
    prompt: "地球的平均半径约为？",
    correct: "6371 千米",
    pool: ["6371 千米", "4 万千米", "5.1 亿千米", "12742 千米"],
    explain: "地球平均半径约 6371 千米，赤道周长约 4 万千米。",
  },
  {
    prompt: "地球赤道周长约为？",
    correct: "4 万千米",
    pool: ["4 万千米", "6371 千米", "5.1 亿千米", "2 万千米"],
    explain: "赤道周长约 4 万千米，约 8 万里。",
  },
  {
    prompt: "地球表面积约为？",
    correct: "5.1 亿平方千米",
    pool: ["5.1 亿平方千米", "960 万平方千米", "4 万平方千米", "1.5 亿平方千米"],
    explain: "地球表面积约 5.1 亿平方千米。",
  },
  {
    prompt: "热带与温带的分界线是？",
    correct: "回归线（23.5°）",
    pool: ["回归线（23.5°）", "极圈（66.5°）", "赤道（0°）", "本初子午线（0°）"],
    explain: "回归线是热带与温带的分界，极圈是温带与寒带的分界。",
  },
  {
    prompt: "温带与寒带的分界线是？",
    correct: "极圈（66.5°）",
    pool: ["极圈（66.5°）", "回归线（23.5°）", "赤道（0°）", "30°纬线"],
    explain: "极圈是温带与寒带的分界。",
  },
  {
    prompt: "有阳光直射现象的是哪个温度带？",
    correct: "热带",
    pool: ["热带", "北温带", "南温带", "寒带"],
    explain: "热带位于南北回归线之间，有阳光直射现象。",
  },
  {
    prompt: "有极昼极夜现象的是哪个温度带？",
    correct: "寒带",
    pool: ["寒带", "热带", "温带", "亚热带"],
    explain: "寒带位于极圈以内，有极昼极夜现象。",
  },
  {
    prompt: "四季分明的是哪个温度带？",
    correct: "温带",
    pool: ["温带", "热带", "寒带", "热带和寒带"],
    explain: "温带既无阳光直射，也无极昼极夜，四季分明。",
  },
];

export function makeEarth(): Question {
  const t = EARTH_TPL[drawBag("earth", EARTH_TPL.length)];
  const { options, answer } = shuffleWithAnswer(t.correct, t.pool.filter((x) => x !== t.correct));
  return {
    kind: "earth",
    tag: TAGS.earth,
    prompt: t.prompt,
    options,
    answer,
    explain: t.explain,
    sig: `ea:${t.prompt}`,
  };
}

const MAP_TPL: Geo4Tpl[] = [
  {
    prompt: "地图的三要素是？",
    correct: "比例尺、方向、图例",
    pool: ["比例尺、方向、图例", "经线、纬线、方向", "图名、图例、注记", "比例尺、经纬网、等高线"],
    explain: "地图三要素是比例尺、方向和图例。",
  },
  {
    prompt: "比例尺的计算公式是？",
    correct: "图上距离 ÷ 实地距离",
    pool: ["图上距离 ÷ 实地距离", "实地距离 ÷ 图上距离", "图上距离 × 实地距离", "实地距离 − 图上距离"],
    explain: "比例尺 = 图上距离 ÷ 实地距离。",
  },
  {
    prompt: "图幅相同的地图，比例尺越大，表示的范围和内容？",
    correct: "范围越小，内容越详细",
    pool: ["范围越小，内容越详细", "范围越大，内容越简略", "范围越大，内容越详细", "范围越小，内容越简略"],
    explain: "图幅相同，比例尺越大 → 范围越小 → 内容越详细。",
  },
  {
    prompt: "比例尺 1:100000 表示图上 1 厘米代表实地多少？",
    correct: "1 千米",
    pool: ["1 千米", "10 千米", "100 千米", "100 米"],
    explain: "1:100000 表示图上 1 厘米代表实地 100000 厘米，即 1 千米。",
  },
  {
    prompt: "1 千米等于多少厘米？",
    correct: "100000 厘米",
    pool: ["100000 厘米", "10000 厘米", "1000 厘米", "1000000 厘米"],
    explain: "1 千米 = 1000 米 = 100000 厘米。",
  },
  {
    prompt: "有指向标的地图，箭头一般指向？",
    correct: "北方",
    pool: ["北方", "南方", "东方", "西方"],
    explain: "指向标的箭头一般指向北方。",
  },
  {
    prompt: "没有指向标、也没有经纬网的地图，通常怎么定方向？",
    correct: "上北下南，左西右东",
    pool: ["上北下南，左西右东", "上南下北，左东右西", "上东下西，左北右南", "按太阳方向"],
    explain: "没有指向标的地图，通常采用“上北下南，左西右东”。",
  },
  {
    prompt: "在经纬网地图上，经线指示什么方向？",
    correct: "南北方向",
    pool: ["南北方向", "东西方向", "东北方向", "西南方向"],
    explain: "经线指示南北方向，纬线指示东西方向。",
  },
];

export function makeMap(): Question {
  const t = MAP_TPL[drawBag("map", MAP_TPL.length)];
  const { options, answer } = shuffleWithAnswer(t.correct, t.pool.filter((x) => x !== t.correct));
  return {
    kind: "map",
    tag: TAGS.map,
    prompt: t.prompt,
    options,
    answer,
    explain: t.explain,
    sig: `mp:${t.prompt}`,
  };
}

const CONTOUR_TPL: Geo4Tpl[] = [
  {
    prompt: "等高线是指？",
    correct: "海拔相同的点连成的线",
    pool: ["海拔相同的点连成的线", "相对高度相同的点连成的线", "坡度相同的点连成的线", "河流流经的线"],
    explain: "等高线是把海拔相同的点连接成的线。",
  },
  {
    prompt: "等高距是指？",
    correct: "相邻两条等高线的高度差",
    pool: ["相邻两条等高线的高度差", "两条等高线的水平距离", "山顶到山脚的垂直距离", "等高线的长度"],
    explain: "等高距是相邻两条等高线之间的高度差。",
  },
  {
    prompt: "等高线密集的地方，坡度？",
    correct: "陡",
    pool: ["陡", "缓", "平坦", "无法判断"],
    explain: "等高线越密集，坡度越陡；越稀疏，坡度越缓。",
  },
  {
    prompt: "两个山顶之间低洼的部分叫？",
    correct: "鞍部",
    pool: ["鞍部", "山顶", "陡崖", "山谷"],
    explain: "两个山顶之间低洼的部分是鞍部。",
  },
  {
    prompt: "等高线重合的地方是？",
    correct: "陡崖",
    pool: ["陡崖", "鞍部", "山脊", "山谷"],
    explain: "等高线重合的地方是陡崖。",
  },
  {
    prompt: "等高线凸向低处的地形部位是？",
    correct: "山脊",
    pool: ["山脊", "山谷", "鞍部", "陡崖"],
    explain: "等高线凸向低处为山脊，凸向高处为山谷。",
  },
  {
    prompt: "河流一般发育在哪种地形部位？",
    correct: "山谷",
    pool: ["山谷", "山脊", "鞍部", "陡崖"],
    explain: "山谷容易汇集水流，河流一般发育在山谷。",
  },
  {
    prompt: "攀岩活动一般选择在？",
    correct: "陡崖",
    pool: ["陡崖", "缓坡", "鞍部", "山顶"],
    explain: "陡崖处坡度陡，适合攀岩。",
  },
  {
    prompt: "登山时，选择哪条路线更省力？",
    correct: "等高线稀疏的缓坡",
    pool: ["等高线稀疏的缓坡", "等高线密集的陡坡", "陡崖", "任意路线都一样"],
    explain: "等高线稀疏的地方坡度缓，登山更省力。",
  },
  {
    prompt: "修建水库，坝址一般选在？",
    correct: "峡谷或口袋形洼地",
    pool: ["峡谷或口袋形洼地", "山顶", "缓坡", "鞍部"],
    explain: "坝址选在峡谷或口袋形洼地，工程量小、库容大。",
  },
];

export function makeContour(): Question {
  const t = CONTOUR_TPL[drawBag("contour", CONTOUR_TPL.length)];
  const { options, answer } = shuffleWithAnswer(t.correct, t.pool.filter((x) => x !== t.correct));
  return {
    kind: "contour",
    tag: TAGS.contour,
    prompt: t.prompt,
    options,
    answer,
    explain: t.explain,
    sig: `cn:${t.prompt}`,
  };
}

type AdminTpl = Geo4Tpl & { province?: string };

const ADMIN_TPL: AdminTpl[] = [
  {
    prompt: "我国跨纬度最广的省级行政区是？",
    correct: "海南省",
    pool: ["海南省", "黑龙江省", "内蒙古自治区", "新疆维吾尔自治区"],
    explain: "海南省跨纬度最广，从约 4°N 到 20°N 左右。",
    province: "海南省",
  },
  {
    prompt: "我国跨经度最广的省级行政区是？",
    correct: "内蒙古自治区",
    pool: ["内蒙古自治区", "新疆维吾尔自治区", "西藏自治区", "青海省"],
    explain: "内蒙古自治区东西狭长，跨经度最广。",
    province: "内蒙古自治区",
  },
  {
    prompt: "我国面积最大的省级行政区是？",
    correct: "新疆维吾尔自治区",
    pool: ["新疆维吾尔自治区", "西藏自治区", "内蒙古自治区", "青海省"],
    explain: "新疆面积约 166 万平方千米，是我国面积最大的省级行政区。",
    province: "新疆维吾尔自治区",
  },
  {
    prompt: "我国面积最小的省级行政区是？",
    correct: "澳门特别行政区",
    pool: ["澳门特别行政区", "香港特别行政区", "上海市", "天津市"],
    explain: "澳门特别行政区面积最小。",
    province: "澳门特别行政区",
  },
  {
    prompt: "我国陆上邻国最多的省级行政区是？",
    correct: "新疆维吾尔自治区",
    pool: ["新疆维吾尔自治区", "西藏自治区", "内蒙古自治区", "云南省"],
    explain: "新疆维吾尔自治区与多个国家接壤，陆上邻国最多。",
    province: "新疆维吾尔自治区",
  },
  {
    prompt: "我国临省最多的省级行政区之一是？",
    correct: "内蒙古自治区",
    pool: ["内蒙古自治区", "新疆维吾尔自治区", "西藏自治区", "青海省"],
    explain: "内蒙古自治区和陕西省都邻接 8 个省级行政区。",
    province: "内蒙古自治区",
  },
  {
    prompt: "既临渤海又临黄海的省级行政区是？",
    correct: "山东省",
    pool: ["山东省", "江苏省", "河北省", "浙江省"],
    explain: "山东省和辽宁省既临渤海又临黄海。",
    province: "山东省",
  },
  {
    prompt: "既有国界线又有海岸线的省级行政区是？",
    correct: "辽宁省",
    pool: ["辽宁省", "山东省", "河北省", "江苏省"],
    explain: "辽宁省和广西壮族自治区既有国界线又有海岸线。",
    province: "辽宁省",
  },
  {
    prompt: "北回归线自东向西穿过的省级行政区依次是？",
    correct: "台湾省、广东省、广西壮族自治区、云南省",
    pool: [
      "台湾省、广东省、广西壮族自治区、云南省",
      "台湾省、福建省、广东省、云南省",
      "广东省、广西壮族自治区、云南省、台湾省",
      "云南省、广西壮族自治区、广东省、台湾省",
    ],
    explain: "北回归线自东向西穿过台湾省、广东省、广西壮族自治区、云南省。",
  },
];

export function makeAdminExtreme(): Question {
  const t = ADMIN_TPL[drawBag("admin", ADMIN_TPL.length)];
  const { options, answer } = shuffleWithAnswer(t.correct, t.pool.filter((x) => x !== t.correct));
  return {
    kind: "adminExtreme",
    tag: TAGS.adminExtreme,
    prompt: t.prompt,
    options,
    answer,
    explain: t.explain,
    chinaVisual: t.province ? { highlights: [t.province] } : {},
    sig: `ad:${t.prompt}`,
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
  terrainStep: makeTerrainStep,
  climateType: makeClimateType,
  climateFeature: makeClimateFeature,
  river: makeRiver,
  boundary: makeBoundary,
  earth: makeEarth,
  map: makeMap,
  contour: makeContour,
  adminExtreme: makeAdminExtreme,
};

export const GEO_KINDS: QuestionKind[] = [
  "lineType",
  "readCoord",
  "hemisphere",
  "zone",
  "symmetry",
  "direction",
  "clickCoord",
  "earth",
  "map",
  "contour",
];

export const GEO4_KINDS: QuestionKind[] = [
  "terrainStep",
  "climateType",
  "climateFeature",
  "river",
  "boundary",
];

export const CHINA_KINDS: QuestionKind[] = [
  "clickProvince",
  "provinceAbbr",
  "provinceCapital",
  "territory",
  "population",
  "ethnic",
  "adminExtreme",
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
