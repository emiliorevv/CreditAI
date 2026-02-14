import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { X, Loader2, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import type { ICardModel } from '@credit-ai/shared';

interface AddCardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddCardModal({ isOpen, onClose }: AddCardModalProps) {
    const queryClient = useQueryClient();
    const [mode, setMode] = useState<'select' | 'custom'>('select');

    const [selectedModel, setSelectedModel] = useState<ICardModel | null>(null);
    const [customName, setCustomName] = useState('');
    const [customIssuer, setCustomIssuer] = useState('');

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
            onClose();
            // Reset form
            setSelectedModel(null);
            setCustomName('');
            setCustomIssuer('');
            setCreditLimit(1000);
            setMode('select');
        }
    });

    if (!isOpen) return null;

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
