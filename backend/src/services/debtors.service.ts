import { debtorRepository } from "../repositories/debtors.repository";
import { NotFoundError } from "../middlewares/errorHandler.middleware";

export const debtorsService = {
  async list(userId: string) {
    return debtorRepository.findAllByUser(userId);
  },

  async getById(userId: string, id: string) {
    const debtor = await debtorRepository.findByUserAndId(userId, id);
    if (!debtor) throw new NotFoundError("Deudor");
    return debtor;
  },

  async create(userId: string, data: { fullName: string; phone: string; notes?: string }) {
    return debtorRepository.create({
      userId,
      fullName: data.fullName,
      phone: data.phone,
      notes: data.notes,
    });
  },

  async update(
    userId: string,
    id: string,
    data: { fullName?: string; phone?: string; notes?: string }
  ) {
    const existing = await debtorRepository.findByUserAndId(userId, id);
    if (!existing) throw new NotFoundError("Deudor");
    return debtorRepository.update(id, data);
  },

  async delete(userId: string, id: string) {
    const existing = await debtorRepository.findByUserAndId(userId, id);
    if (!existing) throw new NotFoundError("Deudor");
    return debtorRepository.delete(id);
  },

  async search(userId: string, query: string) {
    return debtorRepository.searchByUser(userId, query);
  },
};
