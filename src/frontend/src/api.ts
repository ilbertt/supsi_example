import { formatFileSize, formatTimestamp, removeButtonLoading, setButtonLoading } from "./utils";
import { getAssetManager } from "./assetManager";

const downloadFile = async (button: HTMLButtonElement) => {
  const assetManager = getAssetManager();

  const filePath = button.getAttribute("data-file-path")!;

  setButtonLoading(button);
  const file = await assetManager.get(filePath);

  const a = document.createElement("a");
  a.href = URL.createObjectURL(await file.toBlob());
  a.download = filePath.split("/").pop() || "asset";
  a.click();
  a.remove();

  removeButtonLoading(button, "Download");
};

const deleteFile = async (button: HTMLButtonElement) => {
  const assetManager = getAssetManager();

  const filePath = button.getAttribute("data-file-path")!;

  const confirmDelete = confirm(`Are you sure you want to delete the file ${filePath}?`);
  if (confirmDelete) {
    setButtonLoading(button);
    await assetManager.delete(filePath);
    await fetchFilesAndPopulateTable();
    removeButtonLoading(button, "Delete");
  }
}

export const fetchFilesAndPopulateTable = async () => {
  const assetManager = getAssetManager();
  const table = document.getElementById("filesList")!;
  const tbody = table.querySelector("tbody")!;

  const files = await assetManager.list();
  console.log("Files:", files);

  if (files.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td>
          No files available.
        </td>
      </tr>
    `;
    return;
  } else {
    tbody.innerHTML = "";
  }

  for (const file of files) {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${file.key}</td>
      <td><div class="badge badge-neutral">${file.content_type}</div></td>
      <td>${formatFileSize(file.encodings[0].length)}</td>
      <td>${formatTimestamp(file.encodings[0].modified)}</td>
      <td>
        <div class="join">
          <button class="btn join-item bg-primary download-file-button" data-file-path="${file.key}">Download</button>
          <button class="btn join-item bg-error delete-file-button" data-file-path="${file.key}">Delete</button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  }

  registerActionsHandlers();
};

const registerActionsHandlers = () => {
  const downloadFileButtons = document.querySelectorAll(".download-file-button");
  const deleteFileButtons = document.querySelectorAll(".delete-file-button");

  for (const button of downloadFileButtons) {
    button.addEventListener("click", (e) => {
      downloadFile((e.target as HTMLButtonElement));
    });
  }

  for (const button of deleteFileButtons) {
    button.addEventListener("click", (e) => {
      deleteFile((e.target as HTMLButtonElement));
    });
  }
};
