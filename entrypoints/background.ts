import { initializeDefaultAlarms } from '@/src/services/notificationService';

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  // Initialize default alarms on installation
  chrome.runtime.onInstalled.addListener(async () => {
    try {
      console.log('initializing_default_alarms');
      await initializeDefaultAlarms();
    } catch (e) {
      console.log('error_initializing_alarms', e);
    }
  });

  // Handle alarm events
  chrome.alarms.onAlarm.addListener((alarm: any) => {
    const message: string =
      alarm.name === 'drinkWater'
        ? 'Đến giờ uống nước rồi 💧'
        : 'Hết phiên làm việc, hãy đứng lên đi lại chút 🧍‍♂️';

    console.log('alarm fired', alarm, message);
    chrome.notifications.create({
      iconUrl: 'wxt.svg',
      type: 'basic',
      title: '❗️Nhắc nhở',
      message,
      priority: 2,
    });
  });
});
