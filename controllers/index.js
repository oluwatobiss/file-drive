const byteSize = require("byte-size");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function showHomepage(req, res) {
  const folders = await prisma.folder.findMany();
  const files = await prisma.file.findMany();

  console.log(files);

  res.render("index", { folders, files, byteSize });
}

function showFolderView(req, res) {
  res.render("folder", { folderName: req.query.f, file: [] });
}

function showSignUpView(req, res) {
  res.render("sign-up");
}

function showLoginView(req, res) {
  res.render("log-in");
}

async function saveUploadedFile(req, res) {
  console.log("===================");
  console.log("File Saved!");
  console.log(req.file);
  try {
    await prisma.file.create({ data: { fileData: req.file } });
    await prisma.$disconnect();
    return res.redirect("/");
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }
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
  showFolderView,
  showSignUpView,
  showLoginView,
  saveUploadedFile,
  createFolder,
};
