import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Music, X } from "lucide-react";
import { Button, Text } from "@stellar-ui-kit/web";

type IAudioAttacherProps = {
  src: string | null;
  onAttach: (file: File) => Promise<void>;
  onRemove: () => void;
};

export const AudioAttacher = ({
  src,
  onAttach,
  onRemove,
}: IAudioAttacherProps) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      await onAttach(file);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="audio/mpeg"
        className="hidden"
        onChange={handleChange}
      />

      {src && (
        <div className="flex h-7 items-center gap-1.5 rounded-md bg-success-soft px-2">
          <Music className="size-3 text-success-text" />

          <Text as="span" className="text-xs font-medium text-success-text">
            {t("cardAudioAttached")}
          </Text>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            aria-label={t("cardAudioRemove")}
            className="-mr-1 size-5 p-0 text-success-text hover:text-foreground"
          >
            <X className="size-3" />
          </Button>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="h-7 gap-1.5 px-2 text-xs"
      >
        <Music className="size-3" />
        {isUploading
          ? t("cardAudioUploading")
          : src
            ? t("cardAudioReplace")
            : t("cardAudioAttach")}
      </Button>
    </div>
  );
};
