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

  if (request.message === "searchedPeopleData") {
    const peoplesData = request.data;
    localStorage.setItem("searchedPeopleData", peoplesData);
  }

  if (request.message === "getPersonInfo") {
    const person = request.data;

    localStorage.setItem("person", person);
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

  if (
    tab?.url &&
    tab?.url.includes("https://www.linkedin.com/search/results/people") &&
    changeInfo?.status === "complete"
  ) {
    chrome.tabs.sendMessage(tabId, {
      message: "searchedPeople",
      data: { url: tab.url },
    });
  }

  if (
    tab?.url &&
    tab?.url.includes("https://www.linkedin.com/in") &&
    changeInfo?.status === "complete"
  ) {
    chrome.tabs.sendMessage(tabId, {
      message: "getPersonInfo",
      data: { url: tab.url },
    });
  }
});
