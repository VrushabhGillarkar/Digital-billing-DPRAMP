"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  FileCheck,
  RotateCcw,
  Receipt,
  Boxes,
  Package,
  FolderTree,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  Truck,
  ClipboardList,
  History,
  Users,
  Ticket,
  Megaphone,
  Sparkles,
  Landmark,
  CreditCard,
  AlertCircle,
  AlertTriangle,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  Store,
  Settings,
  MessageSquare,
  Activity,
  CalendarCheck,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Search,
  Bell,
} from "lucide-react";
import { CopilotDrawer } from "@/components/CopilotDrawer";
import { authApi, notificationApi } from "@/services/api";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  tab?: string;
}

interface NavSection {
  title: string;
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "SALES & BILLING",
    key: "sales",
    icon: ShoppingCart,
    items: [
      { name: "Sell / POS", href: "/dashboard/billing", icon: ShoppingCart },
      { name: "Invoice History", href: "/dashboard/invoices", icon: FileText },
      { name: "Quotations", href: "/dashboard/quotations", icon: FileCheck },
      { name: "Returns / Refunds", href: "/dashboard/returns", icon: RotateCcw },
    ],
  },
  {
    title: "STOCK MANAGEMENT",
    key: "stock",
    icon: Boxes,
    items: [
      { name: "Stock Overview", href: "/dashboard/inventory", icon: Boxes },
      { name: "Products", href: "/dashboard/products", icon: Package },
      { name: "Categories", href: "/dashboard/inventory/categories", icon: FolderTree },
      { name: "Stock Inward", href: "/dashboard/inventory/inward", icon: ArrowDownToLine },
      { name: "Stock Outward", href: "/dashboard/inventory/outward", icon: ArrowUpFromLine },
      { name: "Stock Movement", href: "/dashboard/inventory/movements", icon: History },
      { name: "Stock Adjustment", href: "/dashboard/inventory/adjustments", icon: SlidersHorizontal },
      { name: "Low Stock / Out of Stock", href: "/dashboard/inventory?filter=low_stock", icon: AlertTriangle },
    ],
  },
  {
    title: "CONTACTS",
    key: "contacts",
    icon: Users,
    items: [
      { name: "Customers", href: "/dashboard/customers", icon: Users },
      { name: "Suppliers", href: "/dashboard/suppliers", icon: Truck },
    ],
  },
  {
    title: "REPORTS & ANALYTICS",
    key: "reports",
    icon: BarChart3,
    items: [
      { name: "Sales Reports", href: "/dashboard/reports/sales", icon: TrendingUp },
      { name: "Purchase Reports", href: "/dashboard/purchases/history", icon: ClipboardList },
      { name: "Inventory Reports", href: "/dashboard/reports/pos", icon: Boxes },
      { name: "Customer Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { name: "Payment Reports", href: "/dashboard/reports/daily-closing", icon: CalendarCheck },
      { name: "Reports Hub", href: "/dashboard/reports", icon: FileSpreadsheet },
    ],
  },
  {
    title: "FINANCE",
    key: "finance",
    icon: Landmark,
    items: [
      { name: "Payment Records", href: "/dashboard/finance/payments", icon: CreditCard },
      { name: "Customer Outstanding", href: "/dashboard/finance/receivables", icon: AlertCircle },
      { name: "Credit Management", href: "/dashboard/finance/payables", icon: FileSpreadsheet },
      { name: "Cash Register", href: "/dashboard/register", icon: Landmark },
    ],
  },
  {
    title: "ADMINISTRATION",
    key: "admin",
    icon: Settings,
    items: [
      { name: "Staff Management", href: "/dashboard/staff", icon: Users },
      { name: "Business Settings", href: "/dashboard/settings?tab=general", icon: Settings },
      { name: "Invoice Customization", href: "/dashboard/settings?tab=invoice", icon: FileText },
      { name: "WhatsApp Settings", href: "/dashboard/settings?tab=whatsapp", icon: MessageSquare },
      { name: "Data Import / POS Migration", href: "/dashboard/migration", icon: FileSpreadsheet },
      { name: "Stores", href: "/dashboard/stores", icon: Store },
      { name: "System Health", href: "/dashboard/health", icon: Activity },
    ],
  },
  {
    title: "MORE UTILITIES",
    key: "more",
    icon: Sparkles,
    items: [
      { name: "Coupons & Discounts", href: "/dashboard/coupons", icon: Ticket },
      { name: "Marketing Campaigns", href: "/dashboard/campaigns", icon: Megaphone },
      { name: "AI Assistant", href: "/dashboard/ai-campaigns", icon: Sparkles },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [currentTab, setCurrentTab] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const res = await notificationApi.getSummary();
        if (isMounted) {
          setUnreadNotifications(res.data?.unread || 0);
        }
      } catch {
        // silent layout fallback
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    const handleUpdate = () => fetchUnread();
    window.addEventListener("notifications_updated", handleUpdate);
    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("notifications_updated", handleUpdate);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const fallbackTimer = setTimeout(() => {
      if (active) setAuthChecking(false);
    }, 4000);

    const authorizeWorkspace = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (!token) {
        clearTimeout(fallbackTimer);
        router.replace("/login");
        return;
      }
      try {
        const response = await authApi.getProfile();
        const role = response.data?.role;
        const adminRoles = ["super_admin", "org_admin", "owner", "store_manager", "manager"];
        if (!adminRoles.includes(role)) {
          clearTimeout(fallbackTimer);
          router.replace("/staff/dashboard");
          return;
        }
      } catch {
        clearTimeout(fallbackTimer);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.replace("/login");
        return;
      } finally {
        clearTimeout(fallbackTimer);
        if (active) setAuthChecking(false);
      }
    };
    authorizeWorkspace();
    return () => {
      active = false;
      clearTimeout(fallbackTimer);
    };
  }, [router]);

  const [currentFilter, setCurrentFilter] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<string | null>(null);

  useEffect(() => {
    const updateQueryParams = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        setCurrentTab(params.get("tab"));
        setCurrentFilter(params.get("filter"));
        setCurrentView(params.get("view"));
      }
    };
    updateQueryParams();
    window.addEventListener("popstate", updateQueryParams);
    return () => {
      window.removeEventListener("popstate", updateQueryParams);
    };
  }, [pathname]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Helper to determine if an item is active
  const isItemActive = React.useCallback((item: NavItem) => {
    const [itemPath, itemQuery] = item.href.split("?");
    const params = itemQuery ? new URLSearchParams(itemQuery) : null;
    const itemFilter = params ? params.get("filter") : null;
    const itemTab = params ? params.get("tab") : item.tab || null;

    // Distinguish between Sell / POS and Invoice History
    if (item.name === "Invoice History" || itemPath === "/dashboard/invoices") {
      if (pathname === "/dashboard/invoices") return true;
      if (pathname === "/dashboard/billing" && currentView === "history") return true;
      return false;
    }
    if (item.name === "Sell / POS" || itemPath === "/dashboard/billing") {
      if (pathname === "/dashboard/billing" && currentView !== "history") return true;
      if (pathname === "/dashboard/pos") return true;
      return false;
    }

    if (itemPath === "/dashboard/notifications") {
      return pathname === "/dashboard/notifications" || pathname?.startsWith("/dashboard/notifications");
    }

    // Reports Hub exact check vs sub-reports
    if (itemPath === "/dashboard/reports" && !itemQuery) {
      return pathname === "/dashboard/reports";
    }

    // Purchases exact check
    if (itemPath === "/dashboard/purchases/history") {
      return pathname === "/dashboard/purchases/history" || pathname === "/dashboard/purchases";
    }

    if (pathname !== itemPath) return false;

    // Distinguish between /dashboard/inventory (Stock Overview) and /dashboard/inventory?filter=low_stock
    if (itemFilter) {
      return currentFilter === itemFilter;
    }
    if (currentFilter && pathname === "/dashboard/inventory") {
      return false;
    }

    // Distinguish between Settings tabs
    if (pathname === "/dashboard/settings") {
      if (itemTab === "whatsapp") return currentTab === "whatsapp";
      if (itemTab === "invoice" || itemTab === "branding") return currentTab === "invoice" || currentTab === "branding";
      if (itemTab === "general" || itemTab === "profile") return currentTab === "general" || currentTab === "profile" || !currentTab;
    }

    if (item.tab) {
      return currentTab === item.tab;
    }
    return true;
  }, [pathname, currentTab, currentFilter, currentView]);

  // Find active section key
  const activeSectionKey = useMemo(() => {
    for (const section of navSections) {
      for (const item of section.items) {
        if (isItemActive(item)) {
          return section.key;
        }
      }
    }
    if (pathname?.startsWith("/dashboard/billing") || pathname?.startsWith("/dashboard/invoices") || pathname?.startsWith("/dashboard/pos") || pathname?.startsWith("/dashboard/quotations") || pathname?.startsWith("/dashboard/returns")) {
      return "sales";
    }
    if (pathname?.startsWith("/dashboard/inventory") || pathname?.startsWith("/dashboard/products")) {
      return "stock";
    }
    if (pathname?.startsWith("/dashboard/customers") || pathname?.startsWith("/dashboard/suppliers")) {
      return "contacts";
    }
    if (pathname?.startsWith("/dashboard/reports") || pathname?.startsWith("/dashboard/analytics") || pathname?.startsWith("/dashboard/purchases")) {
      return "reports";
    }
    if (pathname?.startsWith("/dashboard/finance") || pathname?.startsWith("/dashboard/register")) {
      return "finance";
    }
    if (pathname?.startsWith("/dashboard/settings") || pathname?.startsWith("/dashboard/staff") || pathname?.startsWith("/dashboard/migration") || pathname?.startsWith("/dashboard/stores") || pathname?.startsWith("/dashboard/health")) {
      return "admin";
    }
    if (pathname?.startsWith("/dashboard/coupons") || pathname?.startsWith("/dashboard/campaigns") || pathname?.startsWith("/dashboard/ai-campaigns")) {
      return "more";
    }
    return "";
  }, [isItemActive, pathname]);

  // Load persisted collapsed state from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("billfree_sidebar_collapsed");
      if (saved) {
        setCollapsedSections(JSON.parse(saved));
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, []);

  // Automatically expand the active section
  useEffect(() => {
    if (activeSectionKey) {
      setCollapsedSections((prev) => {
        if (prev[activeSectionKey]) {
          const updated = { ...prev, [activeSectionKey]: false };
          try {
            sessionStorage.setItem("billfree_sidebar_collapsed", JSON.stringify(updated));
          } catch {}
          return updated;
        }
        return prev;
      });
    }
  }, [activeSectionKey]);

  // Toggle collapse state for a section
  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        sessionStorage.setItem("billfree_sidebar_collapsed", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Find current active page title
  const activePageTitle = useMemo(() => {
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return "Dashboard Overview";
    }
    if (pathname === "/dashboard/notifications" || pathname?.startsWith("/dashboard/notifications")) {
      return "Notifications";
    }
    for (const section of navSections) {
      for (const item of section.items) {
        if (isItemActive(item)) {
          return item.name;
        }
      }
    }
    return "Dashboard";
  }, [isItemActive, pathname]);

  const closeMobile = () => setMobileOpen(false);

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex items-center gap-3 text-sm text-muted-foreground" role="status" aria-live="polite">
          <span className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          Checking workspace access…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Desktop fixed & Mobile drawer) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 sm:w-80 lg:w-64 flex-col border-r bg-card transition-transform duration-200 ease-in-out lg:translate-x-0 safe-area-top",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b px-5 shrink-0">
          <Link href="/dashboard" onClick={closeMobile} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-lg tracking-wider shadow-sm">
              BM
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-foreground block leading-tight">BillMeet</span>
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Retail POS & ERP</span>
            </div>
          </Link>
          <button
            onClick={closeMobile}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden touch-target-min"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Menu Search (Mobile friendly) */}
        <div className="px-3 pt-3 pb-1 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search all 25+ pages..."
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-md border bg-muted/30 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {menuSearch && (
              <button
                type="button"
                onClick={() => setMenuSearch("")}
                className="absolute right-2 top-2 text-xs text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Quick Launch Copilot from Mobile Menu */}
        <div className="px-3 pt-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              closeMobile();
              window.dispatchEvent(new CustomEvent("open-copilot"));
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/70 dark:border-indigo-800/70 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:opacity-90 transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
              <span>Ask AI Copilot</span>
            </div>
            <span className="text-[9px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">AI</span>
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-3 text-xs select-none">
          {/* Top-level Dashboard Link */}
          <div className="pb-0.5">
            <Link
              href="/dashboard"
              onClick={closeMobile}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all min-h-[36px]",
                pathname === "/dashboard" || pathname === "/dashboard/"
                  ? "bg-primary text-primary-foreground shadow-sm font-bold"
                  : "text-foreground/90 hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <LayoutDashboard className={cn("h-4 w-4 shrink-0", pathname === "/dashboard" || pathname === "/dashboard/" ? "text-primary-foreground" : "text-primary")} />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Business Operation Navigation Groups */}
          {navSections.map((section) => {
            const SectionIcon = section.icon;
            const filteredItems = menuSearch.trim()
              ? section.items.filter((item) =>
                  item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
                  section.title.toLowerCase().includes(menuSearch.toLowerCase())
                )
              : section.items;

            if (menuSearch.trim() && filteredItems.length === 0) return null;

            const isCollapsed = Boolean(collapsedSections[section.key]) && !menuSearch.trim();
            const containsActive = section.items.some(isItemActive);

            return (
              <div key={section.key} className="space-y-1">
                {/* Section header toggle */}
                <button
                  type="button"
                  onClick={() => !menuSearch.trim() && toggleSection(section.key)}
                  className={cn(
                    "flex w-full items-center justify-between px-2.5 py-1.5 text-[11px] font-bold tracking-wider rounded-md uppercase transition-colors group",
                    containsActive
                      ? "text-primary font-extrabold bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  aria-expanded={!isCollapsed}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <SectionIcon className={cn("h-3.5 w-3.5 shrink-0 transition-colors", containsActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                    <span className="truncate">{section.title}</span>
                  </div>
                  {!menuSearch.trim() && (
                    isCollapsed ? (
                      <ChevronRight className="h-3.5 w-3.5 opacity-70 shrink-0" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 opacity-70 shrink-0" />
                    )
                  )}
                </button>

                {/* Section children */}
                {(!isCollapsed || menuSearch.trim()) && (
                  <div className="space-y-0.5 pt-0.5 pl-3 border-l-2 border-muted/70 ml-3.5 mt-0.5">
                    {filteredItems.map((item) => {
                      const active = isItemActive(item);
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={closeMobile}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-all min-h-[34px]",
                            active
                              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className={cn("h-3.5 w-3.5 shrink-0", active ? "text-primary-foreground" : "text-muted-foreground")} />
                          <span className="truncate">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="border-t p-3 bg-card/50 shrink-0 safe-area-bottom">
          <button
            onClick={() => {
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              window.location.href = "/login";
            }}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors min-h-[44px]"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64 min-w-0 w-full overflow-x-hidden">
        {/* Controlled Pilot Mode Monitored Banner */}
        <div className="bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-purple-900/90 border-b border-indigo-700/50 px-3 sm:px-4 py-1.5 text-xs text-indigo-100 flex flex-wrap items-center justify-between gap-1.5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
              PILOT v1.0
            </span>
            <span className="font-medium text-[11px] sm:text-xs">Business Deployment — Real-time Monitored</span>
          </div>
          <Link href="/dashboard/health" className="underline font-semibold hover:text-white transition-colors text-[10px] sm:text-[11px] flex items-center gap-1">
            System Health →
          </Link>
        </div>

        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b bg-card/90 px-3 sm:px-4 md:px-6 backdrop-blur-md">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden touch-target-min shrink-0"
              aria-label="Open navigation drawer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider hidden md:inline shrink-0">
                BillMeet /
              </span>
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-foreground truncate">
                {activePageTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Desktop Ask Copilot Action Button */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-copilot"))}
              className="hidden lg:flex items-center gap-1.5 rounded-lg border border-indigo-200/80 dark:border-indigo-800/80 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/30 dark:to-purple-950/30 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 dark:text-indigo-300 px-2.5 sm:px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all min-h-[38px] active:scale-95"
              title="Open AI Business Copilot"
            >
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              <span>Ask Copilot</span>
            </button>

            <Link
              href="/dashboard/notifications"
              className={cn(
                "relative flex items-center gap-1 rounded-lg border px-2 sm:px-2.5 py-1.5 text-xs font-semibold shadow-2xs transition-all min-h-[38px]",
                pathname === "/dashboard/notifications"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border bg-card hover:bg-accent text-foreground"
              )}
              title="Notifications Center"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
              {unreadNotifications > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white min-w-[18px] h-[18px]">
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </span>
              )}
            </Link>
            <Link
              href="/dashboard/billing"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all min-h-[38px]"
            >
              <Receipt className="h-4 w-4" />
              <span>Billing</span>
            </Link>
          </div>
        </header>

        {/* Page Content with bottom clearance for mobile nav */}
        <main className="flex-1 p-2.5 sm:p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0 overflow-x-hidden pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Native Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 border-t border-border backdrop-blur-md safe-area-bottom shadow-lg">
        <div className="grid grid-cols-5 h-14 items-center">
          {/* 1. Dashboard */}
          <Link
            href="/dashboard"
            className={cn(
              "flex flex-col items-center justify-center h-full transition-colors",
              pathname === "/dashboard"
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-[10px] leading-tight mt-0.5">Home</span>
          </Link>

          {/* 2. POS / Billing */}
          <Link
            href="/dashboard/billing"
            className={cn(
              "flex flex-col items-center justify-center h-full transition-colors",
              pathname === "/dashboard/billing" || pathname === "/dashboard/pos"
                ? "text-emerald-600 font-extrabold"
                : "text-muted-foreground hover:text-emerald-600"
            )}
          >
            <div className={cn(
              "p-1 rounded-full",
              pathname === "/dashboard/billing" || pathname === "/dashboard/pos" ? "bg-emerald-500/15" : ""
            )}>
              <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
            </div>
            <span className="text-[10px] leading-tight font-bold text-emerald-600">POS</span>
          </Link>

          {/* 3. Inventory */}
          <Link
            href="/dashboard/inventory"
            className={cn(
              "flex flex-col items-center justify-center h-full transition-colors",
              pathname === "/dashboard/inventory" || pathname?.startsWith("/dashboard/inventory")
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Boxes className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-[10px] leading-tight mt-0.5">Stock</span>
          </Link>

          {/* 4. AI Business Copilot */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-copilot"))}
            className="flex flex-col items-center justify-center h-full transition-colors text-muted-foreground hover:text-indigo-600 active:scale-95 group touch-target-min"
            title="Ask AI Copilot"
            aria-label="Ask AI Copilot"
          >
            <div className="p-1 rounded-full text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 transition-colors">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
            </div>
            <span className="text-[10px] leading-tight mt-0.5 font-semibold text-indigo-600 dark:text-indigo-400">Copilot</span>
          </button>

          {/* 5. All Menu */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center justify-center h-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-[10px] leading-tight mt-0.5">Menu</span>
          </button>
        </div>
      </nav>

      {/* Floating AI Copilot */}
      <CopilotDrawer />
    </div>
  );
}
