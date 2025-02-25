// Подключение к серверу через Socket.io
const socket = io();

let nickname = ""; // Локальная переменная для хранения никнейма

function authWithDiscord() {
    window.location.href = '/auth/discord'; // Перенаправляем на страницу авторизации Discord
}

function logout() {
    window.location.href = '/logout'; // Выход из системы
}

socket.on('connect', () => {
    // Проверяем, авторизован ли пользователь, и обновляем интерфейс
    fetch('/nickname', {
        method: 'GET',
        credentials: 'include' // Включаем куки для сессии
    })
    .then(response => response.json())
    .then(data => {
        if (data.nickname) {
            nickname = data.nickname;
            document.getElementById('authButton').style.display = 'none';
            document.getElementById('logoutButton').style.display = 'block';
            document.getElementById('nicknameDisplay').textContent = ` (Никнейм: ${nickname})`;
            socket.emit('setNickname', nickname); // Уведомляем сервер о никнейме
        } else {
            document.getElementById('authButton').style.display = 'block';
            document.getElementById('logoutButton').style.display = 'none';
            document.getElementById('nicknameDisplay').textContent = '';
        }
    })
    .catch(error => {
        console.error('Ошибка получения никнейма:', error);
        alert('Произошла ошибка при проверке авторизации. Попробуйте снова.');
    });

    // Обработка обновления никнейма от сервера
    socket.on('nicknameSet', (message) => {
        console.log(message);
        alert(message);
    });

    socket.on('error', (message) => {
        console.error(message);
        alert(message);
        nickname = "";
        document.getElementById('authButton').style.display = 'block';
        document.getElementById('logoutButton').style.display = 'none';
        document.getElementById('nicknameDisplay').textContent = '';
    });
});

function showCreateLobby() {
    if (!nickname) {
        alert("Сначала авторизуйтесь через Discord!");
        return;
    }
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("createLobby").style.display = "block";
}

function backToMenu() {
    document.getElementById("createLobby").style.display = "none";
    document.getElementById("mainMenu").style.display = "block";
}

function createLobby() {
    if (!nickname) {
        alert("Сначала авторизуйтесь через Discord!");
        return;
    }
    const lobbyName = document.getElementById("lobbyName").value.trim();
    if (lobbyName) {
        socket.emit('createLobby', lobbyName);
    } else {
        alert("Введите название лобби!");
    }
}

function joinLobby(code) {
    if (!nickname) {
        alert("Сначала авторизуйтесь через Discord!");
        return;
    }
    socket.emit('joinLobby', code);
}

function leaveLobby(code) {
    if (!nickname) {
        alert("Сначала авторизуйтесь через Discord!");
        return;
    }
    socket.emit('leaveLobby', code);
}

function showPlayerList(code) {
    socket.emit('getPlayerList', code);
    socket.on('playerList', (players) => {
        const playerList = document.getElementById("playerList");
        playerList.innerHTML = "";
        players.forEach(player => {
            const li = document.createElement("li");
            li.textContent = player;
            playerList.appendChild(li);
        });
        document.getElementById("playerListModal").style.display = "block";
    });
}

function closePlayerList() {
    document.getElementById("playerListModal").style.display = "none";
}

function updateLobbyList(lobbies) {
    const list = document.getElementById("activeLobbies");
    list.innerHTML = "";
    lobbies.forEach(lobby => {
        const li = document.createElement("li");
        const lobbyInfo = document.createElement("span");
        lobbyInfo.textContent = `${lobby.name} (Игроков: ${lobby.players.length}/14)`; 

        const buttonContainer = document.createElement("div");
        buttonContainer.style.display = "flex";
        buttonContainer.style.gap = "10px";

        const actionButton = document.createElement("button");
        if (lobby.players.includes(nickname)) {
            actionButton.textContent = "Выйти";
            actionButton.onclick = () => leaveLobby(lobby.code);
        } else {
            actionButton.textContent = "Присоединиться";
            actionButton.onclick = () => joinLobby(lobby.code);
            if (lobby.players.length >= 14) {
                actionButton.disabled = true;
            }
        }

        const playersButton = document.createElement("button");
        playersButton.textContent = "Список игроков";
        playersButton.onclick = () => showPlayerList(lobby.code);

        buttonContainer.appendChild(actionButton);
        buttonContainer.appendChild(playersButton);
        li.appendChild(lobbyInfo);
        li.appendChild(buttonContainer);
        list.appendChild(li);
    });
}

// Получение обновлений списка лобби от сервера
socket.on('updateLobbies', (lobbiesData) => {
    updateLobbyList(lobbiesData);
});

socket.on('error', (message) => {
    alert(message);
});

socket.on('lobbyCreated', (message) => {
    alert(message);
    backToMenu();
});

socket.on('joinedLobby', (message) => {
    alert(message);
});

socket.on('leftLobby', (message) => {
    alert(message);
});