import { View, Text, Image, useWindowDimensions, Platform } from 'react-native';
import { BedStatus, isAlert, type UserCardData } from "@core/types/UserCard"
import { twMerge } from "tailwind-merge";
import { TriangleAlert, Volume2 } from "lucide-react-native"
import { useMemo } from 'react';
import { calculateFontSizes } from "@core/helpers/userCardSizes"
import { LungIcon } from './icons/LungIcon';
import { HeartIcon } from './icons/HeartIcon';
import TextStroke from './helper/TextStroke';

type Props = {
  card: UserCardData,
  isSelected?: boolean,
  border?: boolean
}

const cardAspectRatio = 0.38;
const horizontalPadding = 14;
const useSizes = () => {
  const { width } = useWindowDimensions();

  const dynamicStyles = useMemo(() => {
    // 左右の余白を考慮したカードの幅を計算
    const cardWidth = width - horizontalPadding * 2;
    // 固定比率に基づいてカードの高さを計算
    const cardHeight = cardWidth * cardAspectRatio;
    // フォントサイズを計算

    const { vitalFontSize, aishFontSize, nameFontSize, iconSize, roomFontSize } = calculateFontSizes(cardWidth, cardHeight)


    // iOSとAndroidでフォントサイズを調整
    const fontScale = Platform.select({
      ios: 1.2,  // iOSの場合は1.1を乗算
      android: 1, // Androidの場合はそのまま
    }) || 1;

    return {
      cardWidth,
      cardHeight,
      roomFontSize: roomFontSize * fontScale,
      nameFontSize: nameFontSize * fontScale,
      vitalFontSize: vitalFontSize * fontScale * 1.06,
      aishFontSize: aishFontSize * fontScale,
      iconSize
    };
  }, [width]); // widthが変わった時のみ再計算

  return dynamicStyles;
};


export const UserCard = (props: Props) => {
  const { cardHeight, vitalFontSize } = useSizes();

  if (props.card.alertStatus === "SensorOffline") {
    return <View className={twMerge("overflow-hidden flex flex-col w-full h-full  px-4 pt-2 pb-1  text-gray-500 border-gray-300", props.border && "border rounded-lg ", props.isSelected && "border-3")}
      style={{ height: cardHeight, backgroundColor: "#BCBCBC" }} >
      <View className="flex flex-row gap-1" style={{ height: "26%" }}>
        <View className="w-2/3">
          <RoomNumber {...props} />
        </View>
        <View className="w-1/3">
        </View>

      </View>
      <View className="flex flex-row w-full" style={{ height: "31%" }}>
        <UserName {...props} />
      </View>
      <View className="flex flex-row gap-1 text-red-400" style={{ height: "42%" }}>
        <View className="h-full w-3/4 mx-auto items-center justify-around ">
          <TriangleAlert size={52} color={"#fb2c36"} />
        </View>
      </View>
    </View>

  } else if (props.card.alertStatus === "NoDevice") {
    return <View className={twMerge("overflow-hidden flex flex-col w-full h-full  px-4 pt-2 pb-1  text-gray-500   border-gray-300 ", props.border && "border rounded-lg ", props.isSelected && "border-3")}
      style={{ height: cardHeight, backgroundColor: "#FFF" }}>
      <View className="flex gap-1" style={{ height: "26%" }}>
        <View className="w-2/3">
          <RoomNumber {...props} />
        </View>
        <View className="w-1/3">
        </View>

      </View>
      <View className="flex w-full" style={{ height: "31%" }}>
        <UserName {...props} />
      </View>
      <View className="flex gap-1" style={{ height: "42%" }}>
        <View className="w-3/5">
        </View>
        <View className="w-2/5">
        </View>
      </View>
    </View>
  }
  const alertClasses = isAlert(props.card) && props.border ? 'bg-red-100' : 'bg-white';

  return <View className={twMerge("overflow- flex flex-col w-full px-4 pt-2 pb-1  border-gray-300  ", props.border && "border rounded-lg ", alertClasses)} style={{ height: cardHeight, }} >
    <View className="flex flex-row gap-1" style={{ height: "26%" }}>
      <View className="w-2/3">
        <RoomNumber {...props} />
      </View>
      <View className="w-1/3 flex flex-row justify-end">
        <Icon {...props} />
      </View>
    </View>
    <View className="flex flex-row w-full overflow-y-visible" style={{ height: "31%" }}>
      <UserName {...props} />
    </View>
    <View className="flex flex-row justify-between w-full px-4 " style={{ height: "42%" }}>
      <View className='' style={{ width: vitalFontSize * (Platform.OS === "ios" ? 1.74 : 1.8) }}>
        <HeartRate {...props} />
      </View>
      <View className="" style={{ width: vitalFontSize * 1.23 }}>
        <Breath {...props} />
      </View>
      <View className="h-full" style={{ width: "35%" }}>
        <StatusImage {...props} />
      </View>
    </View>
  </View>
}

const RoomNumber = (props: Props) => {
  const { roomFontSize } = useSizes();
  const card = props.card;
  return <View className="text-left">
    <Text className="" style={{ fontSize: roomFontSize, fontWeight: 600 }}>{card.roomNumber}</Text>
  </View>
}

const UserName = (props: Props) => {
  const card = props.card;
  const { nameFontSize } = useSizes();
  return <Text className={twMerge("truncate")} style={{ fontSize: nameFontSize, fontWeight: 600 }}>{card.userName}{card.id}</Text>
}

const HeartRate = (props: Props) => {
  const { vitalFontSize } = useSizes();
  return <View className="text-right ">
    <Text className="font-bold text-right text-red-600" style={{ fontSize: vitalFontSize }}>{props.card.heartBeat ?? '--'}</Text>
  </View>

}

const Breath = (props: Props) => {
  const { vitalFontSize } = useSizes();
  return <View className="text-right" style={{}}>
    <Text className="font-bold text-right text-blue-600" style={{ fontSize: vitalFontSize }}>{props.card.breath ?? '--'}</Text>
  </View>
}

const Icon = (props: Props) => {
  const card = props.card;
  const { iconSize } = useSizes();
  if (card.alertStatus === "NurseCall") {
    return <Volume2 color={"#fb2c36"} size={iconSize} />
  }

  return <>
  </>
}

const StatusImage = (props: Props) => {
  const card = props.card;
  const className = twMerge("w-full h-full object-contain")
  const { aishFontSize } = useSizes();
  return <View className=" w-full flex flex-row items-end">
    <View className="items-end relative mx-auto" style={{
      width: "100%", height: "100%"
    }}>
      <Image
        source={statusImg(card.gender, card.bedStatus)}
        resizeMode="contain"
        alt="status" className={className} />
      {props.card.isAISH &&
        <View className="absolute font-extralight text-shadow-xs text-shadow-white text-grah-900" style={{ bottom: 0, right: 7, }}>
          <TextStroke strokeColor='#fff' strokeWidth={1} style={{ fontSize: aishFontSize }} text='AISH' />
        </View>
      }
    </View>
  </View>
}

export const statusImg = (gender: "male" | "female", bedStatus: BedStatus) => {
  if (bedStatus === "bedexit") {
    return require("../assets/empty.png")
  } else if (bedStatus === "offline") {
    return require("../assets/empty.png")
  } else if (bedStatus === "resting") {
    if (gender === "male") {
      return require("../assets/male-resting.png")
    } else {
      return require("../assets/female-resting.png")
    }
  } else if (bedStatus === "moving") {
    if (gender === "male") {
      return require("../assets/male-moving.png")
    } else {
      return require("../assets/female-moving.png")
    }
  }
};