import { historyRepository } from "../repositories/history.repository";

export const historyService = {
  async list(
    userId: string,
    filters?: { eventType?: string; startDate?: string; endDate?: string }
  ) {
    return historyRepository.findByUser(userId, filters);
  },

  async getByDebtor(debtorId: string) {
    return historyRepository.findByDebtor(debtorId);
  },

  async getByDebt(debtId: string) {
    return historyRepository.findByDebt(debtId);
  },
};
