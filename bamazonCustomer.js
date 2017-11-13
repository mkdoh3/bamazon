const connection = require("./src/sql-connection");

const mySQL = require('mysql');

const inquirer = require('inquirer');

const columnify = require('columnify')

//to be used from inquirer validation
let idNumbers = [];
let descriptors = ["Yummy", "Delicious", "Mouth Watering", "Delectable"]
let shoppingCart = [];



connection.connect(function (err) {
    if (err) throw err;
    process.stdout.write('\033c')
    displayAllProducts()
});


function displayAllProducts() {
    console.log("\n Welcome to Bamazon! Like Amazon, but with more B!\n Come on down n' getcha some!!\n");
    connection.query("SELECT item_id, product_name, price FROM products", function (err, res) {
        if (err) throw err;
        let columns = [];
        console.log("######################### FOR SALE #############################\n");
        res.forEach(function (e) {
            columns.unshift({
                "Inventory ID": e.item_id,
                "product name": e.product_name,
                "low-low Price": e.price
            });
            idNumbers.push(e.item_id.toString())
        })
        console.log(columnify(columns, {
            minWidth: 20
        }))
        console.log("\n################################################################")
        idSelect();
    })
};


function idSelect() {
    console.log("\n\nEnter a product id to start buyin'!")
    inquirer.prompt([
        {
            message: "Product id: ",
            type: 'input',
            name: 'id',
            validate: function (id) {
                if (idNumbers.indexOf(id) >= 0) {
                    return true;
                }
                return 'Please enter a valid product id';
            }
        },
    ]).then(function (res) {
        displaySelectedProduct(res.id)
    })
}



function displaySelectedProduct(id) {
    process.stdout.write('\033c')
    connection.query("SELECT product_name, price FROM products WHERE item_id=" + id, function (err, res) {
        if (err) throw err;
        let adjective = descriptors[Math.floor(Math.random() * descriptors.length)]
        console.log("\n", `${adjective} ${res[0].product_name}! Those'll run ya ${res[0].price} each. What a steal!`)
        quantitySelect(res[0].product_name, res[0].price);
    });

}


function quantitySelect(name, price) {
    inquirer.prompt([
        {
            message: "\nHow many can I put ya down for?\n",
            type: 'input',
            name: 'quantity',
            validate: function (quantity) {
                if (typeof (parseInt(quantity)) === 'number') {
                    return true;
                } else {
                    return 'Please enter a valid, whole-number quantity'
                }
            }
        },
        {
            message: "\nAdd to Cart?\n",
            type: "list",
            choices: ["Add", "Cancel"],
            name: 'choice'
        }
    ]).then(function (res) {
        if (res.choice === 'Cancel') {
            process.stdout.write('\033c');
            displayAllProducts();
        }
        shoppingCart.push({
            'product_name': name,
            'price': price,
            'quantity': res.quantity
        })
        console.log(shoppingCart)
    })
}









//
//
//   {
//            message: "Quantity: ",
//            type: "input",
//            name: 'quantity'
//        }
//

//function createProduct() {
//    console.log("Inserting a new product...\n");
//    let value = Math.floor(1000 + Math.random() * 9000);
//    connection.query(
//        "INSERT INTO products SET ?", {
//            item_id: value,
//            product_name: "chicken wings",
//            department_name: "meats",
//            price: .29,
//            stock_quantity: 1500
//        },
//        function (err, res) {
//            if (err) console.log(err)
//            console.log(res);
//            // Call updateProduct AFTER the INSERT completes
//        }
//    );
//}
