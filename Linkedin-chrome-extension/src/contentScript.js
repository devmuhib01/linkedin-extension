(() => {
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { message, data } = obj;
    if (message === "extensionData") {
      const userNameElement = document.querySelector(".global-nav__me-photo");

      if (userNameElement) {
        const userName = userNameElement.alt;
        const profileImage = userNameElement.src;

        chrome.runtime.sendMessage({
          message: "linkedinUserInfo",
          data: {
            loggedIn: true,
            userName,
            profileImage,
          },
        });
      }
    }
  });
})();
