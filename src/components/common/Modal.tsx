'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Maximum width class. Defaults to 'max-w-lg'. */
  maxWidth?: string;
}

/**
 * Generic modal wrapper built on top of Radix Dialog.
 *
 * Usage:
 *   <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="딜 생성">
 *     <DealForm onClose={...} />
 *   </Modal>
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={maxWidth}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
