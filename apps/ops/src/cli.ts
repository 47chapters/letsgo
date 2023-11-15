import { Command } from "commander";
import config from "./commands/config";
import rm from "./commands/rm";
import deploy from "./commands/deploy";
import status from "./commands/status";
import stop from "./commands/stop";
import start from "./commands/start";
import restart from "./commands/restart";
import domain from "./commands/domain";
import db from "./commands/db";
import issuer from "./commands/issuer";
import jwt from "./commands/jwt";

export const cli = new Command();

cli
  .name("ops")
  .version(require("../package.json").version)
  .description(
    "DevOps tool for LetsGo - set up and manage your deployments in AWS."
  )
  .addCommand(config)
  .addCommand(deploy)
  .addCommand(status)
  .addCommand(stop)
  .addCommand(start)
  .addCommand(restart)
  .addCommand(rm)
  .addCommand(domain)
  .addCommand(db)
  .addCommand(issuer)
  .addCommand(jwt);
