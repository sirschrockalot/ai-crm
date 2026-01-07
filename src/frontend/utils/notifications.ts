/**
 * Browser Notifications Utility
 * Handles browser push notifications for appointments and tasks
 */

export class NotificationService {
  private static permission: NotificationPermission = 'default';

  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  static async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return;
    }

    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn('Notification permission denied');
        return;
      }
    }

    const notification = new Notification(title, {
      icon: '/logo.svg',
      badge: '/logo.svg',
      tag: options?.tag || 'default',
      requireInteraction: options?.requireInteraction || false,
      ...options,
    });

    // Auto-close after 5 seconds unless requireInteraction is true
    if (!options?.requireInteraction) {
      setTimeout(() => notification.close(), 5000);
    }

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options?.onClick) {
        options.onClick();
      }
    };
  }

  static async checkAppointmentReminders(appointments: any[]): Promise<void> {
    const now = new Date();
    
    for (const appointment of appointments) {
      if (appointment.status !== 'scheduled' || !appointment.reminderSettings?.enabled) {
        continue;
      }

      const appointmentTime = new Date(appointment.startDate);
      const timeUntil = appointmentTime.getTime() - now.getTime();
      const minutesUntil = Math.floor(timeUntil / (1000 * 60));

      // Check if we're within the reminder window
      if (appointment.reminderSettings.timings) {
        for (const reminderMinutes of appointment.reminderSettings.timings) {
          // Show notification if we're within 1 minute of the reminder time
          if (minutesUntil >= reminderMinutes - 1 && minutesUntil <= reminderMinutes + 1) {
            await this.showNotification(
              `Appointment Reminder: ${appointment.title}`,
              {
                body: `Your appointment is in ${reminderMinutes} minutes`,
                tag: `appointment-${appointment.id}`,
                requireInteraction: reminderMinutes <= 15, // Require interaction for urgent reminders
                onClick: () => {
                  window.location.href = `/transactions/${appointment.transactionId}`;
                },
              }
            );
          }
        }
      }
    }
  }

  static async showTaskReminder(task: any): Promise<void> {
    await this.showNotification(
      `Task Reminder: ${task.title}`,
      {
        body: task.dueDate 
          ? `Due: ${new Date(task.dueDate).toLocaleDateString()}`
          : 'This task needs your attention',
        tag: `task-${task.id}`,
        requireInteraction: task.priority === 'urgent' || task.priority === 'high',
        onClick: () => {
          window.location.href = '/transactions/planning';
        },
      }
    );
  }
}

// Initialize permission on load
if (typeof window !== 'undefined') {
  NotificationService.requestPermission().catch(console.error);
}

