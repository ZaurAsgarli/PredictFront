"use client"

import { motion } from "framer-motion";

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
        >
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded flex-1 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20 animate-pulse" />
        </motion.div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg space-y-4">
      <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse" />
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse" />
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 animate-pulse" />
    </div>
  );
}

export function MetricSkeleton() {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24 animate-pulse" />
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse" />
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-40 animate-pulse" />
    </div>
  );
}

