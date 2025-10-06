import { LargeClosableModal, type ClosableModalProps } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, X } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { IntegrationCheckbox } from "./IntegrationCheckbox";
import { MandatoryInput } from "@/components/MandatoryInput";
import { Label } from "@/components/ui/label";
import { twMerge } from "tailwind-merge";
import { useAddFacility, useEditFacility, useFacility } from "./query";
import { toast } from "sonner";

// --- Type Definitions ---

const INTEGRATION_MASTERS = [
  { id: "systemA", name: "アイホン", hasEmailField: false },
  { id: "systemB", name: "ケアコム", hasEmailField: false },
  { id: "systemC", name: "ナカヨ", hasEmailField: false },
  { id: "systemD", name: "岩通", hasEmailField: true },
] as const;

export type IntegrationId = typeof INTEGRATION_MASTERS[number]['id'];

type FacilityIntegrationsState = {
  [key in IntegrationId]: {
    checked: boolean;
    email: string;
  };
};

type Credential = {
  account: string;
  password: string;
};

export type FacilityData = {
  id: string;
  facilityName: string;
  comment: string;
  monitorPc: { email: string } & Credential;
  mobileApps: (Credential & { id: string })[];
  api: Credential;
  careKarteApi: Credential;
  honobonoLicenseKey: string;
  integrations: FacilityIntegrationsState;
};

// --- Initial Data ---

const generateId = () => Math.random().toString(36).substring(2);

const createInitialFacilityState = (): FacilityData => ({
  id: "new-facility", // Static ID for a single facility form
  facilityName: "",
  comment: "",
  monitorPc: { email: "", account: "", password: "" },
  mobileApps: [{ id: generateId(), account: "", password: "" }],
  api: { account: "", password: "" },
  careKarteApi: { account: "", password: "" },
  honobonoLicenseKey: "",
  integrations: Object.fromEntries(
    INTEGRATION_MASTERS.map(master => [
      master.id,
      { checked: false, email: '' }
    ])
  ) as FacilityIntegrationsState,
});

// --- Main Components ---


type Props = {
  onSuccess?: () => void;
  facilityId?: string;
  corpId?: number;
} & Omit<ClosableModalProps, "title">;

export function EditFacilityModal(props: Props) {
  return (
    <LargeClosableModal
      {...props}
      title={"施設登録・編集"}
      framePanelClassName={"mx-20"}
    >
      <div className="flex flex-col overflow-y-scroll hide-scrollbar" style={{ maxHeight: "calc( 100vh - 308px)" }} >
        <FacilityRegistrationForm onSuccess={props.onSuccess} onClose={props.close} facilityId={props.facilityId} corpId={props.corpId} open={props.open} />
      </div>
    </LargeClosableModal>
  );
}

export function FacilityRegistrationForm({ onSuccess, onClose, facilityId, corpId, open }: { onSuccess?: () => void; onClose?: () => void; facilityId?: string; corpId?: number; open?: boolean }) {
  const isEdit = !!facilityId;
  const facilityQuery = useFacility(corpId!, facilityId!, {
    query: { enabled: isEdit && !!corpId && !!facilityId && !!open }
  });
  const facilityData = facilityQuery.data;

  const [facility, setFacility] = useState<FacilityData>(() => {
    if (isEdit && facilityData?.data) {
      const data = facilityData.data;
      const mobileApps = data.MobileApp?.length
        ? data.MobileApp.map(app => ({ account: app.Account || '', password: app.Password || '', id: generateId() }))
        : [{ id: generateId(), account: "", password: "" }];

      const nurseCallMakers = data.NurseCallMaker?.split(',') || [];
      const integrations = Object.fromEntries(
        INTEGRATION_MASTERS.map(master => {
          const isChecked = nurseCallMakers.includes(master.name);
          return [
            master.id,
            {
              checked: isChecked,
              email: isChecked && master.hasEmailField ? (data.NurseCallMailAddress || '') : ''
            }
          ];
        })
      ) as FacilityIntegrationsState;

      return {
        id: facilityId!,
        facilityName: data.FacilityName || '',
        comment: data.Comment || '',
        monitorPc: {
          email: data.MonitorAppMailAddress || '',
          account: data.MonitorAppAccount || '',
          password: data.MonitorAppPassword || ''
        },
        mobileApps,
        api: {
          account: data.SSSAPIAccount || '',
          password: data.SSSAPIPassword || ''
        },
        careKarteApi: {
          account: data.ExternalCollaboCareKarteAPIKey || '',
          password: data.ExternalCollaboCareKartePassword || ''
        },
        honobonoLicenseKey: data.ExternalCollaboHonobonoLicenseKey || '',
        integrations
      };
    }
    return createInitialFacilityState();
  });

  const addFacility = useAddFacility();
  const editFacilityMutation = useEditFacility();

  // Update facility state when data is loaded for edit mode
  useEffect(() => {
    if (isEdit && facilityData?.data) {
      const data = facilityData.data;
      const mobileApps = data.MobileApp?.length
        ? data.MobileApp.map(app => ({ account: app.Account || '', password: app.Password || '', id: generateId() }))
        : [{ id: generateId(), account: "", password: "" }];

      const nurseCallMakers = data.NurseCallMaker?.split(',') || [];
      const integrations = Object.fromEntries(
        INTEGRATION_MASTERS.map(master => {
          const isChecked = nurseCallMakers.includes(master.name);
          return [
            master.id,
            {
              checked: isChecked,
              email: isChecked && master.hasEmailField ? (data.NurseCallMailAddress || '') : ''
            }
          ];
        })
      ) as FacilityIntegrationsState;

      setFacility({
        id: facilityId!,
        facilityName: data.FacilityName || '',
        comment: data.Comment || '',
        monitorPc: {
          email: data.MonitorAppMailAddress || '',
          account: data.MonitorAppAccount || '',
          password: data.MonitorAppPassword || ''
        },
        mobileApps,
        api: {
          account: data.SSSAPIAccount || '',
          password: data.SSSAPIPassword || ''
        },
        careKarteApi: {
          account: data.ExternalCollaboCareKarteAPIKey || '',
          password: data.ExternalCollaboCareKartePassword || ''
        },
        honobonoLicenseKey: data.ExternalCollaboHonobonoLicenseKey || '',
        integrations
      });
    }
  }, [facilityData, facilityId, isEdit]);

  const handleFacilityChange = (field: 'facilityName' | 'comment' | 'honobonoLicenseKey', value: string) => {
    setFacility(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (
    category: 'monitorPc' | 'api' | 'careKarteApi',
    field: string,
    value: string
  ) => {
    setFacility(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleMobileAppChange = (id: string, field: 'account' | 'password', value: string) => {
    setFacility(prev => ({
      ...prev,
      mobileApps: prev.mobileApps.map(app =>
        app.id === id ? { ...app, [field]: value } : app
      ),
    }));
  };

  const handleAddMobileApp = () => {
    setFacility(prev => ({
      ...prev,
      mobileApps: [...prev.mobileApps, { id: generateId(), account: "", password: "" }],
    }));
  };

  const handleRemoveMobileApp = (id: string) => {
    setFacility(prev => ({
      ...prev,
      mobileApps: prev.mobileApps.filter(app => app.id !== id),
    }));
  };

  const handleIntegrationChange = (
    integrationId: IntegrationId,
    field: 'checked' | 'email',
    value: string | boolean
  ) => {
    setFacility(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [integrationId]: {
          ...prev.integrations[integrationId],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const requestData = {
        FacilityName: facility.facilityName,
        Comment: facility.comment,
        MonitorAppMailAddress: facility.monitorPc.email,
        MonitorAppAccount: facility.monitorPc.account,
        MonitorAppPassword: facility.monitorPc.password,
        MobileApp: facility.mobileApps.map(app => ({
          Account: app.account,
          Password: app.password
        })),
        SSSAPIAccount: facility.api.account,
        SSSAPIPassword: facility.api.password,
        ExternalCollaboCareKarteAPIKey: facility.careKarteApi.account,
        ExternalCollaboCareKartePassword: facility.careKarteApi.password,
        ExternalCollaboHonobonoLicenseKey: facility.honobonoLicenseKey,
        NurseCallMaker: Object.entries(facility.integrations)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([_, integration]) => integration.checked)
          .map(([id]) => INTEGRATION_MASTERS.find(master => master.id === id)?.name)
          .join(','),
        NurseCallMailAddress: Object.entries(facility.integrations)
          .find(([id, integration]) => integration.checked && INTEGRATION_MASTERS.find(master => master.id === id)?.hasEmailField)?.[1]?.email || ''
      };

      if (isEdit) {
        const result = await editFacilityMutation.mutateAsync({
          cid: corpId!,
          fid: facilityId!,
          data: requestData
        });
        if (result.status === 200) {
          toast.success("施設を更新しました");
          onSuccess?.();
          onClose?.();
        }
      } else {
        const result = await addFacility.mutateAsync({
          cid: corpId!,
          data: requestData
        });
        if (result.status === 200) {
          toast.success("施設を登録しました");
          onSuccess?.();
          onClose?.();
        }
      }
    } catch (error) {
      console.error(error)
      toast.error(isEdit ? "施設の更新に失敗しました" : "施設の登録に失敗しました");
    }
  }, [facility, addFacility, editFacilityMutation, onSuccess, onClose, isEdit, facilityId, corpId]);

  return (
    <div className="px-4">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="p-4  rounded-lg bg-white grid grid-cols-2 gap-x-8 gap-y-4">
          <div className="space-y-4">
            <Field label="施設名">
              <MandatoryInput
                id="facilityName"
                placeholder="施設名"
                value={facility.facilityName}
                onChange={(e) => handleFacilityChange("facilityName", e.target.value)}
              />
            </Field>

            <Field label="コメント">
              <Input
                id="comment"
                placeholder="コメント"
                value={facility.comment}
                onChange={(e) => handleFacilityChange("comment", e.target.value)}
              />
            </Field>

            <Section title="モニタPCアプリ">
              <div className="space-y-2 pl-6">
                <Field label="メールアドレス">
                  <MandatoryInput
                    placeholder="email@example.com"
                    value={facility.monitorPc.email}
                    onChange={e => handleNestedChange('monitorPc', 'email', e.target.value)}
                  />
                </Field>
                <Field label="アカウント">
                  <MandatoryInput
                    placeholder="アカウント"
                    value={facility.monitorPc.account}
                    onChange={e => handleNestedChange('monitorPc', 'account', e.target.value)}
                  />
                </Field>
                <Field label="パスワード">
                  <MandatoryInput
                    type="password"
                    placeholder="パスワード"
                    value={facility.monitorPc.password}
                    onChange={e => handleNestedChange('monitorPc', 'password', e.target.value)}
                  />
                </Field>
              </div>
            </Section>

            <Section title="モバイルアプリ">
              <div className="space-y-2 pl-6">
                {facility.mobileApps.map((app) => (
                  <div key={app.id} className="p-2 border border-gray-200 rounded-md space-y-2 relative">
                    {facility.mobileApps.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-6 w-6"
                        onClick={() => handleRemoveMobileApp(app.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                    <Field label="アカウント" className="pr-4">
                      <Input
                        placeholder="アカウント"
                        value={app.account}
                        onChange={e => handleMobileAppChange(app.id, 'account', e.target.value)}
                      />
                    </Field>
                    <Field label="パスワード" className="pr-4">
                      <Input
                        type="password"
                        className="mr-4"
                        placeholder="パスワード"
                        value={app.password}
                        onChange={e => handleMobileAppChange(app.id, 'password', e.target.value)}
                      />
                    </Field>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-24"
                    onClick={handleAddMobileApp}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    追加
                  </Button>
                </div>
              </div>
            </Section>
          </div>

          {/* Column 右 */}
          <div className="space-y-4">
            <Section title="安心ひつじ 汎用API連携">
              <div className="space-y-2 pl-6">
                <Field label="アカウント">
                  <Input
                    placeholder="APIアカウント"
                    value={facility.api.account}
                    onChange={e => handleNestedChange('api', 'account', e.target.value)}
                  />
                </Field>
                <Field label="パスワード">
                  <Input
                    type="password"
                    placeholder="APIパスワード"
                    value={facility.api.password}
                    onChange={e => handleNestedChange('api', 'password', e.target.value)}
                  />
                </Field>
              </div>
            </Section>

            <Section title="介護ソフト連携">
              <div className="pt-2  mt-3 pl-6">
                <div className="font-bold">CAREKARTE</div>
                <div className="space-y-2 pl-4">
                  <Field label="アカウント">
                    <Input
                      placeholder="CAREKARTE API キー"
                      value={facility.careKarteApi.account}
                      onChange={e => handleNestedChange('careKarteApi', 'account', e.target.value)}
                    />
                  </Field>
                  <Field label="パスワード">
                    <Input
                      type="password"
                      placeholder="CAREKARTE API パスワード"
                      value={facility.careKarteApi.password}
                      onChange={e => handleNestedChange('careKarteApi', 'password', e.target.value)}
                    />
                  </Field>
                </div>
              </div>
              <div className="pt-2  mt-3 ml-6 border-t border-dashed">
                <div className="font-bold">ほのぼのNEXT</div>
                <div className="space-y-2 pl-4">
                  <Field label="ライセンスキー">
                    <Input
                      placeholder="ほのぼのライセンスキー(5桁)"
                      value={facility.honobonoLicenseKey}
                      onChange={(e) => handleFacilityChange("honobonoLicenseKey", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </Section>
            <Section title="ナースコール連携">
              <div className="space-y-2 pl-6">
                {INTEGRATION_MASTERS.map(master => (
                  <IntegrationCheckbox
                    key={master.id}
                    master={master}
                    state={facility.integrations[master.id]}
                    onIntegrationChange={handleIntegrationChange}
                  />
                ))}
              </div>
            </Section>
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-6 pt-4 border-t">
          <Button type="submit">
            {isEdit ? '更新' : '登録'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}

// --- Helper Components ---

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border-t">
    <h3 className="font-semibold mb-2">{title}</h3>
    {children}
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode, className?: string }> = ({ label, children, className }) => {
  const _className = twMerge("flex-1", className)
  return (
    <div className="flex items-center gap-2">
      <Label className="text-sm text-gray-600 w-28 text-right pr-2">{label}</Label>
      <div className={_className}>{children}</div>
    </div>
  );
}
