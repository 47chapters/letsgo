#!/usr/bin/env node

import { Command } from "commander";
import ls from "./commands/ls";
import get from "./commands/get";
import set from "./commands/set";
import rm from "./commands/rm";
import deploy from "./commands/deploy";

const program = new Command();

program
  .name("ops")
  .version(require("../package.json").version)
  .description(
    "DevOps tool for LetsGo - set up and manage your deployments in AWS."
  )
  .addCommand(ls)
  .addCommand(get)
  .addCommand(set)
  .addCommand(rm)
  .addCommand(deploy);

program.parse();
