"use client";

import { MagnifyingGlass, Bell, CaretDown, SignOut } from "@phosphor-icons/react";
import { useUser } from "@/components/auth/UserProvider";
import { ROLE_LABELS } from "@/lib/auth/roles";
import ThemeToggle from "./ThemeToggle";

export default function TopBar() {
  const user = useUser();
  const initials = user.email.slice(0, 2).toUpperCase();

  return (
    <header className="top-bar">
      <div className="top-bar-inner">
        <div className="left-controls">
          <div className="search-box">
            <MagnifyingGlass size={16} weight="regular" />
            <input type="text" placeholder="Search clients, alerts…" />
            <span className="shortcut">⌘K</span>
          </div>
        </div>

        <div className="right-controls">
          <ThemeToggle />

          <div className="header-icons">
            <Bell size={18} weight="regular" />
          </div>

          <div className="dropdown-container">
            <div className="dropdown-trigger user-profile">
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--accent-purple)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{user.email}</span>
              <CaretDown size={12} weight="regular" />
            </div>

            <div className="dropdown-menu right-aligned">
              <div
                style={{
                  padding: "8px 12px 6px",
                  borderBottom: "1px solid var(--border-color)",
                  marginBottom: 4,
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                  {user.email}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  {ROLE_LABELS[user.role]}
                </p>
              </div>
              <a href="/login" className="dropdown-item text-red">
                <SignOut size={14} weight="regular" />
                Sign out
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
