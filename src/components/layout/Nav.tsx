"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  Heart, LogOut, Activity, BarChart3, Clock, 
  MessageSquareCode, User, Menu, X
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Nav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    router.push("/");
  };

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: Activity },
    { href: "/assess",    label: "New Assessment", icon: Heart },
    { href: "/history",   label: "History",   icon: Clock },
    { href: "/insights",  label: "Insights",  icon: BarChart3 },
    { href: "/cardiobot", label: "CardioBot", icon: MessageSquareCode },
    { href: "/profile",   label: "Profile",   icon: User },
  ];

  // Close profile context menus on document target click boundaries
  useEffect(() => {
    const clickOutside = () => {
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
          
          {/* Brand/Logo Layout Container */}
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

          {/* Right Action Stack: Avatar Node Dropdown */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-1.5 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-400 to-coral-500 text-white font-semibold text-xs flex items-center justify-center border-2 border-white shadow-md">
                    {user.full_name ? user.full_name.split(" ").pop()?.substring(0, 2).toUpperCase() : "MD"}
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
                        <p className="text-xs font-semibold text-text">{user.full_name || "Clinician Account"}</p>
                        <p className="text-[10px] text-text-muted truncate font-mono">{user.email}</p>
                      </div>
                      
                      <Link href="/profile" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-text hover:bg-surface-2 transition-colors">
                        <User size={14} className="text-text-muted" />
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
            )}

            {/* Mobile menu panel hamburger trigger node */}
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

      {/* Mobile Menu Dropdown Panel */}
      <AnimatePresence>
        {mobileMenuOpen && user && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-surface border-t border-border overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1幕">
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