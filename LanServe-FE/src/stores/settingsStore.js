import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // Notification settings
      notifications: {
        emailNotifications: true,
        newProjectNotifications: true,
        messageNotifications: true,
      },

      // Privacy settings
      privacy: {
        publicProfile: true,
        showOnlineStatus: false,
      },

      // Update notification settings
      updateNotificationSettings: (key, value) => {
        const currentNotifications = get().notifications;
        const updated = { ...currentNotifications, [key]: value };
        set({ notifications: updated });
      },

      // Update privacy settings
      updatePrivacySettings: (key, value) => {
        const currentPrivacy = get().privacy;
        const updated = { ...currentPrivacy, [key]: value };
        set({ privacy: updated });
      },
    }),
    {
      name: "lanserve-settings",
      partialize: (state) => ({
        notifications: state.notifications,
        privacy: state.privacy,
      }),
    }
  )
);
