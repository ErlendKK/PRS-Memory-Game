const imageLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

/**
 * Represents a card
 * @param {string} img - The image identifier for the card.
 */
class Card {
    constructor(img) {
        this.img_id = img;
        this.img = "images/" + img + ".png";
        this.flipped = false;
        this.matched = false;
    }
}

/**
 * Creates and shuffles an array of cards
 * @param {number} dimensions - The dimensions of the game board (number of rows/columns).
 * @returns {Card[]} An array of shuffled Card objects.
 */
function mixedCards(dimensions) {
    const numOfCards = (dimensions ** 2) / 2;
    const cards = [];

    const cardPool = imageLetters.length < numOfCards ? [...imageLetters] : null;

    // Duplicate letters to ensure cards.length === numOfCards
    while (imageLetters.length < numOfCards) {
        const randomIdx = Math.floor(Math.random() * cardPool.length);
        const randomLetter = cardPool[randomIdx];
        imageLetters.push(randomLetter);
    }

    // Create cards and add to cards
    for (let i = 0; i < numOfCards; i++) {
        cards.push(new Card(imageLetters[i]));
        cards.push(new Card(imageLetters[i]));
    }

    // Shuffle cards
    const mixedCards = [];
    while (cards.length) {
        const randomIdx = Math.floor(Math.random() * cards.length);
        const [movedCard] = cards.splice(randomIdx, 1);
        mixedCards.push(movedCard);
    }

    return mixedCards;
}

/**
 * Vue component representing the game board.
 * @type {Object}
 */
const boardC = {
    props: ['players', 'dimensions'],

    template: `
    <div class="cardboard" :style="{ width: computedWidth }">
        <div class="outer" v-for="card in cards">
            <div v-if="!card.matched" class="card-container"> 
                <div class="card front" :style="{ transform: card.flipped? 'rotateY(180deg)': 'none'}">
                    <img :src="card.img">
                </div>
                <div class="card back" :style="{ transform: card.flipped? 'rotateY(180deg)': 'none'}" @click="clickCard(card)"></div>
            </div>
        </div>
    </div>
    `,

    data() {
        return {
            cards: mixedCards(this.dimensions),
            prevCard: null,
            isPlaying: false
        }
    },

    methods: {
        /**
         * Handles the card click event. First card: store as this.prevCard; Second card: check if its a match
         * @param {Card} card - The card that was clicked.
         */
        async clickCard(card) {
            if (card === this.prevCard || this.isPlaying) return;
            card.flipped = true;
            this.$emit('card-flipped');

            // Handle first card drawn
            if (!this.prevCard) {
                this.prevCard = card;
                return;
            }

            this.isPlaying = true;
            await this.unflipCards(card, 600);

            // Handle match / non-match
            const isMatch = () => this.prevCard?.img_id === card.img_id;

            if (isMatch()) {
                this.handleMatch(card);
            } else {
                this.handleNonMatch();
            }
        },

        /**
         * Sets the current player.
         * @returns {Object} The current player.
         */
        setCurrentPlayer() {
            return this.players.find(player => player.hasTurn);
        },

        /**
         * Unflips the cards after a delay.
         * @param {Card} card - The current card.
         * @param {number} ms - The delay in milliseconds.
         * @returns {Promise} A promise that resolves after the delay.
         */
        unflipCards(card, ms) {
            return new Promise((resolve) => { 
                setTimeout(() => {
                    [card, this.prevCard].forEach(c => c.flipped = false);
                    this.isPlaying = false;
                    resolve();
                }, ms);
            });
        },

        /**
         * Handles a match scenario. Resets prevCard. Checks if its game-over.
         * @param {Card} card - The card that was matched.
         */
        handleMatch(card) {
            [card, this.prevCard].forEach(c => c.matched = true);
            this.prevCard = null;
            const gameOver = this.cards.every(card => card.matched);
            console.log('player got match');
            this.$emit('turn-played', { match: true, gameOver: gameOver });
        },

        /**
         * Handles a non-match scenario. Resets prevCard.
         */
        handleNonMatch() {
            this.prevCard = null;
            this.$emit('turn-played', { match: false, gameOver: false });
            console.log('no match');
        },
    },
    computed: {
        /**
         * Computes the width of the game board based on dimensions.
         * @returns {string} The computed width.
         */
        computedWidth() {
            return (this.dimensions * 100) + 'px';
        }
    }       
}
