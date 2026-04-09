"use client";

import { Sun, Moon, Desktop } from "@phosphor-icons/react";
import { useTheme, Theme } from "@/components/ui/ThemeProvider";
import React from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themeOptions: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Desktop },
  ];

  const CurrentIcon = 
    themeOptions.find((opt) => opt.value === theme)?.icon || Desktop;

  return (
    <div className="dropdown-container">
      <div className="header-icons dropdown-trigger">
        <CurrentIcon size={18} weight="regular" />
      </div>

      <div className="dropdown-menu right-aligned">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              className={`dropdown-item ${theme === option.value ? "active" : ""}`}
              onClick={() => setTheme(option.value)}
              style={{ 
                background: "none", 
                border: "none", 
                width: "100%", 
                textAlign: "left", 
                cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              <Icon size={14} weight="regular" />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
