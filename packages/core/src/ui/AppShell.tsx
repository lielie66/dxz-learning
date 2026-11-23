import type { ReactNode } from "react";

export type ShellPill = { text: string; soft?: boolean };

export type AppShellProps = {
  /** 左上角方块里的字，例如“地”“史”“生” */
  mark: string;
  title: string;
  subtitle: string;
  pills?: ShellPill[];
  /** 左侧场景区 */
  stage: ReactNode;
  /** 右侧「讲解 / 练习 / 错题本」面板 */
  panel: ReactNode;
};

/** 全站统一外壳：顶栏 + 左场景 / 右面板。 */
export function AppShell({ mark, title, subtitle, pills = [], stage, panel }: AppShellProps) {
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">{mark}</div>
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>
        {pills.length > 0 && (
          <div className="topbar-right">
            {pills.map((pill) => (
              <span key={pill.text} className={pill.soft ? "pill pill-soft" : "pill"}>
                {pill.text}
              </span>
            ))}
          </div>
        )}
      </header>
      <main className="layout">
        <section className="stage">{stage}</section>
        <aside className="panel">{panel}</aside>
      </main>
    </div>
  );
}
