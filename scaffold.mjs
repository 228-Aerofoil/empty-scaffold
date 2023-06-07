import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const directory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "source"
);

export async function scaffold({
  deploymentName,
  deploymentPath,
  deploymentTypes,
}) {
  console.log(`Scaffolding ${deploymentName} at ${deploymentPath}`);
  const type = await promptDeploymentType(deploymentTypes);
  await fs.copy(directory, deploymentPath);
  const packageJSON = await fs.readJSON(
    path.resolve(deploymentPath, "package.json")
  );
  packageJSON.name = deploymentName;
  await fs.writeJSON(
    path.resolve(deploymentPath, "package.json"),
    packageJSON,
    {
      spaces: "\t",
    }
  );
  return {
    deployment: {
      type: type,
    },
  };
}

export async function promptDeploymentType(deploymentTypes) {
  const { type } = await inquirer.prompt({
    name: "type",
    type: "list",
    choices: deploymentTypes,
    message: `Which deployment type should be used?`,
  });

  return type;
}
