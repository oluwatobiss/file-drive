function openCreateFolderModal(popup) {
  const createFolderModal = document.getElementById("create-folder-modal");
  popup
    ? (createFolderModal.style.display = "flex")
    : (createFolderModal.style.display = "");
}

function openRenameFolderModal(popup) {
  const renameFolderModal = document.getElementById("rename-folder-modal");
  popup
    ? (renameFolderModal.style.display = "flex")
    : (renameFolderModal.style.display = "");
}

function openRowOptionsModal(event) {
  const rowOptionsModal =
    event.currentTarget.parentElement.querySelector(".row-options-modal");
  rowOptionsModal.classList.toggle("show-row-options-modal");
}
