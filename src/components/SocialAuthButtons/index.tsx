import { Spinner } from "@stellar-ui-kit/web";

interface ISocialAuthButtons {
  handlers: {
    google?: () => void;
    github?: () => void;
    twitter?: () => void;
  };
  isLoading?: boolean;
}

const CONFIG = [
  {
    key: "google",
    label: "Google",
    icon: "/icons/google.svg",
    bgColor: "bg-[#BC2026]",
  },
  {
    key: "github",
    label: "GitHub",
    icon: "/icons/github.svg",
    bgColor: "bg-[#553493]",
  },
  {
    key: "twitter",
    label: "X",
    icon: "/icons/twitter.svg",
    bgColor: "bg-[#353535]",
  },
] as const;

export const SocialAuthButtons = ({
  handlers,
  isLoading = false,
}: ISocialAuthButtons) => {
  return (
    <div className="flex justify-center gap-4">
      {CONFIG.map(({ key, label, icon, bgColor }) => {
        const onClick = handlers[key];

        if (!onClick) return null;

        return (
          <button
            key={key}
            type="button"
            onClick={onClick}
            disabled={!onClick || isLoading}
            aria-label={label}
            className={`flex h-9 w-9 items-center justify-center rounded-full ${bgColor} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {isLoading ? (
              <Spinner className="size-4 text-white" />
            ) : (
              <img
                src={icon}
                alt=""
                loading="lazy"
                width={20}
                height={20}
                className="size-5 brightness-0 invert"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
