import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Sparkles,
  Layers,
  BarChart3,
  MessageSquarePlus,
  TableProperties,
  FlaskConical,
  BrainCircuit,
  Sun,
  Moon,
  Menu,
  X
} from "lucide-react";

export type NavTab = "access" | "home" | "feedback" | "dashboard" | "reviews" | "analyzer" | "model";

interface NavbarProps {
  currentTab: NavTab;
  isEmployee: boolean;
  onNavigate: (tab: NavTab, params?: { productId?: number }) => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, isEmployee, onNavigate, onSignOut }) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const employeeNavItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: "home", label: "Products", icon: <Layers className="w-4 h-4" /> },
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "reviews", label: "Reviews Explorer", icon: <TableProperties className="w-4 h-4" /> },
    { id: "analyzer", label: "Live Analyzer", icon: <FlaskConical className="w-4 h-4" /> },
    { id: "model", label: "Model Insights", icon: <BrainCircuit className="w-4 h-4" /> },
  ];
  const navItems = isEmployee
    ? [...employeeNavItems.slice(0, 1), { id: "feedback" as NavTab, label: "Submit Feedback", icon: <MessageSquarePlus className="w-4 h-4" /> }, ...employeeNavItems.slice(1)]
    : [{ id: "feedback" as NavTab, label: "Submit Feedback", icon: <MessageSquarePlus className="w-4 h-4" /> }];

  const handleNavClick = (id: NavTab) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[#0B1120]/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => handleNavClick(isEmployee ? "home" : "access")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
                EmotiLens
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-1 hidden sm:block">
              Feedback Intelligence Engine
            </p>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                    : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Model indicator + Theme toggle + Mobile button */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>SimpleRNN + VADER</span>
          </div>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {isEmployee ? (
            <button
              onClick={onSignOut}
              className="hidden sm:inline-flex px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Switch role
            </button>
          ) : (
            <button
              onClick={() => handleNavClick("access")}
              className="hidden sm:inline-flex px-3 py-2 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
            >
              Choose role
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle mobile menu"
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
          {isEmployee ? (
            <button
              onClick={() => { onSignOut(); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Switch role
            </button>
          ) : (
            <button
              onClick={() => handleNavClick("access")}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
            >
              Choose role
            </button>
          )}
        </div>
      )}
    </header>
  );
};
