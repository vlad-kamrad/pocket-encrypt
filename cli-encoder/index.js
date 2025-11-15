#!/usr/bin/env node

// @ts-check

import { Command } from "commander";
import { encodeCommand } from "./commands/encode.command.js";

const program = new Command();

program.name("Pocket Encoder CLI").version("1.0.0");

program
  .command("encode <path>")
  .description("Encode target files")
  .requiredOption("-p, --password <password>", "Password to encrypt")
  .option("-m, --metadata", "Generate metadata file")
  .option("-u, --unique", "Generates unique filenames for encoded files")
  .action(async (inputPath, flags) => {
    console.time("Execution time: ");

    await encodeCommand({
      inputPath,
      password: flags.password,
      generateMetadata: flags?.metadata ?? false,
      uniqueFilename: flags?.unique ?? false,
    }).catch(console.log);

    console.timeEnd("Execution time: ");
  });

program.parse();
