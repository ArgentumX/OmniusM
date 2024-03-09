const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')
const { Vec3 } = require('vec3');

class MyBot {
    constructor(options, n) {
        this.bot = mineflayer.createBot(options)
        this.brain = []
        this.name = options.username
        this.n = n
        this.timer = 0
        this.fillBrain(n)
        //this.bot.on('physicTick', this.lookAtNearestPlayer())
    }
    
    fillBrain(n) {
        this.brain = this.generateBrainTypeMatrix(n)
        this.fillBrainWithRandom(this.brain, n)
    }

    generateBrainTypeMatrix(n){
        return new Array(n).fill(0).map(() => new Array(n).fill(0).map(() => new Array(4).fill(0)))
    }
    generatePositiongTypeMatrix(n){
        return new Array(n).fill(0).map(() => new Array(n).fill(0))
    }

    fillBrainWithRandom(brain, n) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                brain[i][j][0] = Math.random() < 0.7 ? 0 : 1
                brain[i][j][1] = Math.random() < 0.7 ? 0 : 1
                brain[i][j][2] = Math.random() < 0.7 ? 0 : 1
                brain[i][j][3] = Math.random() < 0.7 ? 0 : 1
            }
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
        let itemPositiong = this.generatePositiongTypeMatrix(myBot.n)
        for (var key in myBot.bot.entities) {
            if (myBot.bot.entities.hasOwnProperty(key)) {
                var entity = myBot.bot.entities[key]
                if (entity.name === "item" && isInNeuronZone(entity.position.x, myBot.bot.entity.position.x, entity.position.z, myBot.bot.entity.position.z, entity.position.y, myBot.bot.entity.position.y, myBot.n)) {
                    let [i, j] = this.getBrainMatrixIndexes(myBot.bot.entity.position.x, myBot.bot.entity.position.z, entity.position.x, entity.position.z, myBot.n)
                    itemPositiong[i][j] = 1
                }
            }
        }
        return itemPositiong
    }

    getBrainMatrixIndexes(xPosPlayer, zPosPlayer, xPosItem, zPosItem, n) {
        return [Math.floor(n / 2) + Math.floor(xPosItem) - Math.floor(xPosPlayer), Math.floor(n / 2) + Math.floor(zPosItem) - Math.floor(zPosPlayer)]
    }

    chooseDirection(myBot){
        if (myBot.timer < 2){
            myBot.timer++
            return
        }
        myBot.timer = 0

        let itemsPositioning = this.getItemsPositioning(myBot)
        // 0 - north, 1 - east, 2 - south, 3 - west
        let arr = new Array(4).fill(0)
        for (let i = 0; i < myBot.n; i++){
            for (let j = 0; j < myBot.n; j++){
                if (itemsPositioning[i][j] !== 0 ){
                    console.log(itemsPositioning[i][j])
                    arr = arr.map((num, index) => num + this.brain[i][j][index])
                }
            }
        }
        let maxIndex = arr.indexOf(Math.max.apply(null, arr))
        let targetX = Math.floor(myBot.bot.entity.position.x)
        let targetY = Math.floor(myBot.bot.entity.position.y)
        let targetZ = Math.floor(myBot.bot.entity.position.z)
        switch (maxIndex){
            case 0:
                targetZ -= 1;
                break;
            case 1:
                targetX += 1
                break;
            case 2:
                targetZ += 1
                break;
            case 3:
                targetX -= 1
                break;
        }
        this.goTo(myBot, targetX, targetY, targetZ)

    }

    goTo(myBot, x, y, z){
        console.log("goto")
        const defaultMove = new Movements(myBot.bot)
        bot1.bot.pathfinder.setMovements(defaultMove)
        myBot.bot.pathfinder.setGoal(new GoalNear(x, y, z, 0.2))
    }
}

function isInNeuronZone(x1, x2, z1, z2, y1, y2, n){
    return (Math.floor(y1) === Math.floor(y2)) && (Math.max(Math.abs(Math.floor(x2) - Math.floor(x1)), Math.abs(Math.floor(z2)-Math.floor(z1))) <= Math.floor(n / 2))
}

// i, j - neuron index
function getBotDirection(i, j, n){
    if (i - j <= 0){ // up
        if (n - i + 1 <= j) {
            return 0
       }
       else {
            return 1
       }
    }
    else {
        if (n - i + 1 <= j) {
            return 4
       }
       else {
            return 3
       }
    }
}


const options1 = {
    host: '5.42.211.9',
    port: '25565',
    username: 'Biba',
}
var bot1 = new MyBot(options1, 11)
bot1.bot.once('spawn', () => {
    mineflayerViewer(bot1.bot, { port: 1701, firstPerson: false })
    bot1.printBrain()
    bot1.bot.loadPlugin(pathfinder);
    bot1.bot.on('physicsTick', () => bot1.chooseDirection(bot1))
})
// bot1.bot.on('itemDrop', () => console.log(bot1.getItemsPositioning(bot1)))
