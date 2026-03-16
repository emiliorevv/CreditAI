import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { CardService } from './CardService';

export class AiService {
   static async generateResponse(userMessage: string, userId: string): Promise<any> {
      if (!process.env.OPENAI_API_KEY) {
         throw new Error('[AiService] CRITICAL: OPENAI_API_KEY is missing');
      }

      // 1. Fetch Rich Context via CardService (includes utilization, due dates, health)
      const cards = await CardService.getUserCards(userId);

      const maskedId = userId ? `${userId.substring(0, 4)}...` : 'unknown';
      console.log(`[AiService] User ${maskedId} has ${cards.length} cards.`);

      // 2. Construct System Prompt with Financial & Rewards Logic
      const redactedCards = cards.map(({ user_id, ...rest }) => rest);
      const systemPrompt = `
You are an expert credit card financial assistant. 
Your goal is to help the user maximize their rewards (cashback/points) AND protect their credit health.

User's Portfolio:
${JSON.stringify(redactedCards, null, 2)}

CORE RULES:

1. 🛡️ FINANCIAL HEALTH FIRST (Critical):
   - IF a card has 'health_status' = 'Critical' (>80% utilization), DO NOT recommend it for spending. Warn the user to pay it down to avoid credit score damage.
   - IF a card has 'health_status' = 'Warning' (>30% utilization), advise caution.
   - IF 'days_until_due' is 3 or less, WARN the user to pay the bill immediately to avoid interest.

2. 💰 REWARDS VALUATION (Points vs Cashback):
   - Cashback is liquid: 1% = 1 cent.
   - Points are variable: 
     - Default Valuation: 1 Point = 1 Cent (conservative).
     - Travel Potential: 1 Point = 1.5 Cents (if user mentions travel).
   - Comparison: When comparing cards, explain the value. 
     - Ex: "Card A (4x Points) is worth ~4-6 cents, while Card B (3% Cash) is worth 3 cents."

3. 🛒 SPENDING RECOMMENDATIONS:
   - Identify the category of the purchase (e.g., "Dinner" -> Dining, "Flight" -> Travel).
   - If category is unknown or not listed, assume "Base" / "All Other" rate (usually 1x or 1%).
   - Recommend the card with the highest *effective value* (considering points vs cash).

4. 🧪 TONE:
   - Concise, data-driven, and helpful.
   - If financial health is at risk, be direct but supportive.
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
