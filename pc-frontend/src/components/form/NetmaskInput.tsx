"use client"

import * as React from "react"
import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// ネットマスクのバリデーションロジック
const validateNetmask = (mask: string): { isValid: boolean; message: string | null } => {
  if (mask === "") {
    return { isValid: true, message: null } // 空の場合はエラーにしない
  }

  const octets = mask.split('.')
  if (octets.length !== 4) {
    return { isValid: false, message: "4つのオクテットをドットで区切る必要があります。" }
  }

  let fullBinary = ""
  for (const octet of octets) {
    if (!/^\d+$/.test(octet) || parseInt(octet, 10) > 255 || parseInt(octet, 10) < 0) {
      return { isValid: false, message: "各オクテットは0から255の数値である必要があります。" }
    }
    const binary = parseInt(octet, 10).toString(2).padStart(8, '0')
    fullBinary += binary
  }

  // バイナリ表現で '0' の後に '1' が出現しないかチェック
  // (例: 111...1100...00 の形式になっているか)
  if (fullBinary.includes('0') && fullBinary.substring(fullBinary.indexOf('0')).includes('1')) {
    return { isValid: false, message: "不正なサブネットマスクです。連続した1の後に0が続く形式でなければなりません。" }
  }

  return { isValid: true, message: null }
}

type InputProps = React.ComponentProps<"input">;
// NetmaskInputコンポーネントの定義
interface NetmaskInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  label?: string;
  initialValue?: string;
  onValueChange?: (value: string, isValid: boolean) => void;
}

export const NetmaskInput = React.forwardRef<HTMLInputElement, NetmaskInputProps>(
  ({ className, label, initialValue = "", onValueChange, ...props }, ref) => {
    const [value, setValue] = useState(initialValue)
    const [error, setError] = useState<string | null>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // 数字とドット以外の入力をフィルタリング
      const filteredValue = e.target.value.replace(/[^0-9.]/g, '')
      setValue(filteredValue)

      const { isValid, message } = validateNetmask(filteredValue)
      setError(message)

      if (onValueChange) {
        onValueChange(filteredValue, isValid)
      }
    }

    return (
      <div className="grid w-full max-w-sm items-center gap-1.5">
        {label && <Label htmlFor={props.id}>{label}</Label>}
        <Input
          ref={ref}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder="例: 255.255.255.0"
          className={cn(
            // エラーがある場合にリング（枠線）を赤くする
            error && "ring-2 ring-destructive ring-offset-2",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }
)
