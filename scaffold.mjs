import { getProjectConfig } from "@aerofoil/aerofoil-core/util/getProjectConfig";
import { getProjectRootPath } from "@aerofoil/aerofoil-core/util/getProjectRootPath";
import { logger } from "@aerofoil/logger";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const sourceDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "source"
);

export async function scaffold({
  generateDeploymentInfo,
  generateDatabaseInfo,
  deploymentTypes,
  addTodos,
}) {
  const projectConfig = await getProjectConfig();
  const rootPath = await getProjectRootPath();
  const type = await logger.listInput("Select deployment type", [
    deploymentTypes.map((t) => ({
      name: t,
      value: t,
    })),
  ]);
  if (type != null) {
    const deployInfo = await generateDeploymentInfo(null, {
      deployment: { type },
    });
    const deploymentRootPath = path.resolve(
      rootPath,
      "deployments",
      deployInfo.name
    );
    logger.info(`Scaffolding ${deployInfo.name} at ${deploymentRootPath}`);
    await fs.copy(sourceDirectory, deploymentRootPath);
    const packageJSON = await fs.readJSON(
      path.resolve(deploymentRootPath, "package.json")
    );
    packageJSON.name = `@${projectConfig.name}/${deployInfo.name}`;
    await fs.writeJSON(
      path.resolve(deploymentRootPath, "package.json"),
      packageJSON,
      {
        spaces: "\t",
      }
    );
  } else {
    throw new Error("No deployment type selected");
  }
}
