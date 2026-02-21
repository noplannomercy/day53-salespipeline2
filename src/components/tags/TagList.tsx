'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import type { Tag } from '@/types/index';
import EmptyState from '@/components/common/EmptyState';

interface TagListProps {
  tags: Tag[];
  entityCounts: Record<string, number>;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
}

export default function TagList({ tags, entityCounts, onEdit, onDelete }: TagListProps) {
  if (tags.length === 0) {
    return <EmptyState message="등록된 태그가 없습니다." />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tags.map((tag) => (
        <Card key={tag.id} className="relative group">
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full shrink-0"
                style={{ backgroundColor: tag.color }}
              />
              <span className="font-medium truncate">{tag.name}</span>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {entityCounts[tag.id] ?? 0}개 연결
              </Badge>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => onEdit(tag)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={() => onDelete(tag)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
