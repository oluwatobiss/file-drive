const byteSize = require("byte-size");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function showHomepage(req, res) {
  const folders = await prisma.folder.findMany();
  const folderData = await prisma.folder.findUnique({
    where: { name: "root" },
  });
  let files = [];

  // console.log("=== showHomepage folderData ===");

  // console.log(folderData);

  if (folderData) {
    files = await prisma.file.findMany({
      where: { folderId: folderData.id },
    });
  }

  console.log("=== showHomepage files ===");
  console.log(files);

  res.render("index", { folders, files, byteSize });
}

async function showFolderView(req, res) {
  console.log("=== folder ===");
  const folderName = req.query.f;
  console.log(folderName);
  const folderData = await prisma.folder.findUnique({
    where: { name: folderName },
  });

  console.log(folderData);

  const files = await prisma.file.findMany({
    where: { folderId: folderData.id },
  });

  // console.log(files);

  res.render("folder", { folderName, files, byteSize });
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
    const folderName = req.query.f;
    console.log("=== Directory ===");
    console.log(folderName);

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
