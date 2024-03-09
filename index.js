const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer

class MyBot {
    constructor(options) {
        this.bot = mineflayer.createBot(options)
        this.brain = []
        this.name = options.username
        this.i = 1
        //this.bot.on('physicTick', this.lookAtNearestPlayer())
    }

    study() {
        console.log(this.i + " studies.");
    }

    fillBrain(rows, cols, value) {
        this.brain = new Array(rows).fill(0).map(() => new Array(cols).fill(value))
        if (value == 0) {
            console.log(`Greetings! I am the genius bot with the username ${this.username}`)
        }
    }

    printBrain() {
        console.log(this.brain)
    }

    lookAtNearestPlayer(myBot) {
        myBot.playerFilter = (entity) => entity.type === 'player'
        const playerEntity = myBot.bot.nearestEntity(myBot.playerFilter)
    
        if (!playerEntity) return
    
        myBot.bot.lookAt(playerEntity.position.offset(0, playerEntity.height, 0))
    }

    getItemsPositioning(myBot){
        for (var key in myBot.bot.entities) {
            if (myBot.bot.entities.hasOwnProperty(key)) {
                var entity = myBot.bot.entities[key]
                if (entity.name === "item" && getDistance(entity.position.x, myBot.bot.entity.position.x, entity.position.z, myBot.bot.entity.position.z) <= 4) {
                    console.log(Math.round(entity.position.x), Math.round(entity.position.z))
                    let i, j = this.getBrainMatrixIndexes()
                    console.log(i)
                }
            }
        }
    }

    getBrainMatrixIndexes(){
        return (2, 2)
    }

    chooseDirection(){
        
    }
}

function getDistance(x1, x2, z1, z2){
    return Math.hypot(x2-x1, z2-z1)
}

const options1 = {
    host: '5.42.211.9',
    port: '25565',
    username: 'Biba',
}

var bot1 = new MyBot(options1)
bot1.fillBrain(5, 5, 0)
bot1.printBrain()
bot1.bot.once('spawn', () => {
    mineflayerViewer(bot1.bot, { port: 1701, firstPerson: false })
})
bot1.bot.on('itemDrop', () => bot1.getItemsPositioning(bot1))
bot1.bot.on('physicTick', () => bot1.lookAtNearestPlayer(bot1))
