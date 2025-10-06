// components/SaaSHeader.tsx
import {
  User,
  ChevronDown,
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
import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { useModal } from "@core/hooks/useModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { SensorIcon } from "@/assets/icons/SensorIcon";
import { BuildingsIcon } from "@/assets/icons/BuildingIcon";
import { LogoutIcon } from "@/assets/icons/LogoutIcon";
import { forwardRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@/features/login/query";

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
  const confirmationModal = useModal();
  const openLogoutConfirmationModal = confirmationModal.open;
  const onClickLogout = useCallback(() => {
    openLogoutConfirmationModal()
  }, [openLogoutConfirmationModal]);
  const buildDate = import.meta.env.VITE_APP_BUILD_DATE
  const { logout } = useAuth()
  const logoutMutation = useLogout()
  const doLogout = useCallback(async () => {
    await logoutMutation.mutateAsync()
    logout()
  }, [logoutMutation, logout])
  return (
    <>
      <header className="flex h-12 w-full items-center justify-between px-4 backdrop-blur md:px-6 bg-blue-950 text-white">
        {/* 左端: アイコンエリア */}
        <div className="flex justify-between items-center">
          <div>
            <div className="bg-white rounded-full px-2 py-1 select-none">
              <img src="/hitsuji-logo.png" width={84} />
            </div>
          </div>
          <div className="px-4 text-xl">
            安心ひつじコンソール
          </div>

        </div>
        <nav className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">

          <div className="flex flex-1 items-center justify-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem >
                  <Link to={`/corporate`} className="block h-12 min-w-36 hover:border-b-2  px-4 py-2 border-white">
                    <div className={twMerge(navigationMenuTriggerStyle(), "gap-1")}>
                      <span className="h-5 w-5 text-white mr-1"><BuildingsIcon /></span> 法人・施設管理
                    </div>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem >
                  <Link to={`/devices`} className="block h-12 min-w-36 hover:border-b-2  px-4 py-2 border-white">
                    <div className={twMerge(navigationMenuTriggerStyle(), "gap-1")}>
                      <span className="h-5 w-5 text-white">
                        <SensorIcon className="h-5 w-5" />
                      </span> デバイスID管理
                    </div>
                  </Link>
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
      <ConfirmationModal {...confirmationModal.props} message="ログアウトします。よろしいですか？" onOK={doLogout} key={confirmationModal.key} />
    </>
  );
}

// NavigationMenuのドロップダウン内リスト項目用のコンポーネント
const ListItem = forwardRef<
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