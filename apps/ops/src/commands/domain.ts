import { Command } from "commander";
import domainAdd from "./domain-add";
import domainRm from "./domain-rm";
import domainStatus from "./domain-status";

const program = new Command();

program
  .name("domain")
  .summary("Manage custom domain names")
  .description(`Add or remove custom domain names for web and api components.`)
  .addCommand(domainAdd)
  .addCommand(domainRm)
  .addCommand(domainStatus);

export default program;
