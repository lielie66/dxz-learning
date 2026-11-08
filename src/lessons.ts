import type { GlobeConfig } from "./globe/Globe";
import type { ChinaConfig } from "./globe/ChinaMap";
import {
  CHANGJIANG,
  HUANGHE,
  LINE400,
  QINLING_HUAIHE,
  STEP1,
  STEP2,
  MOUNTAIN_LABELS,
  TERRAIN_LABELS,
} from "./data/geo4";

export type LessonStep = {
  title: string;
  body: string;
  bullets?: string[];
  tip?: string;
  view?:
    | "3d"
    | "flat"
    | "split"
    | "china"
    | "terrain"
    | "climate"
    | "earth"
    | "map"
    | "contour"
    | "solar"
    | "hierarchy"
    | "timeline"
    | "terrain3d"
    | "valley";
  globe: Partial<GlobeConfig>;
  china?: Partial<ChinaConfig>;
  terrain?: { highlight?: 1 | 2 | 3 | null };
  climate?: { cities: string[] };
  earth?: { mode: "shape" | "zones" };
  map?: { mode: "scale" | "direction" | "legend" };
  contour?: { highlight?: "peak" | "saddle" | "cliff" | "ridge" | "valley" | null };
  solar?: { highlight?: string | null };
  timeline?: { mode: "world" | "china" | "all" };
};

export type Lesson = {
  id: string;
  title: string;
  subtitle: string;
  steps: LessonStep[];
};

const BASE: Partial<GlobeConfig> = {
  showLat: true,
  showLon: true,
  showEquator: true,
  showPrime: true,
  showZones: false,
  showHemi: false,
  highlightLat: null,
  highlightLon: null,
  markers: [],
};

const LESSON_LIST: Lesson[] = [
  {
    id: "lines",
    title: "第 4 课 · 横纬竖经",
    subtitle: "先把两种线分开",
    steps: [
      {
        title: "地球仪上的线，只有两种",
        body: "一种是横着绕地球一圈的，叫纬线；一种是从北极竖着连到南极的，叫经线。\n记住四个字：横纬竖经。",
        bullets: ["横着的一圈圈 → 纬线", "竖着的半圈 → 经线"],
        tip: "你现在看到的红色圈，是纬线里最特殊的一条——赤道。",
        globe: { ...BASE, showLat: false, showLon: false, showEquator: true, focus: { lat: 10, lon: 105, distance: 3.7 } },
      },
      {
        title: "纬线：像呼啦圈，一圈套一圈",
        body: "纬线是完整的圆。赤道是最大的一个圈，越往南北两极，圈越小。\n所有纬线都互相平行，永远不相交。",
        bullets: ["形状：完整的圆", "关系：互相平行，永不相交", "长短：赤道最长，向两极变短"],
        tip: "黄色高亮的这一条，就是一条普通的纬线。",
        globe: {
          ...BASE,
          showLon: false,
          highlightLat: 30,
          focus: { lat: 30, lon: 105, distance: 3.7 },
        },
      },
      {
        title: "经线：像橘子瓣，从北极连到南极",
        body: "经线是半个圆。每一条都从北极出发，绕到南极，再连回来。\n所有经线长度都相等，而且全部在南北两极汇合。",
        bullets: ["形状：半圆", "关系：都在南北极相交", "长短：全都一样长"],
        tip: "黄色高亮的这一条，就是一条经线。注意它的两端都指向极点。",
        globe: {
          ...BASE,
          showLat: false,
          showEquator: false,
          highlightLon: 105,
          focus: { lat: 15, lon: 105, distance: 3.7 },
        },
      },
      {
        title: "一眼分辨的办法",
        body: "看它会不会在极点碰头。\n会碰头的，是经线；永远平行的，是纬线。",
        bullets: ["转到北极看：所有经线在这里汇成一个点", "纬线不管怎么转，都是一圈一圈平行的"],
        tip: "试试拖动地球，把北极转到正中间，看看经线是怎么汇合的。",
        globe: {
          ...BASE,
          showLat: true,
          showLon: true,
          focus: { lat: 82, lon: 0, distance: 3.45 },
        },
      },
    ],
  },
  {
    id: "lat",
    title: "第 5 课 · 北纬与南纬",
    subtitle: "纬度是怎么数出来的",
    steps: [
      {
        title: "赤道是 0° 纬线",
        body: "赤道把地球分成北半球和南半球。它是纬度的起点，写作 0°。",
        tip: "赤道是唯一一条能把地球平分成南北两半的纬线。",
        globe: { ...BASE, showLon: false, highlightLat: 0, focus: { lat: 5, lon: 105, distance: 3.7 } },
      },
      {
        title: "往北走，度数越来越大 → 北纬",
        body: "从赤道往北，纬度从 0° 一直增加到 90°（北极点）。\n这些纬线都叫北纬，用字母 N 表示。",
        bullets: ["赤道 → 北极：0° → 90°N", "北纬 30° 记作 30°N"],
        tip: "黄色这条是 30°N，它在赤道北边。",
        globe: { ...BASE, showLon: false, highlightLat: 30, focus: { lat: 30, lon: 105, distance: 3.7 } },
      },
      {
        title: "往南走，度数越来越大 → 南纬",
        body: "从赤道往南，纬度也从 0° 增加到 90°（南极点）。\n这些纬线叫南纬，用字母 S 表示。",
        bullets: ["赤道 → 南极：0° → 90°S", "南纬 30° 记作 30°S"],
        tip: "同样是 30°，在赤道北边是 30°N，在南边是 30°S。",
        globe: { ...BASE, showLon: false, highlightLat: -30, focus: { lat: -30, lon: 105, distance: 3.7 } },
      },
      {
        title: "低纬、中纬、高纬",
        body: "纬度还能分三段：0°–30° 是低纬度，30°–60° 是中纬度，60°–90° 是高纬度。\n南北半球都一样分。",
        bullets: ["低纬：0°–30°（绿色）", "中纬：30°–60°（橙色）", "高纬：60°–90°（紫色）"],
        tip: "只看纬度，和经度没有关系。",
        globe: { ...BASE, showLon: false, showZones: true, focus: { lat: 22, lon: 105, distance: 3.8 } },
      },
    ],
  },
  {
    id: "lon",
    title: "第 6 课 · 东经与西经",
    subtitle: "经度是怎么数出来的",
    steps: [
      {
        title: "本初子午线是 0° 经线",
        body: "它穿过英国伦敦的格林尼治天文台，是经度的起点。\n注意：它不是东西半球的分界线。",
        tip: "蓝色这条就是本初子午线。",
        globe: { ...BASE, showLat: false, highlightLon: 0, focus: { lat: 20, lon: 0, distance: 3.7 } },
      },
      {
        title: "向东走，度数越来越大 → 东经",
        body: "从 0° 经线向东（也就是地球自转的方向），经度从 0° 增加到 180°。\n这些经线叫东经，用字母 E 表示。",
        bullets: ["0° → 180°：东经", "东经 109° 记作 109°E"],
        tip: "西安大约在 109°E，就在这个方向。",
        globe: { ...BASE, showLat: false, highlightLon: 105, focus: { lat: 25, lon: 105, distance: 3.7 } },
      },
      {
        title: "向西走，度数越来越大 → 西经",
        body: "从 0° 经线向西，经度也从 0° 增加到 180°。\n这些经线叫西经，用字母 W 表示。",
        bullets: ["0° → 180°：西经", "西经 75° 记作 75°W"],
        tip: "同样度数，方向相反，字母就不同。",
        globe: { ...BASE, showLat: false, highlightLon: -75, focus: { lat: 25, lon: -75, distance: 3.7 } },
      },
      {
        title: "东西半球的分界：20°W 和 160°E",
        body: "东西半球不是用 0° 和 180° 分的，而是用 20°W 和 160°E。\n从 20°W 向东，一直到 160°E，这一半是东半球。",
        bullets: ["东半球：20°W 向东 → 160°E", "西半球：160°E 向东 → 20°W"],
        tip: "两条橙色线就是分界线。中国、西安都在东半球。",
        globe: { ...BASE, showLat: false, showHemi: true, focus: { lat: 15, lon: 70, distance: 3.8 } },
      },
    ],
  },
  {
    id: "read",
    title: "第 7 课 · 读一个点的坐标",
    subtitle: "先纬后经，两步搞定",
    steps: [
      {
        title: "第一步：看南北，定纬度",
        body: "先看这个点在赤道的北边还是南边，再数它离赤道多少度。\n在北边就是北纬（N），在南边就是南纬（S）。",
        tip: "图中的点在赤道以北，所以纬度带 N。",
        globe: {
          ...BASE,
          showLon: false,
          markers: [{ lat: 34, lon: 109, kind: "target" }],
          focus: { lat: 34, lon: 109, distance: 3.4 },
        },
      },
      {
        title: "第二步：看东西，定经度",
        body: "再看这个点在本初子午线的东边还是西边，数它离 0° 经线多少度。\n在东边就是东经（E），在西边就是西经（W）。",
        tip: "这个点在本初子午线以东，所以是东经。",
        globe: {
          ...BASE,
          showLat: false,
          markers: [{ lat: 34, lon: 109, kind: "target" }],
          focus: { lat: 34, lon: 109, distance: 3.4 },
        },
      },
      {
        title: "合起来写：34°N，109°E",
        body: "这个点就是西安。写法是先纬度、后经度，中间用逗号隔开。\n（34°N，109°E）读作“北纬 34 度，东经 109 度”。",
        bullets: ["先纬后经，不能颠倒", "度数写前面，字母写后面", "赤道写 0°，本初子午线写 0°"],
        tip: "你每天生活的地方，就在这个坐标上。",
        globe: {
          ...BASE,
          markers: [{ lat: 34.34, lon: 108.94, kind: "target", label: "西安" }],
          focus: { lat: 30, lon: 108, distance: 3.55 },
        },
      },
    ],
  },
  {
    id: "traps",
    title: "第 8 课 · 四个最容易错的坑",
    subtitle: "考试就爱在这儿设套",
    steps: [
      {
        title: "坑 1：竖着的那条，是纬线？",
        body: "错。竖着的是经线。\n判断标准不是“看起来横还是竖”，而是：它是不是从北极连到南极、是不是所有这样的线都在极点汇合。",
        tip: "在地图上，经线也可能被画成竖直线；在球上，它们其实是半圆。",
        globe: { ...BASE, showLat: false, highlightLon: 60, focus: { lat: 70, lon: 60, distance: 3.45 } },
      },
      {
        title: "坑 2：东经一定在东半球？",
        body: "错。东西半球的分界是 20°W 和 160°E。\n比如 170°E，虽然叫东经，但它已经在西半球了。",
        bullets: ["160°E 以东 → 西半球", "20°W 以西 → 西半球"],
        tip: "把地球转到 170°E，它正好落在西半球那一边。",
        globe: { ...BASE, showHemi: true, highlightLon: 170, focus: { lat: 10, lon: 170, distance: 3.6 } },
      },
      {
        title: "坑 3：度数越大，越靠东？",
        body: "只在东经里成立。\n西经是反过来的：西经度数越大，位置越靠西。\n所以比较东西，要先看是东经还是西经。",
        bullets: ["东经：度数大 → 靠东", "西经：度数大 → 靠西"],
        globe: { ...BASE, showLat: false, highlightLon: -120, focus: { lat: 10, lon: -110, distance: 3.7 } },
      },
      {
        title: "坑 4：0° 经线分东西半球？",
        body: "错。0° 经线（本初子午线）只是经度的起点。\n真正分东西半球的是 20°W 和 160°E，这样分是为了尽量不把欧洲、非洲的国家切开。",
        tip: "0° 经线穿过英国、法国、西班牙，如果拿它分半球，这些国家会被劈成两半。",
        globe: { ...BASE, showHemi: true, showPrime: true, focus: { lat: 15, lon: 0, distance: 3.6 } },
      },
    ],
  },
  {
    id: "map",
    title: "第 9 课 · 从球面到地图",
    subtitle: "地图上的直线，是怎么来的",
    steps: [
      {
        title: "球面上：纬线是圈，经线是半圈",
        body: "先把地球转一圈，确认这两件事：纬线是一圈一圈的圆，经线是从北极到南极的半圆。\n右边是同一时刻的平面地图，可以对照着看。",
        bullets: ["左边：球面，线是弯的、绕着球的", "右边：平面地图，同一条线被拉直了"],
        tip: "盯着黄色高亮的 30°N：在球上它是一个圈，在右边地图上它是一条横线。",
        view: "split",
        globe: {
          ...BASE,
          highlightLat: 30,
          focus: { lat: 20, lon: 105, distance: 3.8 },
        },
      },
      {
        title: "把球剪开、压平，就成了地图",
        body: "想象沿着一条经线把地球剪开，再像擀面一样压平。\n圆圈的纬线被拉成了横线，半圆的经线被拉成了竖线。",
        bullets: ["纬线 → 横线", "经线 → 竖线", "球面上的弯曲，被地图拉直了"],
        tip: "现在只显示平面地图。找找看：赤道在哪里？本初子午线在哪里？",
        view: "flat",
        globe: { ...BASE, highlightLat: 30 },
      },
      {
        title: "地图的上下两条边，就是北极和南极",
        body: "这是地图最大的“骗局”：地图的上边不是“北边”，而是整个北极被拉成了一条线；下边整个是南极。\n所有经线在地图顶部其实汇合在同一个点，只是被摊开了。",
        tip: "所以判断经线和纬线，不能只看“横还是竖”，要看它是不是从北极连到南极、是不是在极点汇合。",
        view: "flat",
        globe: { ...BASE, showLat: true, showLon: true },
      },
    ],
  },
  {
    id: "territory",
    title: "第 12 课 · 中国的疆域",
    subtitle: "位置、四至、面积与邻国",
    steps: [
      {
        title: "中国在哪里",
        body: "半球位置：中国位于北半球、东半球。\n纬度位置：大部分在北温带，南部一小部分在热带，没有寒带。\n海陆位置：亚洲东部、太平洋西岸。",
        bullets: [
          "北半球、东半球",
          "大部分北温带，南部热带，无寒带",
          "亚洲东部、太平洋西岸",
        ],
        tip: "“大部分在北温带”很关键：北温带四季分明，适合农业生产。",
        view: "china",
        globe: {},
        china: {
          markers: [{ lon: 116.4, lat: 39.9, label: "北京", kind: "point" }],
        },
      },
      {
        title: "领土的四个端点",
        body: "最北端：漠河以北的黑龙江主航道中心线（约 53°N）。\n最南端：曾母暗沙（约 4°N）。\n最东端：黑龙江与乌苏里江主航道中心线汇合处（约 135°E）。\n最西端：帕米尔高原（约 73°E）。",
        bullets: [
          "南北跨约 49 个纬度，东西跨约 62 个经度",
          "南北跨纬度广，导致冬季南北温差大",
          "东西跨经度广，导致东西时间差异大",
        ],
        tip: "南北跨纬度广 → 温差大；东西跨经度广 → 时间差大。这两句话经常考。",
        view: "china",
        globe: {},
        china: { showExtremes: true, showNames: true },
      },
      {
        title: "陆地大国与海洋大国",
        body: "陆地面积约 960 万平方千米，仅次于俄罗斯、加拿大，居世界第三位。\n陆上邻国 14 个，隔海相望的国家 6 个。\n自北向南濒临渤海、黄海、东海、南海，渤海是我国的内海。",
        bullets: ["陆地面积：960 万平方千米，世界第三", "陆上邻国 14 个", "隔海相望 6 个", "四大海域：渤海、黄海、东海、南海"],
        tip: "渤海是内海，不是“临海”——这个区别考试爱设套。",
        view: "china",
        globe: {},
        china: { showNames: true },
      },
    ],
  },
  {
    id: "admin",
    title: "第 13 课 · 行政区划",
    subtitle: "34 个省级行政区",
    steps: [
      {
        title: "省、县、乡三级",
        body: "我国行政区划基本分为省、县、乡三级。\n全国共有 34 个省级行政区：23 个省、5 个自治区、4 个直辖市、2 个特别行政区。",
        bullets: ["23 个省", "5 个自治区：新疆、西藏、内蒙古、广西、宁夏", "4 个直辖市：北京、天津、上海、重庆", "2 个特别行政区：香港、澳门"],
        tip: "34 = 23 + 5 + 4 + 2，先记这个加法，再记具体名字。",
        view: "china",
        globe: {},
        china: { showNames: false, highlights: ["陕西省"] },
      },
      {
        title: "在地图上认省份",
        body: "看一个省，先看它在哪一个大区：东北、华北、华东、华中、华南、西南、西北。\n陕西在西北地区，北边是内蒙古，东边是山西、河南，南边是四川、重庆、湖北。",
        bullets: ["先定大区，再看邻省", "陕西：西北，接内蒙古、山西、河南、湖北、重庆、四川、甘肃、宁夏"],
        tip: "用邻省反推位置，比死记轮廓更牢。",
        view: "china",
        globe: {},
        china: { showNames: true, highlights: ["陕西省"] },
      },
      {
        title: "简称和行政中心",
        body: "很多省有两个简称。陕西简称“陕”或“秦”，行政中心是西安。\n四川简称“川”或“蜀”，行政中心成都；贵州简称“黔”或“贵”，行政中心贵阳；云南简称“滇”或“云”，行政中心昆明；甘肃简称“甘”或“陇”，行政中心兰州。",
        bullets: ["陕西：陕 / 秦 —— 西安", "四川：川 / 蜀 —— 成都", "贵州：黔 / 贵 —— 贵阳", "云南：滇 / 云 —— 昆明", "甘肃：甘 / 陇 —— 兰州"],
        tip: "两个简称的省不多，集中记：陕西、四川、贵州、云南、甘肃，再加上上海（沪/申）。",
        view: "china",
        globe: {},
        china: {
          showNames: true,
          highlights: ["陕西省", "四川省", "贵州省", "云南省", "甘肃省"],
        },
      },
    ],
  },
  {
    id: "population",
    title: "第 14 课 · 众多的人口",
    subtitle: "14 亿人住在哪里",
    steps: [
      {
        title: "世界人口大国",
        body: "2020 年第七次全国人口普查，我国人口约 14.1 亿，是世界上人口众多的国家。\n人口多，既提供了充足的劳动力和市场，也给资源、环境带来压力。",
        bullets: ["2020 年：约 14.1 亿", "人口基数大，增长快", "既是劳动力资源，也是资源环境压力"],
        tip: "记住“14 亿”这个量级就够了，具体数字考试一般不会抠到小数点。",
        view: "china",
        globe: {},
        china: { showNames: true },
      },
      {
        title: "东多西少：黑河—腾冲线",
        body: "从黑龙江黑河到云南腾冲画一条线，线以东人口稠密，线以西人口稀疏。\n这条线以东面积约占全国一半，人口却占九成以上。",
        bullets: ["黑河（黑龙江）— 腾冲（云南）", "线以东：人口稠密", "线以西：人口稀疏", "结论：东多西少"],
        tip: "这条线不只是“分人口”，它还大致对应我国地形、气候、经济的差异。",
        view: "china",
        globe: {},
        china: { showLine: true, showNames: true },
      },
      {
        title: "为什么东多西少",
        body: "东部多平原、丘陵，气候湿润，交通便利，经济发达；西部多高原、山地，气候干旱或高寒，交通不便。\n人口分布是自然条件和社会经济条件共同作用的结果。",
        bullets: ["地形：东部平原多，西部高原山地多", "气候：东部湿润，西部干旱或高寒", "经济：东部发达，就业机会多"],
        tip: "答题时按“地形—气候—经济”三条写，基本不会漏点。",
        view: "china",
        globe: {},
        china: { showLine: true, showNames: true },
      },
    ],
  },
  {
    id: "ethnic",
    title: "第 15 课 · 统一的多民族国家",
    subtitle: "56 个民族，一家亲",
    steps: [
      {
        title: "56 个民族",
        body: "我国共有 56 个民族。汉族人口最多，约占全国人口的 91%；其余 55 个民族人口较少，统称少数民族。\n少数民族中，壮族人口最多。",
        bullets: ["56 个民族", "汉族约占 91%", "55 个少数民族", "人口最多的少数民族：壮族"],
        tip: "“56 个民族、55 个少数民族”这两个数字最容易混。",
        view: "china",
        globe: {},
        china: { showNames: true },
      },
      {
        title: "大散居、小聚居、交错杂居",
        body: "汉族遍布全国，主要集中在东部和中部。\n少数民族主要分布在西南、西北和东北地区。\n各民族分布的特点是：大散居、小聚居、交错杂居。",
        bullets: ["汉族：遍布全国，东部中部多", "少数民族：西南、西北、东北", "特点：大散居、小聚居、交错杂居"],
        tip: "“大散居”是说总体上分散，“小聚居”是说局部集中，两句不矛盾。",
        view: "china",
        globe: {},
        china: { showNames: true },
      },
      {
        title: "民族区域自治",
        body: "我国在少数民族聚居的地方实行民族区域自治，设立了 5 个自治区：新疆维吾尔自治区、西藏自治区、内蒙古自治区、广西壮族自治区、宁夏回族自治区。",
        bullets: ["新疆维吾尔自治区", "西藏自治区", "内蒙古自治区", "广西壮族自治区", "宁夏回族自治区"],
        tip: "5 个自治区都分布在边疆地区，看图时注意它们的位置。",
        view: "china",
        globe: {},
        china: {
          showNames: true,
          highlights: [
            "新疆维吾尔自治区",
            "西藏自治区",
            "内蒙古自治区",
            "广西壮族自治区",
            "宁夏回族自治区",
          ],
        },
      },
    ],
  },
  {
    id: "terrain",
    title: "第 16 课 · 地势与地形",
    subtitle: "西高东低，三级阶梯",
    steps: [
      {
        title: "地势：西高东低，呈三级阶梯",
        body: "我国地势西高东低，像三级台阶一样逐级下降。\n第一级是青藏高原，平均海拔 4000 米以上；第二级是高原和盆地，1000—2000 米；第三级是平原和丘陵，500 米以下。",
        bullets: ["第一级：青藏高原，4000 米以上", "第二级：高原、盆地，1000—2000 米", "第三级：平原、丘陵，500 米以下"],
        tip: "地势说的是“高低起伏”，地形说的是“地表形态”，两个词别混。",
        view: "terrain",
        globe: {},
        terrain: { highlight: null },
      },
      {
        title: "三级阶梯的分界线",
        body: "第一、二级阶梯的分界线：昆仑山—祁连山—横断山。\n第二、三级阶梯的分界线：大兴安岭—太行山—巫山—雪峰山。",
        bullets: ["昆仑山—祁连山—横断山", "大兴安岭—太行山—巫山—雪峰山"],
        tip: "这两串山脉是必背的，考试常以“界线”或“山脉”两种方式考。",
        view: "china",
        globe: {},
        china: {
          showNames: false,
          polylines: [STEP1, STEP2],
          labels: [
            { lon: 86, lat: 42.5, text: "第一、二级阶梯分界线", size: 11, color: "#c4b5fd" },
            { lon: 116, lat: 49, text: "第二、三级阶梯分界线", size: 11, color: "#67e8f9" },
          ],
        },
      },
      {
        title: "主要地形区",
        body: "四大高原：青藏高原、内蒙古高原、黄土高原、云贵高原。\n四大盆地：塔里木盆地、准噶尔盆地、柴达木盆地、四川盆地。\n三大平原：东北平原、华北平原、长江中下游平原。",
        bullets: ["高原：青藏、内蒙古、黄土、云贵", "盆地：塔里木、准噶尔、柴达木、四川", "平原：东北、华北、长江中下游"],
        tip: "“四大高原、四大盆地、三大平原”是期末高频记忆点。",
        view: "china",
        globe: {},
        china: {
          showNames: false,
          labels: [...TERRAIN_LABELS, ...MOUNTAIN_LABELS],
        },
      },
    ],
  },
  {
    id: "climate",
    title: "第 17 课 · 气温和降水",
    subtitle: "南北温差、东西降水",
    steps: [
      {
        title: "冬季：南北温差大",
        body: "冬季我国南北气温差别很大。漠河 1 月平均气温接近 -30℃，海南岛却在 20℃ 左右。\n1 月 0℃ 等温线大致沿秦岭—淮河分布。",
        bullets: ["冬季南北温差大", "1 月 0℃ 等温线大致沿秦岭—淮河", "越往北，冬季越冷"],
        tip: "看两张图：哈尔滨 1 月约 -19℃，广州 1 月约 14℃，差了 30 多度。",
        view: "climate",
        globe: {},
        climate: { cities: ["哈尔滨", "广州"] },
      },
      {
        title: "夏季：普遍高温",
        body: "夏季除青藏高原等地势高的地区外，全国普遍高温。\n哈尔滨 7 月约 23℃，广州 7 月约 29℃，南北差别不大。",
        bullets: ["夏季普遍高温", "青藏高原夏季气温较低", "南北温差比冬季小得多"],
        tip: "冬季看南北，夏季看海拔——这是气温题的两条主线。",
        view: "climate",
        globe: {},
        climate: { cities: ["哈尔滨", "北京", "上海", "广州"] },
      },
      {
        title: "降水：从东南向西北递减",
        body: "我国年降水量从东南沿海向西北内陆递减。\n800 毫米等降水量线大致沿秦岭—淮河；400 毫米等降水量线大致沿大兴安岭—张家口—兰州—拉萨—喜马拉雅山东段。",
        bullets: ["东南多，西北少", "800 毫米线：秦岭—淮河", "400 毫米线：大兴安岭—兰州—拉萨一线"],
        tip: "400 毫米线大致是半湿润区和半干旱区的分界，也是农耕区和牧区的过渡带。",
        view: "china",
        globe: {},
        china: {
          showNames: false,
          polylines: [LINE400, QINLING_HUAIHE],
          labels: [
            { lon: 112, lat: 30.5, text: "800 毫米", size: 11, color: "#dc2626" },
            { lon: 108, lat: 40.5, text: "400 毫米", size: 11, color: "#0ea5e9" },
          ],
        },
      },
    ],
  },
  {
    id: "weather",
    title: "第 18 课 · 天气与气候",
    subtitle: "短时间与长期的平均",
    steps: [
      {
        title: "天气和气候不是一回事",
        body: "天气是一个地方短时间里的大气状况，比如“今天晴转多云”“明天有雨”。\n气候是一个地方多年的天气平均状况，比如“西安夏季高温多雨，冬季寒冷干燥”。",
        bullets: ["天气：短时间、多变", "气候：多年平均、相对稳定"],
        tip: "“夜来风雨声”是天气，“四季如春”是气候。",
        view: "climate",
        globe: {},
        climate: { cities: ["西安"] },
      },
      {
        title: "我国主要的气候类型",
        body: "我国有五种主要气候类型：温带季风气候、亚热带季风气候、热带季风气候、温带大陆性气候、高原山地气候。\n看气温曲线和降水柱状图，就能判断气候类型。",
        bullets: ["温带季风：冬冷夏热，雨热同期", "亚热带季风：冬季温和，夏季高温多雨", "热带季风：全年高温，分旱雨两季", "温带大陆性：冬冷夏热，降水少", "高原山地：气温低，昼夜温差大"],
        tip: "判断气候类型，先看最冷月气温，再看降水集中在哪个季节。",
        view: "climate",
        globe: {},
        climate: { cities: ["北京", "上海", "海口", "乌鲁木齐", "拉萨"] },
      },
      {
        title: "气候对人类活动的影响",
        body: "气候影响农业、饮食、服饰、民居和交通。\n秦岭—淮河以南以水田为主，以北以旱地为主；南方屋顶坡度大，北方屋顶坡度小。",
        bullets: ["南方水田，北方旱地", "南方湿热，北方干冷", "气候影响民居、饮食和交通"],
        tip: "答“气候影响”类题，从农业、生活、建筑三个角度写，基本不会漏。",
        view: "china",
        globe: {},
        china: {
          showNames: false,
          polylines: [QINLING_HUAIHE],
          labels: [
            { lon: 108, lat: 34.8, text: "秦岭—淮河", size: 11, color: "#dc2626" },
          ],
        },
      },
    ],
  },
  {
    id: "rivers",
    title: "第 19 课 · 河流和湖泊",
    subtitle: "长江、黄河与内外流区",
    steps: [
      {
        title: "外流区与内流区",
        body: "最终流入海洋的河流叫外流河，它们的集水区域叫外流区。\n最终没有流入海洋、而是消失在沙漠或注入内陆湖泊的河流叫内流河，所在区域叫内流区。",
        bullets: ["外流区：东部季风区，面积约占 2/3", "内流区：西北内陆，面积约占 1/3", "分界线大致沿 400 毫米等降水量线"],
        tip: "外流区面积大、河流多；内流区面积小、河流少。",
        view: "china",
        globe: {},
        china: {
          showNames: false,
          polylines: [CHANGJIANG, HUANGHE],
          labels: [
            { lon: 104, lat: 27.5, text: "长江", size: 12, color: "#2563eb", weight: 700 },
            { lon: 106, lat: 38.5, text: "黄河", size: 12, color: "#d97706", weight: 700 },
          ],
        },
      },
      {
        title: "长江：我国第一长河",
        body: "长江发源于唐古拉山，自西向东注入东海，全长约 6300 千米，是我国长度最长、水量最大、流域面积最广的河流。\n主要支流有嘉陵江、汉江、湘江、赣江等。",
        bullets: ["发源地：唐古拉山", "注入：东海", "全长约 6300 千米", "我国第一长河、水量最大"],
        tip: "长江被称为“黄金水道”，航运价值高。",
        view: "china",
        globe: {},
        china: {
          showNames: false,
          polylines: [CHANGJIANG],
          markers: [
            { lon: 106.5, lat: 29.6, label: "重庆", kind: "point" },
            { lon: 114.3, lat: 30.6, label: "武汉", kind: "point" },
            { lon: 121.5, lat: 31.4, label: "上海", kind: "point" },
          ],
        },
      },
      {
        title: "黄河：含沙量最大的河流",
        body: "黄河发源于巴颜喀拉山，自西向东注入渤海，全长约 5464 千米。\n黄河中游流经黄土高原，携带大量泥沙，下游泥沙淤积形成“地上河”。",
        bullets: ["发源地：巴颜喀拉山", "注入：渤海", "全长约 5464 千米", "含沙量最大，下游有“地上河”"],
        tip: "“地上河”的成因：中游黄土高原水土流失 → 下游泥沙淤积 → 河床抬高。",
        view: "china",
        globe: {},
        china: {
          showNames: false,
          polylines: [HUANGHE],
          markers: [
            { lon: 103.8, lat: 36.1, label: "兰州", kind: "point" },
            { lon: 113.6, lat: 34.8, label: "郑州", kind: "point" },
            { lon: 117.0, lat: 36.7, label: "济南", kind: "point" },
          ],
        },
      },
    ],
  },
  {
    id: "divides",
    title: "第 20 课 · 重要地理分界线",
    subtitle: "秦岭—淮河与阶梯界线",
    steps: [
      {
        title: "秦岭—淮河：一条线，分南北",
        body: "秦岭—淮河是我国重要的地理分界线：1 月 0℃ 等温线、800 毫米等降水量线都大致经过这里。\n它还是亚热带与暖温带、湿润区与半湿润区、水田与旱地的分界线。",
        bullets: ["1 月 0℃ 等温线", "800 毫米等降水量线", "亚热带与暖温带分界", "水田与旱地分界", "南方与北方分界"],
        tip: "秦岭—淮河的意义，是期末必考的大题，按“气温、降水、温度带、干湿区、农业、南北”六条记。",
        view: "china",
        globe: {},
        china: {
          showNames: false,
          polylines: [QINLING_HUAIHE],
          labels: [
            { lon: 107, lat: 35.2, text: "秦岭", size: 11, color: "#dc2626" },
            { lon: 117, lat: 31.6, text: "淮河", size: 11, color: "#dc2626" },
            { lon: 112, lat: 31.5, text: "秦岭—淮河线", size: 12, color: "#dc2626", weight: 700 },
          ],
        },
      },
      {
        title: "其他重要分界线",
        body: "三级阶梯分界线：昆仑山—祁连山—横断山；大兴安岭—太行山—巫山—雪峰山。\n400 毫米等降水量线：大兴安岭—张家口—兰州—拉萨—喜马拉雅山东段。",
        bullets: ["第一、二级阶梯：昆仑山—祁连山—横断山", "第二、三级阶梯：大兴安岭—太行山—巫山—雪峰山", "400 毫米线：大兴安岭—兰州—拉萨"],
        tip: "把分界线和山脉、等降水量线一起记，答题时能互相提示。",
        view: "china",
        globe: {},
        china: {
          showNames: false,
          polylines: [STEP1, STEP2, LINE400],
          labels: [
            { lon: 86, lat: 42.5, text: "第一、二级阶梯", size: 11, color: "#c4b5fd" },
            { lon: 116, lat: 49, text: "第二、三级阶梯", size: 11, color: "#67e8f9" },
            { lon: 108, lat: 40.5, text: "400 毫米线", size: 11, color: "#0ea5e9" },
          ],
        },
      },
      {
        title: "一张表记住南北差异",
        body: "秦岭—淮河以北：1 月均温低于 0℃，年降水量少于 800 毫米，以旱地为主，主要粮食作物是小麦。\n秦岭—淮河以南：1 月均温高于 0℃，年降水量多于 800 毫米，以水田为主，主要粮食作物是水稻。",
        bullets: ["以北：冷、干、旱地、小麦", "以南：暖、湿、水田、水稻"],
        tip: "“北麦南稻、北旱南水”是最好记的一组对比。",
        view: "china",
        globe: {},
        china: {
          showNames: false,
          polylines: [QINLING_HUAIHE],
        },
      },
    ],
  },
  {
    id: "earthbasics",
    title: "第 3 课 · 地球的形状和五带",
    subtitle: "从形状到五带",
    steps: [
      {
        title: "地球是什么形状",
        body: "地球是一个两极稍扁、赤道略鼓的不规则椭球体。\n平均半径约 6371 千米，赤道周长约 4 万千米，表面积约 5.1 亿平方千米。",
        bullets: ["两极稍扁、赤道略鼓", "平均半径 6371 千米", "赤道周长约 4 万千米", "表面积约 5.1 亿平方千米"],
        tip: "证据：远航船只先见桅杆、登高望远、月食、麦哲伦环球航行、卫星照片。",
        view: "earth",
        globe: {},
        earth: { mode: "shape" },
      },
      {
        title: "五带是怎么划分的",
        body: "人们根据太阳热量在地表的分布，把地球表面划分为五带：热带、北温带、南温带、北寒带、南寒带。\n回归线（23.5°）是热带与温带的分界，极圈（66.5°）是温带与寒带的分界。",
        bullets: ["热带：23.5°S—23.5°N", "温带：23.5°—66.5°", "寒带：66.5°—90°"],
        tip: "先记两条线：23.5° 回归线、66.5° 极圈。",
        view: "earth",
        globe: {},
        earth: { mode: "zones" },
      },
      {
        title: "五带各有什么特点",
        body: "热带终年炎热，有阳光直射；寒带终年寒冷，有极昼极夜；温带四季分明，既无阳光直射，也无极昼极夜。\n我国大部分位于北温带，南部一小部分在热带。",
        bullets: ["热带：终年炎热，有直射", "温带：四季分明", "寒带：终年寒冷，有极昼极夜"],
        tip: "“我国大部分在北温带”这句话，和五带图一起记。",
        view: "earth",
        globe: {},
        earth: { mode: "zones" },
      },
    ],
  },
  {
    id: "mapbasics",
    title: "第 10 课 · 地图三要素",
    subtitle: "比例尺、方向、图例",
    steps: [
      {
        title: "比例尺：图上距离与实地距离的比",
        body: "比例尺 = 图上距离 ÷ 实地距离。\n图幅相同的地图，比例尺越小，表示范围越大，内容越简略；比例尺越大，表示范围越小，内容越详细。",
        bullets: ["数字式：1:100000", "文字式：图上 1 厘米代表实地 1 千米", "线段式：一段线段代表一定实地距离", "1 千米 = 100000 厘米"],
        tip: "比例尺是分式，分母越大，比例尺越小。",
        view: "map",
        globe: {},
        map: { mode: "scale" },
      },
      {
        title: "方向：三种判断方法",
        body: "有指向标的地图，箭头一般指向北方。\n没有指向标的地图，通常“上北下南，左西右东”。\n有经纬网的地图，经线指示南北，纬线指示东西。",
        bullets: ["指向标：箭头指北", "一般定向：上北下南，左西右东", "经纬网：经线南北，纬线东西"],
        tip: "先看有没有指向标，再看有没有经纬网，最后才用“上北下南”。",
        view: "map",
        globe: {},
        map: { mode: "direction" },
      },
      {
        title: "图例：地图的语言",
        body: "图例是对地图上各种符号和注记的说明。\n首都、城市、铁路、公路、河流、湖泊、山峰、等高线、国界、省界，都有固定的符号。",
        bullets: ["看图先看图例", "同类地图的图例基本一致", "注记包括文字和数字"],
        tip: "考试给一幅新图，第一件事是看图例和比例尺。",
        view: "map",
        globe: {},
        map: { mode: "legend" },
      },
    ],
  },
  {
    id: "contour",
    title: "第 11 课 · 等高线地形图",
    subtitle: "把三维地形压成二维",
    steps: [
      {
        title: "等高线和等高距",
        body: "等高线是把海拔相同的点连接成的线。\n相邻两条等高线的高度差叫等高距。等高线上的数值是海拔，单位是米。",
        bullets: ["等高线：海拔相同的点连成的线", "等高距：相邻等高线的高度差", "数值越大，海拔越高"],
        tip: "等高线越密，坡越陡；越稀，坡越缓。",
        view: "contour",
        globe: {},
        contour: { highlight: null },
      },
      {
        title: "一条等高线是怎么切出来的",
        body: "想象给山谷灌水：水面停在某一高度时，水面和山坡的交线，就是一条等高线。\n拖动下面的水位，看这条线怎么移动。",
        bullets: ["水位越高，等高线越靠上游", "水位越低，等高线越靠下游", "所以山谷的 V 尖指向高处（上游）"],
        tip: "拖一拖水位滑块：红色 V 尖永远朝上游翘。",
        view: "valley",
        globe: {},
      },
      {
        title: "转一转：山脊和山谷",
        body: "拖动这个立体地形块，从侧面看：山脊是隆起的，山谷是凹下去的。\n等高线凸向低处的是山脊，凸向高处的是山谷。",
        bullets: ["山脊：中间高、两边低，像脊背", "山谷：中间低、两边高，常有河流"],
        tip: "把地形块转到侧面，看山脊的“脊”和山谷的“沟”。蓝色的是山谷里的河流。",
        view: "terrain3d",
        globe: {},
      },
      {
        title: "五个部位：山顶、鞍部、陡崖、山脊、山谷",
        body: "山顶：等高线闭合，数值中间高、四周低。\n鞍部：两个山顶之间低洼的部分。\n陡崖：等高线重合的地方。\n山脊：等高线凸向低处。\n山谷：等高线凸向高处。",
        bullets: ["山顶：闭合，中间高", "鞍部：两山顶之间", "陡崖：等高线重合", "山脊：凸向低处", "山谷：凸向高处"],
        tip: "口诀：凸低为脊，凸高为谷。",
        view: "contour",
        globe: {},
        contour: { highlight: null },
      },
      {
        title: "等高线的应用",
        body: "河流发育在山谷，从海拔高处流向低处。\n登山走等高线稀疏的缓坡更省力；攀岩在陡崖；水库坝址选在峡谷或“口袋形”洼地，工程量小、库容大。",
        bullets: ["河流：山谷，高处流向低处", "登山：缓坡，等高线稀疏", "攀岩：陡崖", "水库：峡谷、口袋形洼地"],
        tip: "判断河流位置，先找山谷；判断登山路线，先看疏密。",
        view: "contour",
        globe: {},
        contour: { highlight: "valley" },
      },
    ],
  },
  {
    id: "universe",
    title: "第 1 课 · 地球在宇宙中",
    subtitle: "天体系统与太阳系",
    steps: [
      {
        title: "天体系统：一层套一层",
        body: "宇宙中的天体相互吸引、相互绕转，形成天体系统。\n从大到小：可观测宇宙 → 银河系 → 太阳系 → 地月系。",
        bullets: ["可观测宇宙", "银河系", "太阳系", "地月系"],
        tip: "地球是太阳系中的一颗行星，月球是地球唯一的天然卫星。",
        view: "hierarchy",
        globe: {},
      },
      {
        title: "太阳系大家庭",
        body: "太阳是太阳系的中心天体。八大行星自近及远依次是：水星、金星、地球、火星、木星、土星、天王星、海王星。\n小行星带位于火星和木星之间。",
        bullets: ["类地行星：水星、金星、地球、火星", "巨行星：木星、土星", "远日行星：天王星、海王星", "小行星带：火星与木星之间"],
        tip: "口诀：水金地火木土天海。",
        view: "solar",
        globe: {},
        solar: { highlight: null },
      },
      {
        title: "地球为什么有生命",
        body: "外部条件：太阳光照稳定，宇宙环境安全。\n自身条件：适宜的温度、液态水、适合生物呼吸的大气。",
        bullets: ["稳定的太阳光照", "安全的宇宙环境", "适宜的温度", "液态水", "适合呼吸的大气"],
        tip: "答题按“外部两条、自身三条”写，基本不会漏。",
        view: "solar",
        globe: {},
        solar: { highlight: "地球" },
      },
    ],
  },
  {
    id: "space",
    title: "第 2 课 · 太空探索",
    subtitle: "从人造卫星到中国空间站",
    steps: [
      {
        title: "人类走向太空",
        body: "1957 年，苏联发射世界第一颗人造地球卫星。\n1961 年，加加林乘“东方 1 号”首次进入太空。\n1969 年，美国“阿波罗 11 号”首次载人登月。",
        bullets: ["1957：第一颗人造卫星（苏联）", "1961：加加林首次进入太空", "1969：阿波罗 11 号登月"],
        tip: "三个人类航天“第一”，按时间顺序记。",
        view: "timeline",
        globe: {},
        timeline: { mode: "world" },
      },
      {
        title: "中国航天之路",
        body: "1970 年，“东方红一号”——中国第一颗人造卫星。\n2003 年，“神舟五号”杨利伟，中国首次载人航天。\n2007 年，“嫦娥一号”首次月球探测。\n2020 年，“天问一号”火星探测、“嫦娥五号”采样返回。\n2021 年，“天和”核心舱发射；2022 年中国空间站全面建成。",
        bullets: ["1970：东方红一号", "2003：神舟五号（杨利伟）", "2007：嫦娥一号", "2020：天问一号、嫦娥五号", "2021—2022：中国空间站"],
        tip: "中国航天按“卫星—载人—探月—探火—空间站”五步记。",
        view: "timeline",
        globe: {},
        timeline: { mode: "china" },
      },
      {
        title: "为什么要探索太空",
        body: "太空探索帮助我们认识宇宙、开发太空资源、推动科技进步，也激发人类的探索精神。\n航天技术还带动了材料、通信、气象、导航等产业的发展。",
        bullets: ["认识宇宙", "开发资源", "推动科技", "带动产业"],
        tip: "答“意义”类题，从科学、资源、技术、精神四个角度写。",
        view: "timeline",
        globe: {},
        timeline: { mode: "all" },
      },
    ],
  },
];

const ORDER: string[] = ['universe', 'space', 'earthbasics', 'lines', 'lat', 'lon', 'read', 'traps', 'map', 'mapbasics', 'contour', 'territory', 'admin', 'population', 'ethnic', 'terrain', 'climate', 'weather', 'rivers', 'divides'];
export const LESSONS: Lesson[] = [...LESSON_LIST].sort(
  (a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id)
);
