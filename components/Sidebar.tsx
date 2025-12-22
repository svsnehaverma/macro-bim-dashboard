"use client";

import type { KeyboardEvent } from "react";

export type ModuleNode = {
  key: string;
  label: string;
  subcategories?: { key: string; label: string }[];
};

function isActivationKey(e: KeyboardEvent<HTMLElement>) {
  return e.key === "Enter" || e.key === " ";
}

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
        const subcats = m.subcategories ?? [];
        const defaultSubcat = subcats[0]?.key ?? "";

        return (
          <div key={m.key} className="navGroup">
            <div
              className={`navItem${isActiveModule ? " active" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(m.key, activeSubcat || defaultSubcat)}
              onKeyDown={(e) => {
                if (!isActivationKey(e)) return;
                e.preventDefault();
                onSelect(m.key, activeSubcat || defaultSubcat);
              }}
            >
              <span>{m.label}</span>
            </div>

            {isActiveModule && subcats.length > 0 && (
              <div>
                {subcats.map((sc) => {
                  const isActiveSub = sc.key === activeSubcat;
                  return (
                    <div
                      key={sc.key}
                      className={`subItem${isActiveSub ? " active" : ""}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelect(m.key, sc.key)}
                      onKeyDown={(e) => {
                        if (!isActivationKey(e)) return;
                        e.preventDefault();
                        onSelect(m.key, sc.key);
                      }}
                    >
                      {sc.label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}
