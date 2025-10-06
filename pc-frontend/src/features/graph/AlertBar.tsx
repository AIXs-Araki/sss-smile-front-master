import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { BedStatus } from '@core/types/UserCard';
import { format } from 'date-fns';

const STATUS_LABELS: Record<BedStatus, string> = {
  bedexit: "離床",
  moving: "体動",
  resting: "安静",
  offline: "通信途絶"
};

interface AlertSegment {
  id: string;
  left?: string;
  right?: string;
  width: string;
  color: string;
  type: BedStatus;
  startTime: Date;
  endTime: Date;
}

interface AlertBarProps {
  segment: AlertSegment;
  open: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const AlertBar: React.FC<AlertBarProps> = ({ segment, open, onMouseEnter, onMouseLeave }) => {
  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        <div
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className={`absolute h-full ${segment.color} rounded-none cursor-pointer`}
          style={{ left: segment.left, right: segment.right, width: segment.width }}
        />
      </PopoverTrigger>
      <PopoverContent
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="w-auto p-2 text-xs"
      >
        <div className="flex flex-col gap-1">
          <div>{STATUS_LABELS[segment.type]}</div>
          <div>
            {`${format(segment.startTime, "HH:mm")} - ${format(segment.endTime, "HH:mm")}`}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
