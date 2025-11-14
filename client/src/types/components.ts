import { LucideIcon } from 'lucide-react';

// Dashboard component types
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accentColor: string;
}

export interface ActivityItemProps {
  title: string;
  time: string;
}

export interface QuickActionProps {
  title: string;
  link: string;
}

export interface FeatureCardProps {
  title: string;
  description: string;
  link: string;
  icon: LucideIcon;
}

// CRM component types
export interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}

// Email component types
export interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
}

// Automations component types
export interface TemplateCardProps {
  title: string;
  description: string;
}
