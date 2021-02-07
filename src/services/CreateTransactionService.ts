import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (type === 'outcome') {
      const transactions = await transactionsRepository.find();
      const balance = transactionsRepository.getBalance(transactions);

      if (balance.total < value) {
        throw new AppError('Invalid balance, you cant buy anything.');
      }
    }

    const findCategoryExistence = await categoriesRepository.findOne({
      title: category,
    });

    if (findCategoryExistence) {
      const category_id = findCategoryExistence.id;
      const transaction = transactionsRepository.create({
        title,
        value,
        type,
        category_id,
      });

      await transactionsRepository.save(transaction);

      return transaction;
    }

    const newCategory = categoriesRepository.create({ title: category });

    await categoriesRepository.save(newCategory);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: newCategory.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
