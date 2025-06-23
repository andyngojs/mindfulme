import React, { useState, useEffect } from 'react';
import * as Switch from '@radix-ui/react-switch';
import {
  createAlarm,
  clearAlarm,
  loadPreferences,
  savePreferences,
  getNextReminderInfo,
} from '@/src/services/notificationService';

const Popup = () => {
  const [hydrationOn, setHydrationOn] = useState(true);
  const [standUpOn, setStandUpOn] = useState(true);
  const [nextReminder, setNextReminder] = useState('...');

  useEffect(() => {
    const grantedNoti = chrome.permissions.contains({
      permissions: ['notifications'],
      origins: ['*://*/']
    });
    if (!grantedNoti) {
      chrome.permissions.request({
        permissions: ['notifications'],
        origins: ['*://*/']
      }, (granted: boolean) => {
        if (granted) {
          console.log('Permission granted');
        } else {
          alert('Extension must need granted permission to show notifications.');
        }
      });
      return;
    }

    // Load saved preferences from storage
    loadPreferences(['hydrationOn', 'standUpOn']).then(result => {
      setHydrationOn(
        result.hydrationOn !== undefined ? result.hydrationOn : true
      );
      setStandUpOn(result.standUpOn !== undefined ? result.standUpOn : true);
    });

    // Get next alarm time
    updateNextReminderTime();
  }, []);

  const updateNextReminderTime = async () => {
    const nextAlarmInfo = await getNextReminderInfo();

    if (!nextAlarmInfo) {
      setNextReminder('No active reminders');
      return;
    }

    const { name, time } = nextAlarmInfo;
    const formattedName = name === 'drinkWater' ? 'uống nước' : 'đứng dậy';
    setNextReminder(
      `Chuẩn bị ${formattedName} vào ${time.toLocaleTimeString()}`
    );
  };

  const handleHydrationChange = async (checked: boolean) => {
    setHydrationOn(checked);
    await savePreferences({ hydrationOn: checked });

    if (checked) {
      await createAlarm('drinkWater', 60);
    } else {
      await clearAlarm('drinkWater');
    }

    // Update the next reminder display
    setTimeout(updateNextReminderTime, 300);
  };

  const handleStandUpChange = async (checked: boolean) => {
    setStandUpOn(checked);
    await savePreferences({ standUpOn: checked });

    if (checked) {
      await createAlarm('standUp', 15);
    } else {
      await clearAlarm('standUp');
    }

    // Update the next reminder display
    setTimeout(updateNextReminderTime, 300);
  };

  const testNotify = () => {
    console.log('test notify');
    chrome.notifications.create({
      iconUrl: 'wxt.svg',
      type: 'basic',
      title: '❗️Test Nhắc nhở',
      message: 'Hết phiên làm việc, hãy đứng lên đi lại chút 🧍‍♂️',
      priority: 2,
    });
  };

  return (
    <div className='w-80 p-4 bg-white text-gray-800 font-sans'>
      <h1 className='text-xl font-semibold text-blue-600 mb-4'>💧 MindfulMe</h1>

      <div className='space-y-3'>
        <div className='flex items-center justify-between border-b border-gray-200 py-2'>
          <label htmlFor='hydration-switch' className='text-sm font-medium'>
            Nhắc nhở uống nước
          </label>
          <Switch.Root
            id='hydration-switch'
            className='w-10 h-5 bg-gray-300 rounded-full relative data-[state=checked]:bg-blue-500 transition-colors'
            checked={hydrationOn}
            onCheckedChange={handleHydrationChange}
          >
            <Switch.Thumb className='block w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]' />
          </Switch.Root>
        </div>

        <div className='flex items-center justify-between border-b border-gray-200 py-2'>
          <label htmlFor='standup-switch' className='text-sm font-medium'>
            Nhắc nhở đứng dậy
          </label>
          <Switch.Root
            id='standup-switch'
            className='w-10 h-5 bg-gray-300 rounded-full relative data-[state=checked]:bg-blue-500 transition-colors'
            checked={standUpOn}
            onCheckedChange={handleStandUpChange}
          >
            <Switch.Thumb className='block w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]' />
          </Switch.Root>
        </div>
      </div>

      <div className='mt-4 text-sm text-gray-600 bg-gray-50 p-2 rounded'>
        ⏰ <strong>Lời nhắc tiếp theo:</strong> {nextReminder}
      </div>

      <div className={'mt-4'}>
        <button
          className={
            'bg-gray-100 hover:bg-gray-200 text-neutral-500 py-2 px-4 rounded'
          }
          onClick={testNotify}
        >
          Test Notification
        </button>
      </div>

      <footer className='mt-6 text-center text-xs text-gray-400'>
        © 2025 DobeeTeam. Developed by AndyngoJs.
      </footer>
    </div>
  );
};

export default Popup;
