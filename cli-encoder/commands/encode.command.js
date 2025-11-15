// @ts-check

import { fileTypeFromBuffer } from "file-type";
import fs from "fs/promises";
import { dirname as getDirectoryName, join as joinPaths } from "path";
import { encodeBuffer } from "../encoder.js";
import { analyzeDirectory, detectPathType } from "../io-utils.js";

/**
 * @typedef {Object} EncodeCommandParams
 * @property {string} inputPath path to folder or file
 * @property {string} password
 * @property {boolean} generateMetadata generates `metadata.json` file
 * @property {boolean} uniqueFilename replaces file name to unique id
 */

/**
 * @typedef {Object} OutputMetadataItem
 * @property {string} id
 * @property {string} filename
 * @property {number} size
 * @property {string | null} mime
 * @property {string | null} ext
 */

/**
 * @param {EncodeCommandParams} params
 */
export async function encodeCommand(params) {
  if (params.password.length <= 5) {
    throw new Error("Short password");
  }

  const pathType = await detectPathType(params.inputPath);

  if (pathType === "none") {
    throw new Error("Folder or file doesn't exist");
  }

  if (params.generateMetadata && pathType !== "folder") {
    throw new Error(
      "Metadata can be generated only for a path parameter that is a folder"
    );
  }

  const entries = await analyzeDirectory(params.inputPath);

  if (!entries.length) {
    throw new Error("No files found");
  }

  /** @type {OutputMetadataItem[]} */
  const metadataOutputMap = [];

  for (const entry of entries) {
    const fileBuffer = await fs.readFile(entry.path);
    const fileType = await fileTypeFromBuffer(fileBuffer);

    const encodedBuffer = await encodeBuffer({
      buffer: fileBuffer,
      password: params.password,
      metadata: {
        name: entry.filename,
        ext: fileType?.ext ?? entry.extension.replaceAll(".", "") ?? null,
        mime: fileType?.mime ?? null,
      },
    });

    const outputPath =
      pathType === "folder"
        ? params.inputPath
        : getDirectoryName(params.inputPath);

    const outputFilename = params.uniqueFilename
      ? crypto.randomUUID()
      : entry.filename;

    if (params.generateMetadata) {
      metadataOutputMap.push({
        id: outputFilename,
        filename: entry.filename,
        mime: fileType?.mime || null,
        ext: fileType?.ext || null,
        size: entry.size,
      });
    }

    await fs.writeFile(
      joinPaths(outputPath, `${outputFilename}.enc`),
      encodedBuffer
    );
  }

  if (params.generateMetadata) {
    await fs.writeFile(
      joinPaths(params.inputPath, "metadata.json"),
      JSON.stringify(metadataOutputMap, null, 2)
    );
  }
}
