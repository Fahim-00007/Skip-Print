import React from 'react';
import { Upload, LayoutTemplate, Sliders, PenTool, CheckCircle, Download } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  setStep: (step: number) => void;
  canNavigateTo: (step: number) => boolean;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  setStep,
  canNavigateTo
}) => {
  const steps = [
    { number: 1, title: 'Upload Excel', icon: Upload },
    { number: 2, title: 'Choose Letterhead', icon: LayoutTemplate },
    { number: 3, title: 'Adjust Layout', icon: Sliders },
    { number: 4, title: 'Signature', icon: PenTool },
    { number: 5, title: 'Preview & Export', icon: Download },
  ];

  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isAllowed = canNavigateTo(step.number);

          return (
            <React.Fragment key={step.number}>
              <button
                type="button"
                onClick={() => isAllowed && setStep(step.number)}
                disabled={!isAllowed}
                className={`flex items-center space-x-2 text-xs font-medium py-1.5 px-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-sm ring-2 ring-blue-900/20'
                    : isCompleted
                    ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 cursor-pointer'
                    : isAllowed
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer'
                    : 'text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive
                    ? 'bg-blue-800 text-white'
                    : isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : step.number}
                </div>
                <span className="hidden sm:inline">{step.title}</span>
              </button>

              {idx < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 ${
                  currentStep > idx + 1 ? 'bg-emerald-400' : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
