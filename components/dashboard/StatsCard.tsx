'use client';

import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'blue',
}: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 dark:bg-blue-600',
    green: 'bg-green-500 dark:bg-green-600',
    yellow: 'bg-yellow-500 dark:bg-yellow-600',
    purple: 'bg-purple-500 dark:bg-purple-600',
    red: 'bg-red-500 dark:bg-red-600',
    indigo: 'bg-indigo-500 dark:bg-indigo-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold mt-2">{value}</p>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
              {trend && (
                <div className="flex items-center mt-2">
                  <span
                    className={`text-sm font-medium ${
                      trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">vs last month</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
