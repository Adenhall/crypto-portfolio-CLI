import commander from "commander";
import csv from "csv-parser";
import fs from "fs";
import axios from "axios";
import { IBaseCommand } from "./baseCommand";

type GetPortfolioArgs = {
  /** Token from CSV */
  token?: string;
  /** Date from CSV */
  date?: string;
};

type PortfolioResult = {
  /** Amount of crypto currency */
  [key: string]: number;
};

export default class GetPortfolioCommand implements IBaseCommand {
  load(program: commander.Command): void {
    program
      .command("get-portfolio")
      .arguments("<pathToCSV>")
      .option("-t --token [input]", "Provide a token to query from CSV")
      .option(
        "-d --date [input]",
        "Provide a date to query CSV. Date should be in ISO format, milliseconds or MM/DD/YY"
      )
      .action(async (pathToCSV: string, input: GetPortfolioArgs) => {
        const { token, date } = input;

        /** Result from parsing the CSV file */
        let result: PortfolioResult = {};

        /** Data stream from reading the CSV file */
        const readStream = fs.createReadStream(pathToCSV).pipe(csv());

        // Begin processing CSV file
        readStream
          .on("data", (row) => {
            // Break out of data stream if iterate pass the given date
            if (date && new Date(date).getTime() >= parseInt(row.timestamp)) {
              readStream.destroy();
            }

            // Assign 0 to newly added attribute
            isNaN(result[row.token]) && (result[row.token] = 0);

            // Determine whether to deduct or add up amount of crypto based on transaction type
            row.transaction_type === "DEPOSIT"
              ? (result[row.token] += parseFloat(row.amount))
              : (result[row.token] -= parseFloat(row.amount));
          })
          .on("close", async () => {
            try {
              const allCurrencies = Object.keys(result);

              /** The latest crypto value in USD */
              const cryptVal = await axios
                .get(
                  `${
                    process.env.API_URL
                  }/data/pricemulti?fsyms=${allCurrencies.toString()}&tsyms=USD&api_key=${
                    process.env.CRYPTOCOMPARE_API_KEY
                  }`
                )
                .then((res) => res.data);

              // Iterate through the currencies to calculate latest value in USD
              allCurrencies.map(
                (curr) =>
                  (result[curr] = Math.round(result[curr] * cryptVal[curr].USD))
              );

              if (token) {
                console.log(
                  `${date ? `On ${date}` : "Currently"}, you have ${
                    result[token]
                  } USD worth of ${token}`
                );
              } else {
                console.log(
                  `Your portfolio in USD (${
                    date ? `At ${date}` : "Currently"
                  }): `
                );
                console.table(result);
              }
            } catch (error) {
              console.log(error.message);
            }
          })
          .on("error", (error) => console.log("Uh oh ", error.message));
      });
  }
}
