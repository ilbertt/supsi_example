import { AssetManager } from "@dfinity/assets";

let assetManager: AssetManager;

export const getAssetManager = () => {
  return assetManager;
};

export const setAssetManager = (am: AssetManager) => {
  assetManager = am;
};
