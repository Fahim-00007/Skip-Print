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
    { number: 1, title: '1. Pick Excel File', subtitle: 'Select your bill', icon: Upload },
    { number: 2, title: '2. Pick Letterhead', subtitle: 'Choose paper design', icon: LayoutTemplate },
    { number: 3, title: '3. Adjust Position', subtitle: 'Check alignment', icon: Move },
    { number: 4, title: '4. Signature', subtitle: 'Optional', icon: PenTool },
    { number: 5, title: '5. Download PDF', subtitle: 'Save finished file', icon: Download },
  ];

  const currentStepObj = steps.find((s) => s.number === currentStep) || steps[0];

  return (
    <div className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 shadow-2xs">
      <div className="max-w-5xl mx-auto space-y-2.5">
        {/* Progress Bar & Badges */}
        <div className="flex items-center justify-between gap-2">
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
                  className={`flex items-center space-x-2.5 py-2 px-3 rounded-xl transition-all text-left ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-sm ring-2 ring-blue-900/30'
                      : isCompleted
                      ? 'text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 cursor-pointer'
                      : isAllowed
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer'
                      : 'text-slate-400 cursor-not-allowed opacity-60'
                  }`}
                  title={`Go to Step ${step.number}: ${step.title}`}
                >
                  {/* Step Number Circle */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                      isActive
                        ? 'bg-white text-blue-900 font-extrabold'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.number}
                  </div>

                  {/* Step Labels */}
                  <div className="hidden md:block">
                    <p className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-900'}`}>
                      {step.title}
                    </p>
                    <p className={`text-[11px] leading-tight mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                      {step.subtitle}
                    </p>
                  </div>
                </button>

                {/* Connecting Line */}
                {idx < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-1 rounded-full transition-colors ${
                      currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current Active Step Banner - Very clear for senior users */}
        <div className="flex items-center justify-between text-xs bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium">
          <div>
            <span className="font-bold text-blue-900">Current Step {currentStep} of 5:</span>{' '}
            <span className="font-semibold text-slate-900">{currentStepObj.title}</span> — {currentStepObj.subtitle}
          </div>
          <span className="text-[11px] text-slate-500">
            {currentStep < 5 ? `Next step unlocks automatically` : `Final Step`}
          </span>
        </div>
      </div>
    </div>
  );
};
