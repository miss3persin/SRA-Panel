
"use client";

import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Info, Users, BookOpen, Award } from 'lucide-react';

type InsightCardVariant = 'warning' | 'info' | 'success' | 'default' | 'danger' | 'highlight' | 'purple' | 'teal' | 'indigo' | 'cyan' | 'neutral';

interface InsightCardProps {
  title: string;
  description?: string;
  value?: string | number;
  icon: 'atRisk' | 'highFailure' | 'topPerformers' | 'performanceDrop' | 'custom';
  CustomIcon?: ReactNode;
  variant?: InsightCardVariant;
  children?: ReactNode; // For detailed lists or custom content
}

const iconMap = {
  atRisk: <Users className="h-6 w-6 text-orange-500" />,
  highFailure: <BookOpen className="h-6 w-6 text-red-500" />,
  topPerformers: <Award className="h-6 w-6 text-green-500" />,
  performanceDrop: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
  custom: <Info className="h-6 w-6 text-blue-500" />,
};

const variantClasses: Record<InsightCardVariant, string> = {
  warning: "border-orange-500/50 bg-orange-500/10",
  info: "border-blue-500/50 bg-blue-500/10",
  success: "border-green-500/50 bg-green-500/10",
  default: "",
  danger: "border-red-500/50 bg-red-500/10",
  highlight: "border-yellow-500/50 bg-yellow-500/10",
  purple: "border-purple-500/50 bg-purple-500/10",
  teal: "border-teal-500/50 bg-teal-500/10",
  indigo: "border-indigo-500/50 bg-indigo-500/10",
  cyan: "border-cyan-500/50 bg-cyan-500/10",
  neutral: "border-gray-400/50 bg-gray-400/10 dark:border-gray-600 dark:bg-gray-700/20",
};

export default function InsightCard({ title, description, value, icon, CustomIcon, variant = 'default', children }: InsightCardProps) {
  const displayIcon = CustomIcon || iconMap[icon];

  return (
    <Card className={`shadow-lg ${variantClasses[variant]}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="p-2 rounded-md bg-primary/10">
           {displayIcon}
        </div>
      </CardHeader>
      <CardContent>
        {value !== undefined && <div className="text-3xl font-bold text-primary">{String(value)}</div>}
        {children}
      </CardContent>
    </Card>
  );
}
