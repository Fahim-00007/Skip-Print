import React from 'react';
import { Upload, LayoutTemplate, Move, PenTool, Download, Check } from 'lucide-react';

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
    { number: 1, title: 'Upload Bill', desc: 'Select Excel file', icon: Upload },
    { number: 2, title: 'Letterhead', desc: 'Pick company pad', icon: LayoutTemplate },
    { number: 3, title: 'Adjust Position', desc: 'Align on page', icon: Move },
    { number: 4, title: 'Signature', desc: 'Optional signoff', icon: PenTool },
    { number: 5, title: 'Download PDF', desc: 'Save finished file', icon: Download },
  ];

  return (
    <div className="bg-white border-b border-slate-200 select-none">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => {
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            const isAllowed = canNavigateTo(step.number);

            return (
              <React.Fragment key={step.number}>
                <button
                  type="button"
                  onClick={() => isAllowed && setStep(step.number)}
                  disabled={!isAllowed}
                  className={`flex items-center space-x-3 py-1.5 px-2 rounded-xl transition-all text-left ${
                    isAllowed ? 'cursor-pointer hover:bg-slate-50' : 'cursor-not-allowed opacity-50'
                  }`}
                  title={`Step ${step.number}: ${step.title}`}
                >
                  {/* Step Number or Check */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : isCompleted
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'border border-slate-300 text-slate-500 bg-white'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : step.number}
                  </div>

                  {/* Step Titles */}
                  <div className="hidden sm:block">
                    <p
                      className={`text-xs font-bold leading-tight ${
                        isActive ? 'text-slate-900' : isCompleted ? 'text-slate-800' : 'text-slate-500'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </button>

                {/* Connecting Divider */}
                {idx < steps.length - 1 && (
                  <div
                    className={`hidden sm:block h-px flex-1 mx-3 transition-colors ${
                      currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
