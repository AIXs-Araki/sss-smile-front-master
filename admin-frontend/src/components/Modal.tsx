import { useToastClickGuard } from '@/hooks/useToastClickGuard';
import { Dialog, DialogBackdrop, Transition, TransitionChild } from '@headlessui/react';
import { X } from 'lucide-react';
import React, { Fragment, type PropsWithChildren, type ReactNode, } from 'react';
import { twMerge } from 'tailwind-merge';
/**
 * Modal with close button
 * @param props
 * @returns
 */

export function Modal(props: PropsWithChildren<{ customStyle?: React.CSSProperties, open: boolean, setOpen: (o: boolean) => void, renderButtons?: () => ReactNode, maskClosable?: boolean }>) {
  const { open, setOpen, customStyle } = props;

  if (!props.open) {
    return <></>
  }

  return (
    <ModalFrame customStyle={customStyle} opened={open} close={() => setOpen(false)} maskClosable={typeof props.maskClosable === 'boolean' ? props.maskClosable : true}>
      <ModalContent>
        {props.children}
      </ModalContent>
      {props.renderButtons && <ModalButtons>
        {props.renderButtons()}
      </ModalButtons>}
    </ModalFrame >
  )
}

export function NonclosableModal(props: PropsWithChildren<{ customStyle?: React.CSSProperties, open: boolean }>) {
  const { open, customStyle } = props;

  if (!props.open) {
    return <></>
  }

  return (
    <ModalFrame customStyle={customStyle} opened={open} maskClosable={false} close={() => { }}>
      <ModalContent>
        {props.children}
      </ModalContent>
    </ModalFrame >
  )
}

export type ClosableModalProps = {
  title: string | ReactNode,
  customStyle?: React.CSSProperties,
  open: boolean,
  close: () => void;
  renderButtons?: () => ReactNode
  framePanelClassName?: string;
}
/**
 * 閉じるボタンのついているモーダル
 * @param props
 * @returns
 */
export function ClosableModal(props: PropsWithChildren<ClosableModalProps>) {
  const { open, customStyle } = props;
  const close = props.close;
  return (
    <ModalFrame customStyle={customStyle} opened={open} close={close} maskClosable={true} className={props.framePanelClassName}>
      <ModalHeader close={close} >
        {props.title}
      </ModalHeader>
      <ModalContent>
        {props.children}
      </ModalContent>
      <ModalButtons>
        {props.renderButtons && props.renderButtons()}
      </ModalButtons>
    </ModalFrame >
  )
}

export function FullscreenModal(props: PropsWithChildren<ClosableModalProps>) {
  const { open, customStyle } = props;
  const close = props.close;
  const panelClassName = twMerge("sm:my-0 sm:max-w-full max-w-full my-0 relative", props.framePanelClassName);
  return (
    <ModalFrame customStyle={customStyle} opened={open} close={close} maskClosable={true} className={panelClassName} frameClassName='p-0 '>
      <div className="w-8 absolute" style={{ top: 20, right: 18 }}>
        <button type="button"
          className="btn-close box-content p-1 text-black border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-black hover:opacity-75 hover:no-underline h-6 w-6"
          data-bs-dismiss="modal" aria-label="Close" onClick={props.close}><X /></button>
      </div>
      <ModalContent>
        {props.children}
      </ModalContent>
      <ModalButtons>
        {props.renderButtons && props.renderButtons()}
      </ModalButtons>
    </ModalFrame >
  )
}
export function LargeClosableModal(props: PropsWithChildren<ClosableModalProps>) {
  const { open, customStyle } = props;
  const close = props.close;
  const frameClass = twMerge("sm:max-w-6xl", props.framePanelClassName)
  return (
    <ModalFrame customStyle={customStyle} opened={open} close={close} maskClosable={true} className={frameClass}>
      <ModalHeader close={close} >
        {props.title}
      </ModalHeader>
      <ModalContent>
        {props.children}
      </ModalContent>
      <ModalButtons>
        {props.renderButtons && props.renderButtons()}
      </ModalButtons>
    </ModalFrame >
  )
}

export function ModalHeader(props: PropsWithChildren<{ close: () => void }>) {
  return <div className="bg-white px-4 py-3 sm:px-6 flex flex-row print:hidden">
    <div
      className="modal-header flex flex-shrink-0 justify-between p-4 border-b border-gray-200 rounded-t-md w-full">
      <div className="w-8">&nbsp;</div>
      {typeof props.children === "string" ?
        <div><h5 className="text-xl font-medium leading-normal" id="exampleModalLabel">{props.children}</h5></div>
        : props.children}
      <div className="w-8">
        <button type="button"
          className="btn-close box-content p-1 text-black border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-black hover:opacity-75 hover:no-underline h-6 w-6"
          data-bs-dismiss="modal" aria-label="Close" onClick={props.close}><X /></button>
      </div>
    </div>
  </div>
}

export function ModalContent(props: PropsWithChildren) {
  return <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">{props.children}</div>
}

export function ModalButtons(props: PropsWithChildren) {
  return <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end print:hidden">{props.children}</div>
}

// It's good practice to define the props interface clearly
interface ModalFrameProps extends PropsWithChildren {
  customStyle?: React.CSSProperties;
  opened: boolean;
  close: () => void;
  maskClosable?: boolean;
  className?: string;
  frameClassName?: string;
}

export function ModalFrame(props: ModalFrameProps) {
  const className = twMerge("inline-block overflow-hidden align-bottom text-left shadow-xl transform transition-all ease-in-out sm:my-8 sm:align-middle sm:w-full sm:max-w-3xl  rounded-3xl ", props.className);
  const frameClassName = twMerge("flex min-h-full items-center justify-center text-center", props.frameClassName)

  useToastClickGuard(props.opened)

  return (
    <Transition show={props.opened} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={props.maskClosable ? props.close : () => { }}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop className="fixed inset-0 bg-black/60" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto print:overflow-y-visible">
          <div className={frameClassName}>
            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-12"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-12"
            >
              <Dialog.Panel className={className} style={props.customStyle}>
                {props.children}
              </Dialog.Panel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}