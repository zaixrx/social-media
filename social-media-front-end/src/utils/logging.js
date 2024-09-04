import { toast } from "sonner";

export function showMessage(...messages) {
  let fullMessage = messages[0];

  for (let i = 1; i < messages.length; i++) {
    fullMessage += ` ${messages[i]}`;
  }

  toast.error(fullMessage, {
    duration: 3000,
  });
}
