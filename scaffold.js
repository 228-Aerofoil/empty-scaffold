import { logger } from "@aerofoil/logger";
import path from "path";
import { fileURLToPath } from "url";

const sourceDirectory = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"source",
);

export async function scaffold({
	fs,
	projectConfig,
	projectRootPath,
	generateDeploymentInfo,
	deploymentTypes,
}) {
	const type = await logger.listInput("Select deployment type", [
		["none"],
		deploymentTypes,
	]);
	const deployInfo = await generateDeploymentInfo(null, {
		...(type != null && {
			deployment: {
				type,
			},
		}),
	});
	const deploymentRootPath = path.resolve(
		projectRootPath,
		"deployments",
		deployInfo.name,
	);
	logger.info(`Scaffolding ${deployInfo.name} at ${deploymentRootPath}`);
	await fs.copy(sourceDirectory, deploymentRootPath);
	const packageJSON = JSON.parse(
		await fs.readFile(path.resolve(deploymentRootPath, "package.json"), "utf8"),
	);
	packageJSON.name = `@${projectConfig.name}/${deployInfo.name}`;
	await fs.writeFile(
		path.resolve(deploymentRootPath, "package.json"),
		JSON.stringify(packageJSON, null, "\t"),
	);
}
