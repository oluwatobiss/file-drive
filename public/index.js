function openCreateFolderModal(popup) {
  const createFolderModal = document.getElementById("create-folder-modal");
  popup
    ? (createFolderModal.style.display = "flex")
    : (createFolderModal.style.display = "");
}
