export type LessonChipItem = { id: string; label: string };

export type LessonChipsProps = {
  items: LessonChipItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

/** 课程胶囊导航，例如「第 1 课」「第 2 课」。 */
export function LessonChips({ items, activeIndex, onSelect }: LessonChipsProps) {
  return (
    <div className="lesson-chips">
      {items.map((item, index) => (
        <button
          key={item.id}
          className={index === activeIndex ? "chip active" : "chip"}
          onClick={() => onSelect(index)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function LessonHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="lesson-head">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

export type StepCardProps = {
  /** 0-based */
  stepIndex: number;
  stepTotal: number;
  title: string;
  body: string;
  bullets?: string[];
  tip?: string;
};

export function StepCard({ stepIndex, stepTotal, title, body, bullets, tip }: StepCardProps) {
  return (
    <article className="step-card">
      <div className="step-count">
        第 {stepIndex + 1} / {stepTotal} 步
      </div>
      <h3>{title}</h3>
      <p className="step-body">{body}</p>
      {bullets && (
        <ul className="step-bullets">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      )}
      {tip && <div className="tip">{tip}</div>}
    </article>
  );
}

export type StepNavProps = {
  stepIndex: number;
  stepTotal: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (index: number) => void;
  /** 最后一步的按钮文案，例如「去练一练」 */
  lastLabel?: string;
};

export function StepNav({
  stepIndex,
  stepTotal,
  onPrev,
  onNext,
  onJump,
  lastLabel = "下一步",
}: StepNavProps) {
  const isLast = stepIndex >= stepTotal - 1;
  return (
    <div className="step-nav">
      <button className="btn ghost" disabled={stepIndex === 0} onClick={onPrev}>
        上一步
      </button>
      <div className="dots">
        {Array.from({ length: stepTotal }, (_, index) => (
          <button
            key={index}
            className={index === stepIndex ? "dot-btn active" : "dot-btn"}
            onClick={() => onJump(index)}
            aria-label={`第 ${index + 1} 步`}
          />
        ))}
      </div>
      <button className="btn" onClick={onNext}>
        {isLast ? lastLabel : "下一步"}
      </button>
    </div>
  );
}
