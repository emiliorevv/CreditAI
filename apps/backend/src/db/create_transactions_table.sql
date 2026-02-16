-- Create Transactions Table
CREATE TABLE public.transactions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    card_id uuid REFERENCES public.user_cards(id) NOT NULL,
    amount numeric NOT NULL, -- Positive for expense, Negative for payment/refund? Or separate type? Let's assume input is positive for expense.
    description text NOT NULL,
    category text DEFAULT 'General',
    date timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Index for faster queries
CREATE INDEX idx_transactions_card_id ON public.transactions(card_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);

-- Function to update card balance
CREATE OR REPLACE FUNCTION update_card_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- If inserting a new transaction
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.user_cards
        SET current_balance = current_balance + NEW.amount
        WHERE id = NEW.card_id;
    -- If deleting a transaction (undo)
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.user_cards
        SET current_balance = current_balance - OLD.amount
        WHERE id = OLD.card_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to fire on Insert/Delete
CREATE TRIGGER trigger_update_card_balance
AFTER INSERT OR DELETE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION update_card_balance();
