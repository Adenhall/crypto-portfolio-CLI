## Crypto portfolio 
### How to start using the CLI
At root:
1. Added CryptoCompare API key into .env file
2. Run `npm install -g .` to install the CLI globally
3. Run `propine --help` to list all avaiable commands
4. Run `propine get-portfolio` to get the latest portfolio

### Dependencies
- `commander`: Easy to setup commands
- `axios`: After going through hell with Node.js https calls, this library made my life a lot easier
- `csv-parser`: Nice parsing library with good popularity
- `dotenv`: To hide API keys

### Solution design
- At first, I was going to have only a `index.ts` file (Which is now an `app.ts`) and run the command there. But then I wanted to have a little scalability to the project so I made command services separately and import them in app.ts where `bootstrap()` iterate through avaiable commands

- I use Typescript instead of Javascript because I want this project to be the best developer experience with type-safety (The same as my other projects)

- To the main process of parsing the CSV, the file was too large so there was not enough memory for it so I use the `createReadStream()` from Node.js to cut the data into chunks so I can assign new values for `result` object

- With the data being a `result` object, I can quickly do single queries which are great for performance
