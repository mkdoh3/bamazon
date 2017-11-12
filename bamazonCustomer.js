const connection = require("./src/sql-connection");
const mySQL = require('mysql');
const inquirer = require('inquirer');
const columnify = require('columnify')
connection.connect(function (err) {
    if (err) throw err;
    //    console.log(`connected as id: ${connection.threadId}`)
    process.stdout.write('\033c')
    displayProducts();
});

function displayProducts() {
    console.log("\n Welcome to Bamazon! Like Amazon, but with more B!\n Come on down n' getcha some!!\n");
    connection.query("SELECT item_id, product_name, price FROM products", function (err, res) {
        if (err) throw err;
        let columns = [];
        console.log("######################### FOR SALE #############################\n");
        res.forEach(function (e) {
            columns.unshift({
                "Inventory ID": e.item_id,
                "Model": e.product_name,
                "Price": e.price
            });
        })
        console.log(columnify(columns, {
            minWidth: 20
        }))
        console.log("\n################################################################")
        buySome();
    })
};

function buySome() {
    console.log("\n\nEnter a product id to start buyin'!")
    inquirer.prompt([
        {
            message: "Product id: ",
            type: 'input',
            name: 'id'
        },
        {
            message: "Quantity: ",
            type: "input",
            name: 'quantity'
        }
    ]).then(() => console.log('thanks'))
}