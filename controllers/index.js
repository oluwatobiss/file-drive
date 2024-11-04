const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function showHomepage(req, res) {
  const allFolders = await prisma.folder.findMany();
  console.log("=== showHomepage ===");

  console.log(allFolders);

  res.render("index", { folders: allFolders });
}

function showSignUpView(req, res) {
  res.render("sign-up");
}

function showLoginView(req, res) {
  res.render("log-in");
}

function saveUploadedFile(req, res) {
  console.log("===================");
  console.log("File Saved!");
  console.log(req.file);
  return res.redirect("/");
}

async function createFolder(req, res) {
  console.log("=== create folder ====");
  console.log(req.body);
  try {
    await prisma.folder.create({ data: { name: req.body.folderName } });
    await prisma.$disconnect();
    return res.redirect("/");
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }
}

module.exports = {
  showHomepage,
  showSignUpView,
  showLoginView,
  saveUploadedFile,
  createFolder,
};
