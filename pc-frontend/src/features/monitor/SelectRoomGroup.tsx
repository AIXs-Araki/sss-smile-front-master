import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorageState } from 'ahooks';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  options: SelectOption[];
}

export const SelectRoomGroup: React.FC<Props> = ({ options }) => {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const [selectedValue, setSelectedValue] = useState<string>(groupId || '');
  const [, setDefaultGroupId] = useLocalStorageState("defaultGroupId");

  const handleChange = (newValue: string) => {
    setSelectedValue(newValue);
    setDefaultGroupId(newValue)
    navigate(`/monitor/${newValue}`);
  };

  return (
    <Select autoComplete='true' value={selectedValue} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="グループ" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}
      </SelectContent>
    </Select>
  );
};