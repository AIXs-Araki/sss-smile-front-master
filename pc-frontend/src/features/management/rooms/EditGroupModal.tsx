import { Button } from "@/components/ui/button";
import { ClosableModal, type ClosableModalProps } from "../../../components/Modal"
import { Input } from "@/components/ui/input";
import { useGroups } from "@/features/monitor/query";
import { useLoginUser } from "@/hooks/useLoginUser";
import { useSaveGroupList } from "./query";
import { useState, useEffect } from "react";
import { toast } from "sonner";

type Props = {
} & Omit<ClosableModalProps, "title">


export function EditGroupModal(props: Props) {
  const loginUser = useLoginUser();
  const groupsQuery = useGroups(loginUser.cid, loginUser.fid, { query: { enabled: props.open } });
  const saveGroupList = useSaveGroupList();
  const [groupNames, setGroupNames] = useState<Record<number, string>>({});

  useEffect(() => {
    if (groupsQuery.data?.data.GroupInformation) {
      const names: Record<number, string> = {};
      groupsQuery.data.data.GroupInformation.forEach(g => {
        if (g.GroupNumber) names[g.GroupNumber] = g.GroupName || "";
      });
      setGroupNames(names);
    }
  }, [groupsQuery.data]);

  const saveGroups = async () => {
    try {
      const groupInformation = (groupsQuery.data?.data.GroupInformation || []).map(g => ({
        ...g,
        GroupName: g.GroupNumber ? groupNames[g.GroupNumber] || "" : ""
      }));

      await saveGroupList.mutateAsync({
        cid: loginUser.cid,
        fid: loginUser.fid,
        data: { GroupInformation: groupInformation }
      });

      toast.success("グループ名を更新しました。");
      props.close();
    } catch (error) {
      console.error(error);
      toast.error("グループ名の更新に失敗しました。");
    }
  }

  if (!groupsQuery.data) {
    return <></>
  }
  return <div>
    <ClosableModal
      {...props}
      title={"グループ名編集"}
      renderButtons={() => {
        return <div className="flex gap-2">
          <Button onClick={saveGroups}>登録</Button>
          <Button variant="outline" className="" onClick={props.close} >キャンセル</Button>
        </div>
      }}
    >
      <div className="p-6 text-center flex flex-col">

        <div className="">
          <div className="flex flex-col gap-2">
            {(groupsQuery.data.data.GroupInformation || []).map((g, i) => {
              return (
                <div key={g.GroupNumber} className="p-1 flex items-center mx-auto">
                  <div className="w-12 text-sm">
                    {i + 1}
                  </div>
                  <div className="">
                    <Input
                      value={g.GroupNumber ? groupNames[g.GroupNumber] || "" : ""}
                      onChange={(e) => {
                        if (g.GroupNumber) {
                          setGroupNames(prev => ({ ...prev, [g.GroupNumber!]: e.target.value }));
                        }
                      }}
                      className="w-96"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ClosableModal>
  </div>
}

