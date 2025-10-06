import { Button } from "@/components/ui/button";
import {
  ClosableModal,
  type ClosableModalProps,
} from "@/components/Modal";
import { useState, useCallback, type FormEvent } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useAddDevice, useDownloadSampleCsv } from "./query";

// モーダルのProps。titleは内部で設定するためOmitします。
type Props = {
  onSuccess?: () => void;
} & Omit<ClosableModalProps, "title">;

/**
 * CSVアップロード用のモーダルコンポーネント
 */
export function UploadCsvModal(props: Props) {
  return (
    <ClosableModal
      {...props}
      title={"デバイス一括登録"}
      renderButtons={() => (
        <div className="flex gap-2">
          <Button type="submit" form="upload-csv-form">
            登録
          </Button>
          <Button variant="outline" onClick={props.close}>
            キャンセル
          </Button>
        </div>
      )}
    >
      {/* フォーム送信成功時にモーダルを閉じるため、close関数を渡します */}
      <UploadCsvForm onSubmitted={() => { props.close(); props.onSuccess?.(); }} />
    </ClosableModal>
  );
}

type UploadCsvFormProps = {
  onSubmitted: () => void;
};

/**
 * CSVアップロードのフォームコンポーネント
 */
export function UploadCsvForm({ onSubmitted }: UploadCsvFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const addDevice = useAddDevice();
  const downloadSampleCsv = useDownloadSampleCsv();

  const handleDownloadSample = async () => {
    try {
      const result = await downloadSampleCsv.mutateAsync({});
      if (result.data?.DataCSV) {
        const blob = new Blob([result.data.DataCSV], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'device_sample.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error(e);
      toast.error("サンプルCSVのダウンロードに失敗しました");
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("ファイルが選択されていません。");
      return;
    }

    try {
      const csvText = await file.text();
      const lines = csvText.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        toast.error("CSVファイルの形式が正しくありません。");
        return;
      }

      const deviceIdRow = lines[0].split(',');
      const deviceTypeNameRow = lines[1].split(',');

      const deviceList = [];
      for (let i = 1; i < deviceIdRow.length; i++) {
        const deviceId = deviceIdRow[i]?.trim();
        const deviceTypeName = deviceTypeNameRow[i]?.trim();

        if (deviceId && deviceTypeName) {
          deviceList.push({
            DeviceID: deviceId,
            DeviceTypeName: deviceTypeName
          });
        }
      }

      if (deviceList.length === 0) {
        toast.error("有効なデバイスデータが見つかりませんでした。");
        return;
      }

      const result = await addDevice.mutateAsync({ data: { DeviceList: deviceList } });

      if (result.status === 200) {
        toast.success("デバイスの一括登録に成功しました");
        onSubmitted();
      } else {
        toast.error("デバイスの一括登録に失敗しました");
      }
    } catch (e) {
      console.error(e);
      toast.error("デバイスの一括登録に失敗しました");
    }
  };

  return (
    <form
      id="upload-csv-form" // モーダルの登録ボタンから参照するためのID
      onSubmit={handleSubmit}
      className="space-y-4 p-6"
    >
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          デバイス情報をCSVファイルで一括登録します。
          <button
            type="button"
            onClick={handleDownloadSample}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            指定されたフォーマットのCSVファイル
          </button>
          を選択してください。
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`flex cursor-pointer justify-center rounded-md border-2 border-dashed px-6 pt-5 pb-6 transition-colors ${isDragActive
          ? "border-indigo-500 bg-indigo-50"
          : "border-gray-300 hover:border-gray-400"
          }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-1 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex justify-center text-sm text-gray-600">
            <p className="relative rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
              <span>ファイルをアップロード</span>
            </p>
            <p className="pl-1">またはドラッグ＆ドロップ</p>
          </div>
          <p className="text-xs text-gray-500">CSVファイルのみ</p>
        </div>
      </div>
      {file && (
        <div className="rounded-md bg-blue-100 p-2 text-center text-sm text-gray-700">
          選択されたファイル: {file.name}
        </div>
      )}
    </form>
  );
}
