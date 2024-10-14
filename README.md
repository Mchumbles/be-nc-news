# Northcoders News API

This project needs specific environment variables to connect to the databases locally. As the .env files are included in the .gitignore folder, they aren't tracked in the repo.
If you've cloned this repo will need to manually create these files.

You'll need to create two env. files.

.env.test
.env.development

each file will need each line of code respectively.

PGDATABASE=nc_news_test
PGDATABASE=nc_news

ensure you have npm installed.

npm run setup-dbs --- to setup the databases
npm run seed --- to seed the databases

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
