"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  Heart, Bell, Settings, LogOut, ShieldAlert,
  Activity, BarChart3, Clock, MessageSquareCode, User, Menu, X, Sun, Moon, Check
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Nav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  
  const [notifications, setNotifications] = useState([
    { id: 1, text: "High probability assessment detected: cs_81a2f3", read: false, type: "alert" },
    { id: 2, text: "Model recalibrated successfully (AUC 0.9582)", read: true, type: "info" },
    { id: 3, text: "New assessment cs_19f3b5 recorded.", read: true, type: "success" }
  ]);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    router.push("/");
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: Activity },
    { href: "/assess",    label: "New Assessment", icon: Heart },
    { href: "/history",   label: "History",   icon: Clock },
    { href: "/insights",  label: "Insights",  icon: BarChart3 },
    { href: "/cardiobot", label: "CardioBot", icon: MessageSquareCode },
    { href: "/profile",   label: "Profile",   icon: User },
  ];

  // Close menus on click outside
  useEffect(() => {
    const clickOutside = () => {
      setNotificationsOpen(false);
      setProfileOpen(false);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("click", clickOutside);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("click", clickOutside);
      }
    };
  }, []);

  return (
    <nav className="glass-nav sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand/Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Heart size={22} className="text-risk-high animate-heart-float" style={{ fill: "rgba(244, 63, 94, 0.1)" }} />
              <div className="absolute inset-0 bg-risk-high/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-display text-xl tracking-tight text-text">
              CardioSense
            </span>
            <span className="text-[10px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-accent-soft text-accent border border-accent/15">
              AI
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          {user && (
            <div className="hidden lg:flex items-center gap-1">
              {links.map(({ href, label, icon: Icon }) => {
                const isActive = pathname.startsWith(href);
                return (
                  <Link key={href} href={href}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      color: isActive ? "var(--theme-accent)" : "var(--theme-text-muted)",
                      background: isActive ? "var(--theme-accent-soft)" : "transparent",
                    }}>
                    <Icon size={16} className={isActive ? "text-accent" : "text-text-muted"} />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Action Icons: Notifications, Theme Switcher, Avatar */}
          <div className="flex items-center gap-3">
            
            {/* Theme switcher */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setThemeMode(prev => prev === "light" ? "dark" : "light");
              }}
              className="p-2 rounded-xl hover:bg-surface-2 text-text-muted transition-colors relative"
              title="Toggle theme (mock)"
            >
              {themeMode === "light" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user && (
              <>
                {/* Notifications dropdown trigger */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setProfileOpen(false);
                    }}
                    className="p-2 rounded-xl hover:bg-surface-2 text-text-muted transition-colors relative"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-risk-high rounded-full border-2 border-surface animate-pulse" />
                    )}
                  </button>

                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
                      >
                        <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-surface-2">
                          <h4 className="text-xs font-semibold text-text">Notifications</h4>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-[10px] font-medium text-accent hover:underline">
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="divide-y divide-border max-h-64 overflow-y-auto">
                          {notifications.map(n => (
                            <div key={n.id} className={`p-4 flex gap-2.5 transition-colors ${n.read ? "bg-transparent" : "bg-accent-soft/30"}`}>
                              {n.type === "alert" ? (
                                <ShieldAlert size={16} className="text-risk-high shrink-0 mt-0.5" />
                              ) : (
                                <Activity size={16} className="text-accent shrink-0 mt-0.5" />
                              )}
                              <div className="space-y-0.5">
                                <p className="text-xs text-text leading-tight">{n.text}</p>
                                <p className="text-[9px] text-text-subtle">Just now</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Link href="/history" className="block text-center text-xs py-2.5 border-t border-border hover:bg-surface-2 text-text-muted font-medium">
                          View assessment history
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile menu */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => {
                      setProfileOpen(!profileOpen);
                      setNotificationsOpen(false);
                    }}
                    className="flex items-center gap-1.5 focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-400 to-coral-500 text-white font-semibold text-xs flex items-center justify-center border-2 border-white shadow-md">
                      SJ
                    </div>
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-2xl shadow-xl z-50 py-1 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-xs font-semibold text-text">{user.full_name || "Dr. Sarah Jenkins"}</p>
                          <p className="text-[10px] text-text-muted truncate font-mono">{user.email}</p>
                        </div>
                        
                        <Link href="/profile" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-text hover:bg-surface-2 transition-colors">
                          <Settings size={14} className="text-text-muted" />
                          Profile Settings
                        </Link>

                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-risk-high hover:bg-rose-50/50 transition-colors border-t border-border mt-1">
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {!user && (
              <Link href="/auth"
                className="px-4 py-2 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 shadow-sm transition-all duration-200">
                Sign In
              </Link>
            )}

            {/* Mobile menu trigger */}
            {user && (
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 lg:hidden rounded-xl hover:bg-surface-2 text-text-muted transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && user && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-surface border-t border-border overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {links.map(({ href, label, icon: Icon }) => {
                const isActive = pathname.startsWith(href);
                return (
                  <Link key={href} href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      color: isActive ? "var(--theme-accent)" : "var(--theme-text-muted)",
                      background: isActive ? "var(--theme-accent-soft)" : "transparent",
                    }}>
                    <Icon size={18} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
