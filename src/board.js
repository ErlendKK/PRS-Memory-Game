const imageLetters = ["A", "B", "C", "D", "E","F","G","H", "I", "J", "K", "L"];

class Card {
    constructor(img){
        this.img_id = img;
        this.img = "images/" + img + ".png";
        this.flipped = false;
        this.matched = false
    }
}

function mixedCards(dimensions){
    const numOfCards = (dimensions ** 2) / 2;
    const cards = [];

    const cardPool = imageLetters.length < numOfCards ? [...imageLetters] : null;

    // Dublicate letters to ensure cards.length === numOfCards
    while (imageLetters.length < numOfCards) {
        const randomIdx = Math.floor(Math.random() * cardPool.length);
        const randomLetter = cardPool[randomIdx];
        imageLetters.push(randomLetter);
    }

    // create cards and add to cards
    for (let i = 0; i < numOfCards; i++){
        cards.push(new Card(imageLetters[i]));
        cards.push(new Card(imageLetters[i]));
    }

    // shuffle cards
    const mixedCards = [];
    while (cards.length) {
        const randomIdx = Math.floor(Math.random() * cards.length);
        const [ movedCard ] = cards.splice(randomIdx, 1);
        mixedCards.push(movedCard);
    }

    return mixedCards;
}

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
        async clickCard(card) {
            if (card === this.prevCard || this.isPlaying) return;
            card.flipped = true;
            this.$emit('card-flipped');

            // handle first card drawn
            if (!this.prevCard) {
                this.prevCard = card;
                return;
            }

            this.isPlaying = true;
            await this.unflipCards(card, 600);

            // handle match / non-match
            const isMatch = () => this.prevCard?.img_id === card.img_id;

            if (isMatch()) {
                this.handleMatch(card);
            } else {
                this.handleNonMatch();
            }
        },

        setCurrentPlayer() {
            return this.players.find(player => player.hasTurn);
        },

        unflipCards(card, ms) {
            return new Promise((resolve) => { 
                setTimeout(() => {
                    [card, this.prevCard].forEach(c => c.flipped = false);
                    this.isPlaying = false;
                    resolve();
                }, ms);
            });
        },

        handleMatch(card) {
            [card, this.prevCard].forEach(c => c.matched = true);
            this.prevCard = null;
            const gameOver = this.cards.every(card => card.matched);
            console.log('player got match');
            this.$emit('turn-played', {match: true, gameOver: gameOver});
        },

        handleNonMatch() {
            this.prevCard = null;
            this.$emit('turn-played', {match: false, gameOver: false});
            console.log('no match');
        },
    },
    computed: {
        computedWidth() {
            return (this.dimensions * 100) + 'px';
        }
    }       
}



