"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Building2,
  BedDouble,
  FolderOpen,
  CalendarDays,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronDown,
  HelpCircle,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Newspaper,
} from "lucide-react";
import ProtectedPage from "@/components/protectedPage";

// ================= Types =================
type MenuItem = {
  name: string;
  href?: string;
  icon?: React.ElementType;
  children?: { name: string; href: string }[];
};

type MenuSection = {
  label: string;
  items: MenuItem[];
};

// ================= Menu Data =================
const sidebarSections: MenuSection[] = [
  {
    label: "MAIN MENU",
    items: [{ name: "Dashboard", href: "/dashboard", icon: Home }],
  },
  {
    label: "MANAGEMENT",
    items: [
      {
        name: "Properties",
        icon: Building2,
        children: [
          { name: "Property List", href: "/tenant/dashboard/properties" },
          { name: "Add Property", href: "/tenant/dashboard/properties/add" },
        ],
      },
      {
        name: "Rooms",
        icon: BedDouble,
        children: [
          { name: "Room List", href: "/dashboard/rooms" },
          { name: "Add Room", href: "/dashboard/rooms/add" },
        ],
      },
      {
        name: "Categories", 
        icon: FolderOpen,
        children: [
          { name: "Manage Categories", href: "/tenant/dashboard/categories" }
        ]
      },
      {
        name: "Availability & Pricing",
        icon: CalendarDays,
        children: [
          {
            name: "Availability Calendar",
            href: "/dashboard/pricing/calendar",
          },
          { name: "Peak Season Rate", href: "/dashboard/pricing/peak" },
        ],
      },
      {
        name: "Transaction",
        icon: Newspaper,
        children: [
          {
            name: "Order List",
            href: "/tenant/dashboard/transactions",
          },
        ],
      },
      {
        name: "Reports",
        icon: BarChart3,
        children: [
          {
            name: "Sales Report",
            href: "/tenant/dashboard/sales",
          },
          {
            name: "Property Report",
            href: "/tenant/dashboard/property-report",
          },
        ],
      },
    ],
  },
  {
    label: "HELP & SUPPORT",
    items: [
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
      { name: "Support", href: "/dashboard/support", icon: HelpCircle },
    ],
  },
];

// ================= Helper =================
const useActive = () => {
  const pathname = usePathname();
  return (href?: string) => href && pathname.startsWith(href);
};

// ================= Desktop Sidebar =================
function DesktopSidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const isActive = useActive();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (name: string) =>
    setExpanded(expanded === name ? null : name);

  return (
    <aside
      className={`hidden lg:flex flex-col bg-[#2f567a] text-white shadow-lg h-full transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo + Collapse */}
      <div
        className={`flex items-center justify-between px-4 py-4 border-b border-white/10 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        {!collapsed && (
          <Link href="/" className="font-bold text-lg tracking-wide">
            StayFinder
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-white/10 rounded p-1"
        >
          {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-2 mt-4 space-y-6 overflow-y-auto">
        {sidebarSections.map((section, idx) => (
          <div key={idx}>
            {!collapsed && (
              <div className="px-3 mb-2 text-xs font-semibold tracking-wider text-gray-300 uppercase">
                {section.label}
              </div>
            )}
            {section.items.map((menu, i) => {
              const Icon = menu.icon;
              const hasChildren = menu.children?.length;

              return (
                <div key={i}>
                  <button
                    onClick={() =>
                      hasChildren && !collapsed ? toggleExpand(menu.name) : null
                    }
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition ${
                      isActive(menu.href) ? "bg-white/20" : "hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon size={20} />}
                      {!collapsed && (
                        <span className="text-sm font-medium">{menu.name}</span>
                      )}
                    </div>
                    {!collapsed && hasChildren && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          expanded === menu.name ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {/* Submenu */}
                  <AnimatePresence>
                    {hasChildren && expanded === menu.name && !collapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-8 mt-1 flex flex-col space-y-1"
                      >
                        {menu.children?.map((child, idx) => (
                          <Link
                            key={idx}
                            href={child.href}
                            className={`text-sm px-3 py-1 rounded transition ${
                              isActive(child.href)
                                ? "bg-white/20 font-medium"
                                : "hover:bg-white/10"
                            }`}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-white/10">
        <button className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/10 transition">
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

// ================= Mobile Sidebar =================
function MobileSidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const isActive = useActive();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (name: string) =>
    setExpanded(expanded === name ? null : name);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "tween" }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-[#2f567a] text-white shadow-lg flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <Link href="/" className="font-bold text-lg tracking-wide">
                StayFinder
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="text-white"
                aria-label="Close sidebar"
              >
                <X size={22} />
              </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-2 mt-4 space-y-6 overflow-y-auto">
              {sidebarSections.map((section, idx) => (
                <div key={idx}>
                  <div className="px-3 mb-2 text-xs font-semibold tracking-wider text-gray-300 uppercase">
                    {section.label}
                  </div>
                  {section.items.map((menu, i) => {
                    const Icon = menu.icon;
                    const hasChildren = menu.children?.length;

                    return (
                      <div key={i}>
                        <button
                          onClick={() =>
                            hasChildren ? toggleExpand(menu.name) : null
                          }
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition ${
                            isActive(menu.href)
                              ? "bg-white/20"
                              : "hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {Icon && <Icon size={20} />}
                            <span className="text-sm font-medium">
                              {menu.name}
                            </span>
                          </div>
                          {hasChildren && (
                            <ChevronDown
                              size={16}
                              className={`transition-transform ${
                                expanded === menu.name ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </button>

                        {/* Submenu */}
                        <AnimatePresence>
                          {hasChildren && expanded === menu.name && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="ml-8 mt-1 flex flex-col space-y-1"
                            >
                              {menu.children?.map((child, idx) => (
                                <Link
                                  key={idx}
                                  href={child.href}
                                  className={`text-sm px-3 py-1 rounded transition ${
                                    isActive(child.href)
                                      ? "bg-white/20 font-medium"
                                      : "hover:bg-white/10"
                                  }`}
                                >
                                  {child.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Logout */}
            <div className="px-2 py-4 border-t border-white/10">
              <button className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/10 transition">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>

          {/* Overlay */}
          <motion.div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        </>
      )}
    </AnimatePresence>
  );
}

// ================= Layout =================
export default function TenantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false); // mobile
  const [collapsed, setCollapsed] = useState(false); // desktop

  return (
    <ProtectedPage role="TENANT">
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <DesktopSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <MobileSidebar open={open} setOpen={setOpen} />

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile topbar */}
          <div className="flex items-center justify-between p-4 bg-white shadow lg:hidden">
            <button
              onClick={() => setOpen(true)}
              className="text-gray-700"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>
            <span className="font-bold">Tenant Dashboard</span>
            <div className="w-6" />
          </div>

          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ProtectedPage>
  );
}
