const mineflayer = require('mineflayer')

class MyBot {
    constructor(options) {
        this.bot = mineflayer.createBot(options)
        this.brain = []
        this.name = 'ebik'
        this.i = 1
        //this.bot.on('physicTick', this.lookAtNearestPlayer())
    }

    study() {
        console.log(this.i + " studies.");
    }

    fillBrain(rows, cols, value, options) {
        this.brain = new Array(rows).fill(0).map(() => new Array(cols).fill(value))
        if (value == 0) {
            console.log(`Greetings! I am the stupid bot with the username ${options.username}`)
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

}

const options1 = {
    host: 'localhost',
    port: '50600',
    username: 'Biba',
}

const bot1 = new MyBot(options1)
bot1.fillBrain(5, 5, 0, options1)
bot1.bot.on('physicTick', () => bot1.lookAtNearestPlayer(bot1))