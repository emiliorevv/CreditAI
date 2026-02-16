import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { X, Loader2, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import type { ICardModel } from '@credit-ai/shared';

interface AddCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCardAdded?: () => void;
}

export function AddCardModal({ isOpen, onClose, onCardAdded }: AddCardModalProps) {
    const queryClient = useQueryClient();
    const [mode, setMode] = useState<'select' | 'custom'>('select');

    const [selectedModel, setSelectedModel] = useState<ICardModel | null>(null);
    const [customName, setCustomName] = useState('');
    const [customIssuer, setCustomIssuer] = useState('');
    const [rewardsType, setRewardsType] = useState<'points' | 'cashback'>('points');
    const [customBenefits, setCustomBenefits] = useState<{ category: string, value: number }[]>([{ category: '', value: 0 }]);

    const [creditLimit, setCreditLimit] = useState(1000);
    const [closingDay, setClosingDay] = useState(1);
    const [dueDay, setDueDay] = useState(20);

    const { data: models, isLoading: isLoadingModels } = useQuery({
        queryKey: ['card-models'],
        queryFn: api.getCardModels
    });

    const createCardMutation = useMutation({
        mutationFn: api.createCard,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cards'] });
            if (onCardAdded) onCardAdded();
            onClose();
            // Reset form
            setSelectedModel(null);
            setCustomName('');
            setCustomIssuer('');
            setRewardsType('points');
            setCustomBenefits([{ category: '', value: 0 }]);
            setCreditLimit(1000);
            setMode('select');
        }
    });

    if (!isOpen) return null;

    const addBenefitRow = () => setCustomBenefits([...customBenefits, { category: '', value: 0 }]);
    const removeBenefit = (idx: number) => setCustomBenefits(customBenefits.filter((_, i) => i !== idx));
    const updateBenefit = (idx: number, field: 'category' | 'value', val: any) => {
        const newBenefits = [...customBenefits];
        // @ts-ignore
        newBenefits[idx][field] = val;
        setCustomBenefits(newBenefits);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload: any = {
            credit_limit: creditLimit,
            closing_day: closingDay,
            due_day: dueDay
        };

        if (mode === 'select') {
            if (!selectedModel) return;
            payload.model_id = selectedModel.id;
        } else {
            if (!customName || !customIssuer) return;
            payload.model_id = null;
            payload.name_override = customName;
            payload.issuer_override = customIssuer;
            payload.rewards_type_override = rewardsType;

            // Convert array to object map
            const benefitsMap = customBenefits.reduce((acc, curr) => {
                if (curr.category) acc[curr.category] = curr.value;
                return acc;
            }, {} as Record<string, number>);
            payload.custom_benefits = benefitsMap;
        }

        createCardMutation.mutate(payload);
    };

    // Validation
    const isFormValid = () => {
        if (!creditLimit || creditLimit <= 0) return false;
        if (mode === 'select') return !!selectedModel;
        if (mode === 'custom') return !!customName && !!customIssuer;
        return false;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white">Add New Card</h2>
                    <button onClick={onClose} className="text-muted hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Tab Switcher */}
                    <div className="flex bg-white/5 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setMode('select')}
                            className={cn(
                                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                                mode === 'select' ? "bg-primary text-black shadow-lg" : "text-muted hover:text-white"
                            )}
                        >
                            Select from List
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('custom')}
                            className={cn(
                                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                                mode === 'custom' ? "bg-primary text-black shadow-lg" : "text-muted hover:text-white"
                            )}
                        >
                            Custom Card
                        </button>
                    </div>

                    {/* Step 1: Card Details (Conditional) */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-muted uppercase tracking-wider">1. Card Details</label>

                        {mode === 'select' ? (
                            isLoadingModels ? (
                                <div className="flex items-center gap-2 text-primary"><Loader2 className="animate-spin w-5 h-5" /> Loading models...</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-2">
                                    {models?.map(model => (
                                        <div
                                            key={model.id}
                                            onClick={() => setSelectedModel(model)}
                                            className={cn(
                                                "cursor-pointer p-4 rounded-xl border transition-all",
                                                selectedModel?.id === model.id
                                                    ? "border-primary bg-primary/10"
                                                    : "border-white/5 bg-white/5 hover:border-white/20"
                                            )}
                                        >
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-white">{model.name}</h4>
                                                {selectedModel?.id === model.id && <Check className="text-primary w-5 h-5" />}
                                            </div>
                                            <p className="text-sm text-muted">{model.issuer}</p>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-muted">Card Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Gold Rewards"
                                            className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            value={customName}
                                            onChange={(e) => setCustomName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-muted">Issuer (Bank)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Chase"
                                            className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            value={customIssuer}
                                            onChange={(e) => setCustomIssuer(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Rewards Type Configuration */}
                                <div className="space-y-2">
                                    <label className="text-xs text-muted">Rewards Type</label>
                                    <div className="flex gap-2">
                                        {(['points', 'cashback'] as const).map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setRewardsType(type)}
                                                className={cn(
                                                    "px-4 py-2 rounded-lg text-sm border transition-all capitalize",
                                                    rewardsType === type
                                                        ? "bg-primary/20 border-primary text-primary"
                                                        : "bg-white/5 border-white/10 text-muted hover:bg-white/10"
                                                )}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Benefits Input */}
                                <div className="space-y-2">
                                    <label className="text-xs text-muted flex justify-between">
                                        Benefits <span className="text-muted/60">(e.g. Dining: 4x)</span>
                                    </label>
                                    <div className="space-y-2">
                                        {customBenefits.map((benefit, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input
                                                    placeholder="Category"
                                                    className="flex-1 bg-background border border-white/10 rounded-lg p-2 text-sm text-white"
                                                    value={benefit.category}
                                                    onChange={(e) => updateBenefit(idx, 'category', e.target.value)}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Val"
                                                    className="w-20 bg-background border border-white/10 rounded-lg p-2 text-sm text-white"
                                                    value={benefit.value || ''}
                                                    onChange={(e) => updateBenefit(idx, 'value', Number(e.target.value))}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeBenefit(idx)}
                                                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addBenefitRow}
                                            className="text-xs text-primary hover:underline flex items-center gap-1"
                                        >
                                            + Add Benefit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Configuration */}
                    <div className={cn("space-y-4 transition-opacity", (mode === 'select' && !selectedModel) && "opacity-50 pointer-events-none")}>
                        <label className="text-sm font-medium text-muted uppercase tracking-wider">2. Configuration</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs text-muted">Credit Limit ($)</label>
                                <input
                                    type="number"
                                    className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    value={creditLimit || ''}
                                    onChange={(e) => setCreditLimit(Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-muted">Closing Day (1-31)</label>
                                <input
                                    type="number" min="1" max="31"
                                    className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    value={closingDay || ''}
                                    onChange={(e) => setClosingDay(Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-muted">Due Day (1-31)</label>
                                <input
                                    type="number" min="1" max="31"
                                    className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    value={dueDay || ''}
                                    onChange={(e) => setDueDay(Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end pt-4 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-muted hover:text-white transition-colors mr-4"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid() || createCardMutation.isPending}
                            className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {createCardMutation.isPending && <Loader2 className="animate-spin w-4 h-4" />}
                            Add Card
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
