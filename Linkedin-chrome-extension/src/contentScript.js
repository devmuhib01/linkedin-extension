// var script = document.createElement("script");
// script.src = "https://code.jquery.com/jquery-3.7.1.min.js";
// script.onload = function () {
//   main();
// };
// document.head.appendChild(script);

// function main() {
//   $(document).ready(function () {
//     console.log("jQuery is ready in content script");
//   });
// }

// $("#about").next('div').next('div').text()

(() => {
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { message, data } = obj;

    if (message === "extensionData") {
      const allCodes = document.querySelectorAll('code[id^="bpr-guid"]');

      if (!allCodes.length) return;

      let userData = {};

      allCodes?.forEach((item) => {
        let linkedinData = item.textContent;

        if (linkedinData.includes("publicContactInfo")) {
          const data = JSON.parse(linkedinData);

          data?.included.forEach((item) => {
            const { firstName, lastName, picture, occupation } = item;

            userData = {
              fullName: `${firstName} ${lastName}`,
              profileImage: `${picture.rootUrl}${picture.artifacts[1].fileIdentifyingUrlPathSegment}`,
              occupation,
            };
          });
        }
      });

      chrome.runtime.sendMessage({
        message: "linkedinUserInfo",
        data: {
          ...userData,
        },
      });
    }

    if (message === "searchedPeople") {
      const searchResultContainerList = document.querySelectorAll(
        ".reusable-search__entity-result-list > .reusable-search__result-container"
      );

      let peoplesData = [];

      searchResultContainerList?.forEach((searchResultContainer) => {
        const imgElement = searchResultContainer.querySelector(
          ".presence-entity > img"
        );
        const secondaryTitleElement = searchResultContainer.querySelector(
          ".entity-result__secondary-subtitle"
        );
        const primarySubtitleElement = searchResultContainer.querySelector(
          ".entity-result__primary-subtitle"
        );
        const nameElement = searchResultContainer.querySelector(
          ".entity-result__title-line > span:nth-child(1) > a > span > span:nth-child(1)"
        );
        const linkElement = searchResultContainer.querySelector(
          ".entity-result__universal-image > div > a "
        );

        const peopleImg = imgElement?.src;
        const peopleSecondarySubtitle =
          secondaryTitleElement?.textContent.trim();
        const peoplePrimarySubtitle =
          primarySubtitleElement?.textContent.trim();
        const peopleName = nameElement?.textContent;
        const profileUrl = linkElement?.href.split("?")[0];

        peoplesData.push({
          peopleImg,
          peoplePrimarySubtitle,
          peopleSecondarySubtitle,
          peopleName,
          profileUrl,
        });
      });

      chrome.runtime.sendMessage({
        message: "searchedPeopleData",
        data: {
          peoplesData,
        },
      });
    }

    if (message === "getPersonInfo") {
      const personUserName = window.location.href.split("/")[4];

      let person = {};

      person["name"] = document.querySelector(
        " div.ph5.pb5 > div.mt2.relative > div:nth-child(1) > div:nth-child(1) > span > a h1"
      )?.textContent;

      person["title"] = document
        .querySelector(
          "div.ph5.pb5 > div.mt2.relative > div:nth-child(1) > div.text-body-medium.break-words"
        )
        ?.textContent.trim();

      const aboutElement = document.getElementById("about");

      if (aboutElement) {
        const nextDiv = aboutElement.nextElementSibling;

        if (nextDiv && nextDiv.tagName.toLowerCase() === "div") {
          const secondNextDiv = nextDiv.nextElementSibling;
          if (secondNextDiv && secondNextDiv.tagName.toLowerCase() === "div") {
            const textContent =
              secondNextDiv.textContent || secondNextDiv.innerText;
            person["about"] = textContent.trim();
          }
        }
      }

      const educationElement = document.getElementById("education");
      if (educationElement) {
        const nextDiv = aboutElement.nextElementSibling;
        if (nextDiv && nextDiv.tagName.toLowerCase() === "div") {
          const secondNextDiv = nextDiv.nextElementSibling;
          if (secondNextDiv && secondNextDiv.tagName.toLowerCase() === "div") {
            const textContent = secondNextDiv.innerHTML;
            console.log(textContent, "fakfaj");
          }
        }
      }

      person["experience"] = [];
      person["education"] = [];

      console.log(person, "person");

      chrome.runtime.sendMessage({
        message: "getPersonInfo",
        data: {
          person,
        },
      });

      // const iframe = document.createElement("iframe");
      // iframe.classList.add("profile-page-" + personUserName);
      // iframe.width = "100%";
      // iframe.height = "100%";
      // iframe.src = `https://www.linkedin.com/in/${personUserName}/`;

      // document.body.appendChild(iframe);

      // const getIframe = document.querySelector(
      //   ".profile-page-" + personUserName
      // );

      // getIframe.onload = () => {
      //   let person = {};

      //   let iframeDocument =
      //     iframe.contentDocument || iframe.contentWindow.document;

      //   person["name"] = iframeDocument.querySelector(
      //     " div.ph5.pb5 > div.mt2.relative > div:nth-child(1) > div:nth-child(1) > span > a h1"
      //   )?.textContent;

      //   person["title"] = iframeDocument
      //     .querySelector(
      //       "div.ph5.pb5 > div.mt2.relative > div:nth-child(1) > div.text-body-medium.break-words"
      //     )
      //     ?.textContent.trim();

      //   // const aboutElement = iframeDocument.getElementById("about");

      //   // if (aboutElement) {
      //   //   var nextDiv = aboutElement.nextElementSibling;

      //   //   console.log(nextDiv, "next div");
      //   //   if (nextDiv && nextDiv.tagName.toLowerCase() === "div") {
      //   //     var secondNextDiv = nextDiv.nextElementSibling;
      //   //     if (
      //   //       secondNextDiv &&
      //   //       secondNextDiv.tagName.toLowerCase() === "div"
      //   //     ) {
      //   //       var textContent =
      //   //         secondNextDiv.textContent || secondNextDiv.innerText;
      //   //       person["about"] = textContent;
      //   //     }
      //   //   }
      //   // }

      //   person["experience"] = [];
      //   person["education"] = [];

      //   console.log(person, "person");

      //   chrome.runtime.sendMessage({
      //     message: "getPersonInfo",
      //     data: {
      //       person,
      //     },
      //   });

      //   // getIframe.remove();
      // };
    }
  });
})();
