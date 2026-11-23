import * as Dialog from '@radix-ui/react-dialog'
import { Button } from './Button'
import { X } from 'lucide-react'

type VideoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  youtubeId?: string | null
  /** Seconds into the video to start playback. */
  start?: number
  note?: string
}

export function VideoDialog({ open, onOpenChange, title, youtubeId, start, note }: VideoDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog" aria-describedby={undefined}>
          <div className="dialog__head">
            <Dialog.Title className="dialog__title">{title}</Dialog.Title>
            <Dialog.Close className="dialog__close" aria-label="إغلاق">
              <X size={18} aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="dialog__body">
            {youtubeId ? (
              <div className="dialog__video">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1${start ? `&start=${start}` : ''}`}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="dialog__placeholder">
                <h4>الفيديو قيد التجهيز</h4>
                <p>{note ?? 'سيُضاف الفيديو قبل النشر. في الأثناء، احجز جلسة تشخيص وسنشاركك القصة كاملة.'}</p>
                <Dialog.Close asChild>
                  <Button href="#booking" variant="primary">
                    احجز جلسة تشخيص
                  </Button>
                </Dialog.Close>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
