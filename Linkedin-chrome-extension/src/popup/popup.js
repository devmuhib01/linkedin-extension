document.addEventListener("DOMContentLoaded", async () => {
  const user = await chrome.storage.local.get("linkedinUserInfo");

  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      // tabs is an array of tab objects that match the query
      if (!tabs.length) return;
      const container = document.getElementsByClassName("container")[0];

      const activeTab = tabs[0];

      // if (activeTab.url.includes("https://www.linkedin.com")) {
      chrome.cookies.getAll({ url: "https://www.linkedin.com" }, (cookies) => {
        const hasLinkedInCookies = cookies.find((cookie) => {
          return cookie.name === "li_at";
        });

        if (hasLinkedInCookies) {
          console.log("User is logged in on LinkedIn");
          const userInfo = user.linkedinUserInfo;

          container.innerHTML = `<div>
                              <h1 class="title">My Linkedin Extension</h1>
                              <div>
                              <h2>isLoggedIn: ${userInfo.loggedIn}</h2>
                                <img src=${userInfo.profileImage} />
                                <h2>${userInfo.userName}</h2>
                               
                              </div>
                            </div>`;
        } else {
          console.log("User is not logged in on LinkedIn");

          chrome.storage.local.remove("linkedinUserInfo");
          container.innerHTML =
            '<h1 class="title">you are not Logged in please signup</h1>';
        }
      });
      // } else {
      //   chrome.storage.local.remove("linkedinUserInfo");
      //   container.innerHTML =
      //     '<h1 class="title">you are not in current the tab</h1>';
      // }
    }
  );
});
