import { Router } from 'express';
import { AiService } from '../services/AiService';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

router.post('/chat', authMiddleware, async (req: AuthRequest, res) => {
    console.log('[AI Route] Received chat request');
    console.log('[AI Route] Headers:', req.headers);
    console.log('[AI Route] Body:', JSON.stringify(req.body, null, 2));

    try {
        const { messages, text } = req.body;
        const userId = req.user?.id;
        console.log('[AI Route] User ID:', userId);

        if (!userId) {
            console.error('[AI Route] Unauthorized: No user ID');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Extract last message content. Frontend sends 'parts', curl might send 'content' or 'text'.
        const lastMsg = messages?.[messages.length - 1];
        let lastMessageContent = text;

        if (!lastMessageContent && lastMsg) {
            if (lastMsg.content) {
                lastMessageContent = lastMsg.content;
            } else if (lastMsg.parts) {
                // Extract text from parts
                lastMessageContent = lastMsg.parts
                    .filter((p: any) => p.type === 'text')
                    .map((p: any) => p.text)
                    .join('');
            }
        }

        const result = await AiService.generateResponse(lastMessageContent || '', userId);

        // Result is a StreamTextResult
        // Manually pipe the data stream using Server-Sent Events (SSE) format
        // compatible with the frontend's DefaultChatTransport and parseJsonEventStream
        res.writeHead(200, {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Vercel-AI-Data-Stream': 'v1',
        });

        const genId = 'gen-' + Math.random().toString(36).slice(2, 9);

        res.write(`data: ${JSON.stringify({ type: 'text-start', id: genId })}\n\n`);

        for await (const part of result.fullStream) {
            if (part.type === 'text-delta') {
                res.write(`data: ${JSON.stringify({ type: 'text-delta', id: genId, delta: part.text })}\n\n`);
            }
        }

        res.write(`data: ${JSON.stringify({ type: 'text-end', id: genId })}\n\n`);
        res.write(`data: ${JSON.stringify({ type: 'finish', finishReason: 'stop' })}\n\n`);

        res.end();
    } catch (error: any) {
        console.error('AI Service Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
