import "./style.css"

import { AssetManager } from "@dfinity/assets";
import { canisterId } from "../../declarations/backend";
import { HttpAgent } from "@dfinity/agent";
import { fetchFilesAndPopulateTable } from "./api";
import { setAssetManager } from "./assetManager";
import { formatFileSize } from "./utils";

const host = process.env.DFX_NETWORK === "ic" ? "https://icp0.io" : "http://127.0.0.1:4943";

const agent = new HttpAgent({
  host,
  verifyQuerySignatures: false,
});
agent.fetchRootKey();

const assetManager = new AssetManager({
  canisterId,
  agent,
});
setAssetManager(assetManager);

fetchFilesAndPopulateTable();

//// UI handlers
const uploadFileModal = document.getElementById("uploadFileModal")! as HTMLDialogElement;

document.getElementById("uploadFileButton")!.addEventListener("click", () => {
  uploadFileModal.showModal();
  return false;
})

document.getElementById("uploadFileForm")!.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement;

  await agent.fetchRootKey();

  const filePath = (e.target as HTMLFormElement)!.elements.namedItem("filePath")! as HTMLInputElement;
  const fileObj = (e.target as HTMLFormElement)!.elements.namedItem("fileContent")! as HTMLInputElement;
  const fileToUpload = fileObj.files![0];

  console.log("filePath", filePath, "fileContent", fileObj);

  const submitButton = (e.target as HTMLFormElement)!.querySelector("#uploadFileButton")! as HTMLButtonElement;
  submitButton.classList.add("hidden");

  const uploadFileStatus = document.getElementById("uploadFileStatus")!;
  uploadFileStatus.innerHTML = `
    <span class="loading loading-infinity loading-md"></span>
    <span>Uploading file... <span id="uploadProgress">0/${formatFileSize(BigInt(fileToUpload.size))}</span></span>
    <progress class="progress w-56" value="0" max="100"></progress>
  `;
  uploadFileStatus.classList.remove("hidden");

  const key = await assetManager.store(fileToUpload, {
    path: filePath.value,
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
    uploadFileStatus.classList.add("hidden");
    submitButton.classList.remove("hidden");
    uploadFileModal.close();
  }, 3000);

  return false;
});
