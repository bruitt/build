let path = require("path")
let fs = require("fs")
let childProcess = require("child_process")

let root = process.cwd()

function npmInstall(where) {
  childProcess.execSync("yarn", {
    cwd: where,
    env: process.env,
    stdio: "inherit",
  })
}

function subfolders(folder) {
  return fs
    .readdirSync(folder)
    .filter((subfolder) =>
      fs.statSync(path.join(folder, subfolder)).isDirectory(),
    )
    .filter((subfolder) => subfolder !== "node_modules" && subfolder[0] !== ".")
    .map((subfolder) => path.join(folder, subfolder))
}

function npmInstallRecursive(folder) {
  let hasDependencies = false
  let packagePath = path.join(folder, "package.json")
  let hasPackageJson = fs.existsSync(packagePath)

  if (hasPackageJson) {
    hasDependencies = !!JSON.parse(fs.readFileSync(packagePath, "utf8"))
      .dependencies
  }

  if (hasDependencies) {
    // Since this script is intended to be run as a "preinstall" command,
    // skip the root folder, because it will be `npm install`ed in the end.
    if (folder !== root && hasPackageJson) {
      console.log(
        "===================================================================",
      )
      console.log(
        `Performing "install" inside ./${path.relative(root, folder)}`,
      )
      console.log(
        "===================================================================",
      )

      npmInstall(folder)
    }
  }

  subfolders(folder).forEach(npmInstallRecursive)
}

npmInstallRecursive(root)

// Since this script is intended to be run as a "preinstall" command,
// it will be `npm install` inside root in the end.
console.log(
  "===================================================================",
)
console.log("Performing \"install\" inside root folder")
console.log(
  "===================================================================",
)
