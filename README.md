# Northcoders News API

## Hosted Version - https://be-nc-news-mwge.onrender.com

The Northcoders News API is a RESTful API built with Node.js and Express, providing endpoints to manage and access a collection of articles, topics, comments, and users. It was built during my time on the Northcoders Software Development Bootcamp and has been designed to serve as a backend solution for a news application. The project was constructed using Test-Driven Development (TDD), which ensured high code quality and reliability throughout the development process.

## Features

- Retrieve articles and their associated comments
- Filter articles by topics
- Post and delete comments
- Increment article votes
- Get detailed information about available API endpoints

## Prerequisites

Please ensure you have the following installed:

- Node.js (minimum version: 14.x)
- PostgreSQL (minimum version: 12.x)

## Getting Started

To get a local copy of the project, run:

git clone https://github.com/Mchumbles/be-nc-news.git
cd be-nc-news

## Environment Variables

This project needs specific environment variables to connect to the databases locally. As the .env files are included in the .gitignore folder, they aren't tracked in the repo.
If you've cloned this repo, you will need to manually create these files.

You'll need to create two env. files:

.env.test
.env.development

Each file will need each line of code respectively:

PGDATABASE=nc_news_test
PGDATABASE=nc_news

## Installing Dependencies

Ensure you have installed the project dependencies by running:

npm install

## Database Setup

To setup the databases:

npm run setup-dbs

To seed the databases:

npm run seed

## Running Tests

To run the test suite:

npm test

## Acknowledgments

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
