export interface IUser {
    id: string;
    email: string;
    full_name?: string;
    created_at?: string;
}
export interface ICardBenefits {
    [category: string]: number;
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
    model_id?: string | null;
    card_model?: ICardModel;
    name_override?: string;
    issuer_override?: string;
    card_network?: string;
    custom_benefits?: ICardBenefits;
    rewards_type_override?: 'points' | 'cashback';
    current_balance: number;
    credit_limit: number;
    closing_day: number;
    due_day: number;
}
export interface ICardStatus extends IUserCard {
    days_remaining: number;
    days_until_due: number;
    payment_status: 'PAID' | 'DUE' | 'OVERDUE' | 'SPENDING';
    next_closing_date: string;
    next_payment_due_date: string;
    utilization_ratio: number;
    health_status: 'Good' | 'Warning' | 'Critical';
}
export interface ITransaction {
    id: string;
    card_id: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    created_at: string;
}
