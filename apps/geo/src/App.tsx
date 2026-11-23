import { useEffect, useMemo, useState } from "react";
import Globe, { defaultGlobeConfig, type GlobeConfig } from "./globe/Globe";
import FlatMap from "./globe/FlatMap";
import ChinaMap, { defaultChinaConfig, type ChinaConfig } from "./globe/ChinaMap";
import TerrainProfile from "./globe/TerrainProfile";
import ClimateChart from "./globe/ClimateChart";
import EarthBasics from "./globe/EarthBasics";
import MapBasics from "./globe/MapBasics";
import ContourMap from "./globe/ContourMap";
import ContourLab from "./globe/ContourLab";
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
  GEO_WRONG_KEY,
  GEO_WRONG_LEGACY_KEY,
  wrongInput,
  type WrongItem,
} from "./lib/wrongbook";
import {
  AppShell,
  Tabs,
  LessonChips,
  LessonHead,
  StepCard,
  StepNav,
  StartScreen,
  QuizHeader,
  Feedback,
  ChoiceQuestion,
  WrongBookPanel,
  useWrongBook,
  useQuizSession,
  type QuizSessionEntry,
} from "@dxz/core";

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
  | "contourlab"
  | "solar"
  | "hierarchy"
  | "timeline"
  | "terrain3d"
  | "valley";

type ClickFeedback = { ok: boolean; reveal: boolean; dist: number; msg: string };

type EntryExtra = {
  clickPoint: LatLon | null;
  clickFeedback: ClickFeedback | null;
  clickTries: number;
  clickRecorded: boolean;
  pickedProvince: string | null;
};

type Entry = QuizSessionEntry<Question, QuestionKind, EntryExtra>;

type GeoScope = QuestionKind | "geo" | "china" | "geo4" | "universe";

function newEntry(q: Question, review: WrongItem | null): Entry {
  return {
    q,
    review,
    chosen: null,
    added: false,
    clickPoint: null,
    clickFeedback: null,
    clickTries: 0,
    clickRecorded: false,
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

  const wrong = useWrongBook<QuestionKind>(GEO_WRONG_KEY, GEO_WRONG_LEGACY_KEY);
  const session = useQuizSession<Question, GeoScope, QuestionKind, EntryExtra>({
    makeQuestion: (scope, avoidKind) => makeForScope(scope, avoidKind),
    makeVariant,
    kindOf: (q) => q.kind,
    createEntry: newEntry,
    answerOf: (q) => q.answer,
    userAnswerOf: (q, index) => q.options[index],
    onWrong: (q, userAnswer) => wrong.add(wrongInput(q), userAnswer),
    onReview: (id, correct) => wrong.review(id, correct),
    onQuestionChange: (q) => setViewMode(initialView(q)),
    onReviewComplete: () => setTab("wrong"),
    initialScope: "geo",
  });

  const [picked, setPicked] = useState<LatLon | null>(null);
  const [hover, setHover] = useState<LatLon | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("3d");
  const [showLabels, setShowLabels] = useState(
    () => localStorage.getItem("geo-lab:showlabels") !== "0"
  );

  const entry = session.entry;
  const quiz = session.quiz;
  const chosen = session.chosen;
  const reviewItem = session.reviewItem;
  const clickPoint = entry?.clickPoint ?? null;
  const clickFeedback = entry?.clickFeedback ?? null;
  const clickTries = entry?.clickTries ?? 0;
  const clickRecorded = entry?.clickRecorded ?? false;
  const pickedProvince = entry?.pickedProvince ?? null;
  const wrongbook = wrong.items;
  const stats = wrong.stats;

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

  function goLesson(i: number) {
    setLessonIdx(i);
    setStepIdx(0);
    setPicked(null);
  }

  function makeForScope(scope: GeoScope, avoidKind?: QuestionKind): Question {
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

  function startPractice(scope?: GeoScope) {
    setTab("practice");
    setPicked(null);
    session.start(scope ?? "geo");
  }

  function startReview(items: WrongItem[]) {
    setTab("practice");
    setPicked(null);
    if (!items.length) {
      session.reset();
      setViewMode("3d");
      return;
    }
    session.startReview(items);
  }

  function submitClick() {
    if (!quiz?.target || !clickPoint) return;
    const d = angularDistance(clickPoint, quiz.target);
    const { ns, ew } = deltaHint(clickPoint, quiz.target);
    const ok = d <= 6;
    const tries = clickTries + 1;

    if (ok) {
      session.updateEntry({
        clickTries: tries,
        clickFeedback: {
          ok: true,
          reveal: true,
          dist: d,
          msg: "很准！你已经能按经纬网定位了。",
        },
      });
      if (reviewItem) wrong.review(reviewItem.id, true);
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
      if (reviewItem) wrong.review(reviewItem.id, false);
      else wrong.add(wrongInput(quiz), fmtCoord(clickPoint));
      patch.clickRecorded = true;
      patch.added = true;
    }

    session.updateEntry(patch);
  }

  function manualAdd() {
    if (!quiz) return;
    const ans =
      chosen !== null
        ? quiz.options[chosen]
        : clickPoint
          ? fmtCoord(clickPoint)
          : "（手动加入）";
    wrong.add(wrongInput(quiz), ans);
    session.updateEntry({ added: true });
  }

  function nextQuestion() {
    session.next();
  }

  function prevQuestion() {
    session.prev();
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
      session.updateEntry({ clickPoint: p, clickFeedback: null });
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
      if (reviewItem) wrong.review(reviewItem.id, true);
      session.updateEntry(patch);
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
      if (reviewItem) wrong.review(reviewItem.id, false);
      else wrong.add(wrongInput(quiz), name);
      patch.clickRecorded = true;
      patch.added = true;
    }
    session.updateEntry(patch);
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
    <AppShell
      mark="地"
      title="地理实验室"
      subtitle={`中图版 · 七年级上册 · ${chapter}`}
      pills={[{ text: "七年级上" }, { text: "3D 地球仪", soft: true }]}
      stage={
        <>
          <div className={viewMode === "split" ? "stage-canvas split" : "stage-canvas"}>
            {viewMode === "contourlab" ? (
              <div className="pane">
                <ContourLab
                  key={step.contourLab?.scene ?? "mountain"}
                  scene={step.contourLab?.scene ?? "mountain"}
                />
              </div>
            ) : viewMode === "valley" ? (
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

          {!["terrain", "climate", "earth", "map", "contour", "contourlab", "solar", "hierarchy", "timeline", "terrain3d", "valley"].includes(viewMode) && (
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

          {viewMode !== "contourlab" && (
            <div className="stage-hint">
            {viewMode === "china"
              ? "点击省份，查看简称与行政中心"
              : viewMode === "flat"
                ? "点击地图上的任意位置读坐标"
                : viewMode === "terrain"
                  ? "示意图：西高东低，呈三级阶梯"
                  : viewMode === "climate"
                    ? "左轴气温（℃），右轴降水（mm）"
                    : viewMode === "contour"
                      ? "示意图：A–F 五个地形部位"
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
          )}

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
        </>
      }
      panel={
        <>
          <Tabs
            tabs={[
              { id: "learn", label: "讲解" },
              { id: "practice", label: "练习" },
              { id: "wrong", label: "错题本", badge: stats.due },
            ]}
            active={tab}
            onChange={(id) => {
              setTab(id as Tab);
              if (id === "practice") setPicked(null);
            }}
          />

          <div className="panel-body">
            {tab === "learn" && (
              <>
                <LessonChips
                  items={LESSONS.map((l) => ({ id: l.id, label: l.title.split(" · ")[0] }))}
                  activeIndex={lessonIdx}
                  onSelect={goLesson}
                />

                <LessonHead title={lesson.title} subtitle={lesson.subtitle} />

                <StepCard
                  stepIndex={stepIdx}
                  stepTotal={lesson.steps.length}
                  title={step.title}
                  body={step.body}
                  bullets={step.bullets}
                  tip={step.tip}
                />

                <StepNav
                  stepIndex={stepIdx}
                  stepTotal={lesson.steps.length}
                  onPrev={() => setStepIdx((v) => Math.max(0, v - 1))}
                  onJump={setStepIdx}
                  onNext={() => {
                    if (stepIdx < lesson.steps.length - 1) {
                      setStepIdx((v) => v + 1);
                    } else {
                      startPractice(
                        ["territory", "admin", "population", "ethnic"].includes(lesson.id)
                          ? "china"
                          : ["terrain", "climate", "weather", "rivers", "divides"].includes(lesson.id)
                            ? "geo4"
                            : "geo"
                      );
                    }
                  }}
                  lastLabel="去练一练"
                />
              </>
            )}

            {tab === "practice" && (
              <>
                {!quiz && (
                  <StartScreen
                    quickButtons={[
                      {
                        label: "随机练 · 地球与地图",
                        onClick: () => startPractice("geo"),
                        primary: true,
                      },
                      { label: "随机练 · 中国的疆域和人口", onClick: () => startPractice("china") },
                      { label: "随机练 · 中国的自然环境", onClick: () => startPractice("geo4") },
                      { label: "随机练 · 地球的宇宙环境", onClick: () => startPractice("universe") },
                    ]}
                    sections={[
                      {
                        title: "第 1 章 · 地球的宇宙环境",
                        items: UNIVERSE_KINDS.map((k) => ({
                          id: k,
                          label: KIND_LABELS[k],
                          onClick: () => startPractice(k),
                        })),
                      },
                      {
                        title: "第 2 章 · 地球和地图",
                        items: GEO_KINDS.map((k) => ({
                          id: k,
                          label: KIND_LABELS[k],
                          onClick: () => startPractice(k),
                        })),
                      },
                      {
                        title: "第 3 章 · 中国的疆域和人口",
                        items: CHINA_KINDS.map((k) => ({
                          id: k,
                          label: KIND_LABELS[k],
                          onClick: () => startPractice(k),
                        })),
                      },
                      {
                        title: "第 4 章 · 中国的自然环境",
                        items: GEO4_KINDS.map((k) => ({
                          id: k,
                          label: KIND_LABELS[k],
                          onClick: () => startPractice(k),
                        })),
                      },
                    ]}
                  />
                )}

                {quiz && (
                  <div className="quiz">
                    <QuizHeader
                      tag={KIND_LABELS[quiz.kind]}
                      review={
                        reviewItem
                          ? {
                              tag: reviewItem.tag,
                              remaining: Math.max(
                                0,
                                session.history.length - session.histIdx - 1
                              ),
                            }
                          : null
                      }
                      canPrev={session.histIdx > 0}
                      onPrev={prevQuestion}
                      onChange={
                        reviewItem ? undefined : () => startPractice(session.practiceKind)
                      }
                      onClear={() => {
                        session.reset();
                      }}
                    />
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
                          <Feedback
                            ok={clickFeedback.ok}
                            title={
                              clickFeedback.ok
                                ? "定位正确"
                                : clickFeedback.reveal
                                  ? "看一下正确位置"
                                  : "偏了一点"
                            }
                            message={clickFeedback.msg}
                          />
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
                          <Feedback
                            ok={clickFeedback.ok}
                            title={
                              clickFeedback.ok
                                ? "找对了"
                                : clickFeedback.reveal
                                  ? "看一下正确位置"
                                  : "不是这个省"
                            }
                            message={clickFeedback.msg}
                          />
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
                      <ChoiceQuestion
                        options={quiz.options}
                        answer={quiz.answer}
                        chosen={chosen}
                        explain={quiz.explain}
                        added={!!entry?.added}
                        review={!!reviewItem}
                        onChoose={session.answer}
                        onManualAdd={manualAdd}
                        onNext={nextQuestion}
                        optionKeys={OPTION_KEYS}
                      />
                    )}
                  </div>
                )}
              </>
            )}

            {tab === "wrong" && (
              <WrongBookPanel
                items={wrongbook}
                stats={stats}
                onReviewDue={() => startReview(wrong.due())}
                onRetry={(item) => startReview([item])}
                onClear={() => wrong.clear()}
              />
            )}
          </div>
        </>
      }
    />
  );
}
