import { type UserCardData } from "@hitsuji/core/types/UserCard"
import { twMerge } from "tailwind-merge";
import { TriangleAlert, Volume2 } from "lucide-react"
import { useState, } from "react";
import { isAlert } from "@core/types/UserCard";
import { useAlarm } from "@/hooks/useAlarm";

type Props = {
  gridSize: number,
  card: UserCardData,
  onClick: (card: UserCardData) => void,
  isSelected?: boolean,
  bedImageVersion: ImageVersion
}


export const UserCard = (props: Props) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  useAlarm(isAlert(props.card));

  if (props.card.alertStatus === "SensorOffline") {
    return <div ref={setContainer} className={twMerge("overflow-hidden flex flex-col w-full h-full py-1 px-2 text-gray-500  border border-gray-300 rounded-lg  ", props.isSelected && "border-3")}
      style={{ backgroundColor: "#BCBCBC", borderColor: props.isSelected ? "#EDD545" : undefined }} onClick={() => props.onClick(props.card)}>
      <div className="flex gap-1" style={{ height: "26%" }}>
        <div className="w-2/3">
          <RoomNumber {...props} container={container} />
        </div>
        <div className="w-1/3">
        </div>

      </div>
      <div className="flex w-full" style={{ height: "31%" }}>
        <UserName {...props} container={container} />
      </div>
      <div className="flex gap-1  text-red-400" style={{ height: "42%" }}>
        <TriangleAlert className="h-full w-3/4 mx-auto" />
      </div>
    </div>

  } else if (props.card.alertStatus === "NoDevice") {


    return <div ref={setContainer} className={twMerge("overflow-hidden flex flex-col w-full h-full py-1 px-2 text-gray-500  border border-gray-300 rounded-lg  ", props.isSelected && "border-3")}
      style={{ backgroundColor: "#FFF" }}>
      <div className="flex gap-1" style={{ height: "26%" }}>
        <div className="w-2/3">
          <RoomNumber {...props} container={container} />
        </div>
        <div className="w-1/3">
        </div>

      </div>
      <div className="flex w-full" style={{ height: "31%" }}>
        <UserName {...props} container={container} />
      </div>
      <div className="flex gap-1" style={{ height: "42%" }}>
        <div className="w-3/5">
        </div>
        <div className="w-2/5">
        </div>
      </div>
    </div>
  }

  const borderWidth = props.isSelected ? 4 : 1;
  const paddingX = 8 - borderWidth;
  const paddingY = 4 - borderWidth;
  return <div ref={setContainer} className={twMerge("overflow-hidden flex flex-col w-full h-full  border border-gray-300 rounded-lg  ")}
    style={{
      borderColor: props.isSelected ? "#EDD545" : undefined,
      paddingLeft: paddingX,
      paddingRight: paddingX,
      paddingTop: paddingY,
      paddingBottom: paddingY,
      borderWidth,
    }}
    onClick={() => props.onClick(props.card)}>
    <div className="flex gap-1" style={{ height: "26%" }}>
      <div className="w-2/3">
        <RoomNumber {...props} container={container} />
      </div>
      <div className="w-1/3 flex justify-end">
        <Icon {...props} container={container} />
      </div>

    </div>
    <div className="flex w-full overflow-y-visible" style={{ height: "31%" }}>
      <UserName {...props} container={container} />
    </div>
    <div className="flex gap-1" style={{ height: "42%" }}>
      <div className="w-3/5">
        <Vitals {...props} container={container} />
      </div>
      <div className="w-2/5">
        <StatusImage {...props} container={container} />
      </div>
    </div>
  </div>
}

const RoomNumber = (props: Props & { container: HTMLDivElement | null }) => {
  const card = props.card;
  return <div className="text-left">
    <p className=" text-black" style={{ fontSize: 'var(--card-room-font-size)' }}>{card.roomNumber}</p>
  </div>
}

const UserName = (props: Props & { container: HTMLDivElement | null }) => {
  const card = props.card;
  return <p className={twMerge("truncate text-black")} style={{ fontSize: 'var(--card-name-font-size)' }}>{card.userName}</p>
}

const Vitals = (props: Props & { container: HTMLDivElement | null }) => {
  return <div className={twMerge("flex h-full space-x-1 mx-auto items-end pr-1",)}>
    <div style={{ width: "50%" }}>
      <div className="items-baseline text-right" style={{}}>
        <span className="font-bold text-red-600" style={{ fontSize: 'var(--card-vital-font-size)' }}>{props.card.heartBeat ?? '--'}</span>
      </div>
    </div>
    <div className=" text-center" style={{ width: "40%" }}>
      <div className="items-baseline text-right" style={{}}>
        <span className="font-bold text-blue-600" style={{ fontSize: 'var(--card-vital-font-size)' }}>{props.card.breath ?? '--'}</span>
      </div>
    </div>
    <div className=" text-center" style={{ width: "10%" }} />
  </div>
}
const Icon = (props: Props & { container: HTMLDivElement | null }) => {
  const card = props.card;
  if (card.alertStatus === "NurseCall") {
    return <Volume2 className="text-red-500" style={{ height: "var(--card-icon-size)", width: "var(--card-icon-size)" }} />
  }

  return <>
  </>

}

export type ImageVersion = 4 | 6 | 7 | 8;

const StatusImage = (props: Props & { container: HTMLDivElement | null }) => {
  const card = props.card;

  const className = twMerge("w-full h-full object-contain")


  if (props.bedImageVersion >= 7) {
    const imageBaseUrl = `/${statusImgPath(card.gender, card.bedStatus, props.bedImageVersion)}`;

    const defaultPath = imageBaseUrl.replace(".png", "_600.png");

    const imageSrcSet = `
    ${imageBaseUrl.replace(".png", "_75.png")} 75w,
    ${imageBaseUrl.replace(".png", "_150.png")}  150w,
    ${imageBaseUrl.replace(".png", "_300.png")}  300w,
    ${imageBaseUrl.replace(".png", "_600.png")}  600w,
    ${imageBaseUrl.replace(".png", "_1200.png")}  1200w
  `;
    const sizes = `calc( ( (100vw - 32px) / ${props.gridSize} - 18px) * 0.38 )`
    return <div className="h-full w-full flex items-end">
      <div className="flex items-end  relative mx-auto" style={{
        width: "90%", height: "90%"
      }}>
        <img
          src={defaultPath} // srcset非対応ブラウザ用のフォールバック
          srcSet={imageSrcSet}
          sizes={sizes}
          alt="Tiled Image"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          loading="lazy" // 画面外の画像は遅延読み込みする
          className={className}
        />
        {props.card.isAISH &&
          <div className="absolute font-extralight  text-grah-900 stroked-text" style={{ bottom: 0, right: 3, fontSize: 'var(--card-aish-font-size)' }}>
            AISH
          </div>
        }
      </div>
    </div>
  }

  return <div className="h-full w-full flex items-end">
    <div className="flex items-end  relative mx-auto" style={{
      width: "90%", height: "90%"
    }}>

      <img src={`/${statusImgPath(card.gender, card.bedStatus, props.bedImageVersion)}`} alt="status" className={className} />
      {props.card.isAISH &&
        <div className="absolute font-extralight text-grah-900 stroked-text" style={{ bottom: 0, right: 3, fontSize: 'var(--card-aish-font-size)' }}>
          AISH
        </div>
      }
    </div>
  </div>
}


// eslint-disable-next-line react-refresh/only-export-components
export const statusImgPath = (gender: "male" | "female", bedStatus: "bedexit" | "resting" | "moving" | "offline", version: ImageVersion = 4) => {
  const filename = (() => {
    if (bedStatus === "bedexit") {
      return "empty.png"
    } else if (bedStatus === "offline") {
      return "empty.png"
    } else if (bedStatus === "resting") {
      return gender + "-resting.png"
    } else if (bedStatus === "moving") {
      return gender + "-moving.png"
    }
  })();
  return `v${version}/${filename}?1`
}
