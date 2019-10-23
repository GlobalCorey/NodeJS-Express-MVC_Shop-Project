# NodeJS-Express-MVC_Shop-Project
A nodejs web application for a mock online shop. Utilizes ExpressJS, mongoDB, and an MVC architecture. This project was built to hone some much needed web-dev skills.


For this to work outside of a Heroku environment, a couple things need to be set.

In controllers/auth.js
  There needs to be a SendGrid API key in the auth object
In utils/database.js
  A mongoDB URL needs to be set. Granted this can be replaced with a process.env variable.
In package.json
  For non-dev operation, the passed values in the start script can be set.
In nodemon.json
  For dev operation, the values can be set here.
