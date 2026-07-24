import { settingsRepository } from "../repositories/settings.repository";

export const settingsService = {
  async get(userId: string) {
    const settings = await settingsRepository.findByUser(userId);
    return settings || { userId, whatsappNumber: null, fullName: null, reminderTemplate: null, agreementTemplate: null };
  },

  async update(userId: string, data: {
    whatsappNumber?: string;
    fullName?: string;
    reminderTemplate?: string;
    agreementTemplate?: string;
  }) {
    return settingsRepository.upsert(userId, data);
  },
};
