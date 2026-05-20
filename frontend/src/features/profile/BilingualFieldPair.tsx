import { useState } from 'react'

interface Props {
  sv: string
  en: string
  onChange: (sv: string, en: string) => void
  onTranslate?: (fromLang: 'SV' | 'EN') => void
  label?: string
}

export function BilingualFieldPair({ sv, en, onChange, onTranslate, label }: Props) {
  const [activeLang, setActiveLang] = useState<'SV' | 'EN'>('SV')

  const otherIsEmpty = activeLang === 'SV' ? !en.trim() : !sv.trim()
  const currentValue = activeLang === 'SV' ? sv : en

  function handleChange(value: string) {
    if (activeLang === 'SV') onChange(value, en)
    else onChange(sv, value)
  }

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => setActiveLang('SV')}
          className={activeLang === 'SV' ? 'font-bold' : 'text-gray-500'}
        >
          SV
        </button>
        <span>|</span>
        <button
          type="button"
          onClick={() => setActiveLang('EN')}
          className={activeLang === 'EN' ? 'font-bold' : 'text-gray-500'}
        >
          EN
        </button>
      </div>
      <textarea
        className="w-full border rounded p-2"
        value={currentValue}
        onChange={(e) => handleChange(e.target.value)}
        rows={4}
      />
      {otherIsEmpty && currentValue.trim() && (
        <button
          type="button"
          onClick={() => onTranslate?.(activeLang)}
          className="self-start text-sm text-blue-600 underline"
        >
          Translate
        </button>
      )}
    </div>
  )
}
