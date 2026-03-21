import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { cropImage } from "@/utils";

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Slider,
  Spinner,
  Text,
} from "@stellar-ui-kit/web";

type AvatarCropDialogProps = {
  open: boolean;
  imageSrc: string | null;
  isPending: boolean;
  onConfirm: (croppedFile: File) => void;
  onCancel: () => void;
};

export function AvatarCropDialog({
  open,
  imageSrc,
  isPending,
  onConfirm,
  onCancel,
}: AvatarCropDialogProps) {
  const { t } = useTranslation();

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedArea(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedArea) return;

    const file = await cropImage(imageSrc, croppedArea);
    onConfirm(file);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isPending) {
      onCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("avatarCropTitle")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="relative h-64 w-full overflow-hidden rounded-lg bg-black">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <Text as="span" className="text-xs text-muted">
              {t("avatarCropZoom")}
            </Text>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={([value]) => setZoom(value)}
              className="flex-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
          >
            {t("settingsCancel")}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={isPending || !croppedArea}
          >
            {isPending && <Spinner className="size-4 text-white" />}
            {t("avatarCropConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
