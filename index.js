const TelegramApi = require('node-telegram-bot-api');
const { gameOptions, againOptions } = require('./options');

const token = '6680932824:AAFYgke7CXcLt9kTwbN9Tl6Xqk-g0DHXs3k';

const bot = new TelegramApi(token, { polling: true });

const chats = {};

bot.setMyCommands([
  {command: '/start', description: 'Начальное приветствие'},
  {command: '/info', description: 'Получить информацию о пользователе'},
  {command: '/game', description: 'Игра. Угадай число от 0 до 9'}
]);

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, ' Сейчас я загадаю число от 0 до 9, а вы должны его отгадать!');
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, 'Отгадывайте!', gameOptions);
}

bot.on('message', (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;
  if (text === '/start') {
    return bot.sendMessage(chatId, 'Добро пожаловать в наш телеграм-бот!');
  }
  if (text === '/info') {
    return bot.sendMessage(chatId, `Вас зовут: ${msg.from.first_name} ${msg.from.last_name}`);
  }
  if (text === '/game') {
    return startGame(chatId);
  }
  return bot.sendMessage(chatId, 'Я не понимаю. Попробуйте написать что-нибудь ещё раз!');
});

bot.on('callback_query', async (msg) => {
  const data = msg.data;
  const chatId = msg.message.chat.id;
  if (data === '/again') {
    return startGame(chatId);
  }
  if (data === chats[chatId]) {
    return bot.sendMessage(chatId, 'Вы угадали!', againOptions);
  } else {
    return bot.sendMessage(chatId, `Неверно:( Бот загадал число ${chats[chatId]}`, againOptions);
  }
});