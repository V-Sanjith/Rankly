import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TrendingUp, Trophy } from 'lucide-react';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  currentRank: number;
  highestBid: number;
}

export function BidModal({ isOpen, onClose, projectId, projectName, currentRank, highestBid }: BidModalProps) {
  const [amount, setAmount] = useState<number>(Math.max(199, highestBid + 50));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const minBid = Math.max(199, highestBid + 10);

  const handleBid = async () => {
    if (amount < minBid) {
      setError(`Minimum bid amount is ₹${minBid}`);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Simulate Razorpay integration and API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Bid placed for', projectId, amount);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Boost Ranking">
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-medium text-text mb-1">{projectName}</h4>
          <div className="flex gap-4 text-sm text-text-muted">
            <span className="flex items-center gap-1">
              <Trophy size={14} className="text-warning" /> Current Rank: #{currentRank}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp size={14} className="text-success" /> Highest Bid: ₹{highestBid}
            </span>
          </div>
        </div>

        <div className="bg-elevated p-4 rounded-lg border border-border">
          <p className="text-sm text-text-muted mb-4">
            Place a higher bid to boost this project's ranking. Bids are valid for 7 days.
          </p>
          
          <Input
            type="number"
            label="Bid Amount (₹)"
            value={amount}
            onChange={(e) => {
              setAmount(Number(e.target.value));
              setError('');
            }}
            min={minBid}
            error={error}
          />
          <p className="text-xs text-text-muted mt-2">
            Minimum bid: ₹{minBid}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleBid} isLoading={loading}>
            Proceed to Pay ₹{amount}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
