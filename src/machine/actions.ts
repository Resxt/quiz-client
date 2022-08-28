import { GameModel } from "./GameMachine";
import { GameAction } from "./types";

export const joinLobbyAction: GameAction<"joinLobby"> = (context, event) => ({
    players: [...context.players, {id: event.playerId, name: event.name}]
})

export const leaveLobbyAction: GameAction<"leaveLobby"> = (context, event) => ({
    players: context.players.filter(p => p.id !== event.playerId)
})

export const startGameAction: GameAction<"startGame"> = (context, event) => ({
    currentRound: 1,
    lastRound: event.lastRound,
    gameStarted: true
})

export const answerQuestionAction: GameAction<"answerQuestion"> = (context, event) => ({
    confirmedAnswers: [...context.confirmedAnswers, {playerId: event.playerId, playerAnswer: event.answer}]
})

export const endRoundAction: GameAction<"endRound"> = (context, event) => ({
    currentRound: context.currentRound +1,
    confirmedAnswers: [],
})

export const endGameAction: GameAction<"endGame"> = (context, event) => ({
    gameEnded: true
})

export const restartGameAction: GameAction<"restartGame"> = (context, event) => {
    let newGameContext = GameModel.initialContext
    newGameContext.players = context.players
    newGameContext.lastRound = context.lastRound

    return newGameContext
}