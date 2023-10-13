import { Command } from "commander";
import dbPut from "./db-put";
import dbGet from "./db-get";
import dbRm from "./db-rm";
import dbList from "./db-ls";

const program = new Command();

program
  .name("db")
  .summary("Manage data in the dabatase")
  .description(`Manage data in the DynamoDB database`)
  .addCommand(dbList)
  .addCommand(dbGet)
  .addCommand(dbPut)
  .addCommand(dbRm);

export default program;
