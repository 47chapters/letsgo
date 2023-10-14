import { Command, Option } from "commander";
import { DefaultRegion, DefaultDeployment } from "@letsgo/constants";
import {
  createIssuer,
  getPkiIss,
  setActiveIssuer,
  addJwksIssuer,
} from "@letsgo/trust";
import chalk from "chalk";

const program = new Command();

program
  .name("add")
  .summary("Add a new trusted JWT issuer to the system")
  .description(
    [
      `Add a new trusted issuer of JWT tokens required to authenticate access to the API and Web. `,
      `You can request a new PKI-based issuer to be created, or establish trust to a third party issuer `,
      `by registering their JSON Web Key Set (JWKS) URL. There may be many trusted issuers configured. `,
      `Only one PKI issuer can be active at a time, which means it will be used to issue new JWT tokens. `,
    ].join("")
  )
  .option(`-r, --region <region>`, `The AWS region`, DefaultRegion)
  .option(`-d, --deployment <deployment>`, `The deployment`, DefaultDeployment)
  .addOption(
    new Option(
      `--issuer <issuer>`,
      `Unique identifier of an existing third-party issuer. This is often a URL.`
    ).conflicts(["pkiCreate", "pkiCreateOnly", "pkiActivate"])
  )
  .addOption(
    new Option(
      `--jwks <jwks>`,
      `The JWKS URL of the third party JWT issuer`
    ).conflicts(["pkiCreate", "pkiCreateOnly", "pkiActivate"])
  )
  .addOption(
    new Option(
      `--pki-create`,
      `Create a new PKI-based JWT issuer and set it as an active issuer`
    ).conflicts(["issuer", "jwks", "pkiCreateOnly", "pkiActivate"])
  )
  .addOption(
    new Option(
      `--pki-create-only`,
      `Create a new PKI-based JWT issuer without setting it as an active issuer`
    ).conflicts(["issuer", "jwks", "pkiCreate", "pkiActivate"])
  )
  .addOption(
    new Option(
      `--pki-activate <issuerId>`,
      `Set the existing PKI-based JWT issuer as active`
    ).conflicts(["issuer", "jwks", "pkiCreate", "pkiCreateOnly"])
  )
  .action(async (options) => {
    if (
      !options.issuer &&
      !options.pkiCreate &&
      !options.pkiActivate &&
      !options.pkiCreateOnly
    ) {
      console.log(
        chalk.red(
          `One of '--issuer', '--pki-create', '--pki-create-only', or '--pki-activate' must be specified`
        )
      );
      process.exit(1);
    }
    if (options.issuer && !options.jwks) {
      console.log(
        chalk.red(`When '--issuer' is specified, '--jwks' is also required.`)
      );
      process.exit(1);
    }
    try {
      if (options.pkiCreate || options.pkiCreateOnly) {
        const result = await createIssuer(!!options.pkiCreate, options);
        console.log(
          chalk.green(`Issuer`),
          chalk.bold(getPkiIss(result)),
          chalk.green(
            `created${options.pkiCreate ? " and set to active" : ""}.`
          )
        );
      }
      if (options.pkiActivate) {
        await setActiveIssuer(options.pkiActivate, options);
        console.log(
          chalk.green(`Issuer`),
          chalk.bold(options.pkiActivate),
          chalk.green(`set to active.`)
        );
      }
      if (options.jwks) {
        await addJwksIssuer(options.issuer, options.jwks, options);
        console.log(
          chalk.green(`Issuer`),
          chalk.bold(options.issuer),
          chalk.green(`added as a trusted issuer.`)
        );
      }
    } catch (e: any) {
      console.log(chalk.red(e.message));
      process.exit(1);
    }
  });

export default program;
