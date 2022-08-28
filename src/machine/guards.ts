import { GameGuard } from "./types";

/*
- The room doesn't have more than one player
- The player isn't already in the room
*/
export const canJoinLobbyGuard: GameGuard<"joinLobby"> = (context, event) => {
    return context.players.length < 2
    && context.players.find(p => p.id === event.playerId) === undefined
}

/*
- The player is in the room
*/
export const canLeaveLobbyGuard: GameGuard<"leaveLobby"> = (context, event) => {
    return context.players.find(p => p.id === event.playerId) !== undefined
}

/*
- There is more than one player in the room
- The player starting the game is the first player who joined the room (the host)
- The game hasn't started yet
*/
export const canStartGameGuard: GameGuard<"startGame"> = (context, event) => {
    return context.players.length > 1 
    && context.players[0].id === event.playerId 
    && !context.gameStarted
}

/*
- The player didn't answer yet
- The player answering joined the game (is in the game's players array)
- Not everyone answered yet
- The game has started
- The game hasn't ended
*/
export const canAnswerQuestionGuard: GameGuard<"answerQuestion"> = (context, event) => {
    return context.confirmedAnswers.find(p => p.playerId === event.playerId) === undefined 
    && context.players.find(p => p.id === event.playerId)?.id == event.playerId 
    && context.players.length != context.confirmedAnswers.length
    && context.gameStarted
    && context.gameEnded == false
}

/*
- Every player answered
- The current round is not the last round
- The game has started
- The game hasn't ended
*/
export const canEndRoundGuard: GameGuard<"endRound"> = (context) => {
    return context.confirmedAnswers.length == context.players.length 
    && context.currentRound < context.lastRound
    && context.gameStarted
    && context.gameEnded == false
}

/*
- Every player answered
- The current round is the last round
- The game has started
- The game hasn't ended
*/
export const canEndGameGuard: GameGuard<"endGame"> = (context) => {
    return context.confirmedAnswers.length == context.players.length
    && context.currentRound == context.lastRound
    && context.gameStarted
    && context.gameEnded == false
}

/*
- There is at least one player in the room
- The player restarting the game is the first player who joined the room (the host)
- The game has ended
*/
export const canRestartGameGuard: GameGuard<"restartGame"> = (context, event) => {
    return context.players.length >= 1 
    && context.players[0].id === event.playerId 
    && context.gameEnded
}