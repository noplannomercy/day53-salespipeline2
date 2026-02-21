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
import type { Company, CompanySize } from '@/types/index';

const SIZE_OPTIONS: { value: CompanySize; label: string }[] = [
  { value: 'small', label: '소기업' },
  { value: 'medium', label: '중기업' },
  { value: 'large', label: '대기업' },
  { value: 'enterprise', label: '엔터프라이즈' },
];

interface CompanyFormProps {
  company?: Company | null;
  onSubmit: (data: {
    name: string;
    industry: string;
    size: CompanySize | null;
    website: string;
    phone: string;
    address: string;
    revenue: number | null;
  }) => void;
  onCancel: () => void;
}

export default function CompanyForm({
  company,
  onSubmit,
  onCancel,
}: CompanyFormProps) {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState<CompanySize | ''>('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (company) {
      setName(company.name);
      setIndustry(company.industry);
      setSize(company.size ?? '');
      setWebsite(company.website);
      setPhone(company.phone);
      setAddress(company.address);
    } else {
      setName('');
      setIndustry('');
      setSize('');
      setWebsite('');
      setPhone('');
      setAddress('');
    }
  }, [company]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSubmit({
      name: trimmedName,
      industry: industry.trim(),
      size: size || null,
      website: website.trim(),
      phone: phone.trim(),
      address: address.trim(),
      revenue: null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="company-name">회사명 *</Label>
        <Input
          id="company-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 알파테크 주식회사"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="company-industry">업종</Label>
          <Input
            id="company-industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="예: IT/소프트웨어"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>규모</Label>
          <Select
            value={size}
            onValueChange={(v) => setSize(v as CompanySize)}
          >
            <SelectTrigger>
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent>
              {SIZE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="company-website">웹사이트</Label>
        <Input
          id="company-website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="company-phone">전화번호</Label>
        <Input
          id="company-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="02-1234-5678"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="company-address">주소</Label>
        <Input
          id="company-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="서울특별시 강남구 ..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">{company ? '수정' : '생성'}</Button>
      </div>
    </form>
  );
}
