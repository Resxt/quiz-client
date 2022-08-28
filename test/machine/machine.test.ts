import { beforeEach, describe, expect, it } from 'vitest'
import { GameMachine, GameModel, GameState } from '../../src/machine/GameMachine'
import { interpret, InterpreterFrom } from 'xstate'

describe("machine/GameMachine", () => {
    let machine: InterpreterFrom<typeof GameMachine>

    machine = interpret(GameMachine).start()

    machine.onTransition((state) => {
        console.log('State: ' + state.value)
        console.log(state.context)
    })
    
    describe("join", () => {
        it('should let a player join', () => {
            expect(machine.send(GameModel.events.joinLobby("1", "player1")).changed).toBe(true)
            expect(machine.state.context.players).toHaveLength(1)
        })

        it('should not let the same player join the game twice', () => {
            expect(machine.send(GameModel.events.joinLobby("1", "player1")).changed).toBe(false)
            expect(machine.state.context.players).toHaveLength(1)
        })

        it('should allow a player to join again after he left', () => {
            expect(machine.send(GameModel.events.joinLobby("2", "player2")).changed).toBe(true)
            expect(machine.state.context.players).toHaveLength(2)

            expect(machine.send(GameModel.events.leaveLobby("2")).changed).toBe(true)
            expect(machine.state.context.players).toHaveLength(1)

            expect(machine.send(GameModel.events.joinLobby("2", "player2")).changed).toBe(true)
            expect(machine.state.context.players).toHaveLength(2)
        })

        it('should not let a third player join', () => {
            expect(machine.send(GameModel.events.joinLobby("3", "player3")).changed).toBe(false)
            expect(machine.state.context.players).toHaveLength(2)
        })
    })

    describe("start", () => {
        it('should not let a player who\'s not the first player start the game', () => {
            expect(machine.send(GameModel.events.startGame(machine.state.context.players[1].id, 2)).changed).toBe(false)
            expect(machine.state.context.gameStarted).toBe(false)
        })

        it('should let the first player start the game when there are enough players', () => {
            expect(machine.send(GameModel.events.startGame(machine.state.context.players[0].id, 2)).changed).toBe(true)
            expect(machine.state.context.gameStarted).toBe(true)
        })

        it('should not let the first player start the game when the game is already started', () => {
            expect(machine.send(GameModel.events.startGame(machine.state.context.players[0].id, 2)).changed).toBe(false)
            expect(machine.state.context.gameStarted).toBe(true)
        })
    })

    describe("play", () => {
        it('should let each player answer', () => {
            machine.state.context.players.forEach(player => {
                expect(machine.send(GameModel.events.answerQuestion(player.id, player.name + "'s answer")).changed).toBe(true)
            });
        })

        it('should end the round when each player answered', () => {
            expect(machine.send(GameModel.events.endRound()).changed).toBe(true)
        })

        it('should let the first player answer the next question', () => {
            expect(machine.send(GameModel.events.answerQuestion(machine.state.context.players[0].id, machine.state.context.players[0].name + "'s answer")).changed).toBe(true)
        })

        it('should not end the game when not every round has been played', () => {
            expect(machine.send(GameModel.events.endGame()).changed).toBe(false)
        })

        it('should not end the round when not every player answered', () => {
            expect(machine.send(GameModel.events.endRound()).changed).toBe(false)
        })

        it('should let other players answer', () => {
            machine.state.context.players.forEach(player => {
                if (player.id !== machine.state.context.players[0].id) {
                    expect(machine.send(GameModel.events.answerQuestion(player.id, player.name + "'s answer")).changed).toBe(true)
                }
            });
        })

        it('should end the game when every round has been played', () => {
            expect(machine.send(GameModel.events.endGame()).changed).toBe(true)
        })
    })

    describe("restart", () => {
        it('should not let a player who\'s not first player restart the game', () => {
            expect(machine.send(GameModel.events.restartGame(machine.state.context.players[1].id)).changed).toBe(false)
            expect(machine.state.value).toBe(GameState.FINISH)
        })

        it('should let the first player restart the game', () => {
            expect(machine.send(GameModel.events.restartGame(machine.state.context.players[0].id)).changed).toBe(true)
            expect(machine.state.value).toBe(GameState.LOBBY)
        })
    })
})