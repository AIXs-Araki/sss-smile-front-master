import { Link, useLocation } from "react-router-dom"
import { Button } from "./ui/button"
import type { UserCardData } from "@core/types/UserCard";

export const UserHeader = () => {
  const { groupId, cardId } = useIds();

  return (
    <div className="h-12 max-w-full flex items-center justify-between px-4">
      <div className="flex gap-3 items-end">
        <div>408</div>
        <div className="text-xl">利用者名</div>
      </div>
      <div className="flex gap-2">

        <Link to={`/monitor/${groupId}/card/${cardId}`}><Button >戻る</Button></Link>
        <Link to="/"><Button >TOP</Button></Link>
      </div>
    </div>)
}

export const UserHeaderForModal = (props: {
  isLeft?: boolean, card?: UserCardData
}) => {

  return (
    <div className="h-9 max-w-full flex items-center justify-between px-4">
      <div className="flex gap-3 items-end">
        <div>{props.card?.roomNumber}</div>
        <div className="text-xl">{props.card?.userName}
          {props.isLeft &&
            <span className="text-red-500"> (退去)</span>
          }
        </div>
      </div>
      <div className="flex gap-2">
        {/** 右側 */}
      </div>
    </div>)
}

const useIds = () => {
  const location = useLocation();
  const groupId = Number(location.pathname.split('/')[2]);
  const cardId = Number(location.pathname.split('/')[4]);
  return { groupId, cardId };
}

