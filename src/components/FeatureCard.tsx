import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  color: string;
  onClick?: () => void;
  badge?: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  color,
  onClick,
  badge,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`card-feature relative ${className}`}
    >
      {badge && (
        <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-medium rounded-full">
          {badge}
        </span>
      )}
      <div 
        className="icon-container"
        style={{ backgroundColor: color }}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-xs font-medium text-foreground text-center font-bangla leading-tight">
        {title}
      </span>
    </button>
  );
};

export default FeatureCard;
