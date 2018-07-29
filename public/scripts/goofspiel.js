$(document).ready(function () {
    // thisUser: username as a String
    // gameID: game ID as a string

    // Canvas dimensions
    var canvas = document.getElementById("Goofspiel");
    canvas.width = 1600;
    canvas.height = 900;
    canvasTop = canvas.offsetTop;
    canvasLeft = canvas.offsetLeft;
    var ctx = canvas.getContext("2d");

    class Card {
        // static cards = [];
        static getAllCards() {
            if (this._cards === undefined)
                this.initializeCards();
            return this._cards
        };

        static initializeCards() {
            var result = [];
            ['Spade', 'Heart', 'Club', 'Diamond'].forEach(mySuit => {
                ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'].forEach((myName, index) => {
                    result.push(new Card(myName, mySuit, index + 1))
                })
            });
            this._cards = result;
        };
        static fromObjects(collection) { collection.map(each => this.allCards().find(e => e.name === each.name && e.suit === each.suit)) };
        static allCards() { return this._cards };
        static getSuit(aSuit) { return this.getAllCards().filter(each => each.suit === aSuit) };
        static getHearts() { return this.getSuit("Heart") };
        static getSpades() { return this.getSuit("Spade") };
        static getClubs() { return this.getSuit("Club") };
        static getDiamonds() { return this.getSuit("Diamond") };
        static getCardFor(name, suit) { return this.allCards().find(each => each.name === name && each.suit === suit) }
        isSameAs(card) { return (card.name === this.name && card.suit === this.suit) }
        constructor(name, suit, number) {
            this.name = name;
            this.suit = suit;
            this.value = number;
        };
    }

    // Card specifications
    var cardNames = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];
    var cardValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    var playingCard = {
        width: 80,
        height: 120,
        backColor: "#CB4335",
        frontColor: "#FFFFFF"
    }

    // Properties extracted from gamestate
    var player1 = "";
    var player2 = "";
    var playerSuit = "Diamond";
    var opponentSuit = "Club";
    var prizeSuit = "Heart";
    var myHand = Card.getSuit(playerSuit);
    var theirHand = Card.getSuit(opponentSuit);
    var prizeDeck = Card.getSuit(prizeSuit);
    console.log("My hand when the game starts:", myHand);
    var turnHistory = [];
    var turn = 0;

    // Play area cards
    var prizeCard = {};
    var playerPlayed = {};
    var opponentPlayed = {};

    var myTurnHistory = [];
    var opponentTurnHistory = [];
    // Cards in hand
    // card.top and card.left keys are for collision detection
    var playerHandCollision = [];
    var opponentHand = [];

    // polling server for new gamestate

    function poll() {
        $.ajax({
            method: "GET",
            url: "/gs/" + (gameID).toString()
        }).done((gameState) => {
            // {turnHistory: [], player1: string, player2: string}
            if (turn !== turnHistory.length) {
                clearInterval(intervalID);
                setTimeout(doPoll, 5000);
                turn = turnHistory.length;
            }
            console.log(gameState);
            player1 = gameState.player1;
            player2 = gameState.player2;
            turnHistory = gameState.turnHistory;
            
            prizeCard = getPrizeCard(turnHistory);
            playerNum = thePlayer(thisUser);
            myTurnHistory = turnHistory.map(each => each[thePlayer(thisUser)]).filter(isDefined => isDefined !== undefined);
            opponentTurnHistory = turnHistory.map(each => each[otherPlayer(thisUser)]).filter(isDefined => isDefined !== undefined);
            prizeDeckHistory = turnHistory.map(each => each['prizeCard']).filter(isDefined => isDefined !== undefined);
            myHand = myHand.filter(card => !myTurnHistory.find(played => card.isSameAs(played)));
            theirHand = 13 - opponentTurnHistory.length;
            prizeDeck = 13 - prizeDeckHistory.length;
            playerPlayed = getPlayerPlayed(turnHistory);
            opponentPlayed = getOpponentPlayed(turnHistory);
        })
    }
    
    var intervalID;

    function doPoll() {
        intervalID = setInterval(poll, 1000);
    }

    doPoll();    

    // Turnstates - 
    // 0: Initial setup of the game, only rendered once in the beginning
    // 1: Prize card shown on play area, player allowed to make a move
    // 2: Player made a move, opponent has not. Waiting...
    // 3: Opponent made a move, player has not. Player allowed to make a move
    // 4: Both players made their move. Resolution phase: No input allowed. Scores shown
    // 5: Winning player places all 3 cards on his side of the table
    // 6: Player Won
    // 7: Player Lost
    // 8: Tie

    $("canvas").on('click', function (event) {
        var mouseX = event.pageX - canvasLeft;
        var mouseY = event.pageY - canvasTop;

        playerHandCollision.forEach(function (card) {

            if (// mouseclick collision detection
                ((mouseX > card.left && mouseX < card.left + playingCard.width)
                    && (mouseY > card.top && mouseY < card.top + playingCard.height))
                && // move validation, does not pass if move is illegal
                !playerPlayed) {
                var myData = {};
                myData.gameid = gameID;
                var cardData = {};
                cardData.name = card.name;
                cardData.suit = playerSuit;
                myData.card = cardData;
                playerPlayed = cardData;
                console.log(myData);
                //alert(`You clicked your ${cardNames[card.value - 1]}`);
                // if (prizeCard and otherPlayer.card in turnhistory[turn] is filled when i do this, play face up)
                $.ajax({
                    method: "POST",
                    url: "/gs/",
                    data: myData
                }).done(function () {
                    console.log(`Played card:, ${myData.card.name}, suit: ${myData.card.suit}`)
                })
            }
        })
    })

    // Renders a card on canvas. Specify inner color and value if card is face up
    function renderPlayingCard(xpos, ypos, innerColor, name) {
        
        var img = document.createElement("img");
img.src = "../images/2C.svg";

img.onload = function(){ pdf.drawImage(img, x-pos, y-pos };
        // ctx.drawImage(document.getElementById("SVG"), x-pos, y-pos, playingCard.width, playingCard.height)
        var img = new Image;
        img.onload = function(){ ctx.drawImage(img,0,0); };
        img.src = "http://www.w3.org/TR/SVG11/images/painting/fillrule-evenodd.svg";
        // ctx.beginPath();
        // ctx.rect(xpos, ypos, playingCard.width, playingCard.height);
        // ctx.fillStyle = playingCard.backColor;
        // ctx.fill();
        // ctx.stroke();
        // ctx.closePath();

        // if (innerColor) {
        //     ctx.beginPath();
        //     ctx.rect(xpos + 10, ypos + 10, playingCard.width - 20, playingCard.height - 20);
        //     ctx.fillStyle = playingCard.frontColor;
        //     ctx.fill();
        //     ctx.stroke();
        //     ctx.closePath;

        //     ctx.beginPath();
        //     ctx.font = "16px Arial";
        //     ctx.fillStyle = "#000000";
        //     ctx.fillText(name, xpos + 20, ypos + 30);
        //     ctx.closePath();
        // }
    }

    // Accepts an array of cards representing player cards and renders them in a row
    function renderPlayerHand(myCards) {
        var offsetX = 20;
        var y = canvas.height - playingCard.height - 20;
        playerHandCollision = []
        for (var i = 0; i < cardNames.length; i++) {
            for (var j = 0; j < myCards.length; j++) {
                if (cardNames[i] === myCards[j].name) {
                    var cardObj = {};
                    cardObj.name = cardInitial(cardNames[i]);
                    cardObj.value = cardValues[i];
                    cardObj.left = offsetX;
                    cardObj.top = y;
                    playerHandCollision.push(cardObj);
                    renderPlayingCard(cardObj.left, cardObj.top, playingCard.frontColor, cardObj.name);
                    offsetX = offsetX + playingCard.width + 5;
                }
            }
        }
    }

    // Accepts a number and renders that number of cards face down in a row
    function renderOpponentHand(n) {
        var offSetX = 20;
        var y = 20;
        opponentHand = [];
        for (var i = 0; i < n; i++) {
            var cardObj = {};
            cardObj.left = offSetX;
            cardObj.top = y;
            opponentHand.push(cardObj);
            renderPlayingCard(cardObj.left, cardObj.top);
            offSetX = offSetX + playingCard.width + 5;
        }
    }


    // TODO: accepts a number and renders that number of cards face down stacked up
    function renderPrizeDeck(n) {
        var pixelsFromRightEdge = 30;
        var offset = pixelsFromRightEdge / 15;
        for (var i = 0; i < n; i++) {
            renderPlayingCard((canvas.width - playingCard.width - pixelsFromRightEdge - offset), canvas.height / 2 - offset);
            offset = offset + pixelsFromRightEdge / 15;
        }
    }

    // Accepts a card and renders it on the center of the screen
    function renderPrizeCard(card) {
        if (card) {
            var cardName = cardInitial(card.name);
            renderPlayingCard(canvas.width / 2, canvas.height / 2, playingCard.frontColor, cardName);
        }
    }

    // Accepts a card object and renders it to the left and offset down to a card on the center of the screen face up
    function renderPlayerPlayed(card) {
        if (card) {
            var offsetX = 20;
            var offsetY = 20;
            var cardName = cardInitial(card.name);
            renderPlayingCard(canvas.width / 2 - playingCard.width - offsetX, canvas.height / 2 + offsetY, playingCard.frontColor, cardName);
        }
    }

    // Accepts a card object and renders it to the right and offset up to a card on the center of the screen face down
    function renderOpponentPlayed(card) {
        if (card) {
            var offsetX = 20;
            var offsetY = 20;
            var cardName = cardInitial(card.name);
            if (playerPlayed) {
                renderPlayingCard(canvas.width / 2 + playingCard.width + offsetX, canvas.height / 2 - offsetY, playingCard.frontColor, cardName);
            } else {
                //play animation here
                renderPlayingCard(canvas.width / 2 + playingCard.width + offsetX, canvas.height / 2 - offsetY);
            }
        }
    }

    // TODO: function which accepts opponent card object and renders it on the center of the screen face up

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // TODO: render scoreboard
        renderPlayerHand(myHand);//gameState.turnHistory, thisPlayer));
        renderOpponentHand(theirHand);
        renderPrizeDeck(prizeDeck);
        // TODO: render player winnings pile
        // TODO: render opponent winnings pile
        renderPrizeCard(prizeCard); //gamestate.turnHistory[0].prizeCard
        //renderPrizePile(gameState.prizePile);
        renderPlayerPlayed(playerPlayed);
        renderOpponentPlayed(opponentPlayed);

        // animate cards moving to the winning side's winnings pile
        // CHECK IF PLAYER WON/LOST, change to state 6/7

        // TODO: highlight player green in scoreboard
        // and highlight opponent red
        // TODO: show big text: "YOU WON"

        // TODO: highlight player red in scoreboard
        // and highlight opponent green
        // TODO: show big text: "YOU LOST"

        requestAnimationFrame(draw);
    }

    function thePlayer(user) {
        if (!thisUser) {
            return undefined;
        }
        if (user === player1) {
            return "player1";
        } else if (user === player2) {
            return "player2";
        } else {
            return underfined
        }
    }

    function otherPlayer(user) {
        if (!thisUser) {
            return undefined;
        }
        if (user === player1) {
            return "player2";
        } else if (user === player2) {
            return "player1";
        } else {
            return undefined;
        }
    }

    function cardInitial(name) {
        var result = name;
        if (name === "Ace") {
            result = "A";
        } else if (name === "Jack") {
            result = "J";
        } else if (name === "Queen") {
            result = "Q";
        } else if (name === "King") {
            result = "K";
        }
        return result;
    }

    function cardName(initial) {
        result = initial.toString();
        if ((initial) === "A") {
            result = "Ace";
        } else if ((initial) === "J") {
            result = "Jack";
        } else if ((initial) === "Q") {
            result = "Queen";
        } else if ((initial) === "K") {
            result = "King";
        }
        return result;
    }
    // uses gameState's turnHistory array to create an array of cards with properties required for collision detection
    function getHand(history) {

    }

    function getPlayerPlayed(history) {
        var index = history.length - 1;
        if (thisUser === player1) {
            return history[index].player1;
        } else if (thisUser === player2) {
            return history[index].player2;
        }
        return "u wot m8";
    }

    function getOpponentPlayed(history) {
        var index = history.length - 1;
        if (thisUser !== player1) {
            return history[index].player1;
        } else if (thisUser !== player2) {
            return history[index].player2;
        }
        return "u wot m8";
    }

    function getPrizeCard(history) {
        var index = history.length - 1;
        return history[index].prizeCard;
    }

    //TODO: function to produce array of strings representing player card names from gamestate

    //TODO: function to produce a number representing number of opponent cards from gamestate

    draw();
})