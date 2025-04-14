import { env } from "@/env/server";

export const FeedbackLink = () => {
  if (!env.FEEDBACK_LINK) {
    return null;
  }

  return (
    <a
      className="text-sm text-fuchsia-900 dark:text-fuchsia-100"
      href={env.FEEDBACK_LINK}
    >
      Send feedback
    </a>
  );
};
