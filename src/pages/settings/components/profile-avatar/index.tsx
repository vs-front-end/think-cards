import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import Cropper from "react-easy-crop";
import { useTranslation } from "react-i18next";
import type { Area, Point } from "react-easy-crop";
import { useAuthStore } from "@/store";
import { useProfile, useUploadAvatar } from "@/hooks";
import { createImageUrl, cropImage } from "@/utils";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Skeleton,
  Slider,
  Spinner,
  Text,
} from "@stellar-ui-kit/web";

const ProfileAvatarCropDialog = ({
  open,
  imageSrc,
  isPending,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  imageSrc: string | null;
  isPending: boolean;
  onConfirm: (croppedFile: File) => void;
  onCancel: () => void;
}) => {
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
        <DialogHeader className="text-left">
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
};

export const ProfileAvatar = () => {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);

  const user = useAuthStore((s) => s.user);
  const uploadAvatar = useUploadAvatar();
  const { data: profile, isLoading } = useProfile();

  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);

  const initials = profile?.username?.slice(0, 2).toUpperCase() || "?";

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";
    const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

    if (file.size > MAX_AVATAR_SIZE) {
      toast.error(t("profileAvatarTooLarge"));
      return;
    }

    setCropImageSrc(createImageUrl(file));
    setCropOpen(true);
  };

  const handleCropConfirm = async (croppedFile: File) => {
    try {
      await uploadAvatar.mutateAsync(croppedFile);
      toast.success(t("profileAvatarUpdated"));
    } catch (err) {
      const message =
        err instanceof Error && err.message?.includes("size")
          ? t("profileAvatarTooLarge")
          : t("profileAvatarError");

      toast.error(message);
    } finally {
      closeCropDialog();
    }
  };

  const closeCropDialog = () => {
    setCropOpen(false);

    if (cropImageSrc) {
      URL.revokeObjectURL(cropImageSrc);
      setCropImageSrc(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-full" />

        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-3 w-40 rounded" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="size-16">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <button
            type="button"
            aria-label="Change avatar"
            onClick={() => fileRef.current?.click()}
            disabled={uploadAvatar.isPending}
            className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-primary text-white/80 shadow disabled:opacity-60"
          >
            {uploadAvatar.isPending ? (
              <Spinner className="size-4" />
            ) : (
              <Camera className="size-4" />
            )}
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="flex flex-1 flex-col truncate">
          <Text as="p" className="truncate text-sm font-semibold md:text-lg">
            {profile?.username || "—"}
          </Text>

          <Text as="p" className="truncate text-xs text-muted md:text-base">
            {user?.email}
          </Text>
        </div>
      </div>

      <ProfileAvatarCropDialog
        open={cropOpen}
        imageSrc={cropImageSrc}
        isPending={uploadAvatar.isPending}
        onConfirm={handleCropConfirm}
        onCancel={closeCropDialog}
      />
    </>
  );
};
