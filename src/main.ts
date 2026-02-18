#!/usr/bin/env node

import { Command, InvalidArgumentError, Option } from "commander";
import logger from "./logger";
import { ReportType } from "./contants/reporting";
import CardTradeService from "./services/CardTradeService";
import App from "./App";
import { isValid } from "date-fns";

const program = new Command();

let app: App;

program
  .name("altered-tcg-cli")
  .description("Altered TCG CLI to interact with altered.gg website")
  .addOption(
    new Option(
      "-auth, --auth <string>",
      `
The access-token you can get by going on https://www.altered.gg/api/auth/session after being logged in on https://www.altered.gg. 
You can also set the ALTERED_AUTH env variable.
The access-token, it will expires after around 1 hour.
`
    )
      .env("ALTERED_AUTH")
      .makeOptionMandatory(true)
  )
  .version("1.0.0")
  .hook("preAction", async () => {
    app = new App({
      auth: program.opts().auth,
    });
    await app.connect();
  })
  .hook("postAction", async () => {
    await app.close();
  });

program
  .command("list-traded-cards")
  .description("List all bought and sold cards from newest to oldest.")
  .addOption(
    new Option("-r, --report-type <string>", "The report type to generate.")
      .default(ReportType.HTML)
      .choices(Object.values(ReportType))
  )
  .addOption(
    new Option(
      "-o, --oldest-date <Date>",
      "The oldest date to consider for transactions."
    )
      .default(null)
      .argParser((value) => {
        const date = new Date(value);
        if (!isValid(date)) {
          throw new InvalidArgumentError("Not a valid date.");
        }
        return date;
      })
  )
  .action(
    async (commandAndOptions: {
      reportType: `${ReportType}`;
      oldestDate: Date | null;
    }) => {
      await CardTradeService.buildCardTradeReport({
        reportType: commandAndOptions.reportType,
        oldestDate: commandAndOptions.oldestDate,
      });
    }
  );

async function main() {
  await program.parseAsync(process.argv);
}

main().catch((error) => {
  logger.error(error);
  process.exit(1);
});
