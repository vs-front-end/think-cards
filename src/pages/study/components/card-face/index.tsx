import { Text } from "@stellar-ui-kit/web";

type CardFaceProps = {
  label: string;
  progress: string;
  html: string;
};

export const CardFace = ({ label, progress, html }: CardFaceProps) => (
  <>
    <div className="relative flex shrink-0 items-center justify-between px-5 py-3">
      <Text
        as="span"
        className="text-[11px] font-semibold uppercase tracking-widest text-muted"
      >
        {label}
      </Text>

      <Text
        as="span"
        className="text-[11px] font-medium tabular-nums text-muted"
      >
        {progress}
      </Text>
    </div>

    <div className="mx-4 h-px bg-border" />

    <div className="themed-scroll flex flex-1 overflow-auto">
      <div
        className="prose prose-lg m-auto max-w-none px-8 py-8 text-center text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  </>
);
