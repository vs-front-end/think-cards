import { useEffect } from "react";

type DocumentHeadOptions = {
  title?: string;
  description?: string;
};

const BASE_TITLE = "ThinkCards";
const DEFAULT_DESCRIPTION =
  "Free flashcard app powered by the FSRS spaced repetition algorithm. Create decks, study offline, and build long-term memory.";

export const useDocumentHead = ({
  title,
  description,
}: DocumentHeadOptions) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;
    document.title = fullTitle;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", description ?? DEFAULT_DESCRIPTION);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", fullTitle);
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute("content", description ?? DEFAULT_DESCRIPTION);
    }

    return () => {
      document.title = BASE_TITLE;
    };
  }, [title, description]);
};
