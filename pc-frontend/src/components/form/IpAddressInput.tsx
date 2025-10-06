"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Propsの型定義
interface IpAddressInputProps {
  id?: string;
  label?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  initialValue?: string;
  onValueChange?: (ip: string) => void;
}

export const IpAddressInput = React.forwardRef<HTMLDivElement, IpAddressInputProps>(
  ({ id = "ip-address", label, className, value, onChange, initialValue = "...", onValueChange }, ref) => {
    // 4つのオクテットの値を配列で管理
    const currentValue = value || initialValue;
    const initialOctets = currentValue.split('.').concat(['', '', '', '']).slice(0, 4);
    const [octets, setOctets] = React.useState<string[]>(initialOctets);

    // 各input要素への参照を配列で管理
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    // valueが変更されたときにoctetsを更新
    React.useEffect(() => {
      if (value !== undefined) {
        const newOctets = value.split('.').concat(['', '', '', '']).slice(0, 4);
        setOctets(newOctets);
      }
    }, [value]);

    // octetsが変更されたときにonChangeとonValueChangeを呼び出す
    React.useEffect(() => {
      const ip = octets.join('.');
      if (onChange) {
        onChange(ip);
      }
      if (onValueChange) {
        onValueChange(ip);
      }
    }, [octets, onChange, onValueChange]);

    // 値が変更されたときの処理
    const handleChange = (index: number, value: string) => {
      // 数字のみを許可し、255を超えないようにする
      const numericValue = value.replace(/[^0-9]/g, "");
      if (numericValue === "" || (parseInt(numericValue, 10) >= 0 && parseInt(numericValue, 10) <= 255)) {
        const newOctets = [...octets];
        newOctets[index] = numericValue;
        setOctets(newOctets);

        // 3桁入力されたら次のフィールドにフォーカスを移す
        if (numericValue.length === 3 && index < 3) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    };

    // キーが押されたときの処理
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      // '.' を押したら次のフィールドへ
      if (e.key === '.' && index < 3) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }

      // Backspaceキーで前のフィールドへ
      if (e.key === 'Backspace' && octets[index] === '' && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      }
    };

    // フォーカスされたときに全選択
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.select();
    };

    return (
      <div ref={ref} className={cn("grid w-full max-w-sm items-center gap-1.5", className)}>
        {label && <Label htmlFor={`${id}-0`}>{label}</Label>}
        <div className="flex items-center gap-1">
          {octets.map((octet, index) => (
            <React.Fragment key={index}>
              <Input
                ref={(el) => { if (el) (inputRefs.current[index] = el) }}
                id={`${id}-${index}`}
                type="text"
                value={octet}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={handleFocus}
                className="w-16 text-center"
                maxLength={3}
                aria-label={`IP Address Octet ${index + 1}`}
              />
              {index < 3 && <span className="text-muted-foreground">.</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }
);