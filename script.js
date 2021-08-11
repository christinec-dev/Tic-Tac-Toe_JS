//------------------- Credentials -----------------------------------------------
// Author: Christine Coomans
// Date Created: 2020/09/11

// -------------------- Game DOM Constants --------------------------------------

const mainWrapper = document.querySelector("#main-wrapper")
const board = document.querySelector("#board")
const form = document.querySelector("form")
const dashboard = document.querySelector(".dashboard")
const welcomeScreen = document.querySelector(".welcome-screen")
const winnerScreen = document.querySelector(".winner-board")
const winnerParagraph = document.querySelector(".winner-paragraph")

// -------------------- Game 3x3 Array --------------------------------------

const gameBoard = (() => {
    // -------------------- Sets All Init Cells To Empty --------------------------------------
    let gameArray = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ]

    let players = []

    // -------------------- Player Creator --------------------------------------

    const player = (name, sign) => {
        return {
            name,
            sign
        }
    }

    // -------------------- Sets Cell Values To Non-Empty --------------------------------------
    const move = (player, pos) => {
        gameBoard.gameArray[pos[0]][pos[1]] = player.sign
    }

    const validMove = (pos) => {
        return gameBoard.gameArray[Math.floor(pos / 3)][pos % 3] == ""
    }


    // -------------------- Game Over Checker --------------------------------------

    const win = () => {
        // -------------------- (Row) Horizontal Cell Checker--------------------------------------
        const arr = gameBoard.gameArray
        if (!Array.from(arr).flat().includes("")) {
            return "draw"
        }

        for (let i = 0; i < 3; i++) {
            if (arr[i][0] != "" && (arr[i][0] == arr[i][1]) && (arr[i][1] == arr[i][2])) {
                return arr[i][0]
            }
        }

        // -------------------- (Column) Vertical Cell Checker --------------------------------------
        for (let j = 0; j < 3; j++) {
            if (arr[0][j] != "" && (arr[0][j] == arr[1][j]) && (arr[1][j] == arr[2][j])) {
                return arr[0][j]
            }
        }

        // -------------------- Game Diagonals Checker --------------------------------------
        // -------------------- Game Primary Checker --------------------------------------
        if (arr[0][0] != "" && (arr[0][0] == arr[1][1]) && (arr[1][1] == arr[2][2])) {
            return arr[0][0]
        }

        // -------------------- Game Secondary Checker --------------------------------------
        if (arr[0][2] != "" && (arr[0][2] == arr[1][1]) && (arr[1][1] == arr[2][0])) {
            return arr[0][2]
        }
        return false;
    }

    // -------------------- Game Reset After Game Over --------------------------------------
    // ----- Re-uses same players as previous, and sets Cell Values back to Empty -----------
    const restartGame = () => {
        gameBoard.gameArray = [
            ["", "", ""],
            ["", "", ""],
            ["", "", ""]
        ]

    }

    return {
        gameArray,
        player,
        players,
        move,
        win,
        validMove,
        restartGame
    }

})()

// -------------------- Game DOM Manipulation --------------------------------------
const displayController = (() => {

    // --------------------Game DOM Board Rendering --------------------------------------
    const buildBoard = (() => {
        for (let i = 0; i < 9; i++) {
            const block = document.createElement("div")
            block.classList.add("box")
            block.setAttribute("data-id", i);
            board.appendChild(block)
        }
    })

    const clearBoard = () => {
        const blocks = document.querySelectorAll(".box")
        for (let block of blocks) {
            if (block.children.length > 0) {
                block.firstElementChild.remove()
            }
        }
    }

    // -------------------- Game DOM Moves Rendering --------------------------------------
    const renderBoard = (() => {

        for (let i = 0; i < 9; i++) {
            const blocks = document.querySelectorAll("[data-id]")
            const block = blocks[i]
            const boardSign = gameBoard.gameArray[Math.floor(i / 3)][i % 3]
            if (boardSign !== "" && block.children.length === 0) {
                block.appendChild(placeSign(boardSign))
            }
        }
    })

    const placeSign = (sign) => {
        const para = document.createElement("p")
        para.classList.add("sign", sign)
        return para;
    }

    // -------------------- Game Start On Click --------------------------------------
    welcomeScreen.addEventListener("click", (e) => {
        welcomeScreen.style.display = "none"
    })

    // -------------------- Game Welcome Screen After Each Round --------------------------------------
    winnerScreen.addEventListener("click", () => {
        winnerScreen.style.display = "none"
        welcomeScreen.style.display = "flex"
        gameBoard.restartGame()
        displayController.clearBoard()
    })

    // -------------------- Game Player Details (Choose X or O) --------------------------------------
    form.addEventListener("submit", (e) => {
        e.preventDefault()

        // -------------------- Player Details --------------------------------------
        const playerOneName = e.target.querySelectorAll("input")[0].value
        const playerTwoName = e.target.querySelectorAll("input")[1].value

        // -------------------- Details Mandatory Alert --------------------------------------
        if (playerOneName == "" || playerTwoName == "") {
            alert("Did someone forget their name?");
        } else {
            gameBoard.players.push(gameBoard.player(playerOneName, "X"))
            gameBoard.players.push(gameBoard.player(playerTwoName, "O"))
            e.target.style.display = "none"

            // -------------------- Game Start on Player Details --------------------------------------
            displayController.buildBoard()
            ticTacToe()
        }
        return false;

    })

    return {
        renderBoard,
        placeSign,
        buildBoard,
        clearBoard
    }

})()

// -------------------- Game Logic Details --------------------------------------
const ticTacToe = () => {

    // -------------------- Assigns Game Players --------------------------------------
    let player = gameBoard.players[0]

    // -------------------- Turn Indicator --------------------------------------
    const para = document.createElement("h3")
    para.innerHTML = `It's your turn, ${player.name} (${player.sign})`
    para.classList.add("text-light", "turn", `player-${player.sign}`)

    dashboard.appendChild(para)

    // --------------------  Enum Replacement (If) --------------------------------------
    const blocks = document.querySelectorAll("[data-id]")
    for (let block of blocks) {
        block.addEventListener("click", function play(e) {

            // ----------- If cell is clear, put value, if not, send alert-----------------------
            const id = block.getAttribute("data-id")
            if (gameBoard.validMove(id)) {
                gameBoard.move(player, [Math.floor(id / 3), id % 3])

                displayController.renderBoard()

                if (player == gameBoard.players[0]) {
                    player = gameBoard.players[1]
                } else {
                    player = gameBoard.players[0]
                }

                para.classList.remove("player-X", "player-O")
                para.classList.add(`player-${player.sign}`)
                para.innerHTML = `It's your turn, ${player.name} (${player.sign})`
            } else {
                alert(`Oops! You can only place ${player.sign} in empty boxes.`)
            }

            // ----------- Displays winner (X or O), or indicated a draw -----------------------
            const winner = gameBoard.win()

            if (winner) {
                setTimeout(() => {
                    winnerScreen.style.display = "flex"
                    if (winner == "draw") {
                        winnerParagraph.innerHTML = "Yikes, it's a draw!"
                    } else {
                        winnerParagraph.innerHTML = (`Congratulations, ${winner} wins!`)
                    }
                }, 150)
            }
        })
    }
}