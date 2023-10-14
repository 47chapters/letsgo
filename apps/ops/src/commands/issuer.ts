import { Command } from "commander";
import add from "./issuer-add";
import rm from "./issuer-rm";
import ls from "./issuer-ls";

const program = new Command();

program
  .name("issuer")
  .summary("Manage JWT issuers")
  .description(
    [
      `Add, remove, and list trusted issuers of JWT tokens required to authenticate access to the API and Web. `,
      `Issuers can be specified by providing a JSON Web Key Set (JWKS) URI. PKI-based issuers can also be generated.`,
    ].join("")
  )
  .addCommand(ls)
  .addCommand(add)
  .addCommand(rm);

export default program;
