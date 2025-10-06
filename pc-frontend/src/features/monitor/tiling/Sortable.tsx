import React, { useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: React.ReactElement;
  isSorting: boolean;
}

export function SortableItem({ id, children, isSorting }: SortableItemProps) {
  const [wasDragging, setWasDragging] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    disabled: !isSorting,
  });

  useEffect(() => {
    if (isDragging) {
      setWasDragging(true)
    } else {
      setTimeout(() => {
        setWasDragging(false)
      }, 200)
    }

  }, [isDragging])

  const style: React.CSSProperties = {
    transform: (wasDragging && !isDragging) ? undefined : CSS.Transform.toString(transform),
    transition: (isDragging || (wasDragging && !isDragging)) ? 'none' : transition, // ドラッグ中は transition を無効化
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return React.cloneElement(children as React.ReactElement<any, any>, {
    ref: setNodeRef as any,
    style: style,
    ...attributes,
    ...listeners,
  });
}
