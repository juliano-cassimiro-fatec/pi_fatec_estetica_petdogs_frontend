export const toastEventName = "petdogs:toast";

export interface ToastDetail {
  message: string;
}

export function showToast(message: string) {
  window.dispatchEvent(new CustomEvent<ToastDetail>(toastEventName, { detail: { message } }));
}
