'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { EmailTemplate } from '@/types/index';
import * as templateService from '@/services/template.service';

interface TemplateSelectorProps {
  onSelect: (template: EmailTemplate) => void;
}

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  useEffect(() => {
    setTemplates(templateService.getTemplates());
  }, []);

  function handleChange(value: string) {
    if (value === '__none__') return;
    const selected = templates.find((t) => t.id === value);
    if (selected) {
      onSelect(selected);
    }
  }

  if (templates.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <Label>템플릿 적용</Label>
      <Select value="__none__" onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="템플릿 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">템플릿 선택</SelectItem>
          {templates.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
