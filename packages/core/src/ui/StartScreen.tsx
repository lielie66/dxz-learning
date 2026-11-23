export type StartQuickButton = {
  label: string;
  onClick: () => void;
  /** 主按钮（实心），否则为 ghost */
  primary?: boolean;
};

export type StartKindSection = {
  title: string;
  items: { id: string; label: string; onClick: () => void }[];
};

export type StartScreenProps = {
  title?: string;
  description?: string;
  quickButtons: StartQuickButton[];
  sections: StartKindSection[];
};

/** 练习页的起始屏：随机练 + 按章节 / 题型选择。 */
export function StartScreen({
  title = "练一练",
  description = "题目会随机生成，可以一直练，不会重复背答案。",
  quickButtons,
  sections,
}: StartScreenProps) {
  return (
    <div className="start-screen">
      <h2>{title}</h2>
      <p>{description}</p>
      {quickButtons.map((button) => (
        <button
          key={button.label}
          className={button.primary ? "btn big" : "btn big ghost"}
          onClick={button.onClick}
        >
          {button.label}
        </button>
      ))}
      {sections.map((section) => (
        <div key={section.title}>
          <div className="kind-section">{section.title}</div>
          <div className="kind-grid">
            {section.items.map((item) => (
              <button key={item.id} className="kind-btn" onClick={item.onClick}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
