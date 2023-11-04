import { Command } from "commander";
import configLs from "./config-ls";
import configGet from "./config-get";
import configSet from "./config-set";

const program = new Command();

program
  .name("config")
  .summary("Manage configuration")
  .description(
    `Manage configuration settings for all components of the deployment`
  )
  .addCommand(configLs)
  .addCommand(configGet)
  .addCommand(configSet);

export default program;
