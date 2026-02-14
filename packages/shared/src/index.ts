export interface IUser {
    id: string;
    email: string;
    full_name?: string;
    created_at?: string;
}

export interface ICardBenefits {
    [category: string]: number; // e.g., "dining": 4 (percent or multiplier)
}

export interface ICardModel {
    id: string;
    name: string;
    issuer: string;
    benefits: ICardBenefits;
    rewards_type: 'points' | 'cashback';
    image_url?: string;
}

export interface IUserCard {
    id: string;
    user_id: string;
    model_id?: string | null;   // Now Optional
    card_model?: ICardModel;    // Populated/Joined data (optional if custom)

    // Custom Card Fields
    name_override?: string;
    issuer_override?: string;
    card_network?: string;

    current_balance: number;
    credit_limit: number;
    closing_day: number; // 1-31
    due_day: number;     // 1-31

    // Backend calculated fields (from ICardStatus, but sometimes good to have here optionally)
}

// For API Responses where we return calculated dates
export interface ICardStatus extends IUserCard {
    days_remaining: number; // Days until next closing date
    days_until_due: number; // Days until next payment due date
    payment_status: 'PAID' | 'DUE' | 'OVERDUE' | 'SPENDING'; // New Logic
    next_closing_date: string; // ISO Date
    next_payment_due_date: string; // ISO Date
    utilization_ratio: number; // 0-1
    health_status: 'Good' | 'Warning' | 'Critical';
}
