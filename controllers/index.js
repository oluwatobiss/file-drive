const byteSize = require("byte-size");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function showHomepage(req, res) {
  const folders = await prisma.folder.findMany();
  const files = await prisma.file.findMany();

  // console.log(files);

  res.render("index", { folders, files, byteSize });
}

async function showFolderView(req, res) {
  console.log("=== folder ===");
  const folder = req.query.f;
  console.log(folder);
  const folderData = await prisma.folder.findUnique({
    where: { name: folder },
  });
  const files = await prisma.file.findMany();
  res.render("folder", { folderName: folder, files });
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

  // console.log(req.file);
  try {
    const folder = req.query.f;
    console.log("=== Directory ===");
    console.log(folder);

    const folderData = await prisma.folder.findUnique({
      where: { name: folder },
    });

    console.log(folderData);

    if (folderData) {
      await prisma.file.create({ data: { fileData: req.file } });
    }

    if (!folderData) {
      await prisma.file.create({
        data: {
          fileData: req.file,
          folder: { create: { name: folder } },
        },
      });
    }

    await prisma.$disconnect();
    return folder === "root"
      ? res.redirect("/")
      : res.redirect(`/folder/?f=${folder}`);
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
