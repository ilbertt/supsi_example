import "./style.css"

import { AssetManager } from "@dfinity/assets";
import { canisterId as backendCanisterId } from "../../declarations/backend";
import { HttpAgent } from "@dfinity/agent";
import { checkAuthorization, fetchFilesAndPopulateTable, getActor, initializeActor } from "./api";
import { setAssetManager } from "./assetManager";
import { formatFileSize, removeButtonLoading, setButtonLoading } from "./utils";
import { getAuthClient, initializeAuthClient, login, logout } from "./identity";
import { Principal } from "@dfinity/principal";

/// Setup
const host = process.env.DFX_NETWORK === "ic" ? "https://icp0.io" : "http://127.0.0.1:4943";

const agent = new HttpAgent({
  host,
  verifyQuerySignatures: false,
});
agent.fetchRootKey();

const setAgentIdentity = () => {
  const authClient = getAuthClient();
  const identity = authClient.getIdentity();

  agent.replaceIdentity(identity);
}

initializeActor(backendCanisterId, agent);

const assetManager = new AssetManager({
  canisterId: backendCanisterId,
  agent,
});
setAssetManager(assetManager);

initializeAuthClient().then(setAgentIdentity).then(checkAuthorization);

fetchFilesAndPopulateTable();

//// UI handlers
const uploadFileModal = document.getElementById("uploadFileModal")! as HTMLDialogElement;
const authorizeModal = document.getElementById("authorizeModal")! as HTMLDialogElement;

// buttons
document.getElementById("uploadFileButton")!.addEventListener("click", () => {
  uploadFileModal.showModal();
  return false;
});

document.getElementById("authorizeButton")!.addEventListener("click", () => {
  authorizeModal.showModal();
  return false;
});

document.getElementById("authButton")!.addEventListener("click", async () => {
  const authClient = getAuthClient();

  if (await authClient.isAuthenticated()) {
    await logout();
  } else {
    await login();
  }

  setAgentIdentity();

  await checkAuthorization();
});

// forms
document.getElementById("uploadFileForm")!.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target! as HTMLFormElement;

  const filePath = form.elements.namedItem("filePath")! as HTMLInputElement;
  const fileObj = form.elements.namedItem("fileContent")! as HTMLInputElement;
  const fileToUpload = fileObj.files![0];

  console.log("filePath", filePath, "fileContent", fileObj);

  const submitButton = form.querySelector("#uploadFileSubmitButton")! as HTMLButtonElement;
  submitButton.classList.add("hidden");

  const uploadFileStatus = document.getElementById("uploadFileStatus")!;
  uploadFileStatus.innerHTML = `
    <span class="loading loading-infinity loading-md"></span>
    <span>Uploading file... <span id="uploadProgress">0/${formatFileSize(BigInt(fileToUpload.size))}</span></span>
    <progress class="progress w-56" value="0" max="100"></progress>
  `;
  uploadFileStatus.classList.remove("alert-success");
  uploadFileStatus.classList.remove("hidden");

  const key = await assetManager.store(fileToUpload, {
    path: filePath.value.trim(),
    contentType: fileObj.type,
    onProgress: (progress) => {
      console.log("progress", progress);
      const progressElement = uploadFileStatus.querySelector("#uploadProgress")! as HTMLSpanElement;
      progressElement.innerText = `${formatFileSize(BigInt(progress.current), false)}/${formatFileSize(BigInt(progress.total))}`;
      const progressBar = uploadFileStatus.querySelector(".progress")! as HTMLProgressElement;
      progressBar.value = progress.current / progress.total * 100;
    },
  });
  console.log("File uploaded at key:", key);

  uploadFileStatus.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    <span>File uploaded at path: ${key}</span>
  `;
  uploadFileStatus.classList.add("alert-success");

  form.reset();

  await fetchFilesAndPopulateTable();

  setTimeout(() => {
    uploadFileModal.close();
    uploadFileStatus.classList.add("hidden");
    submitButton.classList.remove("hidden");
  }, 3000);

  return false;
});

document.getElementById("authorizeForm")!.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement;

  const otherPrincipalEl = form.elements.namedItem("otherPrincipal")! as HTMLInputElement;
  const otherPrincipal = Principal.fromText(otherPrincipalEl.value.trim());

  console.log("otherPrincipal", otherPrincipal);

  const submitButton = form.querySelector("#authorizeSubmitButton")! as HTMLButtonElement;
  setButtonLoading(submitButton);

  const authorizeStatus = document.getElementById("authorizeStatus")!;
  authorizeStatus.classList.add("hidden");

  const isAlreadyAuthorized = await getActor().is_authorized(otherPrincipal);

  if (isAlreadyAuthorized) {
    authorizeStatus.classList.remove("alert-success");
    authorizeStatus.classList.add("alert-warning");
    authorizeStatus.classList.remove("hidden");

    authorizeStatus.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
        stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <span>Principal is already authorized!</span>
    `;

    removeButtonLoading(submitButton, "Authorize");
    return;
  }

  await getActor().authorize(otherPrincipal);

  authorizeStatus.classList.remove("alert-warning");
  authorizeStatus.classList.add("alert-success");
  authorizeStatus.classList.remove("hidden");
  authorizeStatus.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
      viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span>Principal authorized!</span>
  `;

  removeButtonLoading(submitButton, "Authorize");

  form.reset();

  setTimeout(() => {
    authorizeModal.close();
    authorizeStatus.classList.add("hidden");
  }, 3000);
})
