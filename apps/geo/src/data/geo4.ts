export type GeoLine = {
  id: string;
  name: string;
  points: [number, number][];
  color: string;
  width?: number;
  dashed?: boolean;
};

export type GeoLabel = {
  lon: number;
  lat: number;
  text: string;
  color?: string;
  size?: number;
  weight?: number;
};

/** 长江（示意走向，用于教学，不作为精确地理数据） */
export const CHANGJIANG: GeoLine = {
  id: "changjiang",
  name: "长江",
  color: "#2563eb",
  width: 2.6,
  points: [
    [91.0, 33.0],
    [95.0, 32.5],
    [98.5, 31.0],
    [101.0, 29.0],
    [103.0, 28.5],
    [104.6, 28.8],
    [105.8, 29.3],
    [106.5, 29.6],
    [108.5, 30.8],
    [110.5, 30.9],
    [111.3, 30.7],
    [112.5, 30.3],
    [114.3, 30.6],
    [116.0, 29.7],
    [117.5, 31.0],
    [118.8, 32.1],
    [120.5, 31.9],
    [121.5, 31.4],
  ],
};

/** 黄河（示意走向） */
export const HUANGHE: GeoLine = {
  id: "huanghe",
  name: "黄河",
  color: "#d97706",
  width: 2.6,
  points: [
    [96.0, 34.8],
    [99.0, 35.0],
    [101.5, 35.5],
    [103.8, 36.1],
    [105.5, 37.0],
    [106.3, 38.5],
    [107.5, 39.5],
    [110.0, 40.3],
    [111.1, 40.2],
    [110.6, 38.5],
    [110.4, 36.5],
    [110.5, 35.0],
    [112.4, 34.7],
    [113.6, 34.8],
    [115.0, 35.3],
    [116.5, 36.0],
    [117.0, 36.7],
    [118.0, 37.3],
    [118.9, 37.8],
  ],
};

/** 秦岭—淮河线 */
export const QINLING_HUAIHE: GeoLine = {
  id: "qinling",
  name: "秦岭—淮河",
  color: "#dc2626",
  width: 2.4,
  dashed: true,
  points: [
    [104.5, 34.3],
    [106.5, 34.0],
    [108.5, 33.8],
    [110.5, 33.5],
    [112.5, 33.0],
    [114.5, 32.6],
    [116.5, 32.8],
    [118.5, 33.0],
    [120.0, 33.4],
  ],
};

/** 第一、二级阶梯分界线：昆仑山—祁连山—横断山 */
export const STEP1: GeoLine = {
  id: "step1",
  name: "第一、二级阶梯分界线",
  color: "#7c3aed",
  width: 2.2,
  dashed: true,
  points: [
    [75.0, 37.0],
    [78.0, 36.5],
    [82.0, 36.0],
    [86.0, 36.2],
    [90.0, 37.0],
    [94.0, 38.0],
    [97.0, 38.5],
    [100.0, 37.5],
    [102.0, 35.0],
    [102.5, 32.0],
    [101.5, 29.0],
    [100.0, 26.0],
  ],
};

/** 第二、三级阶梯分界线：大兴安岭—太行山—巫山—雪峰山 */
export const STEP2: GeoLine = {
  id: "step2",
  name: "第二、三级阶梯分界线",
  color: "#0891b2",
  width: 2.2,
  dashed: true,
  points: [
    [121.5, 52.5],
    [120.0, 48.0],
    [118.5, 44.0],
    [115.5, 41.0],
    [113.5, 38.5],
    [112.5, 36.0],
    [111.0, 33.5],
    [110.5, 31.0],
    [110.0, 28.5],
    [109.5, 26.0],
  ],
};

/** 400 毫米等降水量线（示意） */
export const LINE400: GeoLine = {
  id: "line400",
  name: "400 毫米等降水量线",
  color: "#0ea5e9",
  width: 2,
  dashed: true,
  points: [
    [122.0, 50.0],
    [119.0, 46.0],
    [116.0, 43.0],
    [112.0, 41.0],
    [108.0, 39.0],
    [104.0, 37.0],
    [100.0, 35.0],
    [96.0, 32.0],
    [92.0, 29.5],
  ],
};

export const MOUNTAIN_LABELS: GeoLabel[] = [
  { lon: 121.5, lat: 49.5, text: "大兴安岭", size: 10 },
  { lon: 128.0, lat: 48.5, text: "小兴安岭", size: 10 },
  { lon: 128.0, lat: 42.5, text: "长白山", size: 10 },
  { lon: 113.8, lat: 37.8, text: "太行山", size: 10 },
  { lon: 110.2, lat: 31.2, text: "巫山", size: 10 },
  { lon: 110.6, lat: 27.3, text: "雪峰山", size: 10 },
  { lon: 108.0, lat: 33.6, text: "秦岭", size: 10 },
  { lon: 85.0, lat: 36.0, text: "昆仑山", size: 10 },
  { lon: 99.0, lat: 38.6, text: "祁连山", size: 10 },
  { lon: 99.0, lat: 28.0, text: "横断山", size: 10 },
  { lon: 84.0, lat: 42.5, text: "天山", size: 10 },
  { lon: 89.0, lat: 47.5, text: "阿尔泰山", size: 10 },
  { lon: 111.0, lat: 41.8, text: "阴山", size: 10 },
  { lon: 106.0, lat: 38.8, text: "贺兰山", size: 10 },
  { lon: 112.0, lat: 25.2, text: "南岭", size: 10 },
  { lon: 117.5, lat: 26.5, text: "武夷山", size: 10 },
  { lon: 121.0, lat: 23.7, text: "台湾山脉", size: 10 },
];

export const TERRAIN_LABELS: GeoLabel[] = [
  { lon: 88.0, lat: 32.0, text: "青藏高原", size: 12, weight: 600 },
  { lon: 112.0, lat: 43.5, text: "内蒙古高原", size: 11 },
  { lon: 108.5, lat: 36.5, text: "黄土高原", size: 11 },
  { lon: 104.5, lat: 25.5, text: "云贵高原", size: 11 },
  { lon: 83.0, lat: 39.0, text: "塔里木盆地", size: 11 },
  { lon: 86.0, lat: 45.0, text: "准噶尔盆地", size: 11 },
  { lon: 95.0, lat: 37.0, text: "柴达木盆地", size: 10 },
  { lon: 105.0, lat: 30.5, text: "四川盆地", size: 11 },
  { lon: 125.0, lat: 45.5, text: "东北平原", size: 11 },
  { lon: 116.0, lat: 35.0, text: "华北平原", size: 11 },
  { lon: 117.0, lat: 30.8, text: "长江中下游平原", size: 10 },
  { lon: 116.0, lat: 25.5, text: "东南丘陵", size: 10 },
  { lon: 119.0, lat: 36.3, text: "山东丘陵", size: 10 },
];

export type ClimateCity = {
  name: string;
  temp: number[];
  precip: number[];
  type: string;
};

/** 月平均气温（℃）与月降水量（mm），示意数据，用于读图训练 */
export const CLIMATE_CITIES: ClimateCity[] = [
  {
    name: "哈尔滨",
    temp: [-19, -15, -5, 6, 14, 20, 23, 21, 15, 6, -6, -16],
    precip: [4, 6, 10, 23, 38, 90, 160, 120, 55, 25, 10, 6],
    type: "温带季风气候",
  },
  {
    name: "北京",
    temp: [-4, -1, 6, 14, 20, 24, 26, 25, 20, 13, 4, -2],
    precip: [3, 5, 10, 25, 30, 70, 180, 160, 50, 20, 10, 3],
    type: "温带季风气候",
  },
  {
    name: "西安",
    temp: [0, 3, 9, 16, 21, 26, 27, 26, 21, 14, 7, 1],
    precip: [7, 10, 25, 45, 60, 55, 100, 90, 80, 45, 20, 6],
    type: "温带季风气候",
  },
  {
    name: "上海",
    temp: [4, 6, 10, 16, 21, 25, 29, 28, 24, 19, 12, 6],
    precip: [70, 60, 90, 100, 110, 180, 150, 140, 90, 60, 50, 40],
    type: "亚热带季风气候",
  },
  {
    name: "广州",
    temp: [14, 16, 19, 24, 27, 29, 29, 29, 27, 24, 19, 15],
    precip: [40, 60, 90, 180, 280, 280, 230, 220, 170, 70, 40, 30],
    type: "亚热带季风气候",
  },
  {
    name: "乌鲁木齐",
    temp: [-12, -10, 0, 11, 18, 23, 25, 24, 18, 8, -2, -10],
    precip: [15, 12, 20, 35, 30, 30, 25, 25, 20, 25, 20, 15],
    type: "温带大陆性气候",
  },
  {
    name: "拉萨",
    temp: [-2, 1, 5, 9, 13, 17, 16, 15, 13, 8, 2, -2],
    precip: [1, 2, 5, 10, 30, 80, 120, 110, 60, 10, 2, 1],
    type: "高原山地气候",
  },
  {
    name: "海口",
    temp: [18, 19, 22, 26, 28, 29, 29, 28, 27, 25, 22, 19],
    precip: [20, 25, 40, 90, 180, 220, 230, 250, 300, 220, 80, 30],
    type: "热带季风气候",
  },
];

export const CITY_MAP: Map<string, ClimateCity> = new Map(
  CLIMATE_CITIES.map((c) => [c.name, c])
);

export type ClimateTypeInfo = {
  name: string;
  feature: string;
  where: string;
  city: string;
};

export const CLIMATE_TYPES: ClimateTypeInfo[] = [
  {
    name: "温带季风气候",
    feature: "冬季寒冷干燥，夏季高温多雨",
    where: "秦岭—淮河以北的东部地区",
    city: "北京",
  },
  {
    name: "亚热带季风气候",
    feature: "冬季温和少雨，夏季高温多雨",
    where: "秦岭—淮河以南的东部地区",
    city: "上海",
  },
  {
    name: "热带季风气候",
    feature: "全年高温，分旱雨两季",
    where: "云南南部、海南岛、台湾南部",
    city: "海口",
  },
  {
    name: "温带大陆性气候",
    feature: "冬冷夏热，降水稀少，气温年较差大",
    where: "西北内陆地区",
    city: "乌鲁木齐",
  },
  {
    name: "高原山地气候",
    feature: "气温低，昼夜温差大，降水少",
    where: "青藏高原",
    city: "拉萨",
  },
];
