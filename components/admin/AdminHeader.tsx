"use client"

import { Menu, Sun, Moon, Gauge } from "lucide-react";
import { useTheme } from "@/src/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function AdminHeader({ sidebarOpen, setSidebarOpen }: AdminHeaderProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
            {/* Left Section: Menu Trigger */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-foreground hover:bg-accent hover:text-accent-foreground"
                    aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                >
                    {sidebarOpen ? (
                        <div className="hidden lg:block">
                            <Gauge className="h-5 w-5" />
                        </div>
                    ) : (
                        <Menu className="h-5 w-5" />
                    )}
                    <span className="lg:hidden">
                        <Menu className="h-5 w-5" />
                    </span>
                </Button>
            </div>

            {/* Right Section: Theme Toggle & Actions */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="text-foreground hover:bg-accent hover:text-accent-foreground"
                    aria-label="Toggle theme"
                >
                    {theme === "dark" ? (
                        <Sun className="h-5 w-5 text-yellow-500" />
                    ) : (
                        <Moon className="h-5 w-5 text-foreground" />
                    )}
                </Button>
            </div>
        </header>
    );
}
