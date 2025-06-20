// Service to handle all browser/Chrome API interactions for notifications and alarms

/**
 * Creates an alarm with the specified name and timing
 */
export const createAlarm = (name: string, periodInMinutes: number): Promise<void> => {
  console.log('create alarm')
  return new Promise((resolve) => {
    chrome.alarms.create(name, {
      delayInMinutes: 1,
      periodInMinutes
    });
    resolve();
  });
};

/**
 * Clears an alarm with the specified name
 */
export const clearAlarm = (name: string): Promise<boolean> => {
  return new Promise((resolve) => {
    chrome.alarms.clear(name, (wasCleared) => {
      resolve(wasCleared);
    });
  });
};

/**
 * Gets all active alarms
 */
export const getAllAlarms = (): Promise<chrome.alarms.Alarm[]> => {
  return new Promise((resolve) => {
    chrome.alarms.getAll((alarms) => {
      console.log('get all alarms', alarms);
      resolve(alarms);
    });
  });
};

/**
 * Saves user preferences to storage
 */
export const savePreferences = (preferences: Record<string, any>): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set(preferences, () => {
      resolve();
    });
  });
};

/**
 * Loads user preferences from storage
 */
export const loadPreferences = (keys: string[]): Promise<Record<string, any>> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      resolve(result);
    });
  });
};

/**
 * Gets the next scheduled reminder time and name
 */
export const getNextReminderInfo = async (): Promise<{ name: string, time: Date } | null> => {
  const alarms = await getAllAlarms();

  if (alarms.length === 0) {
    return null;
  }

  // Find the next scheduled alarm
  const nextAlarm = alarms.reduce((earliest, alarm) =>
    !earliest || (alarm.scheduledTime < earliest.scheduledTime) ? alarm : earliest, null);

  if (nextAlarm && nextAlarm.scheduledTime) {
    return {
      name: nextAlarm.name,
      time: new Date(nextAlarm.scheduledTime)
    };
  }

  return null;
};

/**
 * Initialize default alarms if they don't exist
 */
export const initializeDefaultAlarms = async (): Promise<void> => {
  const prefs = await loadPreferences(['hydrationOn', 'standUpOn']);

  // Set defaults if not found in storage
  const hydrationOn = prefs.hydrationOn !== undefined ? prefs.hydrationOn : true;
  const standUpOn = prefs.standUpOn !== undefined ? prefs.standUpOn : true;

  // Create alarms based on preferences
  if (hydrationOn) {
    await createAlarm('drinkWater', 60); // Every 60 minutes
  }

  if (standUpOn) {
    await createAlarm('standUp', 45); // Every 45 minutes
  }

  // Save default preferences if they weren't already set
  if (prefs.hydrationOn === undefined || prefs.standUpOn === undefined) {
    await savePreferences({
      hydrationOn: hydrationOn,
      standUpOn: standUpOn
    });
  }
};
