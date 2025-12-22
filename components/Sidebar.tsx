"use client";

import React from "react";

export type Subcat = { key: string; label: string };
export type ModuleNode = { key: string; label: string; subcategories: Subcat[] };

export function Sidebar(props: {
  modules: ModuleNode[];
  activeModule: string;
  activeSubcat: string;
  onSelect: (moduleKey: string, subcatKey: string) => void;
}) {
  const { modules, activeModule, activeSubcat, onSelect } = props;

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
        const isActiveModule = m.key === activeModule;
        const firstSub = m.subcategories?.[0]?.key ?? "";

        return (
          <div key={m.key} className="navGroup">
            <div
              className={"navItem" + (isActiveModule ? " active" : "")}
              onClick={() => onSelect(m.key, firstSub)}
              role="button"
              tabIndex={0}
            >
              <span>{m.label}</span>
            </div>

            {isActiveModule &&
              (m.subcategories ?? []).map((sc) => {
                const isActiveSub = sc.key === activeSubcat;
                return (
                  <div
                    key={sc.key}
                    className={"subItem" + (isActiveSub ? " active" : "")}
                    onClick={() => onSelect(m.key, sc.key)}
                    role="button"
                    tabIndex={0}
                  >
                    {sc.label}
                  </div>
                );
              })}
          </div>
        );
      })}
    </aside>
  );
}
