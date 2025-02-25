let nickname = "";
let lobbies = []; // Список лобби
const MAX_PLAYERS = 14; // Ограничение на количество игроков

function setNickname() {
    const input = document.getElementById("nickname").value.trim();
    if (input) {
        nickname = input;
        alert(`Никнейм установлен: ${nickname}`);
    } else {
        alert("Пожалуйста, введите никнейм!");
    }
}

function showCreateLobby() {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("createLobby").style.display = "block";
}

function backToMenu() {
    document.getElementById("createLobby").style.display = "none";
    document.getElementById("mainMenu").style.display = "block";
}

function isPlayerInAnyLobby() {
    return lobbies.some(lobby => lobby.players.includes(nickname));
}

function hasPlayerCreatedLobby() {
    return lobbies.some(lobby => lobby.players[0] === nickname);
}

function createLobby() {
    if (!nickname) {
        alert("Сначала установите никнейм!");
        return;
    }
    if (hasPlayerCreatedLobby()) {
        alert("Вы уже создали одно лобби! Нельзя создать больше одного.");
        return;
    }
    if (isPlayerInAnyLobby()) {
        alert("Вы уже состоите в лобби! Нельзя создавать новое.");
        return;
    }
    const lobbyName = document.getElementById("lobbyName").value.trim();
    if (lobbyName) {
        const lobbyCode = Math.random().toString(36).substring(2, 7).toUpperCase();
        lobbies.push({ name: lobbyName, code: lobbyCode, players: [nickname] });
        alert(`Лобби создано! Код: ${lobbyCode}`);
        backToMenu();
        updateLobbyList();
    } else {
        alert("Введите название лобби!");
    }
}

function joinLobby(code) {
    if (!nickname) {
        alert("Сначала установите никнейм!");
        return;
    }
    if (isPlayerInAnyLobby()) {
        alert("Вы уже состоите в одном лобби! Нельзя присоединиться к другому.");
        return;
    }
    const lobby = lobbies.find(l => l.code === code);
    if (lobby) {
        if (lobby.players.length >= MAX_PLAYERS) {
            alert("Лобби полностью заполнено (максимум 14 игроков)!");
            return;
        }
        lobby.players.push(nickname);
        alert(`Вы присоединились к лобби: ${lobby.name}`);
        updateLobbyList();
    }
}

function leaveLobby(code) {
    const lobby = lobbies.find(l => l.code === code);
    if (lobby) {
        lobby.players = lobby.players.filter(player => player !== nickname);
        if (lobby.players.length === 0) {
            // Удаляем лобби, если оно пустое
            lobbies = lobbies.filter(l => l.code !== code);
        }
        alert(`Вы вышли из лобби: ${lobby.name}`);
        updateLobbyList();
    }
}

function showPlayerList(code) {
    const lobby = lobbies.find(l => l.code === code);
    if (lobby) {
        const playerList = document.getElementById("playerList");
        playerList.innerHTML = "";
        lobby.players.forEach(player => {
            const li = document.createElement("li");
            li.textContent = player;
            playerList.appendChild(li);
        });
        document.getElementById("playerListModal").style.display = "block";
    }
}

function closePlayerList() {
    document.getElementById("playerListModal").style.display = "none";
}

function updateLobbyList() {
    const list = document.getElementById("activeLobbies");
    list.innerHTML = "";
    lobbies.forEach(lobby => {
        const li = document.createElement("li");
        const lobbyInfo = document.createElement("span");
        lobbyInfo.textContent = `${lobby.name} (Игроков: ${lobby.players.length}/${MAX_PLAYERS})`;

        // Контейнер для кнопок
        const buttonContainer = document.createElement("div");
        buttonContainer.style.display = "flex";
        buttonContainer.style.gap = "10px";

        const actionButton = document.createElement("button");
        if (lobby.players.includes(nickname)) {
            // Если игрок в лобби, показываем "Выйти"
            actionButton.textContent = "Выйти";
            actionButton.onclick = () => leaveLobby(lobby.code);
        } else {
            // Если игрок не в лобби, показываем "Присоединиться"
            actionButton.textContent = "Присоединиться";
            actionButton.onclick = () => joinLobby(lobby.code);
            if (lobby.players.length >= MAX_PLAYERS) {
                actionButton.disabled = true; // Отключаем, если лобби полное
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

// Инициализация списка лобби при загрузке
updateLobbyList();