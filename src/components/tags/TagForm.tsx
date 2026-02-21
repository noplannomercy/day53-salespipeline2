'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Tag } from '@/types/index';
import * as tagService from '@/services/tag.service';

interface TagFormProps {
  editId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

const PRESET_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#6B7280', // gray
  '#14B8A6', // teal
];

export default function TagForm({ editId, onClose, onSaved }: TagFormProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    if (editId) {
      const tag = tagService.getTagById(editId);
      if (tag) {
        setName(tag.name);
        setColor(tag.color);
      }
    }
  }, [editId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) return;

    const data: Omit<Tag, 'id' | 'createdAt'> = {
      name: name.trim(),
      color,
    };

    if (editId) {
      tagService.updateTag(editId, data);
    } else {
      tagService.createTag(data);
    }

    onSaved();
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="tag-name">태그 이름 *</Label>
        <Input
          id="tag-name"
          placeholder="태그 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>색상</Label>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`h-8 w-8 rounded-full border-2 transition-all ${
                color === c ? 'border-foreground scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              aria-label={`색상 ${c}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Label htmlFor="tag-color-input" className="text-xs text-muted-foreground">
            직접 입력:
          </Label>
          <Input
            id="tag-color-input"
            type="color"
            className="h-8 w-12 p-0.5 cursor-pointer"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <span className="text-xs text-muted-foreground">{color}</span>
        </div>
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
