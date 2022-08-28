import { createModel } from "xstate/lib/model"
import { answerQuestionAction, endGameAction, endRoundAction, joinLobbyAction, leaveLobbyAction, restartGameAction, startGameAction } from "./actions";
import { canAnswerQuestionGuard, canEndGameGuard, canEndRoundGuard, canJoinLobbyGuard as canJoinLobbyGuard, canLeaveLobbyGuard, canRestartGameGuard, canStartGameGuard } from "./guards";
import { Player, PlayerAnswer } from "./types";

export enum GameState {
    LOBBY = 'LOBBY',
    PLAY = 'PLAY',
    FINISH = 'FINISH'
}

export const GameModel = createModel({
    players: [] as Player[],
    gameStarted: false as boolean,
    gameEnded: false as boolean,
    currentRound: 1 as number,
    lastRound: 3 as number,

    confirmedAnswers: [] as PlayerAnswer[],
}, {
    events: {
        joinLobby: (playerId: Player["id"], name: Player["name"]) => ({playerId, name}),
        leaveLobby: (playerId: Player["id"]) => ({playerId}),
        startGame: (playerId: Player["id"], lastRound: number) => ({playerId, lastRound}),
        answerQuestion: (playerId: Player["id"], answer: string) => ({playerId, answer}),
        endRound: () => ({}),
        endGame: () => ({}),
        restartGame: (playerId: Player["id"]) => ({playerId})
    }
})

export const GameMachine = GameModel.createMachine({
    id: 'game',
    context: GameModel.initialContext,
    initial: GameState.LOBBY,
    states: {
        [GameState.LOBBY]: {
            on: {
                joinLobby: {
                    cond: canJoinLobbyGuard,
                    actions: [GameModel.assign(joinLobbyAction)],
                    target: GameState.LOBBY
                },
                leaveLobby: {
                    cond: canLeaveLobbyGuard,
                    actions: [GameModel.assign(leaveLobbyAction)],
                    target: GameState.LOBBY
                },
                startGame: {
                    cond: canStartGameGuard,
                    actions: [GameModel.assign(startGameAction)],
                    target: GameState.PLAY
                }
            }
        },
        [GameState.PLAY]: {
            on: {
                answerQuestion: {
                    cond: canAnswerQuestionGuard,
                    actions: [GameModel.assign(answerQuestionAction)],
                    target: GameState.PLAY
                },
                endRound: {
                    cond: canEndRoundGuard,
                    actions: [GameModel.assign(endRoundAction)],
                    target: GameState.PLAY
                },
                endGame: {
                    cond: canEndGameGuard,
                    actions: [GameModel.assign(endGameAction)],
                    target: GameState.FINISH
                }
            }
        },
        [GameState.FINISH]: {
            on: {
                restartGame: {
                    cond: canRestartGameGuard,
                    actions: [GameModel.assign(restartGameAction)],
                    target: GameState.LOBBY
                }
            }
        }
    }
})