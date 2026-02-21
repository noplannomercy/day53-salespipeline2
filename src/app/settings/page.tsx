'use client';

import { useState } from 'react';
import SettingsForm from '@/components/settings/SettingsForm';

export default function SettingsPage() {
  const [savedMessage, setSavedMessage] = useState(false);

  function handleSaved() {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">설정</h1>
        {savedMessage && (
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
            설정이 저장되었습니다.
          </span>
        )}
      </div>

      <SettingsForm onSaved={handleSaved} />
    </div>
  );
}
