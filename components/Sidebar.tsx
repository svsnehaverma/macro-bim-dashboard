"use client";

import React from "react";

export type Subcat = { key: string; label: string };
export type ModuleNode = { key: string; label: string; subcategories?: Subcat[] };

type SidebarProps = {
  modules: ModuleNode[];

  // NEW style
  activeModule?: string;
  activeSubcat?: string;
  onSelect?: (moduleKey: string, subcatKey: string) => void;

  // OLD style (compat)
  selectedModule?: string;
  selectedSubcategory?: string;
  onSelectModule?: (moduleKey: string) => void;
  onSelectSubcat?: (subcatKey: string) => void;
};

export function Sidebar(props: SidebarProps) {
  const modules = props.modules ?? [];

  // Accept both naming styles
  const activeModule = props.activeModule ?? props.selectedModule ?? modules[0]?.key ?? "";
  const activeSubcat =
    props.activeSubcat ??
    props.selectedSubcategory ??
    modules.find((m) => m.key === activeModule)?.subcategories?.[0]?.key ??
    "";

  const doSelect = (moduleKey: string, subcatKey: string) => {
    // Prefer NEW handler
    if (props.onSelect) {
      props.onSelect(moduleKey, subcatKey);
      return;
    }
    // Fallback to OLD handlers
    props.onSelectModule?.(moduleKey);
    props.onSelectSubcat?.(subcatKey);
  };

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
              onClick={() => doSelect(m.key, firstSub)}
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
                    onClick={() => doSelect(m.key, sc.key)}
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

// ALSO export default to avoid import mismatch:
// import Sidebar from "./Sidebar" OR import { Sidebar } from "./Sidebar"
export default Sidebar;
