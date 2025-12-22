"use client";

type ModuleKey = "EL" | "OA" | "PE" | string;

const moduleNames: Record<string, string> = {
  EL: "Education Landscape",
  OA: "Organisational Adoption",
  PE: "Policy Environment",
};

export function Sidebar(props: {
  modules: ModuleKey[];
  activeModule: ModuleKey;
  onSelectModule: (m: ModuleKey) => void;
}) {
  const { modules, activeModule, onSelectModule } = props;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logoMark">ma</div>
        <div>
          <h1>macro adoption</h1>
          <p>Macro BIM Adoption</p>
        </div>
      </div>

      <div className="navTitle">Dashboards</div>
      {modules.map((m) => {
        const label = moduleNames[m] ?? m;
        const active = m === activeModule;
        return (
          <div
            key={m}
            className={"navItem" + (active ? " active" : "")}
            onClick={() => onSelectModule(m)}
            role="button"
            tabIndex={0}
          >
            <span>{label}</span>
          </div>
        );
      })}
    </aside>
  );
}
