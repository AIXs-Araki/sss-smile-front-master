import type { ReactNode } from "react";
import { ClosableModal, type ClosableModalProps } from "./Modal"
import { Button } from "./ui/button";

type Props = {
  okLabel?: string,
  cancelLabel?: string,
  message: string | ReactNode,
  onOK?: () => void;
  onCancel?: () => void;
} & Omit<ClosableModalProps, "title">

export function ConfirmationModal(props: Props) {
  return <div>
    <ClosableModal
      {...props}
      title={"確認"}
      renderButtons={() => {
        return <></>
      }}
    >
      <div className="p-6 text-center flex flex-col">
        <svg aria-hidden="true" className="mx-auto mb-4 text-gray-400 w-14 h-14 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h3 className="mb-5 pb-10 text-lg font-normal text-gray-500 dark:text-gray-400">
          {props.message}
        </h3>
        <div className="flex flex-row justify-between gap-4 mx-auto select-none">
          <Button variant="secondary" data-modal-hide="popup-modal" type="button"
            className="w-min-24"

            onClick={() => { if (props.onCancel) props.onCancel(); props.close() }}>
            {props.cancelLabel || "キャンセル"}
          </Button>
          <Button variant="default" data-modal-hide="popup-modal"
            className="w-min-24"
            onClick={() => { if (props.onOK) props.onOK(); props.close() }}>
            {props.okLabel || "OK"}
          </Button>
        </div>
      </div>
    </ClosableModal>
  </div>
}
