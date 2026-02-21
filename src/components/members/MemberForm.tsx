'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Member, MemberRole } from '@/types/index';
import * as memberService from '@/services/member.service';

interface MemberFormProps {
  editId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

const ROLE_OPTIONS: { value: MemberRole; label: string }[] = [
  { value: 'admin', label: '관리자' },
  { value: 'manager', label: '매니저' },
  { value: 'sales', label: '영업' },
];

export default function MemberForm({ editId, onClose, onSaved }: MemberFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('sales');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (editId) {
      const member = memberService.getMemberById(editId);
      if (member) {
        setName(member.name);
        setEmail(member.email);
        setRole(member.role);
        setAvatar(member.avatar);
      }
    }
  }, [editId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim()) return;

    const data = {
      name: name.trim(),
      email: email.trim(),
      role,
      avatar: avatar.trim(),
    };

    if (editId) {
      memberService.updateMember(editId, data);
    } else {
      memberService.createMember(data);
    }

    onSaved();
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="member-name">이름 *</Label>
        <Input
          id="member-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="멤버 이름"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="member-email">이메일 *</Label>
        <Input
          id="member-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="member-role">역할</Label>
        <Select value={role} onValueChange={(v) => setRole(v as MemberRole)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="역할 선택" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="member-avatar">아바타 URL</Label>
        <Input
          id="member-avatar"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder="https://example.com/avatar.jpg (선택)"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button type="submit">
          {editId ? '수정' : '생성'}
        </Button>
      </div>
    </form>
  );
}
