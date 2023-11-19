type Tab = "documents" | "sync";

let activeTab : Tab = "documents";

const setTabInURL = (tab: Tab) => {
  const url = new URL(window.location.href);

  url.pathname = tab === "documents" ? "/documents" : "/sync";

  window.history.replaceState({}, "", url.toString());
};

const parseTabFromURL = (): Tab => {
  const url = new URL(window.location.href);

  if (url.pathname.startsWith("/documents")) {
    return "documents";
  }

  if (url.pathname.startsWith("/sync")) {
    return "sync";
  }

  setTabInURL("documents");

  return "documents";
};

const documentsTabContainer = document.getElementById("documents")!;
const syncTabContainer = document.getElementById("sync")!;

const tabs = document.getElementById("navbarTabs")!.querySelectorAll(".tab");
const documentsTabButton = tabs[0];
const syncTabButton = tabs[1];

documentsTabButton.addEventListener("click", () => {
  onTabClick("documents");
});
syncTabButton.addEventListener("click", () => {
  onTabClick("sync");
});

const setActiveTab = (tab: Tab) => {
  setTabInURL(tab);

  activeTab = tab;
};

const getActiveTab = () => {
  activeTab = parseTabFromURL();
  return activeTab;
};

export const updateTabsUI = () => {
  if (getActiveTab() === "documents") {
    documentsTabButton.classList.add("tab-active");
    syncTabButton.classList.remove("tab-active");

    documentsTabContainer.classList.remove("hidden");
    syncTabContainer.classList.add("hidden");
  } else {
    documentsTabButton.classList.remove("tab-active");
    syncTabButton.classList.add("tab-active");

    documentsTabContainer.classList.add("hidden");
    syncTabContainer.classList.remove("hidden");
  }
};

const onTabClick = (tab: Tab) => {
  setActiveTab(tab);
  updateTabsUI();
};
