const connection = require("./src/sql-connection");

const Display = require('./display-module');

const mySQL = require('mysql');

const inquirer = require('inquirer');

const columnify = require('columnify')

const TextAnimation = require("text-animation");

const keypress = require('keypress');

//keypress(process.stdin);

const descriptors = ["Yummy", "Delicious", "Delectable", "Tasty", 'That good good']

let shoppingCart = [];



//////// TO-DO //////////////////////

//  get hotkeys working.. maybe. or figure out a better menu design. main menu, back, exit etc..
//  increase original quantity instead of adding duplicate items to the cart
//  when adding duplicate items, what is the best way to verify stock availability??
//  handle empty cart/checkout with empty cart..
//  figure out best place to put database update after checkout..
//  

/////////////////////////////////



connection.connect(function (err) {
    if (err) throw err;
    process.stdout.write('\033c')
    displayAllProducts()
});



//hotkeys are kinda working.. but lots of bugs.. hard to control for key mashing/hitting keys at the wrong time

//process.stdin.on('keypress', function (ch, key) {
//    if (key && key.name === 'escape') {
//        process.stdout.write("\033c");
//        process.exit();
//    }
//});
//
//process.stdin.on('keypress', function (ch, key) {
//    if (key && key.name === 'c') {
//        process.stdin.pause();
//        process.stdout.write("\033c");
//        if (shoppingCart.length === 0) {
//            console.log("\n\n Cart Empty.. duh.")
//            setTimeout(() => {
//                process.stdin.resume();
//                displayAllProducts()
//            }, 2000)
//        } else {
//            viewCart();
//        }
//    }
//});







//seems like it would make way more sense to display stock quantities here.. but for the sake of direction following, It's gonna be left out for now
function displayAllProducts() {
    console.log("\n Welcome to Bamazon! Like Amazon, but with more B!\n Come on down n' getcha some!!\n");
    connection.query("SELECT item_id, product_name, price FROM products", function (err, res) {
        if (err) throw err;
        //to be used from inquirer validation
        let idNumbers = [];
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
        idSelect(idNumbers);
        //        console.log("\n\n\n\n press 'esc' to exit, 'c' to see cart")
    })
};

function idSelect(validIds) {
    console.log("\n\nEnter a product id to start buyin'!")
    inquirer.prompt([
        {
            message: "Product id: ",
            type: 'input',
            name: 'id',
            validate: function (id) {
                if (validIds.indexOf(id) >= 0) {
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
    connection.query("SELECT product_name, price, stock_quantity FROM products WHERE item_id=" + id, function (err, res) {
        if (err) throw err;
        let adjective = descriptors[Math.floor(Math.random() * descriptors.length)]
        //completely unnecessary constructor.. just practicing!
        let display = new Display(adjective, res[0].stock_quantity, res[0].product_name, res[0].price)
        display.log();
        quantitySelect(display.name, display.price, display.stockCount);
    });
}


function quantitySelect(name, price, stockCount) {
    let questions = [
        {
            message: "\nHow many can I put ya down for?\n",
            type: 'input',
            name: 'quantity',
            validate: function (quantity) {
                if (typeof (parseInt(quantity)) === 'number' && parseInt(quantity) > 0) {
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
    ];
    inquirer.prompt(questions).then(function (res) {
        if (res.choice === 'Cancel') {
            process.stdout.write('\033c');
            displayAllProducts();
        } else if (stockCount === 0) {
            console.log('Out of Stock! Sorry!')
            displayAllProducts();
        } else if (stockCount < res.quantity) {
            console.log('Insufficient stock :(')
            quantitySelect(name, price, stockCount)
        } else {
            let total = (price * res.quantity).toFixed(2);
            shoppingCart.push({
                'product_name': name,
                'price': price,
                'quantity': res.quantity,
                'total': total
            })
            console.log('\n', `${res.quantity} ${name}(s) added to cart.`)
            selectMenu()
        }

    })
};

function selectMenu() {
    inquirer.prompt([
        {
            message: '\nWhat now?',
            type: 'list',
            choices: ['SHOP MOAR!', 'View Cart'],
            name: 'choice'
        }
    ]).then(function (res) {
        process.stdout.write('\033c');
        if (res.choice === 'SHOP MOAR!') {
            displayAllProducts();
        } else {
            viewCart();
        }
    })
};



function viewCart() {
    let grandTotal = 0;
    let columns = [];
    if (shoppingCart.length === 0) {
        console.log("\n\n            Cart Empty.. duh.")
    } else {

        shoppingCart.forEach(function (e) {

            grandTotal += parseFloat(e.total)

            columns.unshift({
                "Product": e.product_name,
                "Price": e.price,
                "Quantity": e.quantity,
                "Total": e.total
            });
        });
    }

    console.log(columnify(columns, {
        minWidth: 15
    }));
    grandTotal = grandTotal.toFixed(2)
    console.log("\n", `                                 Grand Total: $${grandTotal}`)
    cartMenu(grandTotal);
}


function cartMenu(grandTotal) {
    inquirer.prompt([
        {
            message: '\nWhat now?',
            type: 'list',
            choices: ['Check Out', 'MOAR SHOPPINGS!'],
            name: 'choice'
        }
    ]).then(function (res) {
        process.stdout.write('\033c');
        if (res.choice === 'MOAR SHOPPINGS!') {
            displayAllProducts();
        } else {
            process.stdout.write('\033c');
            funTimeAnimation(5, grandTotal)
        }
    })
}



//this didnt end up looking nearly as cool as I thought it might.. but I wanted to doing something goofy while messing around with recursion..

function funTimeAnimation(x, grandTotal) {
    if (x < 0) {
        return checkOut(grandTotal);
    }
    let dollars = [`$      $`, `        $        `, `        $        $           $       `, `        $       `, `               $`, '$'];
    let dollar = dollars[Math.floor(Math.random() * dollars.length)]
    TextAnimation({
        text: dollar,
        animation: "top-bottom",
        delay: .5
    }, function (err) {
        if (err) {
            throw err
        }
        x--
        funTimeAnimation(x, grandTotal)

    })
}


function checkOut(grandTotal) {
    process.stdout.write('\033c');
    console.log("\n\n\n     Thanks!\n", `   ${grandTotal} life hours have been subtracted from your avaiable time to live!!`, "\n   Come again!");
    setTimeout(() => {
        process.stdout.write('\033c');
        connection.end();
    }, 6000);
}






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
