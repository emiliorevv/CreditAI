"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardService = void 0;
const supabase_1 = require("../config/supabase");
const date_fns_1 = require("date-fns");
class CardService {
    static async getUserCards(userId) {
        const { data, error } = await supabase_1.supabase
            .from('user_cards')
            .select('*, card_model:card_models(*)')
            .eq('user_id', userId);
        if (error)
            throw new Error(error.message);
        // Transform data with calculated fields
        return data.map(card => this.calculateCardStatus(card));
    }
    static async getCardModels() {
        const { data, error } = await supabase_1.supabase
            .from('card_models')
            .select('*');
        if (error)
            throw new Error(error.message);
        return data;
    }
    static async createCard(userId, cardData) {
        const { data, error } = await supabase_1.supabase
            .from('user_cards')
            .insert({
            user_id: userId,
            model_id: cardData.model_id,
            credit_limit: cardData.credit_limit,
            closing_day: cardData.closing_day,
            due_day: cardData.due_day,
            current_balance: 0 // Default starting balance
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    static calculateCardStatus(card) {
        const today = new Date();
        const closingDay = card.closing_day;
        const dueDay = card.due_day;
        let nextClosingDate = (0, date_fns_1.setDate)(today, closingDay);
        if ((0, date_fns_1.isPast)(nextClosingDate) && !this.isToday(nextClosingDate)) {
            nextClosingDate = (0, date_fns_1.addMonths)(nextClosingDate, 1);
        }
        let nextDueDate = (0, date_fns_1.setDate)(nextClosingDate, dueDay);
        if (nextDueDate < nextClosingDate) {
            nextDueDate = (0, date_fns_1.addMonths)(nextDueDate, 1);
        }
        const daysRemaining = (0, date_fns_1.differenceInDays)(nextClosingDate, today);
        const utilization = card.current_balance / card.credit_limit;
        let health = 'Good';
        if (utilization > 0.3)
            health = 'Warning';
        if (utilization > 0.8)
            health = 'Critical';
        return {
            ...card,
            days_remaining: daysRemaining,
            next_closing_date: (0, date_fns_1.format)(nextClosingDate, 'yyyy-MM-dd'),
            next_payment_due_date: (0, date_fns_1.format)(nextDueDate, 'yyyy-MM-dd'),
            utilization_ratio: Number(utilization.toFixed(2)),
            health_status: health
        };
    }
    static isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }
}
exports.CardService = CardService;
