# icorating API
Запуск скрипта на сервере Ubuntu

## Необходимые программы
- Перейдите в корневую папку на сервере и установите выполните следующие команды:
```
apt-get update
apt-get install nodejs-legacy npm git
npm install -g pm2 npm n
n stable
```

## Необходимо зарегистрироваться на сайте etherscan.io и получить ключ API

## Запуск скрипта
- Скачайте с репозиторий и перейдите в папку с файлами
- Создайте папку `logs`
- Задайте свои конфигурации скрипта: создайте дубликат файла `.env.sample` переименуйте его в `.env`, зайдите в него и пропишите настройки. Пример файла `.env`:
```
#NODE_ENV=development
NODE_ENV=production

SITE=https://your-site.com
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=user
DB_PASSWORD=password
DB_DATABASE=database_name

API_BLOCKCHAIN=
API_ETHERSCAN=api_key_from_etherscan.io
```

- Выполните следующие команды для запуска скрипта:
```
npm install
npm run build
```

## Посмотреть состояние скрипта и логи
- логи об ошибках хранятся в папке `logs`
- команда `pm2 status` выводит информацию о запущенных демон-скриптах
- команда `pm2 logs` выводит информацию о логах выполнения демон-скриптов
