import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { CreditCard } from '../components/CreditCard';
import { AddCardModal } from '../components/AddCardModal';
import { PlusCircle, Loader2 } from 'lucide-react';

export function Dashboard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: cards, isLoading, error } = useQuery({
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
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">My Wallet</h1>
                        <p className="text-muted">Manage your cards and optimize your payments.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Add New Card
                    </button>
                </header>

                <section>
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

                <AddCardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </div>
        </div>
    );
}
