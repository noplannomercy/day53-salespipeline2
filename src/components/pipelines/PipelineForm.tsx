'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Pipeline } from '@/types/index';

interface PipelineFormProps {
  pipeline?: Pipeline | null;
  onSubmit: (data: { name: string; description: string; isDefault: boolean }) => void;
  onCancel: () => void;
}

export default function PipelineForm({
  pipeline,
  onSubmit,
  onCancel,
}: PipelineFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (pipeline) {
      setName(pipeline.name);
      setDescription(pipeline.description);
      setIsDefault(pipeline.isDefault);
    } else {
      setName('');
      setDescription('');
      setIsDefault(false);
    }
  }, [pipeline]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSubmit({ name: trimmedName, description: description.trim(), isDefault });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="pipeline-name">파이프라인 이름 *</Label>
        <Input
          id="pipeline-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 신규 영업"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="pipeline-desc">설명</Label>
        <Input
          id="pipeline-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="파이프라인에 대한 간단한 설명"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="pipeline-default"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="pipeline-default" className="cursor-pointer">
          기본 파이프라인으로 설정
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">{pipeline ? '수정' : '생성'}</Button>
      </div>
    </form>
  );
}
