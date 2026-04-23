"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  SquaresFour,
  Users,
  UsersThree,
  Bell,
  GearSix,
  List,
} from "@phosphor-icons/react";
import { useUser } from "@/components/auth/UserProvider";

const allNavItems = [
  { href: "/overview", label: "Overview", icon: SquaresFour, roles: ["admin", "account_manager", "viewer"] },
  { href: "/clients", label: "Clients", icon: Users, roles: ["admin", "account_manager", "viewer"] },
  { href: "/alerts", label: "Alerts", icon: Bell, roles: ["admin", "account_manager", "viewer"] },
  { href: "/portal-users", label: "Portal Users", icon: UsersThree, roles: ["admin"] },
  { href: "/admin", label: "Admin", icon: GearSix, roles: ["admin"] },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useUser();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = allNavItems.filter((item) =>
    (item.roles as readonly string[]).includes(role)
  );

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="user-brand">
          <span
            className="brand-name"
            style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px" }}
          >
            TCMS
          </span>
        </div>
        <button
          className="toggle-btn"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle sidebar"
        >
          <List size={18} weight="regular" />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item${isActive(href) ? " active" : ""}`}
          >
            <Icon size={18} weight={isActive(href) ? "fill" : "regular"} />
            <span className="nav-text">{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
