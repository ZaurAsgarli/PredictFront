"use client"

import { ThemeProvider as Provider } from "@/src/contexts/ThemeContext";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}

