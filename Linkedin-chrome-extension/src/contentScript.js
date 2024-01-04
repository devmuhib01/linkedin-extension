// Content script

(() => {
  const sendMessageToBackground = (message, data) => {
    chrome.runtime.sendMessage({ message, data });
  };

  const handleLoginUserData = () => {
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

    sendMessageToBackground("linkedinUserInfo", userData);
  };

  const handleSearchedPeople = () => {
    const searchResultContainerList = document.querySelectorAll(
      ".reusable-search__entity-result-list > .reusable-search__result-container"
    );

    let peoples = [];

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
      const peopleSecondarySubtitle = secondaryTitleElement?.textContent.trim();
      const peoplePrimarySubtitle = primarySubtitleElement?.textContent.trim();
      const peopleName = nameElement?.textContent;
      const profileUrl = linkElement?.href.split("?")[0];

      peoples.push({
        peopleImg,
        peoplePrimarySubtitle,
        peopleSecondarySubtitle,
        peopleName,
        profileUrl,
      });
    });

    sendMessageToBackground("searchedPeopleData", { peoples });
  };

  const handleGetPersonInfo = () => {
    const personUserName = window.location.href.split("/")[4];

    const iframe = document.createElement("iframe");
    iframe.classList.add("profile-page-" + personUserName);
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.src = `https://www.linkedin.com/in/${personUserName}/`;

    document.body.appendChild(iframe);

    const getIframe = document.querySelector(".profile-page-" + personUserName);

    getIframe.onload = async () => {
      let person = {};
      // let iframeDocument =
      //   iframe.contentDocument || iframe.contentWindow.document;

      let isSendData = false;

      const nameElement = document.querySelector(
        "div.ph5.pb5 > div.mt2.relative > div:nth-child(1) > div:nth-child(1) > span > a h1"
      );

      if (nameElement) {
        person["name"] = nameElement.textContent;
        const splitName = nameElement.textContent.split(" ");

        if (splitName.length >= 3) {
          person["first_name"] = splitName[0] + " " + splitName[1];
          person["last_name"] = splitName[2];
        } else {
          person["first_name"] = splitName[0];
          person["last_name"] = splitName[1];
        }
      }

      person["title"] =
        document
          .querySelector(
            "div.ph5.pb5 > div.mt2.relative > div:nth-child(1) > div.text-body-medium.break-words"
          )
          ?.textContent.trim() || null;

      const aboutElement = document.getElementById("about");

      if (aboutElement) {
        const nextDiv = aboutElement.nextElementSibling;

        if (nextDiv && nextDiv.tagName.toLowerCase() === "div") {
          const secondNextDiv = nextDiv.nextElementSibling;
          if (secondNextDiv && secondNextDiv.tagName.toLowerCase() === "div") {
            const textContent =
              secondNextDiv?.textContent || secondNextDiv?.innerText;
            person["about"] = textContent.trim() || null;
          }
        }
      }

      person["experiences"] = [];
      person["educations"] = [];
      person["skills"] = [];
      person["recommendations"] = [];

      const educationElement = document.getElementById("education");
      if (educationElement) {
        const nextDiv = educationElement.nextElementSibling;
        if (nextDiv && nextDiv.tagName.toLowerCase() === "div") {
          const secondNextDiv = nextDiv.nextElementSibling;
          if (secondNextDiv && secondNextDiv.tagName.toLowerCase() === "div") {
            const educationList = secondNextDiv.querySelectorAll(
              ".pvs-list > .artdeco-list__item"
            );
            educationList.forEach((item) => {
              let education = {};

              const universityLink = item.querySelector(
                ".optional-action-target-wrapper"
              )?.href;

              if (
                universityLink &&
                universityLink.includes("https://www.linkedin.com/company")
              ) {
                education["university_link"] = universityLink;
              } else {
                education["university_link"] = null;
              }

              education["university_name"] = item.querySelector(
                "div.pvs-entity--padded > div:nth-child(2) > div:nth-child(1) > a > div > div > div > div > span"
              )?.textContent;

              education["degree"] = item.querySelector(
                "div.pvs-entity--padded > div:nth-child(2) > div:nth-child(1) > a > span:nth-child(2) > span"
              )?.textContent;

              education["duration"] = item.querySelector(
                "div.pvs-entity--padded > div:nth-child(2) > div:nth-child(1) > a > span:nth-child(3) > span"
              )?.textContent;

              person.educations.push(education);
            });
          }
        }
      }

      const experienceElement = document.getElementById("experience");
      if (experienceElement) {
        const nextDiv = experienceElement.nextElementSibling;
        if (nextDiv && nextDiv.tagName.toLowerCase() === "div") {
          const secondNextDiv = nextDiv.nextElementSibling;
          if (secondNextDiv && secondNextDiv.tagName.toLowerCase() === "div") {
            const experienceList = secondNextDiv.querySelectorAll(
              ".pvs-list > .artdeco-list__item"
            );
            experienceList.forEach((item) => {
              let experience = {};

              experience["is_current"] = false;

              const companyLink = item.querySelector(
                ".optional-action-target-wrapper"
              )?.href;

              if (
                companyLink &&
                companyLink.includes("https://www.linkedin.com/company")
              ) {
                experience["company_link"] = companyLink;
              } else {
                experience["company_link"] = null;
              }

              experience["designation"] =
                item.querySelector(
                  "div.pvs-entity--padded > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div > div > div > div > span"
                )?.textContent || null;

              experience["company_name"] =
                item.querySelector(
                  "div.pvs-entity--padded > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)  >  span > span "
                )?.textContent || null;

              const duration = item.querySelector(
                "div.pvs-entity--padded > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)  >  span:nth-child(3) > span "
              );

              if (duration) {
                experience["duration"] = duration?.textContent || null;

                // Define a regular expression to match the different parts of the string
                const regex = /([\w\s]+ \d{4}) - (\w+)? · (\d+ yrs? \d+ mo)/;

                // Use the regular expression to extract the matched groups
                const matches = duration?.textContent.match(regex);

                // Create an array with the extracted parts
                const resultArray = matches
                  ? [matches[1], matches[2] || "Present", matches[3]]
                  : [];

                if (resultArray.includes("Present")) {
                  experience["is_current"] = true;
                }
              }

              experience["company_location"] =
                item.querySelector(
                  "div.pvs-entity--padded > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)  >  span:nth-child(4) > span "
                )?.textContent || null;

              person.experiences.push(experience);
            });
          }
        }
      }

      const recommendationsElement = document.getElementById("recommendations");
      if (recommendationsElement) {
        const nextDiv = recommendationsElement.nextElementSibling;
        if (nextDiv && nextDiv.tagName.toLowerCase() === "div") {
          const secondNextDiv = nextDiv.nextElementSibling;
          if (secondNextDiv && secondNextDiv.tagName.toLowerCase() === "div") {
            const recommendationsList = secondNextDiv.querySelectorAll(
              ".pvs-list > .artdeco-list__item"
            );

            let newRecommendations = [];

            newRecommendations.push(
              recommendationsList[0],
              recommendationsList[1]
            );

            newRecommendations?.forEach((item) => {
              let recommendation = {};

              recommendation["recommender_profile_url"] = item.querySelector(
                ".optional-action-target-wrapper"
              )?.href;

              recommendation["recommender_name"] = item.querySelector(
                "div.pvs-entity--padded > div:nth-child(2) > div:nth-child(1) > a > div > div > div > div > span"
              )?.textContent;

              recommendation["recommender_title"] = item.querySelector(
                "div.pvs-entity--padded > div:nth-child(2) > div:nth-child(1) > a > span:nth-child(2) > span"
              )?.textContent;

              recommendation["message"] = item
                .querySelector(
                  "div.pvs-entity--padded > div:nth-child(2) > div:nth-child(2) > ul.pvs-list > li> div.pvs-list__outer-container > ul > li > div > div> div > div > span"
                )
                ?.textContent.trim();

              person.recommendations.push(recommendation);
            });
          }
        }
      }

      const skillElement = document.getElementById("skills");
      if (skillElement) {
        const nextDiv = skillElement.nextElementSibling;
        if (nextDiv && nextDiv.tagName.toLowerCase() === "div") {
          const secondNextDiv = nextDiv.nextElementSibling;
          if (secondNextDiv && secondNextDiv.tagName.toLowerCase() === "div") {
            const seeMoreBtn = secondNextDiv.querySelector(
              ".pvs-list__footer-wrapper > div > div > a"
            );

            if (seeMoreBtn) {
              const iframe = document.createElement("iframe");
              iframe.id = `${personUserName}_skills`;
              iframe.src = `https://www.linkedin.com/in/${personUserName}/details/skills/`;
              iframe.setAttribute("hidden", true);
              iframe.setAttribute("frameborder", "0");

              document.body.appendChild(iframe);

              // if (person_user !== personUserName) {}
            }
          }
        }
      }

      let intervalId = setInterval(() => {
        let skillsIframe = document.getElementById(`${personUserName}_skills`);
        let iframeDocument =
          skillsIframe?.contentDocument || skillsIframe.contentWindow.document;

        let ulElement = iframeDocument.querySelector(
          "div.scaffold-finite-scroll__content > ul.pvs-list"
        );

        let skills = [];

        if (ulElement) {
          clearInterval(intervalId);

          ulElement.querySelectorAll(".artdeco-list__item")?.forEach((item) => {
            const skill = item.querySelector(
              "div.pvs-entity--padded > div:nth-child(2) > div:nth-child(1) > a > div > div > div > div > span"
            )?.textContent;

            skills.push(skill);
            const uniqueSkills = [...new Set(skills)] || [];

            person.skills = uniqueSkills;

            sendMessageToBackground("getPersonInfo", { person });
          });
        }
      }, 1000);

      // Set a timeout to stop the interval after 20 seconds
      setTimeout(() => {
        clearInterval(intervalId);
      }, 20000);

      sendMessageToBackground("getPersonInfo", { person });

      getIframe.remove();
    };
  };

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { message, data } = obj;

    if (message === "extensionData") {
      handleLoginUserData();
    }

    if (message === "searchedPeople") {
      handleSearchedPeople();
    }

    if (message === "getPersonInfo") {
      handleGetPersonInfo();
    }
  });
})();
