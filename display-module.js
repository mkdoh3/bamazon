function Display(adjective, stockCount, name, price) {
    this.adjective = adjective;
    this.stockCount = stockCount;
    this.name = name;
    this.price = price;
    this.log = function () {
        console.log("\n", `${this.adjective} ${this.name}! Those'll run ya ${this.price} each. What a steal!`)
    }
}


module.exports = Display;
