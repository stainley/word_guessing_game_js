document.addEventListener('DOMContentLoaded', function () {

    const wordsArray = [
        ['apple', 'banana', 'cherry', 'grape', 'orange', 'strawberry', 'watermelon', 'pear', 'kiwi', 'blueberry', 'pineapple', 'lemon', 'lime', 'apricot', 'peach'],
        ['dog', 'cat', 'bird', 'elephant', 'giraffe', 'lion', 'tiger', 'zebra', 'kangaroo', 'koala', 'panda', 'squirrel', 'rabbit', 'rhinoceros', 'hippopotamus'],
        ['house', 'car', 'tree', 'mountain', 'river', 'ocean', 'desert', 'forest', 'castle', 'bridge', 'lighthouse', 'waterfall', 'volcano', 'cave', 'island'],
        ['computer', 'phone', 'book', 'television', 'internet', 'keyboard', 'mouse', 'headphones', 'camera', 'microphone', 'tablet', 'printer', 'speaker', 'monitor', 'router']
    ];

    let userInput = '';

    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    const wordDiv = document.createElement('div');
    wordDiv.className = 'word-div';
    wordDiv.style.position = 'absolute';
    canvas.parentNode.insertBefore(wordDiv, canvas.nextSibling);

    // Make the word animation smooth
    wordDiv.style.transition = 'top 0.1s ease-in-out';

    const healthIcons = [];

    let isGameOver = false;
    const totalLevels = 4;
    let currentLevel = 1;
    let currentWord;
    let wordPositionY = 0;
    let lives = 3;
    const initialHealth = lives;

    let correctGuesses = 0;
    let wordSpeed = 1;
    let leaderboard = [];

    const livesDisplay = document.getElementById('lives');
    const scoreDisplay = document.getElementById('score');
    const leaderboardDisplay = document.getElementById('leaderboard');
    const leaderboardContainer = document.getElementById('leaderboard-container');

    const retryButton = document.getElementById('retry-button');

    retryButton.addEventListener('click', () => {
        startGame();
    });

    function getRandomWord(level) {
        userInput = '';
        const words = wordsArray.slice(0, level).flat(); // Combine arrays up to the current level
        return words[Math.floor(Math.random() * words.length)];
    }


    function animationLoop() {
        drawWord();
        requestAnimationFrame(animationLoop);
    }

    function startGame() {
        leaderboardContainer.style.display = 'none';
        //retryButton.setAttribute('hidden', '');
        retryButton.style.display = 'none';
        isGameOver = false;
        currentLevel = 1;
        correctGuesses = 0;
        wordSpeed = 1 / 8000;
        lives = 3;
        leaderboardDisplay.innerHTML = '';

        // Start with 3 health icons
        for (let i = 0; i < initialHealth; i++) {
            addHealth();
        }

        startNewLevel();
        animationLoop();
    }

    function startNewLevel() {
        currentWord = getRandomWord(currentLevel);
        wordPositionY = 6;
        updateUI();

        switch (currentLevel) {
            case 1:
                wordSpeed = 1 / 1000;
                break;
            case 2:
                wordSpeed = 1 / 700;
                break;
            case 3:
                wordSpeed = 1 / 300;
                break;
            case 4:
                wordSpeed = 1 / 100;
                break;
            default:
                wordSpeed = 1 / 100;
        }
    }

    let awaitingCorrectGuess = false;

    function drawWord() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // if the game is over, show message and update the UI
        if (isGameOver) {
            drawGameOverMessage();
            updateUI();
            // stop draw a new word
            return;
        }

        const divX = canvas.width / 2 - 50;
        const divY = wordPositionY;

        wordDiv.style.transition = 'none'; // Disable transition temporally
        wordDiv.style.left = `${divX}px`;
        wordDiv.style.top = `${divY}px`;

        // Trigger a reflow by accessing the computed style
        window.getComputedStyle(wordDiv).transform;
        wordDiv.style.transition = '';

        // Update the guessed word in the div element
        wordDiv.style.fontSize = '32px';
        wordDiv.style.fontFamily = 'Arial';
        wordDiv.style.color = '#3a297c'
        wordDiv.textContent = currentWord.substring(0, currentLevel + 2);

        // if the word reach the bottom reduce a live
        if (wordPositionY >= canvas.height - 30) {
            --lives;
            removeHealth();
            if (lives === 0) { // When the live is 0 show game over and leaderboard screen
                isGameOver = true;
                gameOver();
            } else if (lives > 0) {
                // Reset the word position and pick a new word
                updateUI();
                wordPositionY = 0;
                currentWord = getRandomWord(currentLevel);
                awaitingCorrectGuess = false;
            }
        } else {
            requestAnimationFrame(drawWord);
            wordPositionY += wordSpeed;
        }
    }

    function gameOver() {

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        wordDiv.textContent = '';

        if (isGameOver) {
            leaderboardContainer.style.display = 'flex';

            leaderboard.push({name: 'Game', score: correctGuesses});

            leaderboard.sort((a, b) => b.score - a.score);
            leaderboard = leaderboard.slice(0, 5);

            leaderboardDisplay.innerHTML = '<h3>Leaderboard:</h3>';
            leaderboard.forEach((entry, index) => {
                leaderboardDisplay.innerHTML += `<p>${index + 1}. ${entry.name}: ${entry.score}</p>`;
            });

            retryButton.style.display = 'block';
            retryButton.removeAttribute("hidden");
        }

        cancelAnimationFrame(animationLoop);
        console.log('AFTER CANCELING ANIMATION')
    }


    function drawGameOverMessage() {
        // Draw the "Game Over" message
        ctx.fillStyle = '#333';
        ctx.font = '36px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);

        ctx.font = '24px Arial';
        ctx.fillStyle = correctGuesses === 0 ? 'red' : 'blue';
        ctx.fillText(`Your Score: ${correctGuesses}`, canvas.width / 2 - 70, canvas.height / 2 + 40);

    }

    function updateUI() {
        livesDisplay.textContent = `Lives: ${lives}`;
        scoreDisplay.textContent = `Score: ${correctGuesses}`;
    }

    document.addEventListener('keydown', (event) => {
        if (!awaitingCorrectGuess) {

            // Check if the pressed key is an alphabetic character
            if (/^[a-zA-Z]$/.test(event.key)) {
                userInput += event.key;
                userInput.trim().toLowerCase();

                if (userInput === currentWord) {
                    correctGuesses++;
                    updateUI();
                    if (correctGuesses % 10 === 0) {
                        currentLevel++;
                        startNewLevel();
                    } else if (correctGuesses === 10 && currentLevel === totalLevels) {
                        alert('Congratulations');
                    } else {
                        wordPositionY = 0;
                        currentWord = getRandomWord(currentLevel);
                        awaitingCorrectGuess = false;
                    }
                    userInput = '';
                }
            }
            if (event.key === 'Enter') {
                userInput = '';
            }
        }
    });

    // TODO: Health functions
    function addHealth() {
        const healthIcon = document.createElement("span");
        healthIcon.className = "health-icon";
        healthIcon.innerHTML = "❤️ ";
        document.getElementById("health-container").appendChild(healthIcon);
        healthIcons.push(healthIcon);
    }

    function removeHealth() {
        if (healthIcons.length > 0) {
            const healthIconToRemove = healthIcons.pop();
            healthIconToRemove.remove();
        }
    }

    startGame();

});

