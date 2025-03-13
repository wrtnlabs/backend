import cp from "child_process";
import fs from "fs";

const publish = async (props: {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  execute: () => void;
}): Promise<void> => {
  process.chdir(`${__dirname}/../packages/${props.name}`);

  const metadata = JSON.parse(
    await fs.promises.readFile("package.json", "utf-8"),
  );
  metadata.version = props.version;
  for (const key of Object.keys(metadata.dependencies ?? {}))
    if (props.dependencies[key])
      metadata.dependencies[key] = props.dependencies[key];
  for (const key of Object.keys(metadata.devDependencies ?? {}))
    if (props.dependencies[key])
      metadata.devDependencies[key] = props.dependencies[key];
  await fs.promises.writeFile(
    "package.json",
    JSON.stringify(metadata, null, 2),
    "utf-8",
  );
  props.execute();
};

const main = async (): Promise<void> => {
  const tag: string = process.argv[2] ?? "latest";
  const main = JSON.parse(
    await fs.promises.readFile(`${__dirname}/../package.json`, "utf-8"),
  );
  const version: string = main.version;
  const dependencies: Record<string, string> = {
    ...main.dependencies,
    ...main.devDependencies,
    "@wrtnlabs/os-api": `^${version}`,
  };

  cp.execSync("pnpm run build:main", {
    cwd: `${__dirname}/..`,
  });
  cp.execSync("pnpm run build:api", { cwd: `${__dirname}/..` });
  await publish({
    name: "api",
    version,
    dependencies,
    execute: () => {
      cp.execSync(`npm publish --tag ${tag} --access public`);
    },
  });
};
main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
