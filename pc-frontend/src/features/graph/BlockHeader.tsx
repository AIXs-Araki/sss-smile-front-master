import type { ReactNode } from "react";

export const BlockHeader = (props: { time: ReactNode, title: ReactNode, style?: React.CSSProperties }) => (
  <div className="text-xs flex justify-between text-gray-500" style={props.style}>
    <div>
      {props.time}
    </div>
    <div>
      {props.title}
    </div>
  </div>
)