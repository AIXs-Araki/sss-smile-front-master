import { Autocomplete } from '@/components/autocomplete';
import { useLoginUser } from '@/hooks/useLoginUser';
import { useMemo } from 'react';
import {
  useController,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { useLineStaff } from './query';

type AutocompleteFormFieldProps<TFormValues extends FieldValues> = {
  control: Control<TFormValues>;
  name: Path<TFormValues>;
  label: string;
};

export function LineStaffSelect<TFormValues extends FieldValues>({
  control,
  name,
  label,
}: AutocompleteFormFieldProps<TFormValues>) {
  const { field } = useController({ name, control });
  const loginUser = useLoginUser();
  const lineStaffs = useLineStaff(loginUser.cid, loginUser.fid);

  const handleSelect = (id: string | number) => {
    field.onChange(id);
  };
  const options = useMemo(() => (
    lineStaffs.data?.data.DataList?.map((e) => ({
      id: e.StaffID!,
      name: e.Name!
    })) || []
  ), [lineStaffs.data]);

  if (!lineStaffs.data) return null;


  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <Autocomplete
        options={options}
        onSelect={handleSelect}
        placeholder={`LINE 連携スタッフ`}
      />
      <FormMessage />
    </FormItem>
  );
}
