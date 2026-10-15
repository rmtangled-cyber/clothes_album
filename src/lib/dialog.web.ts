// react-native-web's Alert does nothing, so use the browser's own dialogs.

export function notify(title: string, message?: string) {
  window.alert(message ? `${title}\n${message}` : title);
}

export async function confirmDestructive(title: string, message: string, _confirmLabel: string): Promise<boolean> {
  return window.confirm(`${title}\n${message}`);
}
