'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Smartphone, 
  Laptop, 
  Shirt, 
  Footprints, 
  Home, 
  Sparkles, 
  Briefcase, 
  Gamepad2, 
  Watch, 
  Utensils, 
  Package 
} from 'lucide-react';
import { ProductCategory } from '@/lib/constants';

interface CategoryCardProps {
  category: ProductCategory;
  count?: number;
  isSelected?: boolean;
  onClick?: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  'Électronique': <Zap className="w-6 h-6 text-amber-500" />,
  'Téléphones': <Smartphone className="w-6 h-6 text-sky-500" />,
  'Ordinateurs': <Laptop className="w-6 h-6 text-indigo-500" />,
  'Mode': <Shirt className="w-6 h-6 text-rose-500" />,
  'Chaussures': <Footprints className="w-6 h-6 text-orange-500" />,
  'Maison': <Home className="w-6 h-6 text-emerald-500" />,
  'Beauté': <Sparkles className="w-6 h-6 text-pink-500" />,
  'Services': <Briefcase className="w-6 h-6 text-purple-500" />,
  'Jeux': <Gamepad2 className="w-6 h-6 text-violet-500" />,
  'Accessoires': <Watch className="w-6 h-6 text-teal-500" />,
  'Alimentation': <Utensils className="w-6 h-6 text-yellow-500" />,
  'Autres': <Package className="w-6 h-6 text-slate-500" />,
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  count,
  isSelected,
  onClick,
}) => {
  const icon = ICON_MAP[category] || <Package className="w-6 h-6 text-purple-500" />;

  const content = (
    <div
      className={`group relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-center ${
        isSelected
          ? 'bg-purple-900 text-white border-purple-800 shadow-md ring-2 ring-purple-600 ring-offset-2'
          : 'bg-white hover:bg-purple-50/60 text-gray-800 border-gray-200 hover:border-purple-300 shadow-xs hover:shadow-sm'
      }`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 ${
          isSelected ? 'bg-purple-800' : 'bg-gray-50 group-hover:bg-white'
        }`}
      >
        {icon}
      </div>
      <span className={`text-sm font-semibold tracking-tight ${isSelected ? 'text-white' : 'text-gray-900'}`}>
        {category}
      </span>
      {count !== undefined && (
        <span
          className={`text-xs mt-1 font-medium ${
            isSelected ? 'text-purple-200' : 'text-gray-500'
          }`}
        >
          {count} {count > 1 ? 'articles' : 'article'}
        </span>
      )}
    </div>
  );

  if (onClick) {
    return <button onClick={onClick} className="w-full text-left">{content}</button>;
  }

  return (
    <Link href={`/category/${encodeURIComponent(category)}`} className="block">
      {content}
    </Link>
  );
};
