export type QuizReviewInfo = {
  tag: string;
  remaining: number;
};

export type QuizHeaderProps = {
  tag: string;
  review?: QuizReviewInfo | null;
  canPrev: boolean;
  onPrev: () => void;
  /** 换一题；review 模式下不显示 */
  onChange?: () => void;
  onClear: () => void;
};

/** 练习卡片顶部：错题重练横幅 + 题型标签 + 工具按钮。 */
export function QuizHeader({
  tag,
  review,
  canPrev,
  onPrev,
  onChange,
  onClear,
}: QuizHeaderProps) {
  return (
    <>
      {review && (
        <div className="review-banner">
          错题重练 · {review.tag}
          <span>还剩 {Math.max(0, review.remaining)} 道</span>
        </div>
      )}
      <div className="quiz-tag">
        <span>{tag}</span>
        <span className="quiz-tools">
          <button className="link" disabled={!canPrev} onClick={onPrev}>
            ← 上一题
          </button>
          {!review && onChange && (
            <button className="link" onClick={onChange}>
              换一题
            </button>
          )}
          <button className="link" onClick={onClear}>
            选择题型
          </button>
        </span>
      </div>
    </>
  );
}

export function Feedback({ ok, title, message }: { ok: boolean; title: string; message: string }) {
  return (
    <div className={ok ? "feedback ok" : "feedback bad"}>
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}

export type ChoiceQuestionProps = {
  options: string[];
  answer: number;
  chosen: number | null;
  explain: string;
  /** 是否已经手动加入错题本 */
  added: boolean;
  /** 是否错题重练 */
  review: boolean;
  onChoose: (index: number) => void;
  onManualAdd: () => void;
  onNext: () => void;
  optionKeys?: string[];
};

/** 选择题通用交互：选项、对错反馈、蒙对加错题、下一题。 */
export function ChoiceQuestion({
  options,
  answer,
  chosen,
  explain,
  added,
  review,
  onChoose,
  onManualAdd,
  onNext,
  optionKeys,
}: ChoiceQuestionProps) {
  const keys =
    optionKeys ?? Array.from({ length: options.length }, (_, i) => String.fromCharCode(65 + i));
  return (
    <>
      <div className="options">
        {options.map((option, index) => {
          let className = "option";
          if (chosen !== null) {
            if (index === answer) className += " correct";
            else if (index === chosen) className += " wrong";
            else className += " dim";
          }
          return (
            <button
              key={`${index}-${option}`}
              className={className}
              onClick={() => onChoose(index)}
              disabled={chosen !== null}
            >
              <span className="opt-key">{keys[index] ?? String(index + 1)}</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {chosen !== null && (
        <Feedback
          ok={chosen === answer}
          title={chosen === answer ? "答对了" : "再想想"}
          message={explain}
        />
      )}

      {chosen !== null && chosen === answer && !added && (
        <button className="link manual-add" onClick={onManualAdd}>
          这道我蒙对的，加入错题本
        </button>
      )}

      {chosen !== null && (
        <button className="btn big" onClick={onNext}>
          {review ? "下一道错题" : "下一题"}
        </button>
      )}
    </>
  );
}
