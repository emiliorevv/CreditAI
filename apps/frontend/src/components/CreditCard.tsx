import React from 'react';
import type { ICardStatus } from '@credit-ai/shared';
import { cn } from '../lib/utils';
import { CreditCard as CardIcon, AlertCircle, CheckCircle } from 'lucide-react';

interface CreditCardProps {
    card: ICardStatus;
}

export function CreditCard({ card }: CreditCardProps) {
    const isHealthy = card.health_status === 'Good';
    const isCritical = card.health_status === 'Critical';

    // Logic: Use payment_status from backend
    const isDueZone = card.payment_status === 'DUE';

    // Calculate color based on User's Rules for Due Date
    let dueColorClass = "text-primary"; // Default for Spending Mode

    if (isDueZone) {
        if (card.days_until_due > 10) {
            dueColorClass = "text-green-300"; // Light Greenish
        } else if (card.days_until_due >= 6) {
            dueColorClass = "text-orange-400"; // Orange
        } else {
            dueColorClass = "text-red-500 animate-pulse"; // Red (Critical)
        }
    }

    // Display Logic
    const cardName = card.card_model?.name || card.name_override || 'Unknown Card';
    const cardIssuer = card.card_model?.issuer || card.issuer_override || 'Unknown Issuer';

    // Benefits Logic
    const benefits = card.card_model?.benefits || card.custom_benefits || {};
    const rewardsType = card.card_model?.rewards_type || card.rewards_type_override || 'points';

    const [isFlipped, setIsFlipped] = React.useState(false);

    return (
        <div
            className="perspective-1000 relative w-full h-[240px] group cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div className={cn(
                "w-full h-full transition-all duration-500 preserve-3d relative",
                isFlipped ? "rotate-y-180" : ""
            )}>
                {/* FRONT OF CARD */}
                <div className={cn(
                    "absolute inset-0 backface-hidden rounded-2xl p-6 shadow-xl border border-white/5 overflow-hidden",
                    isDueZone && card.days_until_due <= 5 ? "bg-gradient-to-br from-red-950/30 to-neutral-900 border-red-500/30" : "bg-gradient-to-br from-card to-neutral-900"
                )}>
                    {/* Background decoration */}
                    <div className={cn(
                        "absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl",
                        isDueZone && card.days_until_due <= 5 ? "bg-red-500/10" : "bg-primary/10"
                    )} />

                    <div className="relative z-10 flex flex-col justify-between h-full">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-white tracking-wide">{cardName}</h3>
                                <p className="text-sm text-muted">{cardIssuer}</p>
                            </div>
                            <CardIcon className={cn("w-8 h-8 opacity-80", dueColorClass)} />
                        </div>

                        {/* Middle: Days Remaining */}
                        <div className="my-2">
                            <div className="flex items-baseline gap-2">
                                <span className={cn("text-4xl font-bold transition-colors", isDueZone ? dueColorClass : "text-primary")}>
                                    {isDueZone ? card.days_until_due : card.days_remaining}
                                </span>
                                <span className="text-sm text-muted">
                                    {isDueZone ? "days to pay" : "days left in cycle"}
                                </span>
                            </div>
                            <p className="text-xs text-muted/60">
                                {isDueZone ? `Due on ${card.next_payment_due_date}` : `Closes on ${card.next_closing_date}`}
                            </p>
                        </div>

                        {/* Footer: Balance & Status */}
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-muted mb-1">Current Balance</p>
                                <p className="text-xl font-mono text-white">${card.current_balance.toLocaleString()}</p>
                            </div>

                            <div className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
                                isHealthy ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                    isCritical ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            )}>
                                {isHealthy ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                {card.health_status}
                            </div>
                        </div>
                    </div>

                    {/* ProgressBar */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                        <div
                            className={cn("h-full transition-all duration-500", isCritical ? "bg-red-500" : "bg-primary")}
                            style={{ width: `${Math.min(card.utilization_ratio * 100, 100)}%` }}
                        />
                    </div>
                </div>

                {/* BACK OF CARD (Benefits) */}
                <div className={cn(
                    "absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-6 shadow-xl border border-white/5 bg-neutral-900/95 backdrop-blur-xl flex flex-col",
                    "translate-z-1" // Safari fix
                )}>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-primary">★</span> Card Benefits
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                        {Object.entries(benefits).length > 0 ? (
                            Object.entries(benefits).map(([category, value]) => (
                                <div key={category} className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/5">
                                    <span className="text-sm text-neutral-300 capitalize">{category}</span>
                                    <span className="text-sm font-bold text-primary">
                                        {value}x {rewardsType === 'cashback' ? '%' : 'pts'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted italic">No benefits listed.</p>
                        )}
                    </div>

                    <p className="text-xs text-center text-muted mt-4">Tap to flip back</p>
                </div>
            </div>
        </div>
    );
}
