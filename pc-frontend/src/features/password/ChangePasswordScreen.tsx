import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MandatoryInput } from "@/components/MandatoryInput";
import { useNavigate } from "react-router-dom";
import { useRequestAuthCode, useResetPassword } from "./query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { RequestResetPasswordMonitorParams } from "@core/api/api-generated";

// バリデーションスキーマの定義
const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, {
      message: "現在のパスワードを入力してください。",
    }),
    newPassword: z.string().min(8, {
      message: "新しいパスワードは8文字以上で入力してください。",
    }),
    confirmNewPassword: z.string().min(1, {
      message: "新しいパスワード（再入力）を入力してください。",
    }),
    oneTimePassword: z.string().min(0, {
      message: "ワンタイムパスワードを入力してください。",
    }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "新しいパスワードが一致しません。",
    path: ["confirmNewPassword"], // エラーメッセージをconfirmNewPasswordフィールドに表示
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

function OtpButton() {
  const [cooldown, setCooldown] = useState(0);
  const requestOtp = useRequestAuthCode();

  const handleClick = async () => {
    if (cooldown > 0) {
      toast.error("1分に一度しか送信できません。");
      return;
    }

    await requestOtp.mutateAsync();
    console.log("ワンタイムパスワードを要求しました。");
    toast.success("登録済みのメールアドレスにワンタイムパスワードを送信しました。");

    setCooldown(60);
  };

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
    >
      コードを要求
    </Button>
  );
}

export function ChangePasswordScreen() {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      oneTimePassword: "",
    },
    mode: "onChange", // フォームの変更を検知してバリデーションを実行
  });

  const { logout } = useAuth();
  const navigate = useNavigate();
  const resetPassword = useResetPassword();

  async function onSubmit(values: ChangePasswordFormValues) {
    const params: RequestResetPasswordMonitorParams = {
      userID: "TODO",
      PassCode: values.oneTimePassword,
      CurrentPW: values.currentPassword,
      NewPW: values.newPassword,
    };
    const result = await resetPassword.mutateAsync({ params });

    if (result.data.Result) {
      logout();
      alert("パスワードが変更されました。");
      navigate("/");
    } else {
      alert("パスワードの更新に失敗しました。");
    }
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>パスワード変更</CardTitle>
          <CardDescription>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">


              <div className="space-y-2 ">
                <FormLabel htmlFor="otp-input">ワンタイムパスワード</FormLabel>
                <div className="flex items-start gap-x-2">
                  <FormField
                    control={form.control}
                    name="oneTimePassword"
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <MandatoryInput id="otp-input" placeholder="ワンタイムパスワード" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <OtpButton />
                </div>
                <div className="text-right">
                  <span className="text-xs">※ワンタイムパスワード有効期限：5分</span>
                </div>
              </div>

              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>現在のパスワード</FormLabel>
                    <FormControl>
                      <MandatoryInput type="password" placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>新しいパスワード
                    </FormLabel>
                    <FormControl>
                      <MandatoryInput type="password" placeholder="8文字以上" {...field} />
                    </FormControl>
                    <FormMessage />
                    <div className="text-right">
                      <span className="text-xs text-gray-500">
                        ※半角英数字記号（大文字と小文字の区別あり）を<br />
                        使った8文字以上でお願いします。</span>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>新しいパスワード（再入力）</FormLabel>
                    <FormControl>
                      <MandatoryInput
                        type="password"
                        placeholder="確認のためもう一度入力"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={!form.formState.isValid}>
                パスワードを変更する
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}