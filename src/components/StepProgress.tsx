import React from 'react';
import { Check } from 'lucide-react';

interface Step {
    number: number;
    title: string;
    description: string;
}

interface StepProgressProps {
    steps: Step[];
    currentStep: number;
    onStepClick?: (step: number) => void;
}

const StepProgress: React.FC<StepProgressProps> = ({ steps, currentStep, onStepClick }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '3rem',
            position: 'relative'
        }}>
            {/* Ligne de progression */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '0',
                right: '0',
                height: '2px',
                background: 'rgba(255, 255, 255, 0.1)',
                zIndex: 0
            }}>
                <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                    width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                    transition: 'width 0.3s ease'
                }} />
            </div>

            {/* Étapes */}
            {steps.map((step) => {
                const isCompleted = step.number < currentStep;
                const isCurrent = step.number === currentStep;
                const isClickable = onStepClick && step.number < currentStep;

                return (
                    <div
                        key={step.number}
                        onClick={() => isClickable && onStepClick(step.number)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: 1,
                            position: 'relative',
                            zIndex: 1,
                            cursor: isClickable ? 'pointer' : 'default'
                        }}
                    >
                        {/* Cercle de l'étape */}
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isCompleted || isCurrent
                                ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                                : 'rgba(255, 255, 255, 0.05)',
                            border: isCurrent
                                ? '2px solid #8b5cf6'
                                : '2px solid rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            boxShadow: isCurrent
                                ? '0 0 20px rgba(139, 92, 246, 0.5)'
                                : 'none',
                            transform: isCurrent ? 'scale(1.1)' : 'scale(1)'
                        }}>
                            {isCompleted ? <Check size={20} /> : step.number}
                        </div>

                        {/* Titre et description */}
                        <div style={{
                            marginTop: '0.75rem',
                            textAlign: 'center',
                            maxWidth: '120px'
                        }}>
                            <div style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: isCurrent ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                                marginBottom: '0.25rem'
                            }}>
                                {step.title}
                            </div>
                            <div style={{
                                fontSize: '0.7rem',
                                color: 'rgba(255, 255, 255, 0.4)',
                                lineHeight: 1.3
                            }}>
                                {step.description}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default StepProgress;
