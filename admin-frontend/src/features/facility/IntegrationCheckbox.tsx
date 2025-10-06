import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { IntegrationId } from "./EditFacilityModal";

type Props = {
  master: {
    id: IntegrationId;
    name: string;
    hasEmailField: boolean;
  };
  state: {
    checked: boolean;
    email: string;
  };
  onIntegrationChange: (
    integrationId: IntegrationId,
    field: "checked" | "email",
    value: string | boolean
  ) => void;
  className?: string;
};

export const IntegrationCheckbox: React.FC<Props> = ({
  master,
  state,
  onIntegrationChange,
  className,
}) => {
  const checkboxId = `${master.id}`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Checkbox
        id={checkboxId}
        checked={state.checked}
        onCheckedChange={(checked) =>
          onIntegrationChange(master.id, "checked", !!checked)
        }
      />
      <label
        htmlFor={checkboxId}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 whitespace-nowrap"
      >
        {master.name}
      </label>
      {master.hasEmailField && state.checked && (
        <Input
          type="email"
          placeholder="岩通用メールアドレス"
          value={state.email}
          onChange={(e) =>
            onIntegrationChange(master.id, "email", e.target.value)
          }
          className="h-7 w-48"
        />
      )}
    </div>
  );
};
