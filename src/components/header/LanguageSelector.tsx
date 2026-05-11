import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type LanguageCode = 'ko' | 'en' | 'ja' | 'zh';

const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const currentCode = (i18n.language.split('-')[0] || 'en') as LanguageCode;
  const currentFlag =
    LANGUAGE_OPTIONS.find((l) => l.code === currentCode)?.flag ?? '🇺🇸';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-3 hover:bg-gray-100">
          <Globe className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline text-sm">{currentFlag}</span>
          <span className="sm:hidden text-sm">{currentFlag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {LANGUAGE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => i18n.changeLanguage(option.code)}
            className={currentCode === option.code ? 'bg-gray-100' : ''}
          >
            <span className="mr-2">{option.flag}</span>
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
