/**
 * Returns the file size in KB if the size is lower than 1MB,
 * otherwise returns the size in MB
 * @param {bigint} size File size in bytes
 */
export const formatFileSize = (size: bigint, showUnit = true): string => {
  if (size < BigInt(1024)) {
    return `${size}${showUnit ? "B" : ""}`;
  }
  if (size < BigInt(1024 * 1024)) {
    const decimals = size % BigInt(1024);
    return `${size / BigInt(1024)}.${decimals}${showUnit ? "KB" : ""}`;
  } else {
    let decimals = size % BigInt(1024 * 1024);
    if (decimals % BigInt(1024) > 0) {
      decimals = decimals / BigInt(1024);
    }
    return `${(size / BigInt(1024 * 1024))}.${decimals}${showUnit ? "MB" : ""}`;
  }
};

export const formatTimestamp = (timestamp: bigint) => {
  const date = new Date(Number(timestamp / BigInt(1_000_000)));
  return new Intl.DateTimeFormat("en", {
    timeStyle: "medium",
    dateStyle: "medium",
    hourCycle: "h24",
  }).format(date);
}

export const setButtonLoading = (button: HTMLButtonElement) => {
  button.setAttribute("disabled", "true");
  button.innerHTML = `<span class="loading loading-infinity loading-md"></span>`;
};

export const removeButtonLoading = (button: HTMLButtonElement, text: string) => {
  button.removeAttribute("disabled");
  button.innerHTML = text;
}
