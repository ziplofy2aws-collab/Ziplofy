import {
  ArrowRightIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
  LinkIcon,
  PaintBrushIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeCardList } from '../components/ThemeCardList';

export default function OnlineStorePage() {
  const [customSearch, setCustomSearch] = useState('');

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page header — aligned with catalog / settings cards */}
        <header className="mb-6 rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-blue-50/25 px-5 py-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="pl-3 border-l-4 border-blue-500/70 min-w-0">
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Online Store</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your storefront, themes, and preferences
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                to="/themes/all-themes"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <LinkIcon className="h-4 w-4 text-gray-500" aria-hidden />
                Themes
              </Link>
              <Link
                to="/online-store/preference"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Cog6ToothIcon className="h-4 w-4 text-gray-500" aria-hidden />
                Preference
              </Link>
            </div>
          </div>
          <div className="mt-4 hidden sm:flex items-center justify-between rounded-xl border border-blue-100/80 bg-blue-50/40 px-4 py-2">
            <p className="text-xs text-gray-600">
              Preview your live storefront, switch themes, or tune store preferences from here.
            </p>
            <span className="text-xs font-semibold text-blue-700">Storefront</span>
          </div>
        </header>

        {/* Current theme — primary card */}
        <section className="mb-6 rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-10 lg:items-start">
            <div className="flex flex-col gap-5">
              <div className="relative w-fit max-w-full">
                <img
                  className="h-52 w-44 sm:h-56 sm:w-48 rounded-xl border border-gray-200 object-cover shadow-sm"
                  src="https://picsum.photos/seed/store/200/300"
                  alt="Store preview"
                />
                <div className="absolute -bottom-1 -right-1 overflow-hidden rounded-lg border-2 border-white shadow-md">
                  <img
                    className="h-16 w-16 object-cover"
                    src="https://picsum.photos/seed/store/200/300"
                    alt="Mobile preview"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  <GlobeAltIcon className="h-4 w-4" aria-hidden />
                  View your store
                </a>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  Import theme
                </button>
              </div>
            </div>

            <div className="min-w-0 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <img
                className="h-36 w-full max-w-full rounded-xl border border-gray-200 object-cover shadow-sm sm:h-40 sm:w-56 sm:max-w-[14rem] shrink-0"
                src="https://picsum.photos/seed/horizon/200/300"
                alt="Current theme"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2 gap-y-1">
                  <h2 className="text-xl font-semibold text-gray-900">Horizon</h2>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                    Current theme
                  </span>
                </div>
                <p className="text-sm text-gray-500">Added: 10:07 am</p>
                <p className="text-sm text-gray-500">Version 4.0</p>
                <Link
                  to="/themes/create"
                  className="mt-2 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Edit theme
                  <ArrowRightIcon className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Secondary actions */}
        <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-5 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50">
                <ShoppingBagIcon className="h-6 w-6 text-violet-600" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900">Explore more themes</h2>
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                  Browse professionally designed free and premium themes
                </p>
              </div>
            </div>
            <Link
              to="/themes/all-themes"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors sm:self-center"
            >
              Visit theme store
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="flex flex-col gap-5 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <SparklesIcon className="h-6 w-6 text-emerald-600" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900">Develop your theme</h2>
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                  Use the Ziplofy CLI tool to develop your theme from scratch
                </p>
              </div>
            </div>
            <Link
              to="/themes/create"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-100 transition-colors sm:self-center"
            >
              Get started
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>

        {/* Custom theme + gallery */}
        <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/40 px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <PaintBrushIcon className="h-5 w-5 text-blue-600" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-gray-900">Design a custom theme</h2>
                  <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                    Create a theme tailored to your brand — describe your style below
                  </p>
                </div>
              </div>
              <div className="w-full lg:max-w-md lg:shrink-0">
                <label htmlFor="custom-theme-prompt" className="sr-only">
                  Theme style prompt
                </label>
                <input
                  id="custom-theme-prompt"
                  type="text"
                  value={customSearch}
                  onChange={(e) => setCustomSearch(e.target.value)}
                  placeholder="e.g. modern handmade jewellery"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/25"
                />
              </div>
            </div>
          </div>
          <div className="bg-gray-50/50 px-4 py-6 sm:px-6 sm:py-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <ThemeCardList limit={4} />
            </div>
            <div className="flex justify-center pt-10 pb-1">
              <Link
                to="/themes/all-themes"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/20 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:brightness-[1.03] active:scale-[0.98]"
              >
                <span
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden
                />
                <span className="relative">Explore more themes</span>
                <ArrowRightIcon
                  className="relative h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
