import { useEffect, useMemo, useState } from "react";
import Globe, { defaultGlobeConfig, type GlobeConfig } from "./globe/Globe";
import FlatMap from "./globe/FlatMap";
import ChinaMap, { defaultChinaConfig, type ChinaConfig } from "./globe/ChinaMap";
import TerrainProfile from "./globe/TerrainProfile";
import ClimateChart from "./globe/ClimateChart";
import EarthBasics from "./globe/EarthBasics";
import MapBasics from "./globe/MapBasics";
import ContourMap from "./globe/ContourMap";
import Terrain3D from "./globe/Terrain3D";
import ValleyContour from "./globe/ValleyContour";
import SolarSystem from "./globe/SolarSystem";
import UniverseHierarchy from "./globe/UniverseHierarchy";
import SpaceTimeline from "./globe/SpaceTimeline";
import {
  CHANGJIANG,
  HUANGHE,
  LINE400,
  QINLING_HUAIHE,
  STEP1,
  STEP2,
  MOUNTAIN_LABELS,
  TERRAIN_LABELS,
  type GeoLine,
} from "./data/geo4";

const GEO4_LINES: Record<string, GeoLine> = {
  changjiang: CHANGJIANG,
  huanghe: HUANGHE,
  line400: LINE400,
  qinling: QINLING_HUAIHE,
  step1: STEP1,
  step2: STEP2,
};
import { LESSONS } from "./lessons";
import {
  makeQuestion,
  makeVariant,
  GEO_KINDS,
  CHINA_KINDS,
  GEO4_KINDS,
  UNIVERSE_KINDS,
  type Question,
  type QuestionKind,
} from "./lib/quiz";
import {
  fmtCoord,
  nsHemisphere,
  ewHemisphere,
  latZone,
  angularDistance,
  deltaHint,
  type LatLon,
} from "./lib/coords";
import { PROVINCE_MAP } from "./data/china";
import {
  loadWrongBook,
  addWrong,
  reviewResult,
  dueItems,
  clearWrongBook,
  wrongStats,
  type WrongItem,
} from "./lib/wrongbook";
import "./styles.css";

type Tab = "learn" | "practice" | "wrong";
type ViewMode =
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

type ClickFeedback = { ok: boolean; reveal: boolean; dist: number; msg: string };

type Entry = {
  q: Question;
  review: WrongItem | null;
  chosen: number | null;
  clickPoint: LatLon | null;
  clickFeedback: ClickFeedback | null;
  clickTries: number;
  clickRecorded: boolean;
  added: boolean;
  pickedProvince: string | null;
};

function newEntry(q: Question, review: WrongItem | null): Entry {
  return {
    q,
    review,
    chosen: null,
    clickPoint: null,
    clickFeedback: null,
    clickTries: 0,
    clickRecorded: false,
    added: false,
    pickedProvince: null,
  };
}

const KIND_LABELS: Record<QuestionKind, string> = {
  lineType: "经线 / 纬线",
  readCoord: "读经纬度",
  hemisphere: "半球判断",
  zone: "低中高纬",
  symmetry: "对称点",
  direction: "方向判断",
  clickCoord: "动手定位",
  clickProvince: "找省份",
  provinceAbbr: "省份简称",
  provinceCapital: "行政中心",
  territory: "疆域",
  population: "人口",
  ethnic: "民族",
  terrainStep: "三级阶梯",
  climateType: "气候类型",
  climateFeature: "气温降水",
  river: "河流湖泊",
  boundary: "地理分界线",
  earth: "地球与五带",
  map: "地图三要素",
  contour: "等高线",
  adminExtreme: "行政区划之最",
  universe: "宇宙与太阳系",
  space: "太空探索",
};

const OPTION_KEYS = ["A", "B", "C", "D"];

export default function App() {
  const [tab, setTab] = useState<Tab>("learn");
  const [lessonIdx, setLessonIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  const [history, setHistory] = useState<Entry[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [practiceKind, setPracticeKind] = useState<
    QuestionKind | "geo" | "china" | "geo4" | "universe"
  >("geo");

  const [wrongbook, setWrongbook] = useState<WrongItem[]>(() => loadWrongBook());
  const [picked, setPicked] = useState<LatLon | null>(null);
  const [hover, setHover] = useState<LatLon | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("3d");
  const [showLabels, setShowLabels] = useState(
    () => localStorage.getItem("geo-lab:showlabels") !== "0"
  );

  const entry = histIdx >= 0 ? history[histIdx] ?? null : null;
  const quiz = entry?.q ?? null;
  const chosen = entry?.chosen ?? null;
  const reviewItem = entry?.review ?? null;
  const clickPoint = entry?.clickPoint ?? null;
  const clickFeedback = entry?.clickFeedback ?? null;
  const clickTries = entry?.clickTries ?? 0;
  const clickRecorded = entry?.clickRecorded ?? false;
  const pickedProvince = entry?.pickedProvince ?? null;

  const lesson = LESSONS[lessonIdx];
  const step = lesson.steps[stepIdx];

  useEffect(() => {
    setViewMode(step.view ?? "3d");
  }, [lessonIdx, stepIdx]);

  useEffect(() => {
    if (tab === "practice" && chosen !== null && quiz) {
      setViewMode(viewForQuestion(quiz));
    }
  }, [chosen, quiz, tab]);

  const stats = useMemo(() => wrongStats(wrongbook), [wrongbook]);

  const globeConfig = useMemo<GlobeConfig>(() => {
    let c: GlobeConfig = {
      ...defaultGlobeConfig,
      showZones: false,
      showHemi: false,
      highlightLat: null,
      highlightLon: null,
      markers: [],
      focus: null,
    };
    if (tab === "learn") {
      c = { ...c, ...step.globe };
    } else if (tab === "practice" && quiz) {
      if (quiz.kind === "clickCoord" && quiz.target) {
        const ms: GlobeConfig["markers"] = [];
        if (clickPoint) ms.push({ ...clickPoint, kind: "point", label: "你" });
        if (clickFeedback?.reveal) ms.push({ ...quiz.target, kind: "target", label: "目标" });
        c = {
          ...c,
          markers: ms,
          focus:
            clickFeedback?.reveal && quiz.target
              ? { lat: quiz.target.lat, lon: quiz.target.lon, distance: 3.6 }
              : { lat: 15, lon: 100, distance: 3.9 },
        };
      } else if (quiz.visual && quiz.visual.type === "marker") {
        const v = quiz.visual;
        c = {
          ...c,
          markers: [{ ...v.at, kind: "target" }],
          focus: { lat: v.at.lat, lon: v.at.lon, distance: 3.5 },
        };
      } else if (quiz.visual && quiz.visual.type === "line") {
        const v = quiz.visual;
        c = {
          ...c,
          highlightLat: v.line === "lat" ? v.value : null,
          highlightLon: v.line === "lon" ? v.value : null,
          focus:
            v.line === "lat"
              ? { lat: v.value, lon: 105, distance: 3.6 }
              : { lat: 18, lon: v.value, distance: 3.6 },
        };
      }
    }
    if (picked) {
      c = { ...c, markers: [...c.markers, { ...picked, kind: "point" }] };
    }
    c = { ...c, showLabels };
    return c;
  }, [tab, step, quiz, picked, clickPoint, clickFeedback, showLabels]);

  const chinaConfig = useMemo<ChinaConfig>(() => {
    let c: ChinaConfig = { ...defaultChinaConfig, markers: [] };
    if (tab === "learn") {
      c = { ...c, ...step.china };
    } else if (tab === "practice" && quiz) {
      if (quiz.kind === "clickProvince") {
        const reveal = !!clickFeedback?.reveal;
        c = {
          ...c,
          highlights:
            reveal && quiz.targetProvince
              ? [quiz.targetProvince]
              : pickedProvince
                ? [pickedProvince]
                : [],
          showNames: reveal || !!pickedProvince,
        };
      } else if (quiz.chinaVisual) {
        c = { ...c, ...quiz.chinaVisual };
      } else if (quiz.geo4Visual) {
        const v = quiz.geo4Visual;
        c = {
          ...c,
          showNames: false,
          polylines: (v.polylines ?? [])
            .map((id) => GEO4_LINES[id])
            .filter((x): x is GeoLine => !!x),
          labels:
            v.labels === "terrain"
              ? TERRAIN_LABELS
              : v.labels === "mountains"
                ? MOUNTAIN_LABELS
                : [],
        };
      }
    }
    return c;
  }, [tab, step, quiz, clickFeedback, pickedProvince]);

  const climateCities =
    tab === "practice"
      ? quiz?.geo4Visual?.climateCity
        ? [quiz.geo4Visual.climateCity]
        : []
      : step.climate?.cities ?? [];

  const terrainHighlight =
    tab === "practice"
      ? quiz?.geo4Visual?.terrain ?? null
      : step.terrain?.highlight ?? null;

  const earthMode =
    tab === "practice" && quiz?.kind === "earth"
      ? /五带|温度带|热带|寒带|温带|回归线|极圈|直射|极昼|四季/.test(quiz.prompt)
        ? "zones"
        : "shape"
      : step.earth?.mode ?? "shape";

  const mapMode =
    tab === "practice" && quiz?.kind === "map"
      ? /比例尺|千米|厘米/.test(quiz.prompt)
        ? "scale"
        : /方向|指向标|经线|纬线/.test(quiz.prompt)
          ? "direction"
          : "legend"
      : step.map?.mode ?? "scale";

  const contourHighlight =
    tab === "practice" && quiz?.kind === "contour"
      ? null
      : step.contour?.highlight ?? null;

  function updateEntry(patch: Partial<Entry>) {
    setHistory((h) => h.map((e, i) => (i === histIdx ? { ...e, ...patch } : e)));
  }

  function goLesson(i: number) {
    setLessonIdx(i);
    setStepIdx(0);
    setPicked(null);
  }

  function makeForScope(
    scope: QuestionKind | "geo" | "china" | "geo4" | "universe",
    avoidKind?: QuestionKind
  ): Question {
    if (scope === "geo" || scope === "china" || scope === "geo4" || scope === "universe") {
      const pool =
        scope === "geo"
          ? GEO_KINDS
          : scope === "china"
            ? CHINA_KINDS
            : scope === "geo4"
              ? GEO4_KINDS
              : UNIVERSE_KINDS;
      const choices = avoidKind && pool.length > 1 ? pool.filter((k) => k !== avoidKind) : pool;
      return makeQuestion(choices[Math.floor(Math.random() * choices.length)]);
    }
    return makeQuestion(scope);
  }

  function viewForQuestion(q: Question): ViewMode {
    if (q.kind === "earth") return "earth";
    if (q.kind === "map") return "map";
    if (q.kind === "contour") return "contour";
    if (q.geo4Visual) {
      if (q.geo4Visual.climateCity) return "climate";
      if (q.geo4Visual.terrain) return "terrain";
      return "china";
    }
    if (CHINA_KINDS.includes(q.kind)) return "china";
    return "3d";
  }

  function initialView(q: Question): ViewMode {
    if (q.kind === "earth" || q.kind === "map" || q.kind === "contour") return "3d";
    return viewForQuestion(q);
  }
  function startPractice(scope?: QuestionKind | "geo" | "china" | "geo4" | "universe") {
    const s = scope ?? "geo";
    const q = makeForScope(s);
    setTab("practice");
    setPracticeKind(s);
    setHistory([newEntry(q, null)]);
    setHistIdx(0);
    setPicked(null);
    setViewMode(initialView(q));
  }

  function startReview(items: WrongItem[]) {
    setTab("practice");
    setPicked(null);
    if (!items.length) {
      setHistory([]);
      setHistIdx(-1);
      setViewMode("3d");
      return;
    }
    const entries = items.map((it) => newEntry(makeVariant(it.kind), it));
    setHistory(entries);
    setHistIdx(0);
    setViewMode(initialView(entries[0].q));
  }

  function answer(i: number) {
    if (!quiz || chosen !== null) return;
    const correct = i === quiz.answer;
    updateEntry({ chosen: i, added: !correct });
    if (reviewItem) {
      reviewResult(reviewItem.id, correct);
    } else if (!correct) {
      addWrong(quiz, quiz.options[i]);
    }
    setWrongbook(loadWrongBook());
  }

  function submitClick() {
    if (!quiz?.target || !clickPoint) return;
    const d = angularDistance(clickPoint, quiz.target);
    const { ns, ew } = deltaHint(clickPoint, quiz.target);
    const ok = d <= 6;
    const tries = clickTries + 1;

    if (ok) {
      updateEntry({
        clickTries: tries,
        clickFeedback: {
          ok: true,
          reveal: true,
          dist: d,
          msg: "很准！你已经能按经纬网定位了。",
        },
      });
      if (reviewItem) reviewResult(reviewItem.id, true);
      setWrongbook(loadWrongBook());
      return;
    }

    const parts: string[] = [];
    if (Math.abs(ns) < 2) parts.push("南北方向已经很接近");
    else parts.push(ns > 0 ? "你点得偏南了，目标在北边" : "你点得偏北了，目标在南边");
    if (Math.abs(ew) < 2) parts.push("东西方向已经很接近");
    else parts.push(ew > 0 ? "你点得偏西了，目标在东边" : "你点得偏东了，目标在西边");
    const hint = `${parts.join("；")}。`;

    const patch: Partial<Entry> = {
      clickTries: tries,
      clickFeedback:
        tries >= 3
          ? {
              ok: false,
              reveal: true,
              dist: d,
              msg: `${hint} 看看下面的解析，按“先纬度、后经度、再找交点”的顺序重新找一次。`,
            }
          : {
              ok: false,
              reveal: false,
              dist: d,
              msg: `${hint} 先找赤道和本初子午线，再数度数。`,
            },
    };

    if (!clickRecorded) {
      if (reviewItem) reviewResult(reviewItem.id, false);
      else addWrong(quiz, fmtCoord(clickPoint));
      patch.clickRecorded = true;
      patch.added = true;
      setWrongbook(loadWrongBook());
    }

    updateEntry(patch);
  }

  function manualAdd() {
    if (!quiz) return;
    const ans =
      chosen !== null
        ? quiz.options[chosen]
        : clickPoint
          ? fmtCoord(clickPoint)
          : "（手动加入）";
    addWrong(quiz, ans);
    setWrongbook(loadWrongBook());
    updateEntry({ added: true });
  }

  function nextQuestion() {
    if (histIdx < history.length - 1) {
      setHistIdx(histIdx + 1);
      return;
    }
    if (history[histIdx]?.review) {
      setTab("wrong");
      setHistory([]);
      setHistIdx(-1);
      return;
    }
    const q = makeForScope(practiceKind, quiz?.kind);
    setHistory((h) => [...h, newEntry(q, null)]);
    setHistIdx(histIdx + 1);
    setViewMode(initialView(q));
  }

  function prevQuestion() {
    setHistIdx((i) => Math.max(0, i - 1));
  }

  function handleHover(p: LatLon | null) {
    if (!p) {
      if (hover) setHover(null);
      return;
    }
    if (!hover || hover.lat !== p.lat || hover.lon !== p.lon) setHover(p);
  }

  function handlePick(p: LatLon) {
    if (tab === "practice" && quiz?.kind === "clickCoord") {
      if (clickFeedback?.reveal) return;
      updateEntry({ clickPoint: p, clickFeedback: null });
      return;
    }
    if (tab !== "practice") setPicked(p);
  }

  function submitProvince(name: string) {
    if (!quiz?.targetProvince) return;
    if (clickFeedback?.reveal) return;
    const ok = name === quiz.targetProvince;
    const meta = PROVINCE_MAP.get(quiz.targetProvince);
    const tries = clickTries + 1;
    const patch: Partial<Entry> = { pickedProvince: name, clickTries: tries };

    if (ok) {
      patch.clickFeedback = {
        ok: true,
        reveal: true,
        dist: 0,
        msg: `找对了！${quiz.targetProvince}`,
      };
      if (reviewItem) reviewResult(reviewItem.id, true);
      setWrongbook(loadWrongBook());
      updateEntry(patch);
      return;
    }

    patch.clickFeedback = {
      ok: false,
      reveal: tries >= 2,
      dist: 0,
      msg:
        tries >= 2
          ? `你点的是${name}。正确答案是${quiz.targetProvince}（简称 ${meta?.abbr}，行政中心 ${meta?.capital}）。`
          : `你点的是${name}，再找找。`,
    };

    if (!clickRecorded) {
      if (reviewItem) reviewResult(reviewItem.id, false);
      else addWrong(quiz, name);
      patch.clickRecorded = true;
      patch.added = true;
      setWrongbook(loadWrongBook());
    }
    updateEntry(patch);
  }

  function handleProvincePick(name: string | null) {
    if (tab !== "practice" || quiz?.kind !== "clickProvince" || !name) return;
    submitProvince(name);
  }

  const inChinaPractice = tab === "practice" && !!quiz && CHINA_KINDS.includes(quiz.kind);
  const inGeo4Practice = tab === "practice" && !!quiz && GEO4_KINDS.includes(quiz.kind);
  const inUniversePractice =
    tab === "practice" && !!quiz && UNIVERSE_KINDS.includes(quiz.kind);
  const inGeo2Practice =
    tab === "practice" && !!quiz && ["earth", "map", "contour"].includes(quiz.kind);
  const chapter =
    inUniversePractice || ["universe", "space"].includes(lesson.id)
      ? "第 1 章 · 地球的宇宙环境"
      : inGeo4Practice || ["terrain", "climate", "weather", "rivers", "divides"].includes(lesson.id)
        ? "第 4 章 · 中国的自然环境"
        : inChinaPractice || ["territory", "admin", "population", "ethnic"].includes(lesson.id)
          ? "第 3 章 · 中国的疆域和人口"
          : inGeo2Practice || ["earthbasics", "mapbasics", "contour"].includes(lesson.id)
            ? "第 2 章 · 地球和地图"
            : "第 2 章第 1 节 · 地球和地球仪";

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">地</div>
          <div>
            <h1>地理实验室</h1>
            <p>中图版 · 七年级上册 · {chapter}</p>
          </div>
        </div>
        <div className="topbar-right">
          <span className="pill">七年级上</span>
          <span className="pill pill-soft">3D 地球仪</span>
        </div>
      </header>

      <main className="layout">
        <section className="stage">
          <div className={viewMode === "split" ? "stage-canvas split" : "stage-canvas"}>
            {viewMode === "valley" ? (
              <div className="pane">
                <ValleyContour />
              </div>
            ) : viewMode === "terrain3d" ? (
              <div className="pane">
                <Terrain3D />
              </div>
            ) : viewMode === "solar" ? (
              <div className="pane">
                <SolarSystem highlight={step.solar?.highlight ?? null} />
              </div>
            ) : viewMode === "hierarchy" ? (
              <div className="pane">
                <UniverseHierarchy />
              </div>
            ) : viewMode === "timeline" ? (
              <div className="pane">
                <SpaceTimeline mode={step.timeline?.mode ?? "all"} />
              </div>
            ) : viewMode === "earth" ? (
              <div className="pane">
                <EarthBasics mode={earthMode} />
              </div>
            ) : viewMode === "map" ? (
              <div className="pane">
                <MapBasics mode={mapMode} />
              </div>
            ) : viewMode === "contour" ? (
              <div className="pane">
                <ContourMap highlight={contourHighlight} />
              </div>
            ) : viewMode === "terrain" ? (
              <div className="pane">
                <TerrainProfile highlight={terrainHighlight} />
              </div>
            ) : viewMode === "climate" ? (
              <div className="pane">
                <div className={climateCities.length > 2 ? "climate-grid many" : "climate-grid"}>
                  {climateCities.map((c) => (
                    <ClimateChart
                      key={c}
                      city={c}
                      compact={climateCities.length > 2}
                      title={tab === "practice" ? "某地" : undefined}
                    />
                  ))}
                </div>
              </div>
            ) : viewMode === "china" ? (
              <div className="pane">
                <ChinaMap config={chinaConfig} onPick={handleProvincePick} />
              </div>
            ) : (
              <>
                {viewMode !== "flat" && (
                  <div className="pane">
                    <Globe config={globeConfig} onPick={handlePick} onHover={handleHover} />
                  </div>
                )}
                {viewMode !== "3d" && (
                  <div className="pane">
                    <FlatMap config={globeConfig} onPick={handlePick} onHover={handleHover} />
                  </div>
                )}
              </>
            )}
          </div>

          {!["terrain", "climate", "earth", "map", "contour", "solar", "hierarchy", "timeline", "terrain3d", "valley"].includes(viewMode) && (
            <div className="view-switch">
            <button
              className={viewMode === "3d" ? "on" : ""}
              onClick={() => setViewMode("3d")}
            >
              3D 地球
            </button>
            <button
              className={viewMode === "flat" ? "on" : ""}
              onClick={() => setViewMode("flat")}
            >
              平面地图
            </button>
            <button
              className={viewMode === "split" ? "on" : ""}
              onClick={() => setViewMode("split")}
            >
              对照
            </button>
            <button
              className={viewMode === "china" ? "on" : ""}
              onClick={() => setViewMode("china")}
            >
              中国地图
            </button>
            </div>
          )}

          {(viewMode === "3d" || viewMode === "flat" || viewMode === "split") && (
            <div className="stage-legend">
              <span><i className="dot dot-red" />赤道 0°</span>
              <span><i className="dot dot-blue" />本初子午线 0°</span>
              <span><i className="dot dot-amber" />高亮线</span>
              <button
                className={showLabels ? "legend-toggle on" : "legend-toggle"}
                onClick={() => {
                  const next = !showLabels;
                  setShowLabels(next);
                  try {
                    localStorage.setItem("geo-lab:showlabels", next ? "1" : "0");
                  } catch {
                    /* 忽略 */
                  }
                }}
                title="显示或隐藏地球仪上的度数"
                style={viewMode === "flat" ? { display: "none" } : undefined}
              >
                度数 {showLabels ? "显示" : "隐藏"}
              </button>
            </div>
          )}

          <div className="stage-hint">
            {viewMode === "china"
              ? "点击省份，查看简称与行政中心"
              : viewMode === "flat"
                ? "点击地图上的任意位置读坐标"
                : viewMode === "terrain"
                  ? "示意图：西高东低，呈三级阶梯"
                  : viewMode === "climate"
                    ? "左轴气温（℃），右轴降水（mm）"
                    : viewMode === "solar"
                      ? "太阳系示意图：八大行星围绕太阳公转"
                      : viewMode === "hierarchy"
                        ? "天体系统：一层套一层"
                        : viewMode === "timeline"
                          ? "太空探索大事记"
                          : viewMode === "terrain3d"
                            ? "拖动旋转 · 滚轮缩放，看山脊和山谷"
                            : viewMode === "valley"
                              ? "拖动水位，看等高线怎么移动"
                              : "拖动旋转 · 滚轮缩放 · 点击球面读坐标"}
            {hover && (viewMode === "3d" || viewMode === "flat" || viewMode === "split") && (
              <span className="hover-coord">
                {fmtCoord({ lat: Math.round(hover.lat), lon: Math.round(hover.lon) })}
              </span>
            )}
          </div>

          {picked && (viewMode === "3d" || viewMode === "flat" || viewMode === "split") && (
            <div className="pick-card">
              <button className="pick-close" onClick={() => setPicked(null)}>×</button>
              <div className="pick-title">你点的位置</div>
              <div className="pick-coord">{fmtCoord(picked)}</div>
              <div className="pick-grid">
                <span>{nsHemisphere(picked.lat)}</span>
                <span>{ewHemisphere(picked.lon)}</span>
                <span>{latZone(picked.lat)}</span>
              </div>
            </div>
          )}
        </section>

        <aside className="panel">
          <nav className="tabs">
            <button className={tab === "learn" ? "tab active" : "tab"} onClick={() => setTab("learn")}>
              讲解
            </button>
            <button
              className={tab === "practice" ? "tab active" : "tab"}
              onClick={() => {
                setTab("practice");
                setPicked(null);
              }}
            >
              练习
            </button>
            <button className={tab === "wrong" ? "tab active" : "tab"} onClick={() => setTab("wrong")}>
              错题本
              {stats.due > 0 && <em className="badge">{stats.due}</em>}
            </button>
          </nav>

          <div className="panel-body">
            {tab === "learn" && (
              <>
                <div className="lesson-chips">
                  {LESSONS.map((l, i) => (
                    <button
                      key={l.id}
                      className={i === lessonIdx ? "chip active" : "chip"}
                      onClick={() => goLesson(i)}
                    >
                      {l.title.split(" · ")[0]}
                    </button>
                  ))}
                </div>

                <div className="lesson-head">
                  <h2>{lesson.title}</h2>
                  <p>{lesson.subtitle}</p>
                </div>

                <article className="step-card">
                  <div className="step-count">
                    第 {stepIdx + 1} / {lesson.steps.length} 步
                  </div>
                  <h3>{step.title}</h3>
                  <p className="step-body">{step.body}</p>
                  {step.bullets && (
                    <ul className="step-bullets">
                      {step.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  )}
                  {step.tip && <div className="tip">{step.tip}</div>}
                </article>

                <div className="step-nav">
                  <button
                    className="btn ghost"
                    disabled={stepIdx === 0}
                    onClick={() => setStepIdx((v) => Math.max(0, v - 1))}
                  >
                    上一步
                  </button>
                  <div className="dots">
                    {lesson.steps.map((_, i) => (
                      <button
                        key={i}
                        className={i === stepIdx ? "dot-btn active" : "dot-btn"}
                        onClick={() => setStepIdx(i)}
                        aria-label={`第 ${i + 1} 步`}
                      />
                    ))}
                  </div>
                  {stepIdx < lesson.steps.length - 1 ? (
                    <button className="btn" onClick={() => setStepIdx((v) => v + 1)}>
                      下一步
                    </button>
                  ) : (
                    <button
                      className="btn"
                      onClick={() =>
                        startPractice(
                          ["territory", "admin", "population", "ethnic"].includes(lesson.id)
                            ? "china"
                            : ["terrain", "climate", "weather", "rivers", "divides"].includes(
                                  lesson.id
                                )
                              ? "geo4"
                              : "geo"
                        )
                      }
                    >
                      去练一练
                    </button>
                  )}
                </div>
              </>
            )}

            {tab === "practice" && (
              <>
                {!quiz && (
                  <div className="start-screen">
                    <h2>练一练</h2>
                    <p>题目会随机生成，可以一直练，不会重复背答案。</p>
                    <button className="btn big" onClick={() => startPractice("geo")}>
                      随机练 · 地球与地图
                    </button>
                    <button className="btn big ghost" onClick={() => startPractice("china")}>
                      随机练 · 中国的疆域和人口
                    </button>
                    <button className="btn big ghost" onClick={() => startPractice("geo4")}>
                      随机练 · 中国的自然环境
                    </button>
                    <button className="btn big ghost" onClick={() => startPractice("universe")}>
                      随机练 · 地球的宇宙环境
                    </button>

                    <div className="kind-section">第 1 章 · 地球的宇宙环境</div>
                    <div className="kind-grid">
                      {UNIVERSE_KINDS.map((k) => (
                        <button key={k} className="kind-btn" onClick={() => startPractice(k)}>
                          {KIND_LABELS[k]}
                        </button>
                      ))}
                    </div>

                    <div className="kind-section">第 2 章 · 地球和地图</div>
                    <div className="kind-grid">
                      {GEO_KINDS.map((k) => (
                        <button key={k} className="kind-btn" onClick={() => startPractice(k)}>
                          {KIND_LABELS[k]}
                        </button>
                      ))}
                    </div>

                    <div className="kind-section">第 3 章 · 中国的疆域和人口</div>
                    <div className="kind-grid">
                      {CHINA_KINDS.map((k) => (
                        <button key={k} className="kind-btn" onClick={() => startPractice(k)}>
                          {KIND_LABELS[k]}
                        </button>
                      ))}
                    </div>

                    <div className="kind-section">第 4 章 · 中国的自然环境</div>
                    <div className="kind-grid">
                      {GEO4_KINDS.map((k) => (
                        <button key={k} className="kind-btn" onClick={() => startPractice(k)}>
                          {KIND_LABELS[k]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {quiz && (
                  <div className="quiz">
                    {reviewItem && (
                      <div className="review-banner">
                        错题重练 · {reviewItem.tag}
                        <span>还剩 {Math.max(0, history.length - histIdx - 1)} 道</span>
                      </div>
                    )}
                    <div className="quiz-tag">
                      <span>{KIND_LABELS[quiz.kind]}</span>
                      <span className="quiz-tools">
                        <button
                          className="link"
                          disabled={histIdx <= 0}
                          onClick={prevQuestion}
                        >
                          ← 上一题
                        </button>
                        {!reviewItem && (
                          <button className="link" onClick={() => startPractice(practiceKind)}>
                            换一题
                          </button>
                        )}
                        <button
                          className="link"
                          onClick={() => {
                            setHistory([]);
                            setHistIdx(-1);
                          }}
                        >
                          选择题型
                        </button>
                      </span>
                    </div>
                    <h3 className="quiz-prompt">{quiz.prompt}</h3>

                    {quiz.kind === "clickCoord" ? (
                      <div className="click-quiz">
                        <p className="click-help">
                          在球面上点一下你要找的位置。可以拖动旋转、滚轮缩放，也可以切到「平面地图」或「对照」。
                        </p>
                        <div className={clickPoint ? "click-pos has" : "click-pos"}>
                          {clickPoint ? (
                            <>你点的是 <b>{fmtCoord(clickPoint)}</b></>
                          ) : (
                            "还没有点选位置"
                          )}
                        </div>

                        {clickFeedback && (
                          <div className={clickFeedback.ok ? "feedback ok" : "feedback bad"}>
                            <strong>
                              {clickFeedback.ok
                                ? "定位正确"
                                : clickFeedback.reveal
                                  ? "看一下正确位置"
                                  : "偏了一点"}
                            </strong>
                            <p>{clickFeedback.msg}</p>
                          </div>
                        )}

                        {!clickFeedback?.reveal ? (
                          <button className="btn big" disabled={!clickPoint} onClick={submitClick}>
                            确认位置
                          </button>
                        ) : (
                          <>
                            <div className="click-explain">
                              <b>正确答案：{quiz.target ? fmtCoord(quiz.target) : ""}</b>
                              <p>{quiz.explain}</p>
                            </div>
                            {!entry?.added && (
                              <button className="link manual-add" onClick={manualAdd}>
                                这道我蒙对的，加入错题本
                              </button>
                            )}
                            <button className="btn big" onClick={nextQuestion}>
                              {reviewItem ? "下一道错题" : "下一题"}
                            </button>
                          </>
                        )}
                      </div>
                    ) : quiz.kind === "clickProvince" ? (
                      <div className="click-quiz">
                        <p className="click-help">
                          在左边的中国地图上点一下你找到的省份，点中就提交。
                        </p>
                        <div className={pickedProvince ? "click-pos has" : "click-pos"}>
                          {pickedProvince ? `你点的是 ${pickedProvince}` : "还没有点选省份"}
                        </div>

                        {clickFeedback && (
                          <div className={clickFeedback.ok ? "feedback ok" : "feedback bad"}>
                            <strong>
                              {clickFeedback.ok
                                ? "找对了"
                                : clickFeedback.reveal
                                  ? "看一下正确位置"
                                  : "不是这个省"}
                            </strong>
                            <p>{clickFeedback.msg}</p>
                          </div>
                        )}

                        {clickFeedback?.reveal ? (
                          <>
                            <div className="click-explain">
                              <b>正确答案：{quiz.targetProvince}</b>
                              <p>{quiz.explain}</p>
                            </div>
                            {!entry?.added && (
                              <button className="link manual-add" onClick={manualAdd}>
                                这道我蒙对的，加入错题本
                              </button>
                            )}
                            <button className="btn big" onClick={nextQuestion}>
                              {reviewItem ? "下一道错题" : "下一题"}
                            </button>
                          </>
                        ) : (
                          <p className="click-help subtle">
                            点一下地图上的省份就会提交，最多试 2 次。
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="options">
                          {quiz.options.map((opt, i) => {
                            let cls = "option";
                            if (chosen !== null) {
                              if (i === quiz.answer) cls += " correct";
                              else if (i === chosen) cls += " wrong";
                              else cls += " dim";
                            }
                            return (
                              <button
                                key={opt}
                                className={cls}
                                onClick={() => answer(i)}
                                disabled={chosen !== null}
                              >
                                <span className="opt-key">{OPTION_KEYS[i]}</span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {chosen !== null && (
                          <div className={chosen === quiz.answer ? "feedback ok" : "feedback bad"}>
                            <strong>{chosen === quiz.answer ? "答对了" : "再想想"}</strong>
                            <p>{quiz.explain}</p>
                          </div>
                        )}

                        {chosen !== null && chosen === quiz.answer && !entry?.added && (
                          <button className="link manual-add" onClick={manualAdd}>
                            这道我蒙对的，加入错题本
                          </button>
                        )}

                        {chosen !== null && (
                          <button className="btn big" onClick={nextQuestion}>
                            {reviewItem ? "下一道错题" : "下一题"}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {tab === "wrong" && (
              <div className="wrong">
                <div className="stat-row">
                  <div className="stat">
                    <b>{stats.total}</b>
                    <span>错题总数</span>
                  </div>
                  <div className="stat">
                    <b>{stats.due}</b>
                    <span>今天要复习</span>
                  </div>
                  <div className="stat">
                    <b>{stats.mastered}</b>
                    <span>已掌握</span>
                  </div>
                </div>

                <button
                  className="btn big"
                  disabled={stats.due === 0}
                  onClick={() => startReview(dueItems(wrongbook))}
                >
                  {stats.due === 0 ? "今天没有要复习的错题" : `开始复习（${stats.due} 道）`}
                </button>

                {stats.byTag.length > 0 && (
                  <div className="tag-stats">
                    <h4>按知识点</h4>
                    {stats.byTag.map((t) => (
                      <div key={t.tag} className="tag-stat">
                        <span>{t.tag}</span>
                        <div className="bar">
                          <i style={{ width: `${Math.round((t.mastered / t.count) * 100)}%` }} />
                        </div>
                        <em>{t.mastered}/{t.count}</em>
                      </div>
                    ))}
                  </div>
                )}

                <div className="wrong-list">
                  {wrongbook.length === 0 && (
                    <div className="empty">
                      还没有错题。做几道练习，错的题会自动进来，并按 1 / 3 / 7 / 15 天的间隔提醒你复习。
                    </div>
                  )}
                  {wrongbook.map((it) => (
                    <div key={it.id} className="wrong-item">
                      <div className="wrong-top">
                        <span className="wrong-tag">{it.tag}</span>
                        <span className={it.stage >= 4 ? "stage-badge done" : "stage-badge"}>
                          {it.stage >= 4 ? "已掌握" : `第 ${it.stage + 1} 阶`}
                        </span>
                      </div>
                      <p className="wrong-prompt">{it.prompt}</p>
                      <p className="wrong-answer">
                        你的答案：<s>{it.userAnswer}</s> ｜ 正确答案：<b>{it.correct}</b>
                      </p>
                      <button className="link" onClick={() => startReview([it])}>
                        重练这一道
                      </button>
                    </div>
                  ))}
                </div>

                {wrongbook.length > 0 && (
                  <button
                    className="btn ghost danger"
                    onClick={() => {
                      if (confirm("清空所有错题记录？这个操作不能撤销。")) {
                        setWrongbook(clearWrongBook());
                      }
                    }}
                  >
                    清空错题本
                  </button>
                )}
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
