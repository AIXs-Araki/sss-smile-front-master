import { forwardRef, type HTMLAttributes, type PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

type DynamicCardProps = PropsWithChildren & HTMLAttributes<HTMLDivElement> & {
  isAlert: boolean;
  gridSize: number;
  isSorting?: boolean;
};

const BASE_GRID_SIZE = 4;
const BASE_FONT_SIZE = 16;
const BASE_PADDING = 16;
const BASE_BORDER_WIDTH = 2;
const BASE_IMAGE_HEIGHT = 128;

export const DynamicCard = forwardRef<HTMLDivElement, DynamicCardProps>(
  ({ gridSize, children, isAlert, isSorting, className: propsClassName, ...props }, ref) => {
    const scaleFactor = BASE_GRID_SIZE / gridSize;

    const dynamicStyles = {
      padding: `${BASE_PADDING * scaleFactor}px`,
      borderWidth: `${Math.max(1, BASE_BORDER_WIDTH * scaleFactor) + (isAlert ? 1 : 0)}px`,
      fontSize: `${BASE_FONT_SIZE * scaleFactor}px`,
      imageHeight: `${BASE_IMAGE_HEIGHT * scaleFactor}px`,
      borderRadius: `${8 * scaleFactor}px`,
    };

    const finalClassName = twMerge(
      "w-full bg-white  rounded-lg flex flex-col items-center justify-center overflow-hidden transition-all duration-300 hover:border-primary cursor-pointer",
      isAlert ? "relative text-card-foreground transition-all duration-200 bg-red-100" : "",
      isSorting ? "shadow-lg" : "",
      propsClassName
    );

    return (
      <div
        ref={ref}
        className={finalClassName}
        style={{
          ...props.style, // Allow overriding styles from props
          borderWidth: 0.5,
          borderRadius: dynamicStyles.borderRadius,
        }}
        {...props} // Pass down other props like listeners
      >
        <div
          className="w-full h-full text-center font-bold text-gray-600 leading-tight"
          style={{ fontSize: dynamicStyles.fontSize }}
        >
          {children}
        </div>
      </div>
    );
  }
);

DynamicCard.displayName = 'DynamicCard';
