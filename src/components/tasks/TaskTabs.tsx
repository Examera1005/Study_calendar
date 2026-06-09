import { useLanguage } from "../../hooks/useLanguage";

type Tab = "daily" | "general" | "done";

type Props = {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
  generalIncompleteCount: number;
  doneCount: number;
};

export function TaskTabs({ activeTab, onChange, generalIncompleteCount, doneCount }: Props) {
  const { t } = useLanguage();

  return (
    <div className="task-tabs" style={{ marginBottom: 20 }}>
      <button
        type="button"
        className={`task-tab ${activeTab === "daily" ? "active" : ""}`}
        onClick={() => onChange("daily")}
        id="task-tab-daily"
      >
        <span className="task-tab-icon">📅</span>
        {t.tasks.dailyTab}
      </button>
      <button
        type="button"
        className={`task-tab ${activeTab === "general" ? "active" : ""}`}
        onClick={() => onChange("general")}
        id="task-tab-general"
      >
        <span className="task-tab-icon">📋</span>
        {t.tasks.generalTab}
        {generalIncompleteCount > 0 && (
          <span className="task-tab-badge">{generalIncompleteCount}</span>
        )}
      </button>
      <button
        type="button"
        className={`task-tab ${activeTab === "done" ? "active" : ""}`}
        onClick={() => onChange("done")}
        id="task-tab-done"
      >
        <span className="task-tab-icon">✓</span>
        {t.tasks.doneTab}
        {doneCount > 0 && (
          <span className="task-tab-badge done-badge">{doneCount}</span>
        )}
      </button>
    </div>
  );
}
