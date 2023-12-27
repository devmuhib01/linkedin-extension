document.addEventListener("DOMContentLoaded", async () => {
  const user = await chrome.storage.local.get("linkedinUserInfo");
  const searchedPeoplesData = await chrome.storage.local.get(
    "searchedPeopleData"
  );

  console.log("user", user);

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
                                <img src=${userInfo.profileImage} />
                                <h2>${userInfo.fullName}</h2>
                                <h3>Occupation: ${userInfo.occupation}</h3>
                              </div>
                            </div>`;

          console.log(searchedPeoplesData.peoplesData, "peoples");
        } else {
          console.log("User is not logged in on LinkedIn");

          chrome.storage.local.remove("linkedinUserInfo");
          container.innerHTML =
            '<h1 class="title">Please log in Linkedin.</h1>';
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
