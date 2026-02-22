'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import TagBadge from '@/components/common/TagBadge';
import * as tagService from '@/services/tag.service';
import type { Tag } from '@/types/index';

interface TagAutocompleteProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

export default function TagAutocomplete({
  selectedTagIds,
  onChange,
}: TagAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAllTags(tagService.getTags());
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedSet = new Set(selectedTagIds);

  // Tags that match the query and are not already selected
  const suggestions = allTags.filter(
    (tag) =>
      !selectedSet.has(tag.id) &&
      tag.name.toLowerCase().includes(query.toLowerCase()),
  );

  // Resolved Tag objects for selected IDs
  const selectedTags = allTags.filter((t) => selectedSet.has(t.id));

  function handleSelect(tagId: string) {
    onChange([...selectedTagIds, tagId]);
    setQuery('');
    setIsOpen(false);
  }

  function handleRemove(tagId: string) {
    onChange(selectedTagIds.filter((id) => id !== tagId));
  }

  return (
    <div ref={wrapperRef} className="flex flex-col gap-2">
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <span key={tag.id} className="inline-flex items-center gap-1">
              <TagBadge tag={tag} />
              <button
                type="button"
                onClick={() => handleRemove(tag.id)}
                className="inline-flex items-center justify-center rounded-full h-4 w-4 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label={`${tag.name} 태그 제거`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="태그 검색..."
          className="w-full"
        />

        {/* Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full max-h-40 overflow-auto rounded-md border bg-popover p-1 shadow-md">
            {suggestions.map((tag) => (
              <li key={tag.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(tag.id)}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
