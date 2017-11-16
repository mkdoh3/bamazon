//completely unnecessary constructor.. just practicing!


function Display(adjective, stockCount, name, price, id) {
    this.adjective = adjective;
    this.stockCount = stockCount;
    this.name = name;
    this.price = price;
    this.id = id;
    this.log = function () {
        console.log("\n", `${this.adjective} ${this.name}! Those'll run ya ${this.price} each. What a steal!`)
    }
}


module.exports = Display;
