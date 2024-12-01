let socket = io();
let map;
let geojsonLayer;
let gameTimer;
let timeLeft = 180;
let currentCountry = null;
let playerInfo = {
    name: '',
    country: 'us'
};
let playerId = null;

// Add country list for flag selector
const countryList = [
    { code: 'af', name: 'Afghanistan' },
    { code: 'al', name: 'Albania' },
    { code: 'dz', name: 'Algeria' },
    { code: 'ao', name: 'Angola' },
    { code: 'ar', name: 'Argentina' },
    { code: 'am', name: 'Armenia' },
    { code: 'au', name: 'Australia' },
    { code: 'at', name: 'Austria' },
    { code: 'az', name: 'Azerbaijan' },
    { code: 'bd', name: 'Bangladesh' },
    { code: 'by', name: 'Belarus' },
    { code: 'be', name: 'Belgium' },
    { code: 'bt', name: 'Bhutan' },
    { code: 'bo', name: 'Bolivia' },
    { code: 'ba', name: 'Bosnia and Herzegovina' },
    { code: 'bw', name: 'Botswana' },
    { code: 'br', name: 'Brazil' },
    { code: 'bg', name: 'Bulgaria' },
    { code: 'bf', name: 'Burkina Faso' },
    { code: 'bi', name: 'Burundi' },
    { code: 'kh', name: 'Cambodia' },
    { code: 'cm', name: 'Cameroon' },
    { code: 'ca', name: 'Canada' },
    { code: 'td', name: 'Chad' },
    { code: 'cl', name: 'Chile' },
    { code: 'cn', name: 'China' },
    { code: 'co', name: 'Colombia' },
    { code: 'cr', name: 'Costa Rica' },
    { code: 'hr', name: 'Croatia' },
    { code: 'cu', name: 'Cuba' },
    { code: 'cy', name: 'Cyprus' },
    { code: 'cz', name: 'Czechia' },
    { code: 'dk', name: 'Denmark' },
    { code: 'do', name: 'Dominican Republic' },
    { code: 'ec', name: 'Ecuador' },
    { code: 'eg', name: 'Egypt' },
    { code: 'sv', name: 'El Salvador' },
    { code: 'er', name: 'Eritrea' },
    { code: 'ee', name: 'Estonia' },
    { code: 'et', name: 'Ethiopia' },
    { code: 'fj', name: 'Fiji' },
    { code: 'fi', name: 'Finland' },
    { code: 'fr', name: 'France' },
    { code: 'ga', name: 'Gabon' },
    { code: 'gm', name: 'Gambia' },
    { code: 'ge', name: 'Georgia' },
    { code: 'de', name: 'Germany' },
    { code: 'gh', name: 'Ghana' },
    { code: 'gr', name: 'Greece' },
    { code: 'gt', name: 'Guatemala' },
    { code: 'gn', name: 'Guinea' },
    { code: 'gy', name: 'Guyana' },
    { code: 'ht', name: 'Haiti' },
    { code: 'hn', name: 'Honduras' },
    { code: 'hu', name: 'Hungary' },
    { code: 'is', name: 'Iceland' },
    { code: 'in', name: 'India' },
    { code: 'id', name: 'Indonesia' },
    { code: 'ir', name: 'Iran' },
    { code: 'iq', name: 'Iraq' },
    { code: 'ie', name: 'Ireland' },
    { code: 'il', name: 'Israel' },
    { code: 'it', name: 'Italy' },
    { code: 'jm', name: 'Jamaica' },
    { code: 'jp', name: 'Japan' },
    { code: 'jo', name: 'Jordan' },
    { code: 'kz', name: 'Kazakhstan' },
    { code: 'ke', name: 'Kenya' },
    { code: 'kr', name: 'Korea (South)' },
    { code: 'kg', name: 'Kyrgyzstan' },
    { code: 'la', name: 'Laos' },
    { code: 'lv', name: 'Latvia' },
    { code: 'lb', name: 'Lebanon' },
    { code: 'lr', name: 'Liberia' },
    { code: 'ly', name: 'Libya' },
    { code: 'lt', name: 'Lithuania' },
    { code: 'lu', name: 'Luxembourg' },
    { code: 'mg', name: 'Madagascar' },
    { code: 'mw', name: 'Malawi' },
    { code: 'my', name: 'Malaysia' },
    { code: 'ml', name: 'Mali' },
    { code: 'mx', name: 'Mexico' },
    { code: 'md', name: 'Moldova' },
    { code: 'mn', name: 'Mongolia' },
    { code: 'me', name: 'Montenegro' },
    { code: 'ma', name: 'Morocco' },
    { code: 'mz', name: 'Mozambique' },
    { code: 'mm', name: 'Myanmar' },
    { code: 'na', name: 'Namibia' },
    { code: 'np', name: 'Nepal' },
    { code: 'nl', name: 'Netherlands' },
    { code: 'nz', name: 'New Zealand' },
    { code: 'ne', name: 'Niger' },
    { code: 'ng', name: 'Nigeria' },
    { code: 'no', name: 'Norway' },
    { code: 'om', name: 'Oman' },
    { code: 'pk', name: 'Pakistan' },
    { code: 'pa', name: 'Panama' },
    { code: 'pg', name: 'Papua New Guinea' },
    { code: 'py', name: 'Paraguay' },
    { code: 'pe', name: 'Peru' },
    { code: 'ph', name: 'Philippines' },
    { code: 'pl', name: 'Poland' },
    { code: 'pt', name: 'Portugal' },
    { code: 'qa', name: 'Qatar' },
    { code: 'ro', name: 'Romania' },
    { code: 'ru', name: 'Russia' },
    { code: 'sa', name: 'Saudi Arabia' },
    { code: 'sn', name: 'Senegal' },
    { code: 'rs', name: 'Serbia' },
    { code: 'sg', name: 'Singapore' },
    { code: 'sk', name: 'Slovakia' },
    { code: 'si', name: 'Slovenia' },
    { code: 'so', name: 'Somalia' },
    { code: 'za', name: 'South Africa' },
    { code: 'es', name: 'Spain' },
    { code: 'lk', name: 'Sri Lanka' },
    { code: 'sd', name: 'Sudan' },
    { code: 'sr', name: 'Suriname' },
    { code: 'se', name: 'Sweden' },
    { code: 'ch', name: 'Switzerland' },
    { code: 'sy', name: 'Syria' },
    { code: 'tj', name: 'Tajikistan' },
    { code: 'tz', name: 'Tanzania' },
    { code: 'th', name: 'Thailand' },
    { code: 'tg', name: 'Togo' },
    { code: 'tn', name: 'Tunisia' },
    { code: 'tr', name: 'Turkey' },
    { code: 'tm', name: 'Turkmenistan' },
    { code: 'ug', name: 'Uganda' },
    { code: 'ua', name: 'Ukraine' },
    { code: 'ae', name: 'United Arab Emirates' },
    { code: 'gb', name: 'United Kingdom' },
    { code: 'us', name: 'United States' },
    { code: 'uy', name: 'Uruguay' },
    { code: 'uz', name: 'Uzbekistan' },
    { code: 've', name: 'Venezuela' },
    { code: 'vn', name: 'Vietnam' },
    { code: 'ye', name: 'Yemen' },
    { code: 'zm', name: 'Zambia' },
    { code: 'zw', name: 'Zimbabwe' }
];

function initFlagSelector() {
    const select = document.getElementById('countryFlag');
    countryList.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = country.name;
        select.appendChild(option);
    });

    // Use browser's language settings to guess country
    try {
        const browserLang = navigator.language || navigator.userLanguage;
        const countryCode = browserLang.split('-')[1]?.toLowerCase() || 'us';
        document.getElementById('countryFlag').value = countryCode;
        updateFlag(countryCode);
        playerInfo.country = countryCode;
    } catch (error) {
        console.log('Using default country code:', error);
        document.getElementById('countryFlag').value = 'us';
        updateFlag('us');
        playerInfo.country = 'us';
    }
}

function updateFlag(countryCode) {
    const flagImg = document.getElementById('selectedFlag');
    flagImg.src = `https://flagcdn.com/w40/${countryCode}.png`;
    playerInfo.country = countryCode;
}

function initSocket() {
    socket = io();

    socket.on('connect', () => {
        console.log('Connected to server with ID:', socket.id);
    });

    socket.on('error', (message) => {
        console.error('Server error:', message);
        showGameMessage(message, true);
    });

    socket.on('gameCreated', (data) => {
        console.log('Game created:', data);
        if (data && data.gameId) {
            playerId = data.playerId;
            document.getElementById('gameId').textContent = `Game ID: ${data.gameId}`;
            document.getElementById('joinGame').classList.add('hidden');
            document.getElementById('waitingScreen').classList.remove('hidden');
        }
    });

    socket.on('gameStarted', (data) => {
        console.log('Game started:', data);
        // Hide setup screens
        document.getElementById('waitingScreen').classList.add('hidden');
        document.getElementById('joinGame').classList.add('hidden');
        
        // Show and initialize game screen
        const gameScreen = document.getElementById('gameScreen');
        gameScreen.classList.remove('hidden');
        
        // Initialize map if not already done
        if (!map) {
            initMap();
        }
        
        // Set current country
        currentCountry = data.countryToFind;
        document.getElementById('countryToFind').textContent = `Find: ${currentCountry}`;
        
        // Update scores
        if (data.scores && data.playerInfo) {
            updateScores(data);
        }
        
        // Initialize synchronized timer
        if (data.startTime) {
            const elapsedSeconds = Math.floor((Date.now() - data.startTime) / 1000);
            timeLeft = Math.max(180 - elapsedSeconds, 0);
            startTimer(data.startTime);
        }
    });

    socket.on('scoreUpdate', (data) => {
        console.log('Score update:', data);
        updateScores(data);
        if (data.message) {
            showGameMessage(data.message);
        }
    });

    socket.on('newCountry', (country) => {
        console.log('New country received:', country);
        currentCountry = country;
        document.getElementById('countryToFind').textContent = `Find: ${country}`;
    });

    socket.on('gameOver', (stats) => {
        clearInterval(gameTimer);
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('gameEndScreen').classList.remove('hidden');

        // Create detailed stats display
        let statsHTML = '<div class="final-stats">';
        Object.entries(stats.players).forEach(([pid, playerStats]) => {
            const isWinner = pid === stats.winner;
            statsHTML += `
                <div class="player-stats ${isWinner ? 'winner' : ''}">
                    <div class="player-header">
                        <img src="https://flagcdn.com/w20/${playerStats.country}.png" alt="${playerStats.country}">
                        <h3>${playerStats.name} ${isWinner ? '👑' : ''}</h3>
                    </div>
                    <div class="stat-row">
                        <span>Score:</span>
                        <span>${playerStats.score}</span>
                    </div>
                    <div class="stat-row">
                        <span>Attempts:</span>
                        <span>${playerStats.attempts}</span>
                    </div>
                    <div class="stat-row">
                        <span>Accuracy:</span>
                        <span>${playerStats.accuracy}%</span>
                    </div>
                </div>
            `;
        });
        statsHTML += '</div>';

        document.getElementById('finalScores').innerHTML = statsHTML;

        // Trigger confetti for winner
        if (socket.id === stats.winner) {
            triggerWinnerConfetti();
        }
    });

    socket.on('skipVoteUpdate', (data) => {
        const skipButton = document.getElementById('skipButton');
        
        if (data.skipsRemaining <= 0) {
            skipButton.disabled = true;
            skipButton.textContent = 'No skips remaining';
            return;
        }

        // Show current votes and remaining skips
        skipButton.textContent = `Skip Country (${data.votes}/${data.totalPlayers}) [${data.skipsRemaining} left]`;
        
        if (data.voters && data.voters.length > 0) {
            showGameMessage(`Skip votes: ${data.voters.join(', ')}`);
        }

        // Visual feedback for votes
        if (data.votes > 0) {
            skipButton.classList.add('some-votes');
        } else {
            skipButton.classList.remove('some-votes');
        }
    });

    socket.on('skipError', (message) => {
        showGameMessage(message, true);
    });

    socket.on('countrySkipped', (data) => {
        currentCountry = data.newCountry;
        document.getElementById('countryToFind').textContent = `Find: ${currentCountry}`;
        showGameMessage(data.message);
        
        // Reset skip button state
        const skipButton = document.getElementById('skipButton');
        skipButton.disabled = false;
        skipButton.classList.remove('some-votes');
        
        if (data.skipsRemaining <= 0) {
            skipButton.disabled = true;
            skipButton.textContent = 'No skips remaining';
        } else {
            skipButton.textContent = `Skip Country (0/${data.totalPlayers}) [${data.skipsRemaining} left]`;
        }
    });

    socket.on('skipPenalty', (data) => {
        showGameMessage(`${data.playerName} got +3 attempts penalty for trying to skip ${data.country}`, true);
    });

    socket.on('gamesList', (games) => {
        updateGamesList(games);
    });
}

function joinGame() {
    const nameInput = document.getElementById('playerName');
    const gameIdInput = document.getElementById('gameIdInput');
    
    if (!nameInput.value.trim()) {
        showGameMessage('Please enter your name', true);
        return;
    }
    
    if (!gameIdInput.value.trim()) {
        showGameMessage('Please enter a Game ID', true);
        return;
    }
    
    playerInfo.name = nameInput.value.trim();
    const joinData = {
        gameId: gameIdInput.value.trim(),
        playerInfo: playerInfo
    };
    
    console.log('Joining game with data:', joinData);
    socket.emit('joinGame', joinData);
}

function showGameMessage(message, isError = false) {
    const messageContainer = document.createElement('div');
    messageContainer.className = `game-message ${isError ? 'error' : ''}`;
    messageContainer.textContent = message;
    document.body.appendChild(messageContainer);
    
    setTimeout(() => {
        messageContainer.classList.add('fade-out');
        setTimeout(() => messageContainer.remove(), 500);
    }, 2000);
}

function updateScores(data) {
    if (data.scores && data.playerInfo) {
        const scoresList = Object.entries(data.scores)
            .map(([pid, score]) => {
                const player = data.playerInfo[pid];
                const attempts = data.attempts?.[pid] || 0;
                const accuracy = attempts > 0 ? ((score / attempts) * 100).toFixed(1) : '0.0';
                const displayName = `${player.name}#${pid.split('#')[1]}`;
                return `
                    <div class="score-item">
                        <img src="https://flagcdn.com/w20/${player.country}.png" alt="${player.country}">
                        ${displayName}: ${score}/${attempts} (${accuracy}%)
                    </div>`;
            })
            .join('');
        
        document.getElementById('scores').innerHTML = `
            <div class="scores-container">
                ${scoresList || 'No scores yet'}
            </div>`;
    }
}

// Add this function back
function createGame() {
    const nameInput = document.getElementById('playerName');
    if (!nameInput.value.trim()) {
        showGameMessage('Please enter your name', true);
        return;
    }
    
    playerInfo.name = nameInput.value.trim();
    console.log('Creating game with player info:', playerInfo);
    socket.emit('createGame', playerInfo);
}

// Also make sure initSocket is called when the page loads
window.onload = function() {
    initSocket();
    initFlagSelector();
    // Request initial games list
    socket.emit('requestGamesList');
    // Refresh games list periodically
    setInterval(() => {
        socket.emit('requestGamesList');
    }, 5000);
}

// Add these functions back
function initMap() {
    if (map) return;
    
    document.getElementById('gameScreen').classList.remove('hidden');
    
    map = L.map('map-container', {
        zoomControl: true,
        minZoom: 2,
        maxZoom: 8,
        worldCopyJump: true,
        center: [20, 0],
        zoom: 2,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        bounceAtZoomLimits: true
    });
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    console.log('Loading GeoJSON data...');
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('GeoJSON data loaded successfully');
            geojsonLayer = L.geoJSON(data, {
                style: function(feature) {
                    return {
                        fillColor: '#95a5a6',
                        weight: 1,
                        opacity: 1,
                        color: '#2c3e50',
                        fillOpacity: 0.2,
                        interactive: true
                    };
                },
                onEachFeature: function(feature, layer) {
                    layer.on({
                        mouseover: highlightFeature,
                        mouseout: resetHighlight,
                        click: countryClick
                    });
                }
            }).addTo(map);

            setTimeout(() => {
                map.invalidateSize();
                map.setView([20, 0], 2);
            }, 100);
        })
        .catch(error => {
            console.error('Error loading GeoJSON:', error);
            alert('Error loading map data. Please refresh the page.');
        });
}

function highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({
        fillOpacity: 0.5,
        weight: 2,
        color: '#666'
    });
}

function resetHighlight(e) {
    const layer = e.target;
    layer.setStyle({
        fillOpacity: 0.2,
        weight: 1,
        color: '#2c3e50'
    });
}

function countryClick(e) {
    const layer = e.target;
    const clickedCountry = layer.feature.properties.ADMIN;
    
    console.log('Clicked country:', clickedCountry);
    console.log('Target country:', currentCountry);
    
    if (clickedCountry === currentCountry) {
        console.log('Correct guess!');
        layer.setStyle({
            fillColor: '#2ecc71',
            fillOpacity: 0.6
        });
        socket.emit('correctGuess', { clickedCountry });
    } else {
        console.log('Wrong guess!');
        layer.setStyle({
            fillColor: '#e74c3c',
            fillOpacity: 0.6
        });
        socket.emit('wrongGuess', { clickedCountry });
    }
    
    setTimeout(() => {
        layer.setStyle({
            fillColor: '#95a5a6',
            fillOpacity: 0.2
        });
    }, 500);
}

function startTimer(startTime) {
    if (gameTimer) {
        clearInterval(gameTimer);
    }
    
    gameTimer = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        timeLeft = Math.max(180 - elapsedSeconds, 0);
        updateTimer();
        
        if (timeLeft <= 0) {
            clearInterval(gameTimer);
            socket.emit('gameEnded');
            showGameMessage('Time is up!');
        }
    }, 1000);
}

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = 
        `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function triggerWinnerConfetti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
    }, 250);
}

// Add this function to handle skip votes
function voteToSkip() {
    if (!socket || !socket.connected) {
        showGameMessage('Not connected to server', true);
        return;
    }

    const skipButton = document.getElementById('skipButton');
    skipButton.disabled = true; // Temporarily disable to prevent double-clicks
    
    socket.emit('skipVote');
}

function updateGamesList(games) {
    const gamesListElement = document.getElementById('gamesList');
    if (games.length === 0) {
        gamesListElement.innerHTML = '<p class="no-games">No active games</p>';
        return;
    }

    const gamesHTML = games.map(game => `
        <div class="game-item ${game.status === 'playing' ? 'full' : ''}" 
             onclick="${game.status === 'waiting' ? `joinGameById('${game.gameId}')` : ''}">
            <div class="game-info">
                <div class="host-info">
                    <img src="https://flagcdn.com/w20/${game.hostCountry}.png" alt="${game.hostCountry}">
                    <span>${game.host}'s game</span>
                </div>
                <span class="game-status ${game.status}">${game.status}</span>
            </div>
            <div class="game-id">${game.gameId}</div>
        </div>
    `).join('');

    gamesListElement.innerHTML = gamesHTML;
}

function joinGameById(gameId) {
    const nameInput = document.getElementById('playerName');
    if (!nameInput.value.trim()) {
        showGameMessage('Please enter your name', true);
        return;
    }
    
    playerInfo.name = nameInput.value.trim();
    socket.emit('joinGame', { gameId, playerInfo });
}
