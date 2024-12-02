const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

// Define port
const PORT = process.env.PORT || 3001;

// Add this near the top of your server.js
console.log('Current directory:', __dirname);
console.log('Public directory:', path.join(__dirname, 'public'));

// Update the static files middleware to use absolute path
app.use(express.static(path.join(__dirname, 'public')));

// Update route handlers to use absolute paths
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'countryFinder.html'));
});

app.get('/documentation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'documentation.html'));
});

// Store active games
const games = new Map();

// List of countries to guess from
const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola',
        'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahrain',
        'Bangladesh', 'Belarus', 'Belgium', 'Bhutan',
        'Bolivia', 'Bosnia and Herzegovina', 'Brazil', 'Bulgaria',
        'Burkina Faso', 'Cameroon', 'Canada',
        'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia',
        'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
        'Democratic Republic of the Congo', 'Denmark',
        'Ecuador', 'Egypt', 'El Salvador',
        'Estonia', 'Ethiopia', 'Finland', 'France',
        'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada',
        'Guatemala', 'Haiti', 'Honduras',
        'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
        'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
        'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon',
        'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar',
        'Malaysia', 'Mali', 'Malta', 'Mexico', 'Moldova', 'Monaco',
        'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
        'Nepal', 'Netherlands', 'New Zealand', 'Niger',
        'Nigeria', 'North Korea', 'Norway', 'Oman', 'Pakistan',
        'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
        'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda',
        'San Marino', 'Saudi Arabia', 'Senegal', 'Singapore', 'Slovakia', 'Slovenia',
        'Somalia', 'South Africa', 'South Korea', 'South Sudan',
        'Spain', 'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland', 'Syria',
        'Taiwan', 'Tajikistan', 'Thailand',
        'Tunisia', 'Turkey', 'Turkmenistan',
        'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 
        'United States of America', 'Uruguay', 'Uzbekistan',
        'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

function getRandomCountry() {
    return countries[Math.floor(Math.random() * countries.length)];
}

// Add this at the top with other game-related variables
const GAME_DURATION = 180; // 3 minutes in seconds

// Add this function to get public game listings
function getPublicGamesList() {
    const gamesList = [];
    games.forEach((game, gameId) => {
        gamesList.push({
            gameId: gameId,
            host: game.playerInfo[game.players[0]].name,
            hostCountry: game.playerInfo[game.players[0]].country,
            status: game.players.length === 1 ? 'waiting' : 'playing',
            players: game.players.length
        });
    });
    return gamesList;
}

// Add near the top with other global variables
const leaderboard = new Map(); // Store player scores

// Add this function to get top players
function getTopPlayers() {
    return Array.from(leaderboard.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)  // Get top 3 players
        .map(player => ({
            name: player.name,
            score: player.score
        }));
}

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('createGame', (playerInfo) => {
        const gameId = Math.random().toString(36).substring(2, 8).toLowerCase();
        console.log('Creating game:', gameId, 'for player:', playerInfo);
        
        const playerId = `${playerInfo.name}#${socket.id.slice(0,4)}`;
        
        const game = {
            players: [playerId],
            playerInfo: { [playerId]: playerInfo },
            scores: { [playerId]: 0 },
            attempts: { [playerId]: 0 },
            currentCountry: getRandomCountry(),
            status: 'waiting',
            skipVotes: new Set(),
            skipsRemaining: 3,
            socketIds: { [playerId]: socket.id },
            startTime: null,
            pendingSkips: {}
        };
        
        games.set(gameId, game);
        socket.join(gameId);
        
        socket.emit('gameCreated', {
            gameId,
            playerId,
            countryToFind: game.currentCountry,
            scores: game.scores,
            playerInfo: game.playerInfo,
            attempts: game.attempts,
            status: 'waiting'
        });

        // Broadcast updated games list to all clients
        io.emit('gamesList', getPublicGamesList());
    });

    socket.on('joinGame', ({ gameId, playerInfo }) => {
        const normalizedGameId = gameId.trim().toLowerCase();
        console.log('Join game request for:', normalizedGameId);
        
        const game = games.get(normalizedGameId);
        if (!game) {
            socket.emit('error', 'Game not found');
            return;
        }

        const playerId = `${playerInfo.name}#${socket.id.slice(0,4)}`;
        
        game.players.push(playerId);
        game.playerInfo[playerId] = playerInfo;
        game.scores[playerId] = 0;
        game.attempts[playerId] = 0;
        game.socketIds[playerId] = socket.id;
        game.status = 'playing';
        
        socket.join(normalizedGameId);

        if (!game.startTime) {
            game.startTime = Date.now();
        }

        io.to(normalizedGameId).emit('gameStarted', {
            countryToFind: game.currentCountry,
            scores: game.scores,
            playerInfo: game.playerInfo,
            attempts: game.attempts,
            status: 'playing',
            startTime: game.startTime
        });

        // Broadcast updated games list to all clients
        io.emit('gamesList', getPublicGamesList());
    });

    socket.on('correctGuess', ({ clickedCountry }) => {
        for (const [gameId, game] of games.entries()) {
            const playerId = Object.entries(game.socketIds).find(([_, sid]) => sid === socket.id)?.[0];
            if (playerId) {
                // Check if anyone was trying to skip this country
                Object.entries(game.pendingSkips).forEach(([skipPlayerId, skipData]) => {
                    if (skipData.country === clickedCountry && !skipData.penaltyApplied) {
                        // Apply penalty to player who wanted to skip
                        if (!game.attempts[skipPlayerId]) game.attempts[skipPlayerId] = 0;
                        game.attempts[skipPlayerId] += 3;
                        game.pendingSkips[skipPlayerId].penaltyApplied = true;
                        
                        io.to(gameId).emit('skipPenalty', {
                            playerName: game.playerInfo[skipPlayerId].name,
                            country: clickedCountry
                        });
                    }
                });

                game.attempts[playerId]++;
                game.scores[playerId]++;
                
                const oldCountry = game.currentCountry;
                game.currentCountry = getRandomCountry();
                
                io.to(gameId).emit('scoreUpdate', {
                    scores: game.scores,
                    attempts: game.attempts,
                    playerInfo: game.playerInfo,
                    message: `${game.playerInfo[playerId].name} found ${oldCountry}!`
                });
                io.to(gameId).emit('newCountry', game.currentCountry);
                break;
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        games.forEach((game, gameId) => {
            if (game.players.includes(socket.id)) {
                if (game.players.length <= 2) {
                    // If only 2 or fewer players, end the game
                    io.to(gameId).emit('gameOver');
                    games.delete(gameId);
                } else {
                    // Remove player from game
                    game.players = game.players.filter(id => id !== socket.id);
                    delete game.scores[socket.id];
                    io.to(gameId).emit('scoreUpdate', game.scores);
                }
            }
        });

        // Broadcast updated games list to all clients
        io.emit('gamesList', getPublicGamesList());
    });

    // Add a new event handler for game state requests
    socket.on('requestGameState', (gameId) => {
        const game = games.get(gameId);
        if (game) {
            socket.emit('gameState', {
                countryToFind: game.currentCountry,
                scores: game.scores,
                players: game.players,
                status: game.status
            });
        }
    });

    socket.on('gameEnded', () => {
        for (const [gameId, game] of games.entries()) {
            const playerId = Object.entries(game.socketIds).find(([_, sid]) => sid === socket.id)?.[0];
            if (playerId) {
                const gameStats = {
                    players: {},
                    winner: null,
                    highestScore: 0
                };

                // Calculate final stats for each player
                game.players.forEach(pid => {
                    const score = game.scores[pid] || 0;
                    const attempts = game.attempts[pid] || 0;
                    const accuracy = attempts > 0 ? ((score / attempts) * 100).toFixed(1) : '0';
                    
                    gameStats.players[pid] = {
                        name: game.playerInfo[pid].name,
                        country: game.playerInfo[pid].country,
                        score: score,
                        attempts: attempts,
                        accuracy: accuracy
                    };

                    // Determine winner
                    if (score > gameStats.highestScore) {
                        gameStats.highestScore = score;
                        gameStats.winner = pid;
                    }
                });

                // Send game over to all players in the game
                io.to(gameId).emit('gameOver', gameStats);
                games.delete(gameId);
                break;
            }
        }
    });

    socket.on('wrongGuess', ({ clickedCountry }) => {
        for (const [gameId, game] of games.entries()) {
            const playerId = Object.entries(game.socketIds).find(([_, sid]) => sid === socket.id)?.[0];
            if (playerId) {
                if (!game.attempts) game.attempts = {};
                if (!game.attempts[playerId]) game.attempts[playerId] = 0;
                
                game.attempts[playerId]++;
                
                // Send updated attempts to all players
                io.to(gameId).emit('scoreUpdate', {
                    scores: game.scores || {},
                    attempts: game.attempts,
                    playerInfo: game.playerInfo,
                    message: `${game.playerInfo[playerId].name} clicked ${clickedCountry} instead of ${game.currentCountry}`
                });
                
                console.log(`${game.playerInfo[playerId].name} clicked ${clickedCountry} instead of ${game.currentCountry}. Score: ${game.scores?.[playerId] || 0}/${game.attempts[playerId]}`);
                break;
            }
        }
    });

    // Add new socket event handler for skip votes
    socket.on('skipVote', () => {
        for (const [gameId, game] of games.entries()) {
            const playerId = Object.entries(game.socketIds).find(([_, sid]) => sid === socket.id)?.[0];
            if (playerId) {
                console.log(`${game.playerInfo[playerId].name} voted to skip ${game.currentCountry}`);

                if (game.skipsRemaining <= 0) {
                    socket.emit('skipError', 'No skips remaining');
                    return;
                }

                if (game.skipVotes.has(playerId)) {
                    socket.emit('skipError', 'You already voted to skip');
                    return;
                }

                // Add to pending skips
                game.skipVotes.add(playerId);
                game.pendingSkips[playerId] = {
                    country: game.currentCountry,
                    penaltyApplied: false
                };

                // Send current skip vote status
                io.to(gameId).emit('skipVoteUpdate', {
                    votes: game.skipVotes.size,
                    totalPlayers: game.players.length,
                    skipsRemaining: game.skipsRemaining,
                    voters: Array.from(game.skipVotes).map(id => game.playerInfo[id].name)
                });

                // If all players voted to skip
                if (game.skipVotes.size === game.players.length) {
                    game.skipsRemaining--;
                    const oldCountry = game.currentCountry;
                    game.currentCountry = getRandomCountry();

                    // Apply penalty to all who voted
                    Array.from(game.skipVotes).forEach(pid => {
                        if (!game.attempts[pid]) game.attempts[pid] = 0;
                        game.attempts[pid] += 3;
                    });

                    // Clear skip votes and pending skips
                    game.skipVotes.clear();
                    game.pendingSkips = {};

                    io.to(gameId).emit('countrySkipped', {
                        newCountry: game.currentCountry,
                        message: `All players skipped ${oldCountry}`,
                        skipsRemaining: game.skipsRemaining
                    });
                }
            }
        }
    });

    // Add these socket handlers
    socket.on('requestGamesList', () => {
        socket.emit('gamesList', getPublicGamesList());
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the game at http://localhost:${PORT}`);
}); 