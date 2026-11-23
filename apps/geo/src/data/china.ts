import raw from "./china.json";

export type ProvincePoly = {
  name: string;
  adcode: string;
  center: [number, number];
  rings: [number, number][][];
};

export type ChinaGeo = {
  provinces: ProvincePoly[];
  jd: [number, number][][];
};

const geo = raw as unknown as ChinaGeo;

export const CHINA_GEO: ChinaGeo = geo;

export type ProvinceMeta = {
  name: string;
  abbr: string;
  capital: string;
  kind: "省" | "自治区" | "直辖市" | "特别行政区";
};

export const PROVINCES: ProvinceMeta[] = [
  { name: "北京市", abbr: "京", capital: "北京", kind: "直辖市" },
  { name: "天津市", abbr: "津", capital: "天津", kind: "直辖市" },
  { name: "河北省", abbr: "冀", capital: "石家庄", kind: "省" },
  { name: "山西省", abbr: "晋", capital: "太原", kind: "省" },
  { name: "内蒙古自治区", abbr: "内蒙古", capital: "呼和浩特", kind: "自治区" },
  { name: "辽宁省", abbr: "辽", capital: "沈阳", kind: "省" },
  { name: "吉林省", abbr: "吉", capital: "长春", kind: "省" },
  { name: "黑龙江省", abbr: "黑", capital: "哈尔滨", kind: "省" },
  { name: "上海市", abbr: "沪", capital: "上海", kind: "直辖市" },
  { name: "江苏省", abbr: "苏", capital: "南京", kind: "省" },
  { name: "浙江省", abbr: "浙", capital: "杭州", kind: "省" },
  { name: "安徽省", abbr: "皖", capital: "合肥", kind: "省" },
  { name: "福建省", abbr: "闽", capital: "福州", kind: "省" },
  { name: "江西省", abbr: "赣", capital: "南昌", kind: "省" },
  { name: "山东省", abbr: "鲁", capital: "济南", kind: "省" },
  { name: "河南省", abbr: "豫", capital: "郑州", kind: "省" },
  { name: "湖北省", abbr: "鄂", capital: "武汉", kind: "省" },
  { name: "湖南省", abbr: "湘", capital: "长沙", kind: "省" },
  { name: "广东省", abbr: "粤", capital: "广州", kind: "省" },
  { name: "广西壮族自治区", abbr: "桂", capital: "南宁", kind: "自治区" },
  { name: "海南省", abbr: "琼", capital: "海口", kind: "省" },
  { name: "重庆市", abbr: "渝", capital: "重庆", kind: "直辖市" },
  { name: "四川省", abbr: "川（蜀）", capital: "成都", kind: "省" },
  { name: "贵州省", abbr: "黔（贵）", capital: "贵阳", kind: "省" },
  { name: "云南省", abbr: "滇（云）", capital: "昆明", kind: "省" },
  { name: "西藏自治区", abbr: "藏", capital: "拉萨", kind: "自治区" },
  { name: "陕西省", abbr: "陕（秦）", capital: "西安", kind: "省" },
  { name: "甘肃省", abbr: "甘（陇）", capital: "兰州", kind: "省" },
  { name: "青海省", abbr: "青", capital: "西宁", kind: "省" },
  { name: "宁夏回族自治区", abbr: "宁", capital: "银川", kind: "自治区" },
  { name: "新疆维吾尔自治区", abbr: "新", capital: "乌鲁木齐", kind: "自治区" },
  { name: "台湾省", abbr: "台", capital: "台北", kind: "省" },
  { name: "香港特别行政区", abbr: "港", capital: "香港", kind: "特别行政区" },
  { name: "澳门特别行政区", abbr: "澳", capital: "澳门", kind: "特别行政区" },
];

export const PROVINCE_MAP: Map<string, ProvinceMeta> = new Map(
  PROVINCES.map((p) => [p.name, p])
);

export const AUTONOMOUS_REGIONS = PROVINCES.filter((p) => p.kind === "自治区").map((p) => p.name);
