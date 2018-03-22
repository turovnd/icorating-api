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

ICOBENCH_PUBLIC_KEY=public_key_from_icobench
ICOBENCH_PRIVATE_KEY=private_key_from_icobench

API_BING=key_for_creating_azure_search_api_sercive
TELEGRAM_TOKEN=487424834:AAGZMI5yV2MwpnVCOw8_cOEd3eUf_dfXjmk
FACEBOOK_APP_ID=1861060970585441
FACEBOOK_SECRET=Cb4Ql8n0lbsb0JxBvOwFJqzaI80

MAINREST_GROUP=ICOrating

PEOPLE_IMAGES_PATH=/tmp/

# Time in hours
PEOPLE_SCRAPER_TIME=24
```
- Установите зависимости npm:
```
npm install
```
- Внесите IP адрес серверев white list на сайте https://icobench.com/developers#manage_api_access

## Запуск/остановка скрипта
```
npm run prod:<module>:<option>
<module> = wallets || people || hype || api
<option> = start || stop || restart || delete
```
- Все модули работают не зависимо, для отображения информации на фронте, необходимо, чтобы был запущен модуль `api`
- `wallets` - каждые 12 часов берет информацию о всех Projects из БД и обновляет информацию по балансу кошельков проекта.
- `people` - каждые 24 часа берет информацию с icoBench, обновляет сведения в БД и записывает изображения в папку `~/assets/people`
- `hype` - каждые 24 часа берет информацию о всех ICO из БД и обновляет информацию о scores.

## Посмотреть состояние скрипта и логи
- логи об ошибках хранятся в папке `logs`
- команда `pm2 status` выводит информацию о запущенных демон-скриптах
- команда `pm2 logs` выводит информацию о логах выполнения демон-скриптов
- команда `pm2 logs <App name>` выводят информацию логов конкретного демон-скрипта

## Внести изменения с гита
- перейдите в папку, где располагается проект
- остановите скрипт, выполнив команду: `npm run stop`
- притяните изменения с github: `git pull origin`
- обновите зависимости `npm`: `npm update`
- запустите скрипт
