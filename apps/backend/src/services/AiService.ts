import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { supabase } from '../config/supabase';

export class AiService {
    static async generateResponse(userMessage: string, userId: string): Promise<any> {
        // 1. Fetch Context (Cards & Benefits)
        const { data: cards, error } = await supabase
            .from('user_cards')
            .select(`
                *,
                card_model:card_models (
                    name,
                    issuer,
                    benefits
                )
            `)
            .eq('user_id', userId); // In a real app, use actual auth user id

        if (error) {
            console.error('Supabase fetch error:', error);
            throw new Error('Failed to fetch card context');
        }

        // 2. Construct System Prompt
        const systemPrompt = `
You are an expert credit card financial assistant. 
Your goal is to help the user maximize their rewards (cashback/points) and manage their credit health.

User's Portfolio:
${JSON.stringify(cards, null, 2)}

Instructions:
- Analyze the user's specific cards and benefits.
- If asking about a purchase (e.g., "Dinner"), recommend the card with the highest multiplier for that category.
- Keep answers concise, friendly, and data-driven.
- If you recommend a card, explain WHY (e.g., "Use the Gold Card because it earns 4x on Dining").
`;

        // 3. Stream Response
        const result = await streamText({
            model: openai('gpt-3.5-turbo'),
            system: systemPrompt,
            messages: [{ role: 'user', content: userMessage }],
        });

        return result;
    }
}
