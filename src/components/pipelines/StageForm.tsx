'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Stage } from '@/types/index';

const PRESET_COLORS = [
  '#94A3B8', '#3B82F6', '#8B5CF6', '#F59E0B',
  '#10B981', '#EF4444', '#EC4899', '#06B6D4',
];

interface StageFormProps {
  stage?: Stage | null;
  onSubmit: (data: { name: string; color: string; probability: number }) => void;
  onCancel: () => void;
}

export default function StageForm({
  stage,
  onSubmit,
  onCancel,
}: StageFormProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [probability, setProbability] = useState(50);

  useEffect(() => {
    if (stage) {
      setName(stage.name);
      setColor(stage.color);
      setProbability(stage.probability);
    } else {
      setName('');
      setColor(PRESET_COLORS[0]);
      setProbability(50);
    }
  }, [stage]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSubmit({
      name: trimmedName,
      color,
      probability: Math.min(100, Math.max(0, probability)),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="stage-name">스테이지 이름 *</Label>
        <Input
          id="stage-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 검증 완료"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>색상</Label>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? '#000' : 'transparent',
                }}
                onClick={() => setColor(c)}
                aria-label={`색상 ${c}`}
              />
            ))}
          </div>
          <Input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-7 w-10 cursor-pointer p-0 border-0"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="stage-probability">
          성사 확률: {probability}%
        </Label>
        <input
          id="stage-probability"
          type="range"
          min={0}
          max={100}
          step={5}
          value={probability}
          onChange={(e) => setProbability(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">{stage ? '수정' : '추가'}</Button>
      </div>
    </form>
  );
}
