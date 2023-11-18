import "./style.css"

import { AssetManager } from "@dfinity/assets";
import { canisterId } from "../../declarations/backend";
import { HttpAgent } from "@dfinity/agent";

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

assetManager.list().then((filesData) => {
  console.log("Files:", filesData);
});

document.getElementById("uploadFileForm")!.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log(e);
  
  await agent.fetchRootKey();

  const filePath = (e.target as HTMLFormElement)!.elements.namedItem("filePath")! as HTMLInputElement;
  const fileObj = (e.target as HTMLFormElement)!.elements.namedItem("fileContent")! as HTMLInputElement;
  const fileToUpload = fileObj.files![0];

  console.log("filePath", filePath, "fileContent", fileObj);

  const submitButton = (e.target as HTMLFormElement)!.querySelector("#uploadFileButton")!;
  submitButton.classList.add("btn-disabled");

  const key = await assetManager.store(fileToUpload, {
    path: filePath.value,
    contentType: fileObj.type,
  });

  console.log("File key:", key);

  submitButton.classList.remove("btn-disabled");

  document.getElementById("uploadResult")!.innerText = "Done! Uploaded file at path: " + filePath;

  return false;
});

