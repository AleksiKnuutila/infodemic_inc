let currentLanguage = "en"; // Default language is English
const gameLink = "https://infodemic.gg"; // This will be the Game Link
let backgroundInterval = null; // To store the background rotation interval

// Animation timing parameters (milliseconds) - Adjust for faster/slower gameplay
const GAME_SPEED = {
  FAST: {
    firstChoiceDelay: 50,
    secondChoiceDelay: 100,
    typingIndicatorDelay: 200,
    errorMessageDelay: 300,
    loadingIncrement: 5
  },
  NORMAL: {
    firstChoiceDelay: 250,
    secondChoiceDelay: 500,
    typingIndicatorDelay: 1000,
    errorMessageDelay: 1500,
    loadingIncrement: 4
  }
};

// Set speed mode - change to GAME_SPEED.FAST for testing or GAME_SPEED.NORMAL for regular play
let currentSpeed = GAME_SPEED.NORMAL;
const aboutText = {
  en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc et sodales sapien, sit amet pulvinar lectus. Sed pulvinar nulla nulla. Nulla vel lacus ac massa pellentesque tristique. Donec euismod nibh ante, nec porta felis pellentesque a. Quisque sed ex sagittis, tincidunt tortor nec, mattis magna. Nunc euismod libero ex, vitae elementum dolor ornare id. Interdum et malesuada fames ac ante ipsum primis in faucibus. Suspendisse porttitor dui cursus laoreet lacinia. \n\nNunc sagittis sapien sit amet ipsum vehicula euismod eget eu ipsum. Vestibulum tempus velit et ante cursus, quis blandit mi lobortis. Morbi faucibus nunc eget risus ultricies feugiat. Praesent laoreet felis eu nulla sagittis venenatis. Cras malesuada lorem quis dolor lobortis convallis ut in dui.\n\nNunc sagittis sapien sit amet ipsum vehicula euismod eget eu ipsum. Vestibulum tempus velit et ante cursus, quis blandit mi lobortis. Morbi faucibus nunc eget risus ultricies feugiat. Praesent laoreet felis eu nulla sagittis venenatis. Cras malesuada lorem quis dolor lobortis convallis ut in dui.",
  es: "Este juego simula los desafíos de la gestión de redes sociales y la desinformación.  Tus decisiones impactan las ganancias y la legitimidad. ¿Puedes tener éxito?",
};
const shareText = {
  en: "Please share the game on...",
  es: "Por favor, comparte el juego con...",
};

// Function to create rotating background with smooth transitions
function setupRotatingBackground() {
  // Check if we're on a mobile-sized screen
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  // If mobile, use a simpler static background
  if (isMobile) {
    // For mobile, just set the body background directly
    document.body.style.backgroundImage =
      "url('images/info-lead-illustration1-mob-v1.png')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    // Return an empty function since we don't need transitions on mobile
    return function () {};
  }

  // Desktop version with animations
  // Create container for background halves
  const bgContainer = document.createElement("div");
  bgContainer.id = "rotating-background";
  bgContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        display: flex;
    `;

  // Create left half container
  const leftHalf = document.createElement("div");
  leftHalf.id = "bg-left";
  leftHalf.style.cssText = `
        width: 50%;
        height: 100%;
        background-image: url('images/split/illustration1-0.png');
        background-size: cover;
        background-position: right center;
        transition: opacity 2s ease;
    `;

  // Create right half container
  const rightHalf = document.createElement("div");
  rightHalf.id = "bg-right";
  rightHalf.style.cssText = `
        width: 50%;
        height: 100%;
        background-image: url('images/split/illustration1-1.png');
        background-size: cover;
        background-position: left center;
        transition: opacity 2s ease;
    `;

  // Add to container
  bgContainer.appendChild(leftHalf);
  bgContainer.appendChild(rightHalf);
  document.body.insertBefore(bgContainer, document.body.firstChild);

  // Preload images in custom order: illustration1, illustration3, illustration2
  const leftSideImages = [
    "images/split/illustration1-0.png",
    "images/split/illustration3-0.png",
    "images/split/illustration2-0.png",
  ];

  const rightSideImages = [
    "images/split/illustration1-1.png",
    "images/split/illustration3-1.png",
    "images/split/illustration2-1.png",
  ];

  // Preload images
  function preloadImages(imageArray) {
    imageArray.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

  preloadImages(leftSideImages);
  preloadImages(rightSideImages);

  // Set up rotation
  let currentLeftIndex = 0; // Starting with illustration1 (index 0)
  let currentRightIndex = 0; // Starting with illustration1 (index 0)

  function rotateBackground() {
    // Determine the next index for both halves
    const nextLeftIndex = (currentLeftIndex + 1) % leftSideImages.length;
    const nextRightIndex = (currentRightIndex + 1) % rightSideImages.length;

    // Left side transition
    transitionHalfBackground(
      leftHalf,
      leftSideImages[currentLeftIndex],
      leftSideImages[nextLeftIndex],
      "left"
    );

    // Update current index for next rotation
    currentLeftIndex = nextLeftIndex;

    // Change right side after 5 seconds
    setTimeout(() => {
      // Right side transition
      transitionHalfBackground(
        rightHalf,
        rightSideImages[currentRightIndex],
        rightSideImages[nextRightIndex],
        "right"
      );

      // Update current index for next rotation
      currentRightIndex = nextRightIndex;
    }, 5000);
  }

  // Helper function to handle the transition between images
  function transitionHalfBackground(container, oldImageSrc, newImageSrc, side) {
    // Clear any existing background from container itself
    container.style.backgroundColor = "transparent";
    container.style.backgroundImage = "none";

    // Create a background container that will hold both images
    const transitionContainer = document.createElement("div");
    transitionContainer.style.cssText = `
            position: absolute;
            top: 0;
            ${side === "left" ? "left: 0;" : "right: 0;"}
            width: 50%;
            height: 100%;
            overflow: hidden;
        `;

    // Create solid background color layer (prevents any background from showing through)
    const backgroundLayer = document.createElement("div");
    backgroundLayer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #F6F4F0;
            z-index: 0;
        `;

    // Create overlay with current (old) image
    const oldImageOverlay = document.createElement("div");
    oldImageOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('${oldImageSrc}');
            background-size: cover;
            background-position: ${side === "left" ? "right" : "left"} center;
            opacity: 1;
            transition: opacity 3s ease;
            z-index: 1;
        `;

    // Create overlay with new image
    const newImageOverlay = document.createElement("div");
    newImageOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('${newImageSrc}');
            background-size: cover;
            background-position: ${side === "left" ? "right" : "left"} center;
            opacity: 0;
            transition: opacity 3s ease;
            z-index: 2;
        `;

    // Build the transition container
    transitionContainer.appendChild(backgroundLayer);
    transitionContainer.appendChild(oldImageOverlay);
    transitionContainer.appendChild(newImageOverlay);

    // Add transition container to main container
    container.innerHTML = ""; // Clear any previous content
    container.appendChild(transitionContainer);

    // Trigger fade in/out after a short delay to ensure DOM is updated
    setTimeout(() => {
      newImageOverlay.style.opacity = "1";
      oldImageOverlay.style.opacity = "0";
    }, 50);

    // Clean up after transition completes (increased timeout to match longer transition)
    setTimeout(() => {
      // Set the container's background to the new image
      container.style.backgroundImage = `url('${newImageSrc}')`;
      container.style.backgroundSize = "cover";
      container.style.backgroundPosition = `${
        side === "left" ? "right" : "left"
      } center`;
      // Remove the transition container
      container.removeChild(transitionContainer);
    }, 3150);
  }

  // Store interval in global variable so we can stop it when game starts
  backgroundInterval = setInterval(rotateBackground, 10000);

  // Return the function so it can be called directly
  return rotateBackground;
}

// Function to change language
function changeLanguage(language) {
  currentLanguage = language;
  document.getElementById("languageDropdownMenu").style.display = "none";

  updateInitialMessage();
  updateScoresText();
  updateRestartButtonText();
  updateLanguageButtonText();

  updateAboutContent();
  updateShareContent();

  if (document.getElementById("gameContent").style.display === "block") {
    document.getElementById("gameContent").style.display = "none";
    document.getElementById("initialMessage").style.display = "block";
    loadGameData();
    document.getElementById("startButton").onclick = startGame;
  } else {
    loadGameData();
  }
}

// Function to load game data based on language
function loadGameData() {
  const languageFile =
    currentLanguage === "en" ? "data.json" : "data-spanish.json";
  fetch(languageFile)
    .then((response) => response.json())
    .then((data) => {
      gameData = data;
      currentSection = "beginning"; // Starting the game with the ID "beginning"
      profitScore = 50;
      legitimacyScore = 50;

      updateScores(); // Initialize scores display
      document.getElementById("startButton").onclick = startGame;
    })
    .catch((error) => console.error("Error:", error));
}

let gameData;
let currentSection;
let profitScore;
let legitimacyScore;

// Add loading screen functionality
function startGame() {
  // Stop background rotation when game starts
  if (backgroundInterval) {
    clearInterval(backgroundInterval);
    backgroundInterval = null;

    // Remove rotating background if it exists
    const rotatingBg = document.getElementById("rotating-background");
    if (rotatingBg) {
      document.body.removeChild(rotatingBg);
    }
  }

  // Hide home page and show loading screen
  document.getElementById("homeContainer").style.display = "none";
  document.getElementById("loadingScreen").style.display = "flex";

  // Hide the About and Share buttons in the header when game starts
  document.getElementById("headerOptions").style.display = "none";

  let progress = 0;
  const loadingPercent = document.getElementById("loadingPercent");
  const interval = setInterval(() => {
    progress += currentSpeed.loadingIncrement;
    loadingPercent.innerText = `${progress}%`;
    if (progress >= 100) {
      clearInterval(interval);

      // Initialize game container and hide loading screen
      document.getElementById("loadingScreen").style.display = "none";
      document.getElementById("gameContainer").style.display = "block";
      document.getElementById("languageSelector").style.display = "none"; // Hide language selector
      document.getElementById("scores").style.display = "flex";
      document.getElementById("gameContent").style.display = "block";
      document.getElementById("conversationContainer").style.display = "block";
      document.getElementById("choicesContainer").style.display = "flex";

      if (window.matchMedia("(max-width: 768px)").matches) {
        document.getElementById("gameContainer").style.backgroundImage = "none";
      } else {
        document.body.style.backgroundImage =
          "url('images/info-lead-illustration3-web-v1.png')";
      }

      currentSection = "beginning"; // Start from the beginning
      displayCurrentSection();
    }
  }, 25); // Update every 50ms for smoother animation
}

// Function to display current text and choices
function displayCurrentSection() {
  const conversationContainer = document.getElementById(
    "conversationContainer"
  );
  const choice1Button = document.getElementById("choice1");
  const choice2Button = document.getElementById("choice2");
  const choice1Container = document.getElementById("choice1Container");
  const choice2Container = document.getElementById("choice2Container");
  const choicesContainer = document.getElementById("choicesContainer");

  const section = gameData.find((item) => item.id === currentSection);

  // Add debug logging
  console.log("Current section:", section);
  console.log("Current scores:", { profitScore, legitimacyScore });

  if (!section) {
    console.error("Section with ID", currentSection, "not found");
    return;
  }

  // Function to determine status message based on profit and legitimacy
  function getStatusMessage(profit, legitimacy) {
    // Helper function to wrap messages with badge
    function wrapMessageWithBadge(message, badgeImage, altText) {
      return `<div class="promotion-container">
        <div class="promotion-message">${message}</div>
        <div class="promotion-badge">
          <img src="images/${badgeImage}" alt="${altText}" class="badge-image">
        </div>
      </div>`;
    }
    
    // Check if current section is the end node
    if (currentSection === "end") {
      if (profit < 0) {
        return wrapMessageWithBadge("Game Over! Since company profit plummeted, you ended up downgraded to Manager of Meme Containment.", "badge_failure.png", "Failure Badge");
      } else if (legitimacy < 0) {
        return wrapMessageWithBadge("Game Over! Since company reputation plummeted, you ended up downgraded to Manager of Meme Containment.", "badge_failure.png", "Failure Badge");
      } else if (profit >= 100) {
        return wrapMessageWithBadge("Congratulations! The game ended with you promoted to Chief Veracity Officer.", "promotion_badge.png", "Promotion Badge");
      } else if (legitimacy >= 100) {
        return wrapMessageWithBadge("Congratulations! The game ended with you promoted to Chief Veracity Officer.", "promotion_badge.png", "Promotion Badge");
      } else {
        return wrapMessageWithBadge("Game Over! You weren't promoted but managed to avoid crisis in the company.", "badge_thumbs.png", "Thumbs Badge");
      }
    } else if (profit < 0) {
      return wrapMessageWithBadge("Profit is below zero! You have been downgraded to Manager of Meme Containment.. Try to get those numbers back up!", "badge_failure.png", "Failure Badge");
    } else if (legitimacy < 0) {
      return wrapMessageWithBadge("Legitimacy is below zero! You have been downgraded to Manager of Meme Containment.. Try to get those numbers back up!", "badge_failure.png", "Failure Badge");
    } else if (profit >= 100) {
      return wrapMessageWithBadge("You have raised Profit over 100. So you're promoted to Chief Veracity Officer! See if you can do better still..", "promotion_badge.png", "Promotion Badge");
    } else if (legitimacy >= 100) {
      return wrapMessageWithBadge("You have raised Reputation over 100. So you're promoted to Chief Veracity Officer! See if you can do better still..", "promotion_badge.png", "Promotion Badge");
    } else {
      return wrapMessageWithBadge("You are doing well! Try to get profit or reputation to 100, without either going to zero..", "badge_thumbs.png", "Thumbs Badge");
    }
  }

  // Process template variables
  const statusMessage = getStatusMessage(profitScore, legitimacyScore);
  const variables = {
    score: profitScore + legitimacyScore,
    profit: profitScore,
    reputation: legitimacyScore,
    status: statusMessage
  };

  // Add debug logging
  console.log("Variables for replacement:", variables);
  console.log("Original text:", section.text);

  const processedText = section.text.replace(
    /{{(\w+)}}/g,
    (match, variable) => {
      // Add debug logging
      console.log(`Replacing ${match} with ${variables[variable]}`);
      return variables[variable] !== undefined ? variables[variable] : match;
    }
  );

  // Add debug logging
  console.log("Processed text:", processedText);

  // Create message container
  const messageContainer = document.createElement("div");
  messageContainer.className = "message-container";

  // Create message content
  const textCard = document.createElement("div");
  textCard.className = "systemResponse";
  // Using direct innerHTML assignment to allow HTML in the text
  textCard.innerHTML = `<p>${processedText}</p>`;
  messageContainer.appendChild(textCard);

  // Add system icon below the text
  const systemIconElement = document.createElement("img");
  systemIconElement.src = "images/frame-89.png";
  systemIconElement.className = "chat-icon";
  messageContainer.appendChild(systemIconElement);

  conversationContainer.appendChild(messageContainer);

  // Fade previous system responses
  const previousResponses = conversationContainer.children;
  for (let i = 0; i < previousResponses.length - 1; i++) {
    if (previousResponses[i].className.includes("message-container")) {
      const systemResponse =
        previousResponses[i].querySelector(".systemResponse");
      if (systemResponse) {
        systemResponse.className = "systemResponse old";
      }
    }
  }

  // Handle choices
  if (section.choices && section.choices.length > 0) {
    // Reset choice containers' display and opacity
    choice1Container.style.display = "none";
    choice2Container.style.display = "none";
    choice1Button.style.opacity = "0";
    choice2Button.style.opacity = "0";

    choicesContainer.style.display = "flex";

    // First choice
    choice1Container.style.display = "flex";
    choice1Button.innerText = section.choices[0].text;
    choice1Button.onclick = () =>
      handleChoice(
        section.choices[0].next,
        section.choices[0].profitChange,
        section.choices[0].legitimacyChange,
        section.choices[0].text
      );

    // Animate first choice
    setTimeout(() => {
      choice1Button.style.opacity = "1";
    }, currentSpeed.firstChoiceDelay);

    // Second choice
    if (section.choices.length > 1) {
      choice2Container.style.display = "flex";
      choice2Button.innerText = section.choices[1].text;
      choice2Button.onclick = () =>
        handleChoice(
          section.choices[1].next,
          section.choices[1].profitChange,
          section.choices[1].legitimacyChange,
          section.choices[1].text
        );

      // Animate second choice with delay
      setTimeout(() => {
        choice2Button.style.opacity = "1";
      }, currentSpeed.secondChoiceDelay);
    } else {
      choice2Container.style.display = "none";
    }
  } else {
    choicesContainer.style.display = "none";
  }

  conversationContainer.scrollTop = conversationContainer.scrollHeight;
}

// Function to handle user choice
function handleChoice(nextId, profitChange, legitimacyChange, userChoice) {
  // Immediately hide choices container
  document.getElementById("choicesContainer").style.display = "none";
  // After three choices, fix the position of the choices container

  profitScore += profitChange;
  legitimacyScore += legitimacyChange;
  updateScores();

  // Create user message
  const userContainer = document.createElement("div");
  userContainer.className = "message-container user";

  // User's choice
  const userContent = document.createElement("div");
  userContent.className = "userChoice";
  userContent.innerHTML = `<p>${userChoice}</p>`;
  userContainer.appendChild(userContent);

  // Add user icon
  const userIcon = document.createElement("img");
  userIcon.src = "images/frame-90.png";
  userIcon.className = "chat-icon";
  userContainer.appendChild(userIcon);

  const conversationContainer = document.getElementById(
    "conversationContainer"
  );
  conversationContainer.appendChild(userContainer);

  // Immediate scroll to user's choice
  conversationContainer.scrollTop = conversationContainer.scrollHeight;

  // Add typing indicator
  const typingIndicator = document.createElement("div");
  typingIndicator.className = "typing-indicator";
  typingIndicator.innerHTML = "<span>.</span><span>.</span><span>.</span>";
  conversationContainer.appendChild(typingIndicator);

  // Immediate scroll to typing indicator
  conversationContainer.scrollTop = conversationContainer.scrollHeight;

  setTimeout(() => {
    typingIndicator.remove();

    // Special handling for "share" target
    if (nextId === "share") {
      document.getElementById("sharePage").style.display = "flex";
      updateShareContent();
      return;
    }

    // Process next section
    const targetSection = gameData.find((item) => item.id === nextId);

    // Error handling for invalid/missing next IDs
    if (!targetSection) {
      const errorMessage =
        currentLanguage === "en"
          ? "Error: Next section not found. Returning to start."
          : "Error: Sección siguiente no encontrada. Volviendo al inicio.";

      const errorContainer = document.createElement("div");
      errorContainer.className = "systemResponse error";
      errorContainer.innerHTML = `<p>${errorMessage}</p>`;
      conversationContainer.appendChild(errorContainer);

      setTimeout(() => {
        displayGameOver();
      }, currentSpeed.errorMessageDelay);
      return;
    }

    // Handle intermediate pages and game over conditions
    if (targetSection.type === "intermediate") {
      displayIntermediatePage(targetSection);
    } else if (targetSection.id === "53") {
      displayGameOver();
    } else {
      currentSection = nextId;
      displayCurrentSection();
    }

    // Final scroll after new content is added
    conversationContainer.scrollTop = conversationContainer.scrollHeight;
  }, currentSpeed.typingIndicatorDelay);
  // Auto-scroll to bottom when new message appears
  const conversation = document.getElementById("conversationContainer");
  requestAnimationFrame(() => {
    conversation.scrollTop = conversation.scrollHeight;
  });
}

function displayIntermediatePage(section) {
  // Set current section to the section ID
  currentSection = section.id;
  
  const conversationContainer = document.getElementById(
    "conversationContainer"
  );
  conversationContainer.innerHTML = "";

  // Add class for intermediate page styles
  conversationContainer.classList.add("intermediate-page");
  document
    .getElementById("gameContainer")
    .classList.add("intermediate-game-container");
  document.getElementById("scores").classList.add("hide-on-mobile-desktop");
  
  // Prevent scrolling on mobile devices
  if (window.matchMedia("(max-width: 768px)").matches) {
    // Add no-scroll class to body and html
    document.documentElement.classList.add("intermediate-page-active");
  }

  // Function to determine status message based on profit and legitimacy
  function getStatusMessage(profit, legitimacy) {
    // Helper function to wrap messages with badge
    function wrapMessageWithBadge(message, badgeImage, altText) {
      return `<div class="promotion-container">
        <div class="promotion-message">${message}</div>
        <div class="promotion-badge">
          <img src="images/${badgeImage}" alt="${altText}" class="badge-image">
        </div>
      </div>`;
    }
    
    // Check if current section is the end node
    if (currentSection === "end") {
      if (profit < 0) {
        return wrapMessageWithBadge("Game Over! Since company profit plummeted, you ended up downgraded to Senior Manager of Meme Containment.", "badge_failure.png", "Failure Badge");
      } else if (legitimacy < 0) {
        return wrapMessageWithBadge("Game Over! Since company reputation plummeted, you ended up downgraded to Senior Manager of Meme Containment.", "badge_failure.png", "Failure Badge");
      } else if (profit >= 100) {
        return wrapMessageWithBadge("Congratulations! The game ended with you promoted to Chief Veracity Officer.", "promotion_badge.png", "Promotion Badge");
      } else if (legitimacy >= 100) {
        return wrapMessageWithBadge("Congratulations! The game ended with you promoted to Chief Veracity Officer.", "promotion_badge.png", "Promotion Badge");
      } else {
        return wrapMessageWithBadge("Game Over! You weren't promoted but managed to avoid crisis in the company. Congratulations!", "badge_thumbs.png", "Thumbs Badge");
      }
    } else if (profit < 0) {
      return wrapMessageWithBadge("Profit is below zero! You have been downgraded to Senior Manager of Meme Containment.. Try to get those numbers back up!", "badge_failure.png", "Failure Badge");
    } else if (legitimacy < 0) {
      return wrapMessageWithBadge("Legitimacy is below zero! You have been downgraded to Senior Manager of Meme Containment.. Try to get those numbers back up!", "badge_failure.png", "Failure Badge");
    } else if (profit >= 100) {
      return wrapMessageWithBadge("You have raised Profit over 100. So you're promoted to Chief Veracity Officer. See if you can do better still..", "promotion_badge.png", "Promotion Badge");
    } else if (legitimacy >= 100) {
      return wrapMessageWithBadge("You have raised Legitimacy over 100. So you're promoted to Chief Veracity Officer. See if you can do better still..", "promotion_badge.png", "Promotion Badge");
    } else {
      return wrapMessageWithBadge("You are doing well! Try to get profit or reputation to 100, without either going to zero..", "badge_thumbs.png", "Thumbs Badge");
    }
  }

  // Process template variables
  const statusMessage = getStatusMessage(profitScore, legitimacyScore);
  const variables = {
    score: profitScore + legitimacyScore,
    profit: profitScore,
    reputation: legitimacyScore,
    status: statusMessage
  };

  const processedText = section.text.replace(/{{(\w+)}}/g, (match, variable) =>
    variables[variable] !== undefined ? variables[variable] : match
  );

  const sessionEndMessage = document.createElement("div");
  sessionEndMessage.className = "session-end-message";
  const messageElement = document.createElement("div");
  // Allow direct HTML content without wrapping in paragraph tags
  messageElement.innerHTML = processedText;
  sessionEndMessage.appendChild(messageElement);

  // Create buttons container
  const buttonsContainer = document.createElement("div");
  buttonsContainer.style.display = "flex";
  buttonsContainer.style.flexDirection = "column";
  buttonsContainer.style.alignItems = "center";
  buttonsContainer.style.gap = "10px";
  buttonsContainer.style.marginTop = "20px";

  // Create buttons for each choice
  section.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.className = "proceed-button";
    button.innerText = choice.text;
    button.onclick = () => {
      // Handle next section
      const nextSection = gameData.find((item) => item.id === choice.next);

      if (choice.next === "share") {
        document.getElementById("sharePage").style.display = "flex";
        updateShareContent();
        return;
      }

      // Reset scores if going to "beginning" node
      if (choice.next === "beginning") {
        profitScore = 50;
        legitimacyScore = 50;
        updateScores();
      }

      if (nextSection?.type === "intermediate") {
        // If next section is also intermediate, display it directly
        displayIntermediatePage(nextSection);
      } else {
        // Reset conversation container for normal sections
        conversationContainer.innerHTML = "";
        conversationContainer.classList.remove("intermediate-page");
        document
          .getElementById("gameContainer")
          .classList.remove("intermediate-game-container");
        document
          .getElementById("scores")
          .classList.remove("hide-on-mobile-desktop");

        // Clean up all background images properly
        if (window.matchMedia("(max-width: 768px").matches) {
          document.getElementById("gameContainer").style.backgroundImage = "none";
          document.body.style.backgroundImage = "url('images/info-lead-illustration1-mob-v1.png')";
        } else {
          document.getElementById("gameContainer").style.backgroundImage = "none";
          document.body.style.backgroundImage = "url('images/info-lead-illustration3-web-v1.png')";
        }
        
        // Remove background class from body
        document.body.classList.remove("background-image-class");
        
        // Re-enable scrolling on mobile devices
        document.documentElement.classList.remove("intermediate-page-active");

        currentSection = choice.next;
        displayCurrentSection();
      }
    };
    buttonsContainer.appendChild(button);
  });

  sessionEndMessage.appendChild(buttonsContainer);

  let imageSrc;
  if (window.matchMedia("(max-width: 768px").matches) {
    imageSrc = section.mobileImage;
  } else {
    imageSrc = section.desktopImage;
  }

  // Set background image differently based on device
  if (window.matchMedia("(max-width: 768px").matches) {
    // For mobile: set background only on game container, not on body
    document.body.style.backgroundImage = "none";
    document.getElementById(
      "gameContainer"
    ).style.backgroundImage = `url('${section.mobileImage}')`;
    document.getElementById("gameContainer").style.backgroundSize = "cover";
    document.getElementById("gameContainer").style.backgroundPosition = "initial";
  } else {
    // For desktop: set background only on body, not on game container
    document.body.style.backgroundImage = `url('${imageSrc}')`;
    document.body.classList.add("background-image-class");
    document.getElementById("gameContainer").style.backgroundImage = "none";
  }

  document
    .getElementById("conversationContainer")
    .appendChild(sessionEndMessage);

  // Hide choices container
  document.getElementById("choicesContainer").style.display = "none";
}

// Function to display game over message
function displayGameOver() {
  const conversationContainer = document.getElementById(
    "conversationContainer"
  );
  conversationContainer.innerHTML = ""; // Clear conversation history

  const gameOverMessage = document.createElement("div");
  gameOverMessage.className = "session-end-message";
  const messageElement = document.createElement("h2");
  messageElement.innerText =
    currentLanguage === "en" ? "Game Over!" : "¡Juego Terminado!";
  gameOverMessage.appendChild(messageElement);

  const restartButton = document.createElement("button");
  restartButton.className = "proceed-button";
  updateRestartButtonText(restartButton);

  restartButton.onclick = () => {
    // Reset scores and section
    profitScore = 50;
    legitimacyScore = 50;
    updateScores();
    currentSection = "beginning";

    // Clear conversation
    conversationContainer.innerHTML = "";

    // Reset background image
    document.body.classList.remove("background-image-class");

    // Hide game elements and show home page
    document.getElementById("gameContainer").style.display = "none";
    document.getElementById("homeContainer").style.display = "block";
    document.getElementById("languageSelector").style.display = "block";
    document.getElementById("scores").style.display = "none";

    // Show the About and Share buttons in the header when returning to landing page
    document.getElementById("headerOptions").style.display = "block";

    // Re-initialize the rotating background for the landing page
    if (
      !window.matchMedia("(max-width: 768px)").matches &&
      !backgroundInterval
    ) {
      const rotateFunction = setupRotatingBackground();
      setTimeout(rotateFunction, 500);
    }

    // Reload data and update UI
    loadGameData();
    updateInitialMessage();
    updateLanguageButtonText();
  };

  gameOverMessage.appendChild(restartButton);
  conversationContainer.appendChild(gameOverMessage);

  conversationContainer.scrollTop = conversationContainer.scrollHeight;
  document.getElementById("choicesContainer").style.display = "none";
}

function updateRestartButtonText(button) {
  if (button) {
    button.innerText =
      currentLanguage === "en" ? "Restart the Game" : "Reiniciar el Juego";
  }
}
function updateIndicators(score, indicatorId) {
  const indicators = document.querySelectorAll(
    `#${indicatorId} .indicator-box`
  );
  const activeIndex = Math.min(Math.floor(score / 15), indicators.length - 1);

  // Define color arrays
  const profitColors = [
    "#e8505b",
    "#ef7858",
    "#f5a055",
    "#f5a055",
    "#ead364",
    "#d9df76",
    "#d9df76",
  ];
  const legitimacyColors = [
    "#e8505b",
    "#ef7858",
    "#f5a055",
    "#f5a055",
    "#ead364",
    "#d9df76",
    "#d9df76",
  ];

  indicators.forEach((box, index) => {
    const colorArray =
      indicatorId === "profitIndicator" ? profitColors : legitimacyColors;

    if (index <= activeIndex) {
      // Active or previous boxes: show color
      box.style.backgroundColor = colorArray[index];
      box.classList.toggle("active", index === activeIndex);
    } else {
      // Future boxes: grey and inactive
      box.style.backgroundColor = "#CCCCCC";
      box.classList.remove("active");
    }
  });
}

function updateScores() {
  const profitScoreEl = document.getElementById("profitScore");
  const legitimacyScoreEl = document.getElementById("legitimacyScore");

  if (profitScoreEl) {
    profitScoreEl.innerHTML = `
      <span class="profit-label">Profit</span> 
      <span class="profit-value">${profitScore}</span>
    `;
  } else {
    console.error("Error: #profitScore element not found.");
  }

  if (legitimacyScoreEl) {
    legitimacyScoreEl.innerHTML = `
      <span class="legitimacy-label">Reputation</span> 
      <span class="legitimacy-value">${legitimacyScore}</span>
    `;
  } else {
    console.error("Error: #legitimacyScore element not found.");
  }

  // Update indicators dynamically
  updateIndicators(profitScore, "profitIndicator");
  updateIndicators(legitimacyScore, "legitimacyIndicator");
}

function updateColorIndicator(type, score) {
  const containerId =
    type === "profit" ? "profitIndicator" : "legitimacyIndicator";
  const container = document.getElementById(containerId);
  const boxes = container.querySelectorAll(".indicator-box");
  const numBoxes = boxes.length;
  const maxScore = 100; // Assuming max score is 100

  // Ensure score is within 0-100 range
  score = Math.max(0, Math.min(score, maxScore));

  // Calculate the index based on score percentage
  const colorIndex = Math.round((score / maxScore) * (numBoxes - 1));

  // Remove active class from all boxes
  boxes.forEach((box) => box.classList.remove("active"));

  // Add active class to the active box
  boxes[colorIndex].classList.add("active");
}

function updateScoresText() {
  const profitValueEl = document.querySelector("#profitScore .profit-value");
  const legitimacyValueEl = document.querySelector(
    "#legitimacyScore .legitimacy-value"
  );

  if (profitValueEl) {
    profitValueEl.innerText = profitScore;
  }

  if (legitimacyValueEl) {
    legitimacyValueEl.innerText = legitimacyScore;
  }

  document.querySelector("#profitScore .profit-label").innerText =
    currentLanguage === "en" ? "Profit" : "Ganancia";
  document.querySelector("#profitScore .profit-value").innerText = profitScore;

  document.querySelector("#legitimacyScore .legitimacy-label").innerText =
    currentLanguage === "en" ? "Reputation" : "Legitimidad";
  document.querySelector("#legitimacyScore .legitimacy-value").innerText =
    legitimacyScore;
}

// Landing page text for different language
function updateInitialMessage() {
  // Set background color based on screen size
  if (window.matchMedia("(max-width: 768px)").matches) {
    // On mobile, use the styles from CSS
    document.getElementById("homeContainer").style.backgroundColor = "";
  } else {
    // On desktop, set to transparent
    document.getElementById("homeContainer").style.backgroundColor =
      "transparent";
  }

  if (currentLanguage === "en") {
    document.getElementById("initialMessage").innerHTML = `
          <p class="welcome-text-div">
          <img src="images/infodemic_logo.png" alt="Infodemic Inc." class="logo-image"> 
          <span class="crisis-text">Can you lead your social media platform without getting into crisis?</span>
          </p>
          <button id="startButton">Start the game!</button>
          <div id="homeOptions">
            <button id="aboutButton">About</button>
            <button id="shareButton">Share</button>
        </div>
        `;
    document.getElementById(
      "languageDropdownButton"
    ).innerHTML = `English <i class="fa-solid fa-caret-down"></i>`;
  } else if (currentLanguage === "es") {
    document.getElementById("initialMessage").innerHTML = `
          <p class="welcome-text-div">
          <img src="images/infodemic_logo.png" alt="Infodemic Inc." class="logo-image"> 
          <span class="crisis-text">¡Bienvenido/a a la gestión de redes sociales! ¿Puedes dirigir tu plataforma sin meterte en crisis?</span>
          </p>
          <button id="startButton">¡Hola, Empezar el Juego!</button>
           <div id="homeOptions">
            <button id="aboutButton">Acerca de</button>
            <button id="shareButton">Compartir</button>
        </div>
        `;
    document.getElementById(
      "languageDropdownButton"
    ).innerHTML = `Spanish <i class="fa-solid fa-caret-down"></i>`;
  }

  // Adding event listeners after updating the buttons
  document.getElementById("aboutButton").onclick = () => {
    document.getElementById("aboutPage").style.display = "flex";
    updateAboutContent();
  };

  document.getElementById("shareButton").onclick = () => {
    document.getElementById("sharePage").style.display = "flex";
    updateShareContent();
  };
}

function updateLanguageButtonText() {
  const languageButton = document.getElementById("languageDropdownButton");
  if (currentLanguage === "en") {
    languageButton.innerHTML = `English <i class="fa-solid fa-caret-down"></i>`;
  } else {
    languageButton.innerHTML = `Spanish <i class="fa-solid fa-caret-down"></i>`;
  }
}

function updateAboutContent() {
  const aboutContentDiv = document.getElementById("aboutContent");
  fetch("about-content.html")
    .then((response) => response.text())
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const content = doc.querySelector(
        `.about-content[data-lang="${currentLanguage}"]`
      );
      if (content) {
        aboutContentDiv.innerHTML = content.innerHTML;
        aboutContentDiv.className = "about-text";
      } else {
        console.error(`No content found for language: ${currentLanguage}`);
      }
    })
    .catch((error) => {
      console.error("Error loading about content:", error);
      aboutContentDiv.innerHTML =
        "<p>Error loading content. Please try again later.</p>";
    });
}

function updateShareContent() {
  const shareContentDiv = document.getElementById("shareContent");
  shareContentDiv.innerHTML = `
        <p class="share-title">${shareText[currentLanguage]}</p>
        <div id="socialMediaLinks">
            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              gameLink
            )}" target="_blank">Facebook</a>
            <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(
              "Play this game and become a master of disinfo!"
            )}&url=${encodeURIComponent(gameLink)}" target="_blank">X</a>
            <a href="https://www.instagram.com/?url=${encodeURIComponent(
              gameLink
            )}" target="_blank">Instagram</a>
            <button id="copyLinkButton">Copy Link</button>
        </div>
    `;

  // Copy link button alert
  document.getElementById("copyLinkButton").onclick = () => {
    navigator.clipboard
      .writeText(gameLink)
      .then(() => {
        alert("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
        alert("Failed to copy link. Please try again.");
      });
  };
  //Make social Medial Links Vertical
  document.getElementById("socialMediaLinks").style.display = "flex";
  document.getElementById("socialMediaLinks").style.flexDirection = "column";
  document.getElementById("socialMediaLinks").style.alignItems = "center";
}

// Function to find the previous ID based on the next value
function findPreviousId(currentId) {
  for (const section of gameData) {
    if (section.choices) {
      for (const choice of section.choices) {
        if (choice.next === currentId) {
          return section.id;
        }
      }
    }
  }
  return null; // This code works when anything is not found, and then we return null
}

// Timer functionality
function startTimer(duration) {
  let timer = duration;
  const timerInterval = setInterval(() => {
    timer--;
    document.getElementById(
      "timerDisplay"
    ).innerText = `Time left: ${timer} seconds`;
    if (timer === 0) {
      clearInterval(timerInterval);
      // Proceed to next section or end the game
      alert("Time's up!");
    }
  }, 1000);
}

// Call loadGameData() instead of fetch() directly
loadGameData();

// Adding event listener for language dropdown button
document.getElementById("languageDropdownButton").onclick = () => {
  const dropdownMenu = document.getElementById("languageDropdownMenu");
  dropdownMenu.style.display =
    dropdownMenu.style.display === "block" ? "none" : "block";
};

// Initialize background rotation on load and start transitions after 2 seconds (desktop only)
window.addEventListener("load", function () {
  // Make sure headerOptions are visible on landing page
  document.getElementById("headerOptions").style.display = "block";

  // setupRotatingBackground already checks for mobile and returns appropriate function
  const rotateFunction = setupRotatingBackground();

  // Only start transitions if we're not on mobile
  if (!window.matchMedia("(max-width: 768px)").matches) {
    // Start the first transition after 2 seconds
    setTimeout(rotateFunction, 2000);
  }
});

updateInitialMessage();
updateScoresText();
updateLanguageButtonText();

// Adding event listeners for About and Share buttons
document.getElementById("aboutButton").onclick = function () {
  document.getElementById("aboutPage").style.display = "flex";
  document.getElementById("headerOptions").style.display = "none";
  updateAboutContent();
};

document.getElementById("shareButton").onclick = function () {
  document.getElementById("sharePage").style.display = "flex";
  document.getElementById("headerOptions").style.display = "none";
  updateShareContent();
};

// Adding event listeners for header About and Share buttons
document.getElementById("aboutButtonHeader").onclick = function () {
  document.getElementById("aboutPage").style.display = "flex";
  document.getElementById("headerOptions").style.display = "none";
  updateAboutContent();
};

document.getElementById("shareButtonHeader").onclick = function () {
  document.getElementById("sharePage").style.display = "flex";
  document.getElementById("headerOptions").style.display = "none";
  updateShareContent();
};

// Adding event listeners to close About and Share pages
document.getElementById("closeAboutPage").onclick = () => {
  document.getElementById("aboutPage").style.display = "none";
  document.getElementById("headerOptions").style.display = "block";
};

document.getElementById("closeSharePage").onclick = () => {
  document.getElementById("sharePage").style.display = "none";
  document.getElementById("headerOptions").style.display = "block";
};

document.addEventListener("click", (event) => {
  if (!event.target.closest("#languageSelector")) {
    document.getElementById("languageDropdownMenu").style.display = "none";
  }
});
