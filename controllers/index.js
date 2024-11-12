const bcrypt = require("bcryptjs");
const byteSize = require("byte-size");
const { mkdir, rename, rm, unlink } = require("fs").promises;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function showHomepage(req, res) {
  try {
    const userData = req.user;
    const folders = userData
      ? await prisma.folder.findMany({ where: { userId: userData.id } })
      : [];
    const folderData =
      userData &&
      (await prisma.folder.findUnique({
        where: { nameUserId: { name: "root", userId: userData.id } },
      }));
    let files = [];
    folderData &&
      (files = await prisma.file.findMany({
        where: { folderId: folderData.id },
      }));
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
    const userData = req.user;
    const folderName = req.params.folderName;
    const folderData = await prisma.folder.findUnique({
      where: { nameUserId: { name: folderName, userId: userData.id } },
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
    const userData = req.user;
    const folderName = req.params.folderName;
    await prisma.user.update({
      where: { id: userData.id },
      data: {
        folders: {
          upsert: {
            where: { nameUserId: { name: folderName, userId: userData.id } },
            create: {
              name: folderName,
              files: {
                create: { location: req.file.destination, fileData: req.file },
              },
            },
            update: {
              files: {
                create: { location: req.file.destination, fileData: req.file },
              },
            },
          },
        },
      },
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

async function upsertFolder(req, res) {
  try {
    const userData = req.user;
    const existingName = req.params.folderName;
    const newName = req.body.folderName;
    const folderName = existingName || newName;
    await prisma.user.update({
      where: { id: userData.id },
      data: {
        folders: {
          upsert: {
            where: { nameUserId: { name: folderName, userId: userData.id } },
            create: { name: newName },
            update: { name: newName },
          },
        },
      },
    });
    !existingName && (await mkdir(`uploads/${newName}`, { recursive: true }));
    if (existingName) {
      await rename(`uploads/${existingName}`, `uploads/${newName}`, {
        recursive: true,
      });
      await prisma.folder.update({
        where: { nameUserId: { name: newName, userId: userData.id } },
        data: {
          files: {
            updateMany: {
              where: { location: `uploads/${existingName}` },
              data: { location: `uploads/${newName}` },
            },
          },
        },
        include: {
          files: true,
        },
      });
    }
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
    const userData = req.user;
    const folderName = req.params.folderName;
    const folderData = await prisma.folder.findUnique({
      where: { nameUserId: { name: folderName, userId: userData.id } },
    });
    await prisma.file.deleteMany({
      where: { folderId: folderData.id },
    });
    await prisma.user.update({
      where: { id: userData.id },
      data: { folders: { delete: [{ id: folderData.id }] } },
    });
    await prisma.$disconnect();
    await rm(`uploads/${folderName}`, { recursive: true, force: true });
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
    const fileInfo = await prisma.file.findUnique({
      where: { id: Number(req.params.fileId) },
    });
    await prisma.file.delete({ where: { id: Number(req.params.fileId) } });
    await prisma.$disconnect();
    await unlink(`${fileInfo.location}/${fileInfo.fileData.filename}`);
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
    res.download(
      `${fileInfo.location}/${fileInfo.fileData.filename}`,
      fileInfo.fileData.originalname
    );
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }
}

function logUserOut(req, res, next) {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
}

module.exports = {
  showHomepage,
  showFolderView,
  showSignUpView,
  signUpUser,
  showLoginView,
  saveUploadedFile,
  upsertFolder,
  deleteFolder,
  deleteFile,
  downloadFile,
  logUserOut,
};
