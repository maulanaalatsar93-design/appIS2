import React from 'react';
import {
  CheckCircle2, Coffee, Palmtree, Plane, Briefcase, GraduationCap,
  Stethoscope, FileText, Share2, HelpCircle
} from 'lucide-react';

export const STATUS_CONFIG = {
  1: { id: 1, name: 'Hadir', icon: CheckCircle2, bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', color: 'text-emerald-600', badgeBg: 'bg-emerald-500' },
  2: { id: 2, name: 'Libur', icon: Coffee, bg: 'bg-platinum-dark text-slate-700 border-slate-300', color: 'text-slate-500', badgeBg: 'bg-slate-400' },
  3: { id: 3, name: 'Cuti', icon: Palmtree, bg: 'bg-amber-100 text-amber-900 border-amber-300', color: 'text-amber-700', badgeBg: 'bg-amber-500' },
  4: { id: 4, name: 'Dinas Luar Negeri', icon: Plane, bg: 'bg-blue-100 text-blue-900 border-blue-300', color: 'text-blue-700', badgeBg: 'bg-navy' },
  5: { id: 5, name: 'Dinas Dalam Negeri', icon: Briefcase, bg: 'bg-sky-100 text-sky-900 border-sky-300', color: 'text-sky-700', badgeBg: 'bg-sky-500' },
  6: { id: 6, name: 'Training', icon: GraduationCap, bg: 'bg-indigo-100 text-indigo-900 border-indigo-300', color: 'text-indigo-700', badgeBg: 'bg-navy' },
  7: { id: 7, name: 'Sakit', icon: Stethoscope, bg: 'bg-rose-100 text-rose-900 border-rose-300', color: 'text-rose-700', badgeBg: 'bg-rose-500' },
  8: { id: 8, name: 'Izin', icon: FileText, bg: 'bg-orange-100 text-orange-900 border-orange-300', color: 'text-orange-700', badgeBg: 'bg-orange-500' },
  9: { id: 9, name: 'Referral', icon: Share2, bg: 'bg-teal-100 text-teal-900 border-teal-300', color: 'text-teal-700', badgeBg: 'bg-teal-600' },
};

export function getStatusConfig(key) {
  if (typeof key === 'number' || (typeof key === 'string' && !isNaN(parseInt(key, 10)) && key.trim() !== '')) {
    const num = parseInt(key, 10);
    if (STATUS_CONFIG[num]) return STATUS_CONFIG[num];
  }
  const str = String(key || '').toLowerCase().trim();
  if (str.includes('hadir')) return STATUS_CONFIG[1];
  if (str.includes('libur')) return STATUS_CONFIG[2];
  if (str.includes('cuti')) return STATUS_CONFIG[3];
  if (str.includes('luar negeri')) return STATUS_CONFIG[4];
  if (str.includes('dinas') || str.includes('dalam negeri')) return STATUS_CONFIG[5];
  if (str.includes('training') || str.includes('diklat') || str.includes('pelatihan')) return STATUS_CONFIG[6];
  if (str.includes('sakit')) return STATUS_CONFIG[7];
  if (str.includes('izin') || str.includes('ijin')) return STATUS_CONFIG[8];
  if (str.includes('referral') || str.includes('rujukan')) return STATUS_CONFIG[9];

  return {
    id: 0,
    name: key || 'Absen',
    icon: HelpCircle,
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    color: 'text-amber-600',
    badgeBg: 'bg-amber-500'
  };
}

export default function StatusBadge({ statusId, statusName, size = 'sm', showIcon = true }) {
  const config = statusId ? getStatusConfig(statusId) : getStatusConfig(statusName);
  const IconComponent = config.icon;

  const iconSizes = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18
  };

  const textSizes = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-[11px] px-2.5 py-1',
    md: 'text-xs px-3 py-1',
    lg: 'text-xs px-3.5 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold border shadow-xs transition-all ${config.bg} ${textSizes[size] || textSizes.sm}`}
      title={`Status: ${config.name}`}
    >
      {showIcon && <IconComponent size={iconSizes[size] || 13} className="shrink-0" />}
      <span className="truncate">{config.name}</span>
    </span>
  );
}

