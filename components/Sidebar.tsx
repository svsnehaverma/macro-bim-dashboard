"use client";

type ModuleKey = "EL" | "OA" | "PE" | string;

export type SidebarSection = {
  key: string;
  label: string;
};

const moduleNames: Record<string, string> = {
  EL: "Education Landscape",
  OA: "Organisational Adoption",
  PE: "Policy Environment",
};

export function Sidebar(props: {
  modules: ModuleKey[];
  activeModule: ModuleKey;
  onSelectModule: (m: ModuleKey) => void;

  sections: SidebarSection[];
  activeSectionKey: string;
  onSelectSection: (k: string) => void;
}) {
  const { modules, activeModule, onSelectModule, sections, activeSectionKey, onSelectSection } = props;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="badge">ma</div>
        <div>
          <h1>macro adoption</h1>
          <p>Macro BIM Adoption</p>
        </div>
      </div>

      <div className="navSection">
        <div className="navTitle">Dashboards</div>
        {modules.map((m) => {
          const label = moduleNames[m] ?? m;
          const active = m === activeModule;
          return (
            <div
              key={m}
              className={"navItem" + (active ? " navItemActive" : "")}
              onClick={() => onSelectModule(m)}
              role="button"
              tabIndex={0}
            >
              <span>{label}</span>
            </div>
          );
        })}
      </div>

      <div className="navSection" style={{ marginTop: 16 }}>
        <div className="navTitle">Sections</div>
        {sections.map((s) => {
          const active = s.key === activeSectionKey;
          return (
            <div
              key={s.key}
              className={"navItem" + (active ? " navItemActive" : "")}
              onClick={() => onSelectSection(s.key)}
              role="button"
              tabIndex={0}
            >
              <span>{s.label}</span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
