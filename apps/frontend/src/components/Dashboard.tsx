import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { CreditCard } from './CreditCard';
import { AddCardModal } from './AddCardModal';
import { AddTransactionModal } from './AddTransactionModal';
import { PlusCircle, Loader2, ArrowUpRight } from 'lucide-react';
import { AiAssistant } from './AiAssistant';

export function Dashboard() {
    const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [selectedCardForTransaction, setSelectedCardForTransaction] = useState<string | undefined>(undefined);
    const { data: cards, isLoading, error, refetch } = useQuery({
        queryKey: ['cards'],
        queryFn: api.getCards,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-background text-primary">
                <Loader2 className="w-10 h-10 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-background text-red-500">
                <p>Error loading cards. Is the backend running?</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">My Wallet</h1>
                        <p className="text-muted">Manage your cards and optimize your payments.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsAddCardModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                        >
                            <PlusCircle className="w-5 h-5" />
                            Add New Card
                        </button>
                        <button
                            onClick={() => {
                                setSelectedCardForTransaction(undefined);
                                setIsTransactionModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors shadow-lg shadow-white/5"
                        >
                            <ArrowUpRight className="w-5 h-5" />
                            Log Expense
                        </button>
                    </div>
                </header>

                <section className="mb-10">
                    {cards?.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-neutral-700 rounded-2xl">
                            <p className="text-muted">No cards found. Add your first credit card!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cards?.map((card) => (
                                <CreditCard key={card.id} card={card} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Quick Actions / Recent Activity Placeholder */}
                {cards && cards.length > 0 && (
                    <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 mt-10">
                        <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                        <div className="text-center py-8">
                            <p className="text-neutral-500 text-sm">Select a card to view detailed transactions.</p>
                            <button
                                onClick={() => setIsTransactionModalOpen(true)}
                                className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors"
                            >
                                Log a new expense
                            </button>
                        </div>
                    </div>
                )}

                <AddCardModal
                    isOpen={isAddCardModalOpen} // Updated state
                    onClose={() => setIsAddCardModalOpen(false)} // Updated state
                    onCardAdded={() => {
                        refetch(); // Refresh card list
                    }}
                />

                <AddTransactionModal
                    isOpen={isTransactionModalOpen}
                    onClose={() => setIsTransactionModalOpen(false)}
                    cards={cards || []}
                    preSelectedCardId={selectedCardForTransaction}
                    onTransactionAdded={() => {
                        refetch(); // Refresh card list (balances will update)
                    }}
                />
                <AiAssistant />
            </div>
        </main>
    );
}
