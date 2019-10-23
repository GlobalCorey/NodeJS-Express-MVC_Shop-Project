# NodeJS-Express-MVC_Shop-Project
A nodejs web application for a mock online shop. Utilizes ExpressJS, mongoDB, and an MVC architecture. This project was built to hone some much needed web-dev skills.


For this to work outside of a Heroku environment, a couple things need to be set.

<div>
  <ul>
    <li>
     In controllers/auth.js
      <ul>
        <li>
          There needs to be a SendGrid API key in the auth object
        </li>
      </ul>
    </li>
    <li>
     In utils/database.js
      <ul>
        <li>
           A mongoDB URL needs to be set. Granted this can be replaced with a process.env variable.
        </li>
      </ul>
    </li>
    <li>
      In package.json
      <ul>
        <li>
          For non-dev operation, the passed values in the start script can be set.
        </li>
      </ul>
    </li>
    <li>
     In nodemon.json
     <ul>
        <li>
          For dev operation, the values can be set here.
        </li>
      </ul>
    </li>
  </ul>
</div>



