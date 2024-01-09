document.addEventListener("DOMContentLoaded", async () => {
  let server = `http://localhost:8000/extension`;

  const iframe = document.createElement("iframe");
  iframe.src = window.location.href.includes("outside=true")
    ? `${server}?outside=true`
    : server;
  iframe.width = "100%";
  iframe.height = "595px";
  document.getElementById("app").appendChild(iframe);

  const user = await chrome.storage.local.get("linkedinUserInfo");
  const searchedData = await chrome.storage.local.get("searchedPeopleData");
  const personData = await chrome.storage.local.get("person");

  console.log("person", personData);

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
      chrome.cookies.getAll(
        { url: "https://www.linkedin.com" },
        async (cookies) => {
          const hasLinkedInCookies = cookies.find((cookie) => {
            return cookie.name === "li_at";
          });

          if (hasLinkedInCookies) {
            const userInfo = user.linkedinUserInfo;

            const data = { ...userInfo, cookies: null };

            const response = await fetch(
              `http://localhost:8000/lead-hub/add-linkedin-account`,
              {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
              }
            );

            console.log(response, "json");

            const res = await fetch(
              `http://localhost:8000/get-linkedin-account/${userInfo.profile_user_name}`
            );

            console.log("User is logged in on LinkedIn");

            // container.innerHTML = `<div>
            //                   <h1 class="title">My Linkedin Extension</h1>

            //                   <h3>Current Linkedin account connected</h3>
            //                   <div class='user__info'>
            //                     <img src=${userInfo.profile_picture} />
            //                     <div>
            //                     <h2>${userInfo.name}</h2>
            //                     <h3>Occupation: ${userInfo.occupation}</h3>
            //                     </div>
            //                   </div>

            //                   <button class="user__details-btn">Get User Details </button>
            //                 </div>`;

            let peoplesProfileUrl = [];

            const searchedListContainer =
              document.querySelector(".searched__list");

            // if (searchedData.searchedPeopleData?.peoples?.length) {
            //   searchedListContainer.insertAdjacentHTML(
            //     "beforeend",
            //     "<h1>Search Result</h1>"
            //   );
            //   searchedData.searchedPeopleData?.peoples?.forEach((item) => {
            //     peoplesProfileUrl.push(item.profileUrl);

            //     searchedListContainer.innerHTML += `<li>
            //    <img src=${item.peopleImg} />
            //     <div>
            //     <h2>${item.peopleName}</h2>
            //     <h3>${item.peoplePrimarySubtitle}</h3>
            //     <h4>${item.peopleSecondarySubtitle}</h4>
            //     <a href=${item.profileUrl}>Profile Link</a>
            //     </div>

            //    </li>`;
            //   });
            // }

            document
              .querySelector(".user__details-btn")
              .addEventListener("click", () => {
                chrome.runtime.sendMessage({
                  message: "showListUserDetails",
                  data: peoplesProfileUrl,
                });
              });

            console.log(searchedData.searchedPeopleData?.peoples, "peoples");
          } else {
            console.log("User is not logged in on LinkedIn");

            chrome.storage.local.remove("linkedinUserInfo");
            chrome.storage.local.remove("searchedPeopleData");
            chrome.storage.local.remove("person");
            container.innerHTML =
              '<h1 class="title">Please log in Linkedin.</h1>';
          }
        }
      );
      // } else {
      //   chrome.storage.local.remove("linkedinUserInfo");
      //   container.innerHTML =
      //     '<h1 class="title">you are not in current the tab</h1>';
      // }
    }
  );
});
