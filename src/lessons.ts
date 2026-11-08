import type { GlobeConfig } from "./globe/Globe";
import type { ChinaConfig } from "./globe/ChinaMap";

export type LessonStep = {
  title: string;
  body: string;
  bullets?: string[];
  tip?: string;
  view?: "3d" | "flat" | "split" | "china";
  globe: Partial<GlobeConfig>;
  china?: Partial<ChinaConfig>;
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

export const LESSONS: Lesson[] = [
  {
    id: "lines",
    title: "第 1 课 · 横纬竖经",
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
    title: "第 2 课 · 北纬与南纬",
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
    title: "第 3 课 · 东经与西经",
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
    title: "第 4 课 · 读一个点的坐标",
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
    title: "第 5 课 · 四个最容易错的坑",
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
    title: "第 6 课 · 从球面到地图",
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
    title: "第 7 课 · 中国的疆域",
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
    title: "第 8 课 · 行政区划",
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
    title: "第 9 课 · 众多的人口",
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
    title: "第 10 课 · 统一的多民族国家",
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
];
