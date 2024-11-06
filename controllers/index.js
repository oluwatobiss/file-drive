const byteSize = require("byte-size");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function showHomepage(req, res) {
  const folders = await prisma.folder.findMany();
  const folderData = await prisma.folder.findUnique({
    where: { name: "root" },
  });
  let files = [];
  if (folderData) {
    files = await prisma.file.findMany({
      where: { folderId: folderData.id },
    });
  }
  res.render("index", { folders, files, byteSize });
}

async function showFolderView(req, res) {
  const folderName = req.query.f;
  const folderData = await prisma.folder.findUnique({
    where: { name: folderName },
  });
  const files = await prisma.file.findMany({
    where: { folderId: folderData.id },
  });
  res.render("folder", { folderName, files, byteSize });
}

function showSignUpView(req, res) {
  res.render("sign-up");
}

function showLoginView(req, res) {
  res.render("log-in");
}

async function saveUploadedFile(req, res) {
  try {
    const folderName = req.query.f;
    await prisma.folder.upsert({
      where: { name: folderName },
      create: {
        name: folderName,
        file: { create: { fileData: req.file } },
      },
      update: { file: { create: { fileData: req.file } } },
    });

    await prisma.$disconnect();
    return folderName === "root"
      ? res.redirect("/")
      : res.redirect(`/folder/?f=${folderName}`);
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }
}

async function createFolder(req, res) {
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
