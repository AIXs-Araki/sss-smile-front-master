import { Button } from "@/components/ui/button";
import {
  ClosableModal,
  type ClosableModalProps,
} from "@/components/Modal";
import { useState, useCallback, type FormEvent } from "react";
import { useDropzone } from "react-dropzone";

// モーダルのProps。titleは内部で設定するためOmitします。
type Props = {
  cid?: number,
  fid?: string

} & Omit<ClosableModalProps, "title">;

/**
 * CSVアップロード用のモーダルコンポーネント
 */
export function UploadCsvModal(props: Props) {
  return (
    <ClosableModal
      {...props}
      title={"利用者情報CSVアップロード"}
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
      <UploadCsvForm onSubmitted={props.close} />
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      // You might want to show a toast or a message to the user
      alert("ファイルが選択されていません。");
      return;
    }
    console.log("Form submitted with file:", file);
    // Here, you would typically handle the file upload to the server.
    // For example, using FormData:
    // const formData = new FormData();
    // formData.append('file', file);
    // fetch('/api/upload-csv', { method: 'POST', body: formData })
    //   .then(response => response.json())
    //   .then(data => {
    //     console.log('Upload successful', data);
    //     onSubmitted(); // Close modal on success
    //   })
    //   .catch(error => {
    //     console.error('Upload failed', error);
    //   });

    // For demonstration, we'll just call onSubmitted directly.
    onSubmitted();
  };

  return (
    <form
      id="upload-csv-form" // モーダルの登録ボタンから参照するためのID
      onSubmit={handleSubmit}
      className="space-y-4 p-6"
    >
      <div className="space-y-2">
        <p className="font-semibold">〇〇法人</p>
        <p className="text-sm text-gray-600">
          利用者情報をCSVファイルで一括登録します。指定されたフォーマットのCSVファイルを選択してください。
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
