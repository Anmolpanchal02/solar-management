'use client';

import StatsCard from './StatsCard';
import { 
  CheckSquare, 
  MapPin, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  Building,
  TrendingUp,
  Calendar,
  LucideIcon
} from 'lucide-react';

interface StatsCardWrapperProps {
  title: string;
  value: string | number;
  iconName: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

const iconMap: Record<string, LucideIcon> = {
  CheckSquare,
  MapPin,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Building,
  TrendingUp,
  Calendar,
};

export default function StatsCardWrapper({ iconName, ...props }: StatsCardWrapperProps) {
  const Icon = iconMap[iconName] || CheckSquare;
  
  return <StatsCard {...props} icon={Icon} />;
}
