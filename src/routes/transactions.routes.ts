import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import TransactionsRepository from '../repositories/TransactionsRepository';

import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/uploadConfig';

/*
POST /transactions: A rota deve receber title, value, type, e category dentro do corpo da requisição,
sendo o type o tipo da transação, que deve ser income para entradas (depósitos) e outcome para saídas (retiradas).
Ao cadastrar uma nova transação, ela deve ser armazenada dentro do seu banco de dados, possuindo
os campos id, title, value, type, category_id, created_at, updated_at.

Dica: Para a categoria, você deve criar uma nova tabela, que terá os campos id, title, created_at, updated_at.

Dica 2: Antes de criar uma nova categoria, sempre verifique se já existe uma categoria com o mesmo título. Caso ela exista, use o id já existente no banco de dados.

GET /transactions: Essa rota deve retornar uma listagem com todas as transações que você cadastrou até agora,
junto com o valor da soma de entradas, retiradas e total de crédito.
Essa rota deve retornar um objeto o seguinte formato:
*/

const upload = multer(uploadConfig);
const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find();

  const balance = transactionsRepository.getBalance(transactions);

  const transactionsWithBalance = {
    transactions,
    balance,
  };
  return response.json(transactionsWithBalance);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  return response.status(200).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();

    const transactions = await importTransactionsService.execute(
      request.file.path,
    );

    return response.json(transactions);
  },
);

export default transactionsRouter;
