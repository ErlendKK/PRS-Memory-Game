/**
 * Component representing game statistics.
 * @type {Object}
 */
const gameStatC = {
    props: {
        gameStarted: Boolean, 
        players: Array
    },
    data() {
        return {
            player1: this.players[0],
            player2: this.players[1],
        }
    },
    template: /*html*/`
        <div v-if="gameStarted" id="gamestat">
            <div id="player1" :class="player1.hasTurn ? 'current-player' : 'other-player'">
                <p>
                    <span>Player 1:</span>&nbsp;<span class="score">{{ player1.score }}</span>
                </p>
                <p>
                    <span>{{ player1.flips }}&nbsp;flips</span>
                </p>
            </div>

            <div></div>

            <div id="stat">
                <span id="playerWrapper">{{ currentPlayerName }}</span>
            </div>

            <div></div>

            <div id="player2" :class="player2.hasTurn ? 'current-player' : 'other-player'">
                <p>
                    <span>Player 2:</span>&nbsp;<span class="score">{{ player2.score }}</span>
                </p>
                <p>
                    <span>{{ player2.flips }}&nbsp;flips</span>
                </p>
            </div>
        </div>`,
    computed: {
        /**
         * Computes the name of the current player.
         * @returns {string} The name of the current player or 'No current player' if no player has the turn.
         */
       currentPlayerName() {
            const currentPlayer = this.players.find(player => player.hasTurn);
            return currentPlayer ? currentPlayer.name : 'No current player';
        }
    }
}
