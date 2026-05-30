const DONE_KEY = "tc_onboarding_survey_done";
const PENDING_KEY = "tc_onboarding_survey_pending";

export const requestOnboardingSurvey = (): void => {
  sessionStorage.setItem(PENDING_KEY, "1");
};

export const isOnboardingSurveyPending = (): boolean =>
  !localStorage.getItem(DONE_KEY) && !!sessionStorage.getItem(PENDING_KEY);

export const markOnboardingSurveyDone = (): void => {
  localStorage.setItem(DONE_KEY, "1");
  sessionStorage.removeItem(PENDING_KEY);
};
