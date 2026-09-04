"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  ChevronDown,
  Wallet,
  Building2,
  RefreshCw,
  X,
  Globe,
  LogOut,
  Plus,
  Store,
} from "lucide-react";
import { displayPersonName } from "@/lib/brand";
import { useAuthStore } from "@/stores/authStore";
import { useStoreStore } from "@/stores/storeStore";
import { useI18n, LANGUAGES } from "@/lib/i18n";
import api from "@/lib/api";
import PwaInstallButton from "@/components/PwaInstallButton";
import {
  adminHeaderClass,
  adminHeaderControlClass,
  adminHeaderDropdownClass,
  adminHeaderDropdownItemClass,
  adminHeaderIconButtonClass,
  workspaceAvatarClass,
} from "./admin-header";
import ClientGlobalSearch from "./ClientGlobalSearch";
import { adminListPrimaryButtonClass } from "./dashboard-ui";

interface Notification {
  _id: string;
  action: string;
  resource: string;
  details: string;
  createdAt: string;
  user?: { name: string };
}

type HeaderProps = {
  isAdmin?: boolean;
  /** Black Shopify-style bar (Codiic client admin dashboard) */
  variant?: "default" | "shopify";
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Header({ isAdmin, variant = "default" }: HeaderProps = {}) {
  const shopify = variant === "shopify";
  const { user, workspaces, currentWorkspace, switchWorkspace, logout } = useAuthStore();
  const {
    stores,
    activeStoreId,
    fetchStores,
    createStore,
    setActiveStoreId,
  } = useStoreStore();
  const [showWsDropdown, setShowWsDropdown] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [creatingStore, setCreatingStore] = useState(false);
  const [createStoreError, setCreateStoreError] = useState<string | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<HTMLDivElement>(null);
  const { lang, setLang } = useI18n();
  const [showLang, setShowLang] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const showWallet = !isAdmin && user?.role !== "super_admin" && user?.role !== "admin";
  const canManageStores = showWallet && user?.role === "vendor";
  const activeStore = stores.find((s) => s._id === activeStoreId) || stores[0] || null;

  useEffect(() => {
    if (canManageStores) {
      void fetchStores();
    }
  }, [canManageStores, fetchStores]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setShowLang(false);
      if (wsRef.current && !wsRef.current.contains(e.target as Node)) setShowWsDropdown(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const loadNotifs = async () => {
    setNotifLoading(true);
    try {
      const r = await api.get("/audit-logs", { params: { limit: 20 } });
      setNotifs(r.data.data || []);
    } catch {
      setNotifs([]);
    }
    setNotifLoading(false);
  };

  const handleClearCache = async () => {
    setClearing(true);
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      localStorage.removeItem("next-cache");
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  const walletBalance = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(user?.walletBalance || 0);
  const profileLabel = displayPersonName(currentWorkspace?.name) || displayPersonName(user?.name) || "Account";

  const openCreateStoreModal = () => {
    setShowWsDropdown(false);
    setCreateStoreError(null);
    setStoreName("");
    setStoreDescription("");
    setShowCreateStore(true);
  };

  const handleCreateStore = async () => {
    if (!storeName.trim() || storeDescription.trim().length < 10) {
      setCreateStoreError("Name required; description must be at least 10 characters.");
      return;
    }
    setCreatingStore(true);
    setCreateStoreError(null);
    try {
      await createStore({
        storeName: storeName.trim(),
        storeDescription: storeDescription.trim(),
      });
      setShowCreateStore(false);
      setStoreName("");
      setStoreDescription("");
    } catch (e: unknown) {
      setCreateStoreError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (e as Error)?.message ||
          "Failed to create store"
      );
    } finally {
      setCreatingStore(false);
    }
  };

  if (shopify) {
    return (
      <>
      <header className={`admin-shopify-header ${adminHeaderClass} bg-black`}>
        <div className="grid h-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3 md:grid-cols-[minmax(0,1fr)_minmax(220px,500px)_minmax(0,1fr)]">
          {/* Brand — left */}
          <div className="flex min-w-0 items-center justify-start">
            <Link
              href="/client/dashboard"
              className="inline-flex shrink-0 items-center rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              aria-label="Go to dashboard"
            >
              <span className="font-['Poppins',system-ui,sans-serif] text-[20px] font-extrabold italic tracking-tight text-white">
                Codiic
              </span>
            </Link>
          </div>

          {/* Global search — true center */}
          <div className="flex w-full min-w-0 justify-center md:max-w-[500px]">
            <ClientGlobalSearch mobileIconOnly />
          </div>

          {/* Actions — right */}
          <div className="flex items-center justify-end gap-1.5">
            <PwaInstallButton variant="dark" />

            {!isAdmin && (
              <div className="relative" ref={langRef}>
                <button
                  type="button"
                  onClick={() => setShowLang(!showLang)}
                  title="Change panel language"
                  className={adminHeaderControlClass}
                >
                  <Globe className="h-4 w-4 text-[#b5b5b5]" />
                  <span className="hidden sm:inline">
                    {(LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]).name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#b5b5b5]" />
                </button>
                {showLang && (
                  <div className={`${adminHeaderDropdownClass} max-h-80 w-44 overflow-y-auto py-1`}>
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          setLang(l.code);
                          setShowLang(false);
                        }}
                        className={adminHeaderDropdownItemClass(l.code === lang)}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="relative" ref={wsRef}>
              <button
                type="button"
                onClick={() => setShowWsDropdown(!showWsDropdown)}
                className={adminHeaderControlClass}
                aria-label="Account menu"
              >
                <div className={workspaceAvatarClass}>
                  {getInitials(profileLabel)}
                </div>
                <span className="hidden max-w-[140px] truncate sm:inline">
                  {activeStore?.storeName || profileLabel}
                </span>
                <ChevronDown className="h-4 w-4 text-[#b5b5b5]" />
              </button>
              {showWsDropdown && (
                <div className={`${adminHeaderDropdownClass} w-64`}>
                  {currentWorkspace && (
                    <div className="border-b border-[#e3e3e3] bg-[#f7f7f7] px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#aeea00] text-xs font-semibold text-black">
                          {getInitials(profileLabel)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-semibold text-[#303030]">
                            {displayPersonName(currentWorkspace.name) || profileLabel}
                          </div>
                          {displayPersonName(user?.name) && (
                            <div className="truncate text-[11px] text-[#8a8a8a]">{displayPersonName(user?.name)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {showWallet && (
                    <div className="border-b border-[#e3e3e3] bg-white py-1">
                      <Link
                        href="/client/billing"
                        onClick={() => setShowWsDropdown(false)}
                        className={adminHeaderDropdownItemClass()}
                      >
                        <Wallet className="h-4 w-4 shrink-0 text-[#616161]" />
                        <span className="min-w-0 flex-1 truncate">Wallet</span>
                        <span className="shrink-0 text-[13px] font-semibold text-[#303030]">
                          {walletBalance}
                        </span>
                      </Link>
                      {canManageStores ? (
                        <>
                          {stores.length > 0 ? (
                            <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-[#8a8a8a]">
                              Stores
                            </div>
                          ) : null}
                          {stores.map((s) => (
                            <button
                              key={s._id}
                              type="button"
                              onClick={() => {
                                setActiveStoreId(s._id);
                                setShowWsDropdown(false);
                              }}
                              className={adminHeaderDropdownItemClass(s._id === activeStore?._id)}
                            >
                              <Store className="h-4 w-4 shrink-0 text-[#616161]" />
                              <span className="min-w-0 flex-1 truncate text-left">{s.storeName}</span>
                              {s.subdomain?.subdomain ? (
                                <span className="max-w-[90px] truncate text-[11px] text-[#8a8a8a]">
                                  {s.subdomain.subdomain}
                                </span>
                              ) : null}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={openCreateStoreModal}
                            className={adminHeaderDropdownItemClass()}
                          >
                            <Plus className="h-4 w-4 shrink-0 text-[#616161]" />
                            <span>Create new store</span>
                          </button>
                        </>
                      ) : null}
                    </div>
                  )}

                  <div className="bg-white py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowWsDropdown(false);
                        logout();
                      }}
                      className={`${adminHeaderDropdownItemClass()} text-red-600 hover:bg-red-50 hover:text-red-700`}
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setShowNotif(!showNotif);
                  if (!showNotif) loadNotifs();
                }}
                className={`${adminHeaderIconButtonClass} relative`}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {notifs.length > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>
              {showNotif && (
                <div className="admin-header-dropdown absolute right-0 top-full z-50 mt-1.5 flex max-h-96 w-80 flex-col overflow-hidden rounded-xl border border-[#e3e3e3] bg-white shadow-lg">
                  <div className="flex items-center justify-between border-b border-[#e3e3e3] p-3">
                    <h4 className="text-sm font-semibold text-[#303030]">Notifications</h4>
                    <button
                      type="button"
                      onClick={() => setShowNotif(false)}
                      className="rounded-lg p-1 text-[#8a8a8a] transition-colors hover:bg-[#f6f6f7]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-white">
                    {notifLoading ? (
                      <div className="p-6 text-center text-sm text-[#8a8a8a]">Loading...</div>
                    ) : notifs.length === 0 ? (
                      <div className="p-6 text-center text-sm text-[#8a8a8a]">No recent activity</div>
                    ) : (
                      notifs.map((n) => (
                        <div
                          key={n._id}
                          className="border-b border-[#ebebeb] bg-white px-3 py-2 hover:bg-[#f6f6f7]"
                        >
                          <p className="text-sm text-[#303030]">
                            <span className="font-medium">{n.user?.name || "System"}</span> {n.action}{" "}
                            {n.resource && <span className="text-[#8a8a8a]">({n.resource})</span>}
                          </p>
                          <p className="mt-0.5 text-xs text-[#8a8a8a]">
                            {new Date(n.createdAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showCreateStore ? (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/30 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-store-title"
            className="w-full max-w-md overflow-hidden rounded-xl border border-[#e3e3e3] bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[#e3e3e3] px-4 py-3">
              <h2 id="create-store-title" className="text-[15px] font-semibold text-[#303030]">
                Create new store
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateStore(false)}
                className="rounded-lg p-1 text-[#8a8a8a] hover:bg-[#f6f6f7]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <p className="text-[12px] text-[#8a8a8a]">
                A default Informatic subdomain is assigned automatically when the store is created.
              </p>
              <label className="block text-[13px]">
                <span className="mb-1 block font-medium text-[#303030]">Store name</span>
                <input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full rounded-lg border border-[#e3e3e3] px-3 py-2 text-[13px] outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3]/30"
                  placeholder="Acme Website"
                  maxLength={100}
                />
              </label>
              <label className="block text-[13px]">
                <span className="mb-1 block font-medium text-[#303030]">Description</span>
                <textarea
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[#e3e3e3] px-3 py-2 text-[13px] outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3]/30"
                  placeholder="What this Informatic site is for…"
                  maxLength={500}
                />
              </label>
              {createStoreError ? (
                <p className="text-[12px] text-red-600">{createStoreError}</p>
              ) : null}
            </div>
            <div className="flex justify-end gap-2 border-t border-[#e3e3e3] bg-[#fafafa] px-4 py-3">
              <button
                type="button"
                onClick={() => setShowCreateStore(false)}
                className="rounded-md border border-[#e3e3e3] bg-white px-3 py-2 text-[13px] font-medium text-[#303030] hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={creatingStore}
                onClick={() => void handleCreateStore()}
                className={`${adminListPrimaryButtonClass} disabled:opacity-60`}
              >
                {creatingStore ? "Creating…" : "Create store"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      </>
    );
  }

  /* Default header (admin panel / legacy) */
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white/80 px-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80 lg:px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative hidden w-full max-w-md md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            autoComplete="off"
            placeholder="Search..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-700"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <PwaInstallButton />
        {!isAdmin && user?.role !== "super_admin" && user?.role !== "admin" && (
          <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 ring-1 ring-inset ring-emerald-600/10 dark:bg-emerald-900/30 sm:flex">
            <Wallet className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
                user?.walletBalance || 0
              )}
            </span>
          </div>
        )}
        {!isAdmin && (
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setShowLang(!showLang)}
              title="Change panel language"
              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">
                {(LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]).name}
              </span>
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </button>
            {showLang && (
              <div className="absolute right-0 top-full z-50 mt-2 max-h-80 w-44 overflow-hidden overflow-y-auto rounded-xl bg-white py-1 shadow-xl ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLang(l.code);
                      setShowLang(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      l.code === lang
                        ? "bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={handleClearCache}
          disabled={clearing}
          title="Clear Cache & Reload"
          className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-emerald-900/30"
        >
          <RefreshCw className={`h-4 w-4 ${clearing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Clear Cache</span>
        </button>
        {!isAdmin && workspaces.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowWsDropdown(!showWsDropdown)}
              className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <Building2 className="h-4 w-4 text-gray-500" />
              <span className="hidden max-w-[120px] truncate dark:text-gray-200 sm:inline">
                {currentWorkspace?.name || "Select"}
              </span>
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </button>
            {showWsDropdown && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
                {workspaces.map((ws) => (
                  <button
                    key={ws._id}
                    type="button"
                    onClick={() => {
                      switchWorkspace(ws._id);
                      setShowWsDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      ws._id === currentWorkspace?._id
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {ws.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setShowNotif(!showNotif);
              if (!showNotif) loadNotifs();
            }}
            className="relative rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <Bell className="h-5 w-5" />
            {notifs.length > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 top-full z-50 mt-2 flex max-h-96 w-80 flex-col overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
              <div className="flex items-center justify-between border-b border-gray-100 p-3 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h4>
                <button type="button" onClick={() => setShowNotif(false)}>
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {notifLoading ? (
                  <div className="p-6 text-center text-sm text-gray-400">Loading...</div>
                ) : notifs.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-400">No recent activity</div>
                ) : (
                  notifs.map((n) => (
                    <div
                      key={n._id}
                      className="border-b border-gray-50 px-3 py-2 hover:bg-gray-50 dark:border-gray-700/50 dark:hover:bg-gray-700/50"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-200">
                        <span className="font-medium">{n.user?.name || "System"}</span> {n.action}{" "}
                        {n.resource && <span className="text-gray-500">({n.resource})</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {new Date(n.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
