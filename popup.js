document.addEventListener("DOMContentLoaded", function () {
  // Elements
  var viewTabsButton = document.getElementById("viewTabsButton");
  var savedTabsButton = document.getElementById("savedTabsButton");
  var viewSection = document.getElementById("viewSection");
  var saveSection = document.getElementById("saveSection");
  var activeTabsContent = document.getElementById("activeTabsContent");
  var saveActiveTabs = document.getElementById("saveActiveTabs");
  var saveNameInput = document.getElementById("saveNameInput");
  var saveButton = document.getElementById("saveButton");
  var savedTabsList = document.getElementById("savedTabsList");
  var popupSaveActiveTabs = document.getElementById("popupSaveActiveTabs");
  var saveActiveTabsName = document.getElementById("saveActiveTabsName");
  var saveActiveTabsButton = document.getElementById("saveActiveTabsButton");
  var closePopupButton = document.getElementById("closePopupButton");

  //   new

  var executeCodeButton = document.getElementById("executeCodeButton");
  var executeCodeSection = document.getElementById("executeCodeSection");

  // Elements
  var executeCode = document.getElementById("executeCode");
  var sharedCodeTextarea = document.getElementById("sharedCode");

  // Handle execute code button click
  executeCode.addEventListener("click", function () {
    var sharedCode = sharedCodeTextarea.value.trim();
    if (sharedCode === "") {
      alert("Please paste code to execute.");
      return;
    }

    try {
      var lines = sharedCode.split("\n");
      var folderName =
        lines[0].replace("Folder: ", "").trim().substring(0, 10) + " - Shared";
      var tabUrls = lines.slice(1).map(function (line) {
        return line.trim();
      });

      // Create folder based on the parsed code
      chrome.storage.local.get(["savedTabs"], function (result) {
        var savedTabs = result.savedTabs || {};
        var isShared = true;

        // Check if the folder name already exists
        if (savedTabs[folderName]) {
          var counter = 1;
          var originalFolderName = folderName;
          while (savedTabs[folderName]) {
            folderName = originalFolderName + " (" + counter + ")";
            counter++;
          }
        }

        savedTabs[folderName] = { urls: tabUrls, isShared: isShared }; // Fixed 'urls' key
        chrome.storage.local.set({ savedTabs: savedTabs }, function () {
          sharedCodeTextarea.value = "";
          SST();
        });
      });
    } catch (error) {
      console.log("Error parsing shared code: " + error.message);
    }
  });

  //   viewTabsButton.addEventListener("click", function () {
  //     viewTabsButton.classList.add("active");
  //     savedTabsButton.classList.remove("active");
  //     viewSection.style.display = "block";
  //     saveSection.style.display = "none";
  //   });

  //   savedTabsButton.addEventListener("click", function () {
  //     viewTabsButton.classList.remove("active");
  //     savedTabsButton.classList.add("active");
  //     viewSection.style.display = "none";
  //     saveSection.style.display = "block";
  //     showSavedTabs();
  //   });

  // Switch between sections
  viewTabsButton.addEventListener("click", function () {
    viewTabsButton.classList.add("active");
    savedTabsButton.classList.remove("active");
    executeCodeButton.classList.remove("active");
    viewSection.style.display = "block";
    saveSection.style.display = "none";
    executeCodeSection.style.display = "none";
  });

  savedTabsButton.addEventListener("click", SST);

  function SST() {
    viewTabsButton.classList.remove("active");
    savedTabsButton.classList.add("active");
    executeCodeButton.classList.remove("active");
    viewSection.style.display = "none";
    saveSection.style.display = "block";
    executeCodeSection.style.display = "none";
    showSavedTabs();
  }

  executeCodeButton.addEventListener("click", function () {
    viewTabsButton.classList.remove("active");
    savedTabsButton.classList.remove("active");
    executeCodeButton.classList.add("active");
    viewSection.style.display = "none";
    saveSection.style.display = "none";
    executeCodeSection.style.display = "block";
  });

  // Show active tabs
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(function (tab) {
      var tabDiv = createTabDiv(tab);
      activeTabsContent.appendChild(tabDiv);
    });
  });

  // Save active tabs
  saveActiveTabs.addEventListener("click", function () {
    popupSaveActiveTabs.style.display = "flex";
    var currentDate = new Date();
    var monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    var day = currentDate.getDate();
    var monthIndex = currentDate.getMonth();
    var monthName = monthNames[monthIndex];
    var hours = currentDate.getHours();
    var minutes = currentDate.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // handle midnight (0 hours)
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var formattedDate =
      "Folder " +
      monthName +
      " " +
      day +
      ", " +
      hours +
      ":" +
      minutes +
      " " +
      ampm;
    saveActiveTabsName.value = formattedDate;
    saveActiveTabsName.focus();
  });

  // Save active tabs from popup
  saveActiveTabsButton.addEventListener("click", function () {
    var folderName = saveActiveTabsName.value.trim().substring(0, 25);
    if (folderName === "") {
      alert("Please enter work name.");
      return;
    }

    // Get current date and time
    var currentDate = new Date().toLocaleString();

    chrome.tabs.query({}, function (tabs) {
      var tabUrls = tabs.map(function (tab) {
        return tab.url;
      });

      chrome.storage.local.get(["savedTabs"], function (result) {
        var savedTabs = result.savedTabs || {};

        // Check if the folder name already exists
        if (savedTabs[folderName]) {
          var counter = 1;
          var originalFolderName = folderName;
          while (savedTabs[folderName]) {
            folderName = originalFolderName + " (" + counter + ")";
            counter++;
          }
        }

        savedTabs[folderName] = { urls: tabUrls, date: currentDate };
        chrome.storage.local.set({ savedTabs: savedTabs }, function () {
          saveActiveTabsName.value = "";
          popupSaveActiveTabs.style.display = "none";
          showSavedTabs(); // Update saved tabs list
        });
      });
    });
  });

  // Close the popup when close button is clicked
  closePopupButton.addEventListener("click", function () {
    popupSaveActiveTabs.style.display = "none";
  });

  // Show saved tabs
  // Show saved tabs
  function showSavedTabs() {
    chrome.storage.local.get(["savedTabs"], function (result) {
      var savedTabs = result.savedTabs || {};
      savedTabsList.innerHTML = ""; // Clear existing content

      // Convert savedTabs object into an array
      var savedTabsArray = Object.entries(savedTabs);

      // Sort savedTabsArray based on date
      savedTabsArray.sort(function (a, b) {
        var dateA = new Date(a[1].date);
        var dateB = new Date(b[1].date);
        return dateB - dateA; // Descending order, change to dateA - dateB for ascending order
      });

      savedTabsArray.forEach(function ([folderName, tabData]) {
        var folderDiv = document.createElement("div");
        folderDiv.classList.add("folder");
        folderDiv.classList.add("tab");

        var div1 = document.createElement("div");
        var folderIcon = document.createElement("img");
        folderIcon.setAttribute(
          "src",
          tabData.isShared ? "./images/shared.png" : "./images/tabs.png"
        );

        folderIcon.classList.add("folder-icon");
        div1.appendChild(folderIcon);

        var folderNameSpan = document.createElement("span");
        folderNameSpan.textContent = folderName;
        div1.appendChild(folderNameSpan);

        var div = document.createElement("div");

        var openAllIcon = document.createElement("img");
        openAllIcon.setAttribute("src", "./images/open.png");
        openAllIcon.classList.add("open-all-icon");
        openAllIcon.title = "Open All Tabs"; // Add tooltip
        openAllIcon.addEventListener(
          "click",
          createOpenTabsHandler(folderName, tabData.urls)
        );
        div.appendChild(openAllIcon);

        var copyButton = document.createElement("img");
        copyButton.setAttribute("src", "./images/copy.png");
        copyButton.title = "Copy";
        copyButton.classList.add("copy-button");
        copyButton.addEventListener(
          "click",
          createCopyFolderHandler(folderName, tabData.urls, copyButton)
        );
        div.appendChild(copyButton);

        var removeButton = document.createElement("img");
        removeButton.setAttribute("src", "./images/cross.png");
        removeButton.title = "Remove";
        removeButton.classList.add("remove-button");
        removeButton.addEventListener(
          "click",
          createRemoveFolderHandler(folderName)
        );
        div.appendChild(removeButton);

        folderDiv.appendChild(div1);
        folderDiv.appendChild(div);

        savedTabsList.appendChild(folderDiv);
      });
    });
  }

  // Create event handler for copying folder content
  function createCopyFolderHandler(folderName, tabUrls, copyButton) {
    return function () {
      var contentToCopy = "Folder: " + folderName + "\n";
      tabUrls.forEach(function (url) {
        contentToCopy += url + "\n";
      });
      navigator.clipboard.writeText(contentToCopy).then(
        function () {
          copyButton.classList.add("clicked");
          // Remove the class after 1 second
          setTimeout(function () {
            copyButton.classList.remove("clicked");
          }, 300);
        },
        function (err) {
          console.error("Unable to copy folder content: ", err);
        }
      );
    };
  }

  // Create event handler for opening saved tabs
  function createOpenTabsHandler(folderName, tabUrls) {
    return function () {
      console.log("Folder name:", folderName);
      console.log("Tab URLs:", tabUrls);
      chrome.windows.getCurrent(function (window) {
        if (tabUrls.isShared) {
          tabUrls.urls.forEach(function (url) {
            chrome.tabs.create({ windowId: window.id, url: url });
          });
        } else {
          tabUrls.forEach(function (url) {
            chrome.tabs.create({ windowId: window.id, url: url });
          });
        }
      });
    };
  }

  // Create event handler for removing folder
  function createRemoveFolderHandler(folderName) {
    return function () {
      chrome.storage.local.get(["savedTabs"], function (result) {
        var savedTabs = result.savedTabs || {};
        delete savedTabs[folderName];
        chrome.storage.local.set({ savedTabs: savedTabs }, function () {
          showSavedTabs(); // Update saved tabs list
        });
      });
    };
  }

  // Helper function to create tab div
  function createTabDiv(tab) {
    var tabDiv = document.createElement("div");
    tabDiv.classList.add("tab");

    var favicon = document.createElement("img");
    favicon.setAttribute(
      "src",
      tab.favIconUrl ? tab.favIconUrl : "./images/world.png"
    );
    favicon.classList.add("favicon");
    tabDiv.appendChild(favicon);

    var titleSpan = document.createElement("span");
    titleSpan.textContent = tab.title;
    tabDiv.appendChild(titleSpan);

    var removeButton = document.createElement("img");
    removeButton.setAttribute("src", "./images/cross.png");
    removeButton.title = "Remove";
    removeButton.classList.add("remove-button");
    removeButton.addEventListener("click", function (event) {
      event.stopPropagation();
      tabDiv.remove();
    });
    tabDiv.appendChild(removeButton);

    return tabDiv;
  }
});
