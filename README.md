# BEST Kyiv Website

## Getting started
1. Install [node.js](https://nodejs.org/en/download/current/)
2. Run `npm install` to install dependencies
3. Run `npm start` and go to http://localhost:3000

To buld ejs into html run `npm run build`  
Also in development mode with constant reassembly when template changes `npm run dev`

## Публікація на FTP-сервер
1. Відкрийте термінал у кореневій папці проєкту та запустіть `npm run package:ftp`. Команда автоматично збере сайт і підготує файли для публікації, зокрема `.htaccess`.
2. Знайдіть створену поруч із проєктом папку `ftp_lbg-site`.
3. Під’єднайтеся до FTP-сервера та відкрийте кореневу папку сайту — папку, де зараз розміщений його `index.html`.
4. Увімкніть показ прихованих файлів у FTP-клієнті. Завантажте **вміст** `ftp_lbg-site` у кореневу папку сайту та погодьтеся на перезапис наявних файлів. Не завантажуйте саму папку `ftp_lbg-site` або папку проєкту.
5. Переконайтеся, що файл `.htaccess` завантажився саме в кореневу папку сайту.
6. Перевірте обидві адреси у приватному вікні браузера. Браузер може кешувати постійний редирект (`301`).

## Templates and internationalization
As a template engine we use [EJS](https://ejs.co).
Therefore, only .ejs files must be edited. Do not edit .html manually.
See [this pull request](https://github.com/bestkyiv/lbg-site/pull/1)

