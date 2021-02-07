import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactionToBeDeleted = await transactionsRepository.findOne({
      id,
    });

    if (transactionToBeDeleted) {
      await transactionsRepository.remove(transactionToBeDeleted);

      return;
    }

    throw new AppError('Transaction not found', 400);
  }
}

export default DeleteTransactionService;
