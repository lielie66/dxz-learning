export type TabDef = {
  id: string;
  label: string;
  /** 大于 0 时显示角标 */
  badge?: number;
};

export type TabsProps = {
  tabs: TabDef[];
  active: string;
  onChange: (id: string) => void;
};

/** 右侧顶部的「讲解 / 练习 / 错题本」页签。 */
export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <nav className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={tab.id === active ? "tab active" : "tab"}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {!!tab.badge && tab.badge > 0 && <em className="badge">{tab.badge}</em>}
        </button>
      ))}
    </nav>
  );
}
