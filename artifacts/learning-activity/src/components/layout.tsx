import React from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ChevronLeft, BookOpen } from "lucide-react";
import { store } from "@/lib/store";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
}

export function Layout({ children, showBack, onBack, title }: LayoutProps) {
  const [, navigate] = useLocation();
  const username = store.username;

  const handleLogout = () => {
    store.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none -z-10" />

      <header className="sticky top-0 z-50 glass-panel border-b px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="rounded-full hover:bg-slate-100/50"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg sm:text-xl text-foreground leading-none">
                {title || "Learning Activity"}
              </h1>
              {username && (
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Logged in as <span className="font-medium text-foreground">{username}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {username && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="rounded-full bg-white/50 backdrop-blur-sm border-slate-200 shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
          >
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center p-4 sm:p-6 lg:p-8 w-full max-w-5xl mx-auto z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex-1 flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
