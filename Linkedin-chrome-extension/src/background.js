chrome.runtime.onInstalled.addListener(() => {
  console.log("LinkedIn Extension Installed");
});

const localStorage = {
  getItem: async (key) => (await chrome.storage.local.get(key))[key],
  setItem: (key, val) => chrome.storage.local.set({ [key]: val }),
  removeItems: (keys) => chrome.storage.local.remove(keys),
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "linkedinUserInfo") {
    const userInfo = request.data;

    localStorage.setItem("linkedinUserInfo", userInfo);
  }

  sendResponse();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    tab?.url &&
    tab?.url.includes("https://www.linkedin.com") &&
    changeInfo?.status === "complete"
  ) {
    chrome.tabs.sendMessage(tabId, {
      message: "extensionData",
      data: { url: tab.url },
    });
  }
});
