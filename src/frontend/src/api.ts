import { formatFileSize, formatTimestamp, removeButtonLoading, removeButtonUnauthorized, setButtonLoading, setButtonUnauthorized } from "./utils";
import { getAssetManager } from "./assetManager";
import { getAuthClient } from "./identity";
import { ActorSubclass, Agent } from "@dfinity/agent";
import { _SERVICE } from "../../declarations/backend/backend.did";
import { createActor } from "../../declarations/backend";

let actor: ActorSubclass<_SERVICE>;

export const initializeActor = (canisterId: string, agent: Agent) => {
  actor = createActor(canisterId, {
    agent,
  });
};

export const getActor = () => {
  if (!actor) {
    throw new Error("Actor not initialized");
  }

  return actor;
};

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

export const checkAuthorization = async () => {
  const authClient = getAuthClient();
  const principal = authClient.getIdentity().getPrincipal();

  const isAuthorized = await actor.is_authorized(principal);

  console.log("Is authorized:", isAuthorized);

  const uploadFileButton = document.getElementById("uploadFileButton")! as HTMLButtonElement;
  const authorizeButton = document.getElementById("authorizeButton")! as HTMLButtonElement;
  const deleteFileButtons = document.querySelectorAll(".delete-file-button") as NodeListOf<HTMLButtonElement>;

  for (const button of [...deleteFileButtons, uploadFileButton, authorizeButton]) {
    if (isAuthorized) {
      removeButtonUnauthorized(button);
    } else {
      setButtonUnauthorized(button);
    }
  }
};

export const syncDataOnCanister = async () => {
  await actor.sync_data();
};

type ParsedData = {
  data: JSON;
  lastSyncedAt: Date;
};

export const fetchSyncedData = async () => {
  const syncedData = await actor.get_synced_data();
  const parsedData: ParsedData = {
    data: JSON.parse(syncedData.data),
    lastSyncedAt: new Date(Number(BigInt(syncedData.last_synced_at) / BigInt(1_000_000))),
  };
  console.log("Synced data:", parsedData);

  document.getElementById("syncStatus")!.querySelector("span")!.innerHTML = `Last synced at: ${formatTimestamp(BigInt(syncedData.last_synced_at))}`;
  document.getElementById("syncedDataContent")!.querySelector("pre")!.innerHTML = JSON.stringify(parsedData.data, null, 4);
};
