// src/utils/notificationService.js
// Standard Web Push Notification API & Service Worker Registration Engine

let swRegistration = null;

export async function registerAllInServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    swRegistration = reg;
    return reg;
  } catch {
    return null;
  }
}

export function getNotificationPermissionState() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission; // 'granted' | 'denied' | 'default'
}

export async function requestDeviceNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const status = await Notification.requestPermission();
    return status;
  } catch {
    return Notification.permission;
  }
}

export async function triggerDeviceNotification(
  title = 'All In — Protocol Update',
  body = 'Daily recomp telemetry synced.',
  tag = `allin-${Date.now()}`
) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await requestDeviceNotificationPermission();
  }
  if (permission !== 'granted') {
    return false;
  }

  try {
    const reg =
      swRegistration ||
      ('serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null);

    if (reg && 'showNotification' in reg) {
      await reg.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag,
        vibrate: [120, 60, 120],
        data: { url: '/' },
      });
      return true;
    }

    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: { title, body, tag },
      });
      return true;
    }

    new Notification(title, {
      body,
      icon: '/icon-192.png',
      tag,
    });
    return true;
  } catch {
    return false;
  }
}

export function scheduleDeviceNotification(
  title,
  body,
  delayMs = 5000,
  tag = `allin-sched-${Date.now()}`
) {
  return setTimeout(() => {
    triggerDeviceNotification(title, body, tag);
  }, Math.max(500, Number(delayMs) || 5000));
}

