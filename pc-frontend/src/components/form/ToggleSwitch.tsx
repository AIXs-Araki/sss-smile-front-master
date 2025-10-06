// components/toggle-switch.tsx
'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

const switchColors = {
  primary: 'bg-blue-400',
  secondary: 'bg-green-500',
  red: 'bg-red-500',
};

interface ToggleSwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  color?: keyof typeof switchColors;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _tailwindSafeList = [
  'data-[state=checked]:bg-blue-400',
  'data-[state=checked]:bg-green-500',
  'data-[state=checked]:bg-red-500',
]
const ToggleSwitch = ({ className, color = 'primary', ...props }: ToggleSwitchProps) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex h-[30px] w-[50px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:' +
      switchColors[color] +
      ' data-[state=unchecked]:bg-gray-200',
      className
    )}
    {...props}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-[26px] w-[26px] rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-[20px] data-[state=unchecked]:translate-x-[0px]'
      )}
    />
  </SwitchPrimitives.Root>
);

ToggleSwitch.displayName = 'ToggleSwitch';

export { ToggleSwitch };