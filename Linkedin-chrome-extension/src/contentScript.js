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

        const peopleImg = imgElement?.src;
        const peopleSecondarySubtitle = secondaryTitleElement?.textContent;
        const peoplePrimarySubtitle = primarySubtitleElement?.textContent;
        const peopleName = nameElement?.textContent;

        console.log({
          peopleImg,
          peoplePrimarySubtitle,
          peopleSecondarySubtitle,
          peopleName,
        });

        peoplesData.push({
          peopleImg,
          peoplePrimarySubtitle,
          peopleSecondarySubtitle,
          peopleName,
        });
      });

      chrome.runtime.sendMessage({
        message: "searchedPeopleData",
        data: {
          peoplesData,
        },
      });
    }
  });
})();
