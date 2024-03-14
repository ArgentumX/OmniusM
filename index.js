const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')
const { Vec3 } = require('vec3');
const repl = require('repl');
const { SlowBuffer } = require('buffer');
const { captureRejectionSymbol } = require('events');

class MyBot {
    constructor(options, n) {
        this.bot = mineflayer.createBot(options)
        this.brain = []
        this.name = options.username
        this.n = n
        this.timer = 0
        this.fillBrain(n)
        this.itemsCollected = 0
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
                    arr = arr.map((num, index) => num + this.brain[i][j][index])
                }
            }
        }
        let max = Math.max.apply(null, arr)
        if (max === 0){
            return
        }
        let maxIndex = arr.indexOf(max)
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

    mutate(self, chance, range){
        for (let i = 0; i < self.n; i++){
            for (let j = 0; j < self.n; j++){
                if (Math.random() < chance){
                    let sgn = Math.random() <= 0.5 ? 1 : -1;
                    self.brain[i][j] += Math.round(Math.random() * sgn * range);
                }
            }
        }
    }

    goTo(myBot, x, y, z){
        const defaultMove = new Movements(myBot.bot)
        myBot.bot.pathfinder.setMovements(defaultMove)
        myBot.bot.pathfinder.setGoal(new GoalNear(x, y, z, 0.2))
    }
}

function isInNeuronZone(x1, x2, z1, z2, y1, y2, n){
    return (Math.floor(y1) === Math.floor(y2)) && (Math.max(Math.abs(Math.floor(x2) - Math.floor(x1)), Math.abs(Math.floor(z2)-Math.floor(z1))) <= Math.floor(n / 2))
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createOmniBot(name){
    var options = {
        host: '5.42.211.9',
        port: '25565',
        username: name,
    }
    let omniBot = new MyBot(options, 11)
    omniBot.bot.once('spawn', () => {
        omniBot.bot.loadPlugin(pathfinder);
        omniBot.bot.on('physicsTick', () => omniBot.chooseDirection(omniBot))
    })
    omniBot.bot.on('playerCollect', (collector, collected) => {
        if(collector.type === 'player' && collected.type === 'object' && collector.username == bot.name) {
            console.log("wtf")
            omniBot.itemsCollected += 1
        }
    });
    return omniBot
}


async function startSimulation(botNumber){
    for (let i = 0; i < botNumber; i++){
        let omniBot = createOmniBot("Omnibot"+i)
        botList.push(omniBot)
        await sleep(5000)
    }
    simulationLoop()
}

async function simulationLoop(){
    

    let i = 0
    while (true){
        console.log("Starting new simulation cycle " + i)
        await sleep(10000)
        botList = botList.sort((a, b) => {
            if (a.itemsCollected < b.itemsCollected){
                return 1
            }
            else if (a.itemsCollected > b.itemsCollected){
                return -1
            }
            return 0
        })

        let s = ''
        for (let j = 0; j < BOT_NUMBER; j++){
            s += botList[j].name + ":" + botList[j].itemsCollected + ', ';
        }
        console.log(s)
        i += 1
    }
}

var botList = []
const BOT_NUMBER = 3
const r = repl.start('$ ')
r.ignoreUndefined = true
r.context.blist = botList

startSimulation(BOT_NUMBER);


//bot1.bot.once('spawn', () => {
    //const r = repl.start('$ ')
    //r.ignoreUndefined = true
    //r.context.bot = bot1
    //r.context.mutate = bot1.mutate

    //r.on('exit', () => {
        //bot1.bot.end()
      //})

    //mineflayerViewer(bot1.bot, { port: 1701, firstPerson: false })
    //bot1.printBrain()
    //bot1.bot.loadPlugin(pathfinder);
    //bot1.bot.on('physicsTick', () => bot1.chooseDirection(bot1))
//})
// bot1.bot.on('itemDrop', () => console.log(bot1.getItemsPositioning(bot1)))
