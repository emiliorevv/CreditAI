"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardService = void 0;
const supabase_1 = require("../config/supabase");
class CardService {
    static async getUserCards(userId) {
        const { data, error } = await supabase_1.supabase
            .from('user_cards')
            .select('*, card_model:card_models(*)')
            .eq('user_id', userId);
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Placeholder for future logic (Phase 2)
    static async calculateCardStatus(card) {
        // Logic to be implemented in Phase 2
    }
}
exports.CardService = CardService;
