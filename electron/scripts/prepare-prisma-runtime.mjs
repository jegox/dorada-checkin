import fs from "fs";
import path from "path";

const root = process.cwd();
const sourcePrismaDir = path.join(root, "node_modules", ".prisma");
const rootPrismaPackagesDir = path.join(root, "node_modules", "@prisma");
const nextNodeModulesDir = path.join(root, "next-build", "node_modules");
const nextPrismaDir = path.join(nextNodeModulesDir, "@prisma");

function ensureDirectory(targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function copyDirectory(source, target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
  fs.cpSync(source, target, { recursive: true });
}

function getAliasDirs(prefix) {
  if (!fs.existsSync(nextPrismaDir)) return [];

  return fs
    .readdirSync(nextPrismaDir, { withFileTypes: true })
    .filter((entry) => entry.name.startsWith(prefix))
    .map((entry) => path.join(nextPrismaDir, entry.name));
}

function materializeAliasDir(aliasDir, sourcePackageDir) {
  if (!fs.existsSync(aliasDir)) return;

  const realSource = fs.realpathSync(aliasDir);
  if (fs.existsSync(aliasDir)) {
    fs.rmSync(aliasDir, { recursive: true, force: true });
  }

  copyDirectory(sourcePackageDir, aliasDir);

  const sourcePackagePrisma = path.join(sourcePackageDir, "node_modules", ".prisma");
  const targetAliasPrisma = path.join(aliasDir, ".prisma");

  if (fs.existsSync(sourcePackagePrisma)) {
    copyDirectory(sourcePackagePrisma, targetAliasPrisma);
  } else {
    const rootPrismaTarget = path.join(aliasDir, "node_modules", ".prisma");
    copyDirectory(sourcePrismaDir, rootPrismaTarget);
    copyDirectory(sourcePrismaDir, targetAliasPrisma);
  }

  console.log(
    `[prepare-prisma-runtime] Materializado ${path.relative(root, aliasDir)} desde ${path.relative(root, realSource)}`,
  );
}

function materializeRootAliasDir(aliasName, sourcePackageDir) {
  ensureDirectory(rootPrismaPackagesDir);

  const aliasDir = path.join(rootPrismaPackagesDir, aliasName);
  if (fs.existsSync(aliasDir)) {
    fs.rmSync(aliasDir, { recursive: true, force: true });
  }

  copyDirectory(sourcePackageDir, aliasDir);

  const sourcePackagePrisma = path.join(sourcePackageDir, "node_modules", ".prisma");
  const targetAliasPrisma = path.join(aliasDir, ".prisma");

  if (fs.existsSync(sourcePackagePrisma)) {
    copyDirectory(sourcePackagePrisma, targetAliasPrisma);
  } else {
    const rootPrismaTarget = path.join(aliasDir, "node_modules", ".prisma");
    copyDirectory(sourcePrismaDir, rootPrismaTarget);
    copyDirectory(sourcePrismaDir, targetAliasPrisma);
  }

  console.log(
    `[prepare-prisma-runtime] Alias raíz materializado ${path.relative(root, aliasDir)} desde ${path.relative(root, sourcePackageDir)}`,
  );
}

function copyPrismaRuntime() {
  if (!fs.existsSync(sourcePrismaDir)) {
    throw new Error(
      `No existe el runtime de Prisma en ${sourcePrismaDir}. Ejecuta instalación y build antes.`,
    );
  }

  ensureDirectory(nextNodeModulesDir);
  copyDirectory(sourcePrismaDir, path.join(nextNodeModulesDir, ".prisma"));

  const clientAliases = getAliasDirs("client-");
  const adapterAliases = getAliasDirs("adapter-pg-");

  for (const aliasDir of clientAliases) {
    materializeAliasDir(aliasDir, path.join(root, "node_modules", "@prisma", "client"));
    materializeRootAliasDir(
      path.basename(aliasDir),
      path.join(root, "node_modules", "@prisma", "client"),
    );
  }

  for (const aliasDir of adapterAliases) {
    materializeAliasDir(aliasDir, path.join(root, "node_modules", "@prisma", "adapter-pg"));
    materializeRootAliasDir(
      path.basename(aliasDir),
      path.join(root, "node_modules", "@prisma", "adapter-pg"),
    );
  }

  console.log(
    `[prepare-prisma-runtime] Runtime copiado a ${path.relative(root, path.join(nextNodeModulesDir, ".prisma"))}`,
  );
}

try {
  copyPrismaRuntime();
} catch (error) {
  console.error("[prepare-prisma-runtime] Error:", error instanceof Error ? error.message : error);
  process.exit(1);
}
