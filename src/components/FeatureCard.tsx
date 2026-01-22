import React from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  bgColor: string;
  onClick?: () => void;
  badge?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  bgColor,
  onClick,
  badge,
}) => {
  return (
    <button
      onClick={onClick}
      className="card-feature relative"
    >
      {badge && (
        <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-accent text-accent-foreground text-[9px] font-medium rounded-full">
          {badge}
        </span>
      )}
      <div 
        className="icon-container"
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-2xl">{icon}</span>
      </div>
      <span className="text-[11px] font-medium text-foreground text-center font-bangla leading-tight line-clamp-2">
        {title}
      </span>
    </button>
  );
};

export default FeatureCard;
