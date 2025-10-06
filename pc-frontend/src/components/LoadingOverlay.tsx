import { LoadingIcon } from "@/lib/LoadingIcon"

/**
 * ローディング中に画面全体に半透明の div をかぶせて一切の処理をできなくする
 * @returns
 */
export function LoadingOverlayFullScreen() {
  return <div className="fixed flex top-0 h-screen w-screen bg-black/40 text-white z-50 select-none" style={{ zIndex: 100 }}><div className="mx-auto my-auto text-lg font-bold">
    <LoadingIcon />
    ローディング中...
  </div></div>
}

export function LoadingOverlay() {
  return <div className="absolute top-0 left-0 flex h-full w-full bg-black/40 text-white z-30 select-none"><div className="mx-auto my-auto text-lg font-bold">
    <LoadingIcon />
    ローディング中...
  </div></div>
}
