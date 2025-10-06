// components/SaaSHeader.tsx
import * as React from "react";
import {
  User,
  ChevronDown,
  History,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { MonitorIcon } from "@/assets/icons/MonitorIcon";
import { twMerge } from "tailwind-merge";
import { RoomsIcon } from "@/assets/icons/RoomsIcon";
import { UsersIcon } from "@/assets/icons/UsersIcon";
import { StaffIcon } from "@/assets/icons/StaffIcon";
import { LogoutIcon } from "@/assets/icons/LogoutIcon";
import { PasswordIcon } from "@/assets/icons/Password";
import { SettingIcon } from "@/assets/icons/SettingIcon";
import { useLocalStorageState } from "ahooks";
import { useModal } from "@core/hooks/useModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { useAuth } from "@/contexts/AuthContext";

// Propsの型定義
interface SaaSHeaderProps {
  userName: string;
  userEmail: string;
  avatarSrc?: string;
  appVersion: string;
}

export function Header({
  userName,
  userEmail,
  appVersion,
}: SaaSHeaderProps) {
  const navigate = useNavigate()
  const [groupId,] = useLocalStorageState("defaultGroupId", { listenStorageChange: true });
  const { logout, facilityName } = useAuth();
  const confirmationModal = useModal();
  const openLogoutConfirmationModal = confirmationModal.open;
  const onClickLogout = React.useCallback(() => {
    openLogoutConfirmationModal()
  }, [openLogoutConfirmationModal])
  const handleLogout = React.useCallback(() => {
    logout();
  }, [logout])
  const buildDate = import.meta.env.VITE_APP_BUILD_DATE

  return (
    <>
      <header className=" flex h-12 w-full items-center justify-between px-4 backdrop-blur md:px-6 bg-blue-950 text-white">
        {/* 左端: アイコンエリア */}
        <div className="flex justify-between items-center">
          <div>
            <div className="bg-white rounded-full px-2 py-1 select-none">
              <img src="/hitsuji-logo.png" width={84} />
            </div>
          </div>
          <div className="px-4 text-xl">
            {facilityName || "施設名 0001"}
          </div>

        </div>
        <nav className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">

          <div className="flex flex-1 items-center justify-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem >
                  <Link to={`/monitor/${groupId || 1}`} className="block h-12 min-w-36 hover:border-b-2  px-4 py-2 border-white">
                    <div className={twMerge(navigationMenuTriggerStyle(), "gap-1")}>
                      <span className="h-5 w-5 text-white"><MonitorIcon /></span> モニタ
                    </div>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem >
                  <Link to={`/alerts`} className="block h-12 min-w-36 hover:border-b-2  px-4 py-2 border-white">
                    <div className={twMerge(navigationMenuTriggerStyle(), "gap-1")}>
                      <span className="h-5 w-5 text-white"><History /></span> アラート履歴
                    </div>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-12 min-w-36 text-center hover:border-b-2 border-white px-4 py-2 gap-1 text-sm">
                        <div className={twMerge(navigationMenuTriggerStyle(), "mx-auto")}>
                          <div className="w-5 h-5 mr-1">
                            <SettingIcon />
                          </div>
                          設定
                          <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 p-2">
                      <DropdownMenuItem asChild>
                        <Link to="/rooms" className="cursor-pointer hover:bg-gray-50"><RoomsIcon className="text-gray-900" /> 部屋設定</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/users" className="cursor-pointer hover:bg-gray-50"><UsersIcon className="text-gray-900" /> ユーザー設定</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/staffs" className="cursor-pointer hover:bg-gray-50"><StaffIcon className="text-gray-900" /> スタッフ設定</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </nav>

        {/* 右端: アクションエリア */}
        <div className="flex items-center justify-end gap-4">

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 rounded-full px-3 py-2"
              >
                <User />
                <span className="hidden text-sm font-extralight md:block">
                  {userName}
                </span>
                <ChevronDown className="hidden h-4 w-4 md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-extralight leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/change-password")}>
                <span className="text-black"><PasswordIcon /></span>
                <span>パスワード変更</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onClickLogout}>
                <span className="text-black"><LogoutIcon /></span>
                <span>ログアウト</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                アプリバージョン: {buildDate || appVersion}
              </DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header >
      <ConfirmationModal {...confirmationModal.props} message="ログアウトします。よろしいですか？" onOK={handleLogout} />

    </>
  );
}

// NavigationMenuのドロップダウン内リスト項目用のコンポーネント
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-extralight leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";