import { Autocomplete } from "@/components/autocomplete";
import { IpAddressInput } from "@/components/form/IpAddressInput";
import { MandatoryInput } from "@/components/MandatoryInput";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLoginUser } from "@/hooks/useLoginUser";
import { renderWhenFetched } from "@/lib/loading";
import type { GetGroupNameMonitor200AllOfGroupInformationItem, GetRoomDataMonitor200AllOf } from "@core/api/api-generated";
import { Form, FormProvider, useForm } from "react-hook-form";
import {
  ClosableModal,
  type ClosableModalProps,
} from "../../../components/Modal";
import { useAddRoom, useAvailableUserList, useEditRoom, useGroupList, useRoomDetail } from "./query";

type Props = {
  roomId?: number
} & Omit<ClosableModalProps, "title">;

export function EditRoomModal(props: Props) {
  const loginUser = useLoginUser();
  const roomQuery = useRoomDetail(loginUser.cid, loginUser.fid, props.roomId || 0, { query: { enabled: props.open && !!props.roomId } });
  const editRoom = useEditRoom();
  const addRoom = useAddRoom()

  const onSubmit = (data: Data) => {
    if (props.roomId) {
      editRoom.mutate({
        cid: loginUser.cid,
        fid: loginUser.fid,
        rid: props.roomId,
        data
      }, {
        onSuccess: () => {
          if (props.onSuccess) props.onSuccess();
          props.close()
        }
      })
    } else {
      addRoom.mutate({
        cid: loginUser.cid,
        fid: loginUser.fid,
        data
      }, {
        onSuccess: () => {
          if (props.onSuccess) props.onSuccess();
          props.close()
        }
      })
    }
  };

  // For new room creation, use empty default values
  const defaultRoom: GetRoomDataMonitor200AllOf = {
    RoomNumber: "",
    GroupNumber: 0,
    DeviceID: "",
    IPAddress: "",
    SubnetMask: "",
    ExtensionPhoneNumber: "",
    UserID: ""
  };

  return (
    <div>
      <ClosableModal
        {...props}
        title={"部屋登録"}
        renderButtons={() => {
          return (
            <div className="flex gap-2">
              <Button onClick={props.close}>登録</Button>
              <Button
                variant="outline"
                className=""
                onClick={props.close}
              >キャンセル</Button>
            </div>
          );
        }}
      >
        <div className="p-6 text-center flex flex-col">
          <div className="">
            {props.roomId ? (
              renderWhenFetched(roomQuery, {}, (room) => (
                <DeviceSettingsForm input={{ room }} onSubmit={onSubmit} />
              ))
            ) : (
              <DeviceSettingsForm input={{ room: defaultRoom }} onSubmit={onSubmit} />
            )}
          </div>
        </div>
      </ClosableModal>
    </div>
  );
}

type Data = {
  RoomNumber: string;
  GroupID: number;
  DeviceID: string;
  ipAddress1: string;
  netmask: string;
  extensionNumber: string;
  UserID: string;
}

export function DeviceSettingsForm({ input, onSubmit }: { input: { room: GetRoomDataMonitor200AllOf }, onSubmit: (data: Data) => void }) {
  // 非同期で取得したグループリストとローディング状態を管理
  const form = useForm({
    defaultValues: {
      RoomNumber: input.room.RoomNumber || "",
      GroupID: input.room.GroupNumber || 0,
      DeviceID: input.room.DeviceID || "",
      ipAddress1: input.room.IPAddress || "",
      netmask: input.room.SubnetMask || "",
      extensionNumber: input.room.ExtensionPhoneNumber || "",
      UserID: input.room.UserID || "",
    },
  });

  const loginUser = useLoginUser();
  const groupQuery = useGroupList(loginUser.cid, loginUser.fid);
  const usersQuery = useAvailableUserList(loginUser.cid, loginUser.fid)

  const handleSubmit = (data: Data) => {
    onSubmit(data);
  };

  function convertToOptions(GroupInformation: GetGroupNameMonitor200AllOfGroupInformationItem[] | undefined) {
    if (!GroupInformation) {
      return []
    }
    return GroupInformation
      .sort((a, b) => (a.SortNumber || 0) - (b.SortNumber || 0))
      .map((g) => ({
        id: g.GroupNumber!,
        name: g.GroupName!,
      }))
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 max-w-2xl mx-auto px-4"
        >
          {/* 部屋番号 */}
          <FormField
            control={form.control}
            name="RoomNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>部屋番号</FormLabel>
                <FormControl>
                  <MandatoryInput placeholder="部屋番号" {...field} maxLength={5} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* グループ */}
          {renderWhenFetched(groupQuery, {}, (q) => {
            const groupsData = convertToOptions(q.GroupInformation)
            return <FormField
              control={form.control}
              name="GroupID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>グループ</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className={field.value ? "" : "bg-yellow-100"} >
                        <SelectValue placeholder="グループを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groupsData.map((group) => (
                        <SelectItem
                          key={group.id}
                          value={group.id.toString()}
                        >
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          })}
          {/* デバイスID */}
          <FormField
            control={form.control}
            name="DeviceID"
            render={({ field }) => (
              <FormItem>
                <FormLabel>デバイスID</FormLabel>
                <FormControl>
                  <MandatoryInput placeholder="デバイスID" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* IPアドレス */}
          <FormField
            control={form.control}
            name="ipAddress1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IPアドレス</FormLabel>
                <FormControl>
                  <IpAddressInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="netmask"
            render={({ field }) => (
              <FormItem>
                <FormLabel>サブネットマスク</FormLabel>
                <FormControl>
                  <IpAddressInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 内線番号 */}
          <FormField
            control={form.control}
            name="extensionNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>内線番号</FormLabel>
                <FormControl>
                  <Input
                    placeholder="内線番号"
                    {...field}
                    type="text"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 利用者名 */}
          {renderWhenFetched(usersQuery, {}, (users) => {
            const options = users.DataList?.map((u) => ({
              id: u.UserID || "",
              name: u.Name || "",
            })) || [];
            return <FormField
              control={form.control}
              name="UserID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>利用者名</FormLabel>
                  <Autocomplete
                    options={options}
                    placeholder="利用者名"
                    {...field}
                    onSelect={(selection) => {
                      form.setValue("UserID", selection.toString());
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          })}

        </form>
      </Form >
    </FormProvider >
  );
}
