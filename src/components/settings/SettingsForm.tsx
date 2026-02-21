'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AppSettings, Pipeline, DealCurrency } from '@/types/index';
import { STORAGE_KEYS } from '@/types/index';
import * as storage from '@/lib/storage';
import * as pipelineService from '@/services/pipeline.service';

interface SettingsFormProps {
  onSaved: () => void;
}

const CURRENCY_OPTIONS: { value: DealCurrency; label: string }[] = [
  { value: 'KRW', label: 'KRW (₩)' },
  { value: 'USD', label: 'USD ($)' },
];

const DEFAULT_SETTINGS: AppSettings = {
  defaultPipelineId: '',
  defaultCurrency: 'KRW',
  darkMode: false,
};

export default function SettingsForm({ onSaved }: SettingsFormProps) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    setPipelines(pipelineService.getPipelines());
    const stored = storage.getObject<AppSettings>(STORAGE_KEYS.SETTINGS);
    if (stored) {
      setSettings(stored);
    }
  }, []);

  function handleSave() {
    storage.saveObject(STORAGE_KEYS.SETTINGS, settings);

    // Apply dark mode immediately
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    onSaved();
  }

  function handleResetData() {
    // Clear all localStorage keys managed by the app
    const keys = Object.values(STORAGE_KEYS);
    for (const key of keys) {
      try {
        localStorage.removeItem(key);
      } catch {
        // Silently ignore removal failures
      }
    }

    // Reload the page to re-seed default data
    window.location.reload();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">일반 설정</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>기본 파이프라인</Label>
            <Select
              value={settings.defaultPipelineId || '__none__'}
              onValueChange={(v) =>
                setSettings((prev) => ({
                  ...prev,
                  defaultPipelineId: v === '__none__' ? '' : v,
                }))
              }
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="파이프라인 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">선택 안함</SelectItem>
                {pipelines.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>기본 통화</Label>
            <Select
              value={settings.defaultCurrency}
              onValueChange={(v) =>
                setSettings((prev) => ({
                  ...prev,
                  defaultCurrency: v as DealCurrency,
                }))
              }
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Label htmlFor="dark-mode-toggle">다크 모드</Label>
            <button
              id="dark-mode-toggle"
              type="button"
              role="switch"
              aria-checked={settings.darkMode}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
                settings.darkMode ? 'bg-primary' : 'bg-input'
              }`}
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  darkMode: !prev.darkMode,
                }))
              }
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-sm ring-0 transition-transform ${
                  settings.darkMode ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="pt-2">
            <Button onClick={handleSave}>설정 저장</Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Reset */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">데이터 초기화</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            모든 데이터를 삭제하고 초기 상태로 되돌립니다. 이 작업은 되돌릴 수 없습니다.
          </p>
          {!resetConfirm ? (
            <Button
              variant="destructive"
              className="w-fit"
              onClick={() => setResetConfirm(true)}
            >
              데이터 초기화
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-destructive">
                정말 초기화하시겠습니까?
              </span>
              <Button variant="destructive" size="sm" onClick={handleResetData}>
                확인
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResetConfirm(false)}
              >
                취소
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
