import { type ReactNode, type Dispatch, type SetStateAction, useRef, useMemo } from 'react';
import { DynamicCard } from './DynamicCard';
import { isAlert, type UserCardData } from '@core/types/UserCard';
import {
  DndContext,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './Sortable';
import { useSize } from 'ahooks';
import { calculateFontSizes } from "@core/helpers/userCardSizes"


interface TiledCardLayoutProps<C> {
  cards: C[];
  setCards: Dispatch<SetStateAction<C[]>>;
  renderCard: (data: C, griSize: number) => ReactNode;
  isSorting: boolean;
}

export const TiledCardLayout = ({ cards, setCards, renderCard, isSorting }: TiledCardLayoutProps<UserCardData>) => {


  const containerRef = useRef<HTMLDivElement>(null);

  const size = useSize(containerRef);


  const cardCount = cards.length;
  const gridSize = (() => {
    const size = Math.ceil(Math.sqrt(cardCount));
    if (size <= 1) {
      return 2;
    }
    if (size > 10) {
      return 10;
    }
    return size;
  })()

  const gridStyle = useMemo(() => {
    if (!size) return {};

    const cardWidth = size.width / gridSize;
    // 
    const padding = 4;
    const gap = 4
    const cardHeight = (size.height - gap * (gridSize - 1)) / gridSize - 2 * padding;
    const { vitalFontSize, aishFontSize, nameFontSize, iconSize, roomFontSize } = calculateFontSizes(cardWidth, cardHeight)
    return {
      '--card-name-font-size': `${nameFontSize}px`,
      '--card-room-font-size': `${roomFontSize}px`,
      '--card-icon-size': `${iconSize}px`,
      '--card-vital-font-size': `${vitalFontSize}px`,
      '--card-aish-font-size': `${aishFontSize}px`,
    } as React.CSSProperties
  }, [size, gridSize]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // カードクリックでD&Dが始まらないように、少し動かしたら開始する設定
      activationConstraint: {
        distance: 8,
      },
    })
  );


  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCards((items) => {
        const activeIndex = items.findIndex((item) => item.id.toString() === active.id);
        const overIndex = items.findIndex((item) => item.id.toString() === over.id);
        if (activeIndex < 0 || overIndex < 0) {
          return items;
        }
        return arrayMove(items, activeIndex, overIndex);
      });
    }
  };


  if (!cards || cards.length === 0) {
    return <div className="flex items-center justify-center h-screen">表示するカードがありません。</div>;
  }

  // gridSizeに応じたクラス名を取得。見つからない場合はデフォルト値を設定
  const dynamicGridClasses = gridLayoutClasses[gridSize] || 'grid-cols-10';


  return (
    <div className="p-4 w-full h-full" ref={containerRef} style={gridStyle} >
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={cards.map(c => c.id.toString())} strategy={rectSortingStrategy}>
          <div className={`grid ${dynamicGridClasses} bg-gray-200 gap-1 w-full select-none`} style={{ height: "calc( 100vh - 138px)" }} >
            {cards.map(card => (
              <SortableItem key={card.id} id={card.id.toString()} isSorting={isSorting}>
                <DynamicCard key={gridSize.toString() + card.id} gridSize={gridSize} isAlert={isAlert(card)} isSorting={isSorting}>
                  <>{renderCard(card, gridSize)}</>
                </DynamicCard>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};



const gridLayoutClasses: { [key: number]: string } = {
  1: 'grid-cols-2 grid-rows-2',
  2: 'grid-cols-2 grid-rows-2',
  3: 'grid-cols-3 grid-rows-3',
  4: 'grid-cols-4 grid-rows-4',
  5: 'grid-cols-5 grid-rows-5',
  6: 'grid-cols-6 grid-rows-6',
  7: 'grid-cols-7 grid-rows-7',
  8: 'grid-cols-8 grid-rows-8',
  9: 'grid-cols-9 grid-rows-9',
  10: 'grid-cols-10 grid-rows-10',
};
