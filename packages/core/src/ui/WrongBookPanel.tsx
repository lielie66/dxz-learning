import type { WrongItem, WrongStats } from "../types";

export type WrongBookPanelProps<K extends string = string> = {
  items: WrongItem<K>[];
  stats: WrongStats;
  onReviewDue: () => void;
  onRetry: (item: WrongItem<K>) => void;
  onClear: () => void;
};

/** 错题本页：统计、按知识点掌握度、错题列表、清空。 */
export function WrongBookPanel<K extends string = string>({
  items,
  stats,
  onReviewDue,
  onRetry,
  onClear,
}: WrongBookPanelProps<K>) {
  return (
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

      <button className="btn big" disabled={stats.due === 0} onClick={onReviewDue}>
        {stats.due === 0 ? "今天没有要复习的错题" : `开始复习（${stats.due} 道）`}
      </button>

      {stats.byTag.length > 0 && (
        <div className="tag-stats">
          <h4>按知识点</h4>
          {stats.byTag.map((tag) => (
            <div key={tag.tag} className="tag-stat">
              <span>{tag.tag}</span>
              <div className="bar">
                <i style={{ width: `${Math.round((tag.mastered / tag.count) * 100)}%` }} />
              </div>
              <em>
                {tag.mastered}/{tag.count}
              </em>
            </div>
          ))}
        </div>
      )}

      <div className="wrong-list">
        {items.length === 0 && (
          <div className="empty">
            还没有错题。做几道练习，错的题会自动进来，并按 1 / 3 / 7 / 15 天的间隔提醒你复习。
          </div>
        )}
        {items.map((item) => (
          <div key={item.id} className="wrong-item">
            <div className="wrong-top">
              <span className="wrong-tag">{item.tag}</span>
              <span className={item.stage >= 4 ? "stage-badge done" : "stage-badge"}>
                {item.stage >= 4 ? "已掌握" : `第 ${item.stage + 1} 阶`}
              </span>
            </div>
            <p className="wrong-prompt">{item.prompt}</p>
            <p className="wrong-answer">
              你的答案：<s>{item.userAnswer}</s> ｜ 正确答案：<b>{item.correct}</b>
            </p>
            <button className="link" onClick={() => onRetry(item)}>
              重练这一道
            </button>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <button
          className="btn ghost danger"
          onClick={() => {
            if (confirm("清空所有错题记录？这个操作不能撤销。")) onClear();
          }}
        >
          清空错题本
        </button>
      )}
    </div>
  );
}
