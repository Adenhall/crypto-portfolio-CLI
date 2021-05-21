#!/usr/bin/env ts-node

import { Command } from "commander";
require('dotenv').config()
import { IBaseCommand } from "./commands/baseCommand";
import GetPortfolioCommand from "./commands/getPortfolio";

/** List of commands */
const commands: IBaseCommand[] = [new GetPortfolioCommand()];

async function bootstrap() {
  console.log("Welcome to Propine CLI");

  const program = new Command();

  for (let i = 0; i < commands.length; i++) {
    commands[i].load(program);
  }

  program.parse(process.argv);
}
bootstrap();
