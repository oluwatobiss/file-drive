const bcrypt = require("bcryptjs");
const byteSize = require("byte-size");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function showHomepage(req, res) {
  try {
    console.log("=== showHomepage ===");
    const userData = req.user;
    console.log(userData);
    const folders = userData ? await prisma.folder.findMany() : [];
    const folderData =
      userData &&
      (await prisma.folder.findUnique({
        where: { name: "root" },
      }));
    let files = [];
    folderData &&
      (files = await prisma.file.findMany({
        where: { folderId: folderData.id },
      }));

    console.log(folders);

    await prisma.$disconnect();
    res.render("index", { folders, files, byteSize, userData });
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }
}

async function showFolderView(req, res) {
  try {
    const folderName = req.params.folderName;
    const folderData = await prisma.folder.findUnique({
      where: { name: folderName },
    });
    const files = await prisma.file.findMany({
      where: { folderId: folderData.id },
    });
    await prisma.$disconnect();
    res.render("folder", { folderName, files, byteSize });
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }
}

function showSignUpView(req, res) {
  res.render("sign-up");
}

const signUpUser = [
  async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    bcrypt.hash(password, 10, async (err, hashedPassword) => {
      if (err) return next(err);
      try {
        const userData = await prisma.user.upsert({
          where: { email },
          create: { firstName, lastName, email, password: hashedPassword },
          update: { firstName, lastName, email, password: hashedPassword },
        });
        await prisma.$disconnect();
        const user = { id: userData.id };
        console.log("=== signUpUser ===");
        console.log(user);

        req.login(user, function (err) {
          if (err) return next(err);
          return res.redirect("/");
        });
      } catch (e) {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
      }
    });
  },
];

function showLoginView(req, res) {
  res.render("log-in");
}

async function saveUploadedFile(req, res) {
  try {
    const folderName = req.params.folderName;
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
      : res.redirect(`/folder/${folderName}`);
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

async function renameFolder(req, res) {
  try {
    await prisma.folder.update({
      where: { name: req.params.folderName },
      data: { name: req.body.folderName },
    });
    await prisma.$disconnect();
    return res.redirect("/");
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }
}

async function deleteFolder(req, res) {
  try {
    const folderName = req.params.folderName;
    const folderData = await prisma.folder.findUnique({
      where: { name: folderName },
    });
    const deleteFiles = prisma.file.deleteMany({
      where: { folderId: folderData.id },
    });
    const deleteFolder = prisma.folder.delete({ where: { name: folderName } });
    await prisma.$transaction([deleteFiles, deleteFolder]);
    await prisma.$disconnect();
    return res.redirect("/");
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }
}

async function deleteFile(req, res) {
  try {
    const folderName = req.params.folderName;
    await prisma.file.delete({ where: { id: Number(req.params.fileId) } });
    await prisma.$disconnect();
    return folderName === "root"
      ? res.redirect("/")
      : res.redirect(`/folder/${folderName}`);
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }
}

async function downloadFile(req, res) {
  try {
    const fileInfo = await prisma.file.findUnique({
      where: { id: Number(req.params.fileId) },
    });
    await prisma.$disconnect();
    res.download(fileInfo.fileData.path, fileInfo.fileData.originalname);
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
  signUpUser,
  showLoginView,
  saveUploadedFile,
  createFolder,
  renameFolder,
  deleteFolder,
  deleteFile,
  downloadFile,
};
