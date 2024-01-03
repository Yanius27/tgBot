const TelegramApi = require('node-telegram-bot-api');
const { gameOptions, againOptions } = require('./options');
const sequelize = require('./db');
const UserModel = require('./models');

const token = '6680932824:AAFYgke7CXcLt9kTwbN9Tl6Xqk-g0DHXs3k';

const bot = new TelegramApi(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, ' Сейчас я загадаю число от 0 до 9, а вы должны его отгадать!');
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, 'Отгадывайте!', gameOptions);
}

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (error) {
    console.log('Подключение к БД нарушено');
  }

  bot.setMyCommands([
    {command: '/start', description: 'Начальное приветствие'},
    {command: '/info', description: 'Получить информацию о пользователе'},
    {command: '/game', description: 'Игра. Угадай число от 0 до 9'}
  ]);

  bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
 
    try {
      if (text === '/start') {
       await UserModel.sync({chatId});
        return bot.sendMessage(chatId, 'Добро пожаловать в наш телеграм-бот!');
      }
      if (text === '/info') {
        const user = await UserModel.findOne({chatId});
        return bot.sendMessage(chatId, `Вас зовут: ${msg.from.first_name} ${msg.from.last_name}, верных ответов ${user.right}, неверных ответов ${user.wrong}`);
      }
      if (text === '/game') {
        return startGame(chatId);
      }
      return bot.sendMessage(chatId, 'Я не понимаю. Попробуйте написать что-нибудь ещё раз!');
    } catch (error) {
      return bot.sendMessage(chatId, 'Что-то пошло не так!'); 
    }
  });
  
  bot.on('callback_query', async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    if (data === '/again') {
      return startGame(chatId);
    }
    const user = await UserModel.findOne({chatId});
    if (data == chats[chatId]) {
      user.right += 1;
      await bot.sendMessage(chatId, 'Вы угадали!', againOptions);
    } else {
      user.wrong += 1;
      await bot.sendMessage(chatId, `Неверно:( Бот загадал число ${chats[chatId]}`, againOptions);
    }
    await user.save();
  });
}

start();
