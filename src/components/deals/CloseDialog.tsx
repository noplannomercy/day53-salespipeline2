'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CloseDialogProps {
  isOpen: boolean;
  dealTitle: string;
  onClose: () => void;
  onConfirm: (outcome: 'won' | 'lost', lostReason?: string) => void;
}

/**
 * Dialog for closing a deal as Won or Lost.
 * When Lost is selected, an optional text input for lostReason is shown.
 */
export default function CloseDialog({
  isOpen,
  dealTitle,
  onClose,
  onConfirm,
}: CloseDialogProps) {
  const [outcome, setOutcome] = useState<'won' | 'lost' | null>(null);
  const [lostReason, setLostReason] = useState('');

  function handleConfirm() {
    if (!outcome) return;
    onConfirm(outcome, outcome === 'lost' ? lostReason : undefined);
    resetAndClose();
  }

  function resetAndClose() {
    setOutcome(null);
    setLostReason('');
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>딜 종료</DialogTitle>
          <DialogDescription>
            &quot;{dealTitle}&quot; 딜의 결과를 선택해 주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Outcome selection */}
          <div className="flex gap-3">
            <Button
              variant={outcome === 'won' ? 'default' : 'outline'}
              className={
                outcome === 'won'
                  ? 'flex-1 bg-green-600 hover:bg-green-700 text-white'
                  : 'flex-1'
              }
              onClick={() => setOutcome('won')}
            >
              성사 (Won)
            </Button>
            <Button
              variant={outcome === 'lost' ? 'default' : 'outline'}
              className={
                outcome === 'lost'
                  ? 'flex-1 bg-red-600 hover:bg-red-700 text-white'
                  : 'flex-1'
              }
              onClick={() => setOutcome('lost')}
            >
              실패 (Lost)
            </Button>
          </div>

          {/* Lost reason (only when Lost is selected) */}
          {outcome === 'lost' && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="lost-reason">실패 사유</Label>
              <Input
                id="lost-reason"
                placeholder="실패 사유를 입력해 주세요"
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>
            취소
          </Button>
          <Button
            disabled={!outcome}
            onClick={handleConfirm}
          >
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
