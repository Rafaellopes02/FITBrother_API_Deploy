# Project IV - FITBrother API #

## Requirements ## 

 * You need to install Node.js beforehand
 * This solution was tested with node version 23.10.0 and npm version 10.9.2
 * Check the package.json file for the dependencies that need to be installed

## Basic Setup ## 

 * At the moment the project is running locally so create the PostgreSQL database beforehand
 * Fill .env file with your database information

## Notes / Rules and Recommendations ##

 * ⚠️ **Never push the .env file to git** 

## Project Structure

FITBrother_API/ <br />
│ <br />
├── node_modules/ <br />
├── public/ <br />
│   └── swagger.json <br />
├── src/ <br />
│   ├── controllers/ <br />
│   │   ├── userController.js <br />
│   │   └── ... <br />
│   ├── routes/ <br />
│   │   ├── userRoutes.js <br />
│   │   └── ... <br />
│   ├── utils/ <br />
│   │   ├── passwordUtils.js <br />
│   │   └── ... <br />
│   ├── app.js <br />
│   └── db.js <br />
├── package.json <br />
├── package-lock.json <br />
└── README.md


## Commands to test the API with swagger

* In your terminal:

Before running the API use the following command to install the necessary packages:
```bash
npm install
```

Then run with the following:
 ```bash
 npm run dev
 ```

 * In your browser: `http://localhost:<your-port>/api-docs`

The default port is 3001.
