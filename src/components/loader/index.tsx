import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@stellar-ui-kit/web";
import { cn } from "@stellar-ui-kit/shared";

import "./loader.css";

const MESSAGE_KEYS = [
  "loaderLoadingCards",
  "loaderOrganizingDecks",
  "loaderPreparingSession",
  "loaderShufflingCards",
];

type Props = {
  className?: string;
};

export const Loader = ({ className }: Props) => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGE_KEYS.length);
    }, 1800);

    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-4",
        className,
      )}
    >
      <div className="tc-loader relative h-[118px] w-[240px] overflow-hidden">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="tc-loader__card"
            style={{ ["--i" as string]: i }}
          >
            <div
              className="pointer-events-none absolute inset-x-2 top-2.5 flex flex-col gap-1.5"
              aria-hidden
            >
              <div className="h-0.5 w-[40%] shrink-0 rounded-full bg-primary-soft" />
              <div className="h-0.5 w-full shrink-0 rounded-full bg-primary-soft" />
              <div className="h-0.5 w-[88%] shrink-0 rounded-full bg-primary-soft" />
              <div className="h-0.5 w-[55%] shrink-0 rounded-full bg-primary-soft" />
            </div>
          </div>
        ))}
      </div>

      <Text
        as="span"
        key={index}
        className="tc-loader__text text-sm font-medium text-muted"
      >
        {t(MESSAGE_KEYS[index])}
      </Text>
    </div>
  );
};
