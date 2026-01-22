import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, AlertCircle, Navigation, HelpCircle } from 'lucide-react';

const QuickActions: React.FC = () => {
  const { language } = useLanguage();

  const actions = [
    { 
      icon: Phone, 
      label: language === 'bn' ? 'জরুরি কল' : 'Emergency', 
      color: 'bg-destructive',
      number: '999' 
    },
    { 
      icon: AlertCircle, 
      label: language === 'bn' ? 'SOS' : 'SOS', 
      color: 'bg-accent',
    },
    { 
      icon: Navigation, 
      label: language === 'bn' ? 'নিকটতম' : 'Nearby', 
      color: 'bg-primary',
    },
    { 
      icon: HelpCircle, 
      label: language === 'bn' ? 'সাহায্য' : 'Help', 
      color: 'bg-category-transport',
    },
  ];

  return (
    <div className="px-4 py-4">
      <div className="card-elevated p-3">
        <div className="flex items-center justify-between">
          {actions.map((action, index) => (
            <button
              key={index}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <div className={`icon-container-sm ${action.color}`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-medium text-foreground font-bangla">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
