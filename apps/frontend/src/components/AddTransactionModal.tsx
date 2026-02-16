import React, { useState } from 'react';
import { X, DollarSign, Calendar, Tag, CreditCard } from 'lucide-react';
import { api } from '../api/client';
import type { ICardStatus } from '@credit-ai/shared';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTransactionAdded: () => void;
    cards: ICardStatus[];
    preSelectedCardId?: string;
}

export function AddTransactionModal({ isOpen, onClose, onTransactionAdded, cards, preSelectedCardId }: AddTransactionModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [cardId, setCardId] = useState(preSelectedCardId || (cards.length > 0 ? cards[0].id : ''));
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('General');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!cardId) {
            setError('Please select a card');
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        // Validate Credit Limit (Frontend Pre-check)
        if (cardId && cards) {
            const selectedCard = cards.find(c => c.id === cardId);
            if (selectedCard) {
                const projectedBalance = (selectedCard.current_balance || 0) + amountNum;
                if (projectedBalance > selectedCard.credit_limit) {
                    const available = selectedCard.credit_limit - (selectedCard.current_balance || 0);
                    setError(`Insufficient credit. Available: $${available.toFixed(2)}`);
                    return;
                }
            }
        }

        setIsLoading(true);
        console.log('Submitting transaction:', { cardId, amount: amountNum, description, category, date });

        try {
            await api.createTransaction({
                card_id: cardId,
                amount: amountNum,
                description,
                category,
                date: new Date(date).toISOString(),
            });
            onTransactionAdded();
            onClose();
            // Reset form
            setAmount('');
            setDescription('');
            setCategory('General');
        } catch (err: any) {
            console.error('Failed to add transaction:', err);
            setError(err.message || 'Failed to add transaction. Please check connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Log Expense</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-neutral-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                    {/* Card Selection */}
                    <div className="space-y-2">
                        <label className="text-sm text-neutral-400 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> Select Card
                        </label>
                        <select
                            value={cardId}
                            onChange={(e) => setCardId(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                            required
                        >
                            <option value="" disabled>Select a card</option>
                            {cards.map(card => (
                                <option key={card.id} value={card.id}>
                                    {card.card_model?.name || card.name_override} (...{card.card_model?.id.slice(-4) || 'Custom'})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <label className="text-sm text-neutral-400 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-8 text-white focus:outline-none focus:border-primary transition-colors"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm text-neutral-400">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="e.g. Uber Ride, Starbucks"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-sm text-neutral-400 flex items-center gap-2">
                                <Tag className="w-4 h-4" /> Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary transition-colors"
                            >
                                <option value="General">General</option>
                                <option value="Dining">Dining</option>
                                <option value="Travel">Travel</option>
                                <option value="Groceries">Groceries</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Shopping">Shopping</option>
                                <option value="Utilities">Utilities</option>
                            </select>
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <label className="text-sm text-neutral-400 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary transition-colors"
                                required
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Adding...' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
