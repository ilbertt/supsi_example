import "./style.css"
import { setupCounter } from "./counter.ts"

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Vite + TypeScript</h1>
    <div class="bg-slate-700">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>("#counter")!)

// import { AssetManager } from "@dfinity/assets";
// import { canisterId } from "../../declarations/backend";
// import { HttpAgent } from "@dfinity/agent";

// const host = process.env.DFX_NETWORK === "ic" ? "https://icp0.io" : "http://127.0.0.1:4943";

// const agent = new HttpAgent({
//   host,
// })

// const assetManager = new AssetManager({
//   canisterId,
//   agent,
// });

// document.getElementById("uploadFileForm").addEventListener("submit", async (e) => {
//   await agent.fetchRootKey();

//   console.log(e, this);

//   e.preventDefault();

//   const filePath = e.target.elements.filePath.value;
//   const fileObj = e.target.elements.fileContent.files[0];

//   console.log("filePath", filePath, "fileContent", fileObj);

//   const button = e.target.querySelector("#submitUploadFileFormButton");
//   button.setAttribute("disabled", true);

//   const key = await assetManager.store(fileObj, {
//     path: filePath,
//     contentType: fileObj.type,
//   });

//   console.log("File key:", key);

//   button.removeAttribute("disabled");

//   document.getElementById("result").innerText = "Done! Uploaded file at path: " + filePath;

//   return false;
// });

