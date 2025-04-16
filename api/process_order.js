const mysql = require('mysql');

// Create a connection to the database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

exports.handler = async (event, context) => {
    const data = JSON.parse(event.body);

    return new Promise((resolve, reject) => {
        db.beginTransaction(err => {
            if (err) {
                console.error(err);
                resolve({
                    statusCode: 500,
                    body: JSON.stringify({ message: 'Internal Server Error' })
                });
            }

            const insertOrderQuery = 'INSERT INTO orders (customer_name, customer_email, customer_address) VALUES (?, ?, ?)';
            db.query(insertOrderQuery, [data.name, data.email, data.address], (err, result) => {
                if (err) {
                    console.error(err);
                    return db.rollback(() => {
                        resolve({
                            statusCode: 500,
                            body: JSON.stringify({ message: 'Internal Server Error' })
                        });
                    });
                }

                const orderId = result.insertId;
                const cartItems = JSON.parse(decodeURIComponent(data.cart));

                const insertOrderDetailsPromises = cartItems.map(item => {
                    return new Promise((resolve, reject) => {
                        const insertOrderDetailQuery = 'INSERT INTO order_details (order_id, product_id, quantity, price) VALUES (?, ?, 1, ?)';
                        db.query(insertOrderDetailQuery, [orderId, item.id, item.price], err => {
                            if (err) {
                                console.error(err);
                                return db.rollback(() => {
                                    reject(err);
                                });
                            }
                            resolve();
                        });
                    });
                });

                Promise.all(insertOrderDetailsPromises)
                    .then(() => {
                        db.commit(err => {
                            if (err) {
                                console.error(err);
                                return db.rollback(() => {
                                    resolve({
                                        statusCode: 500,
                                        body: JSON.stringify({ message: 'Internal Server Error' })
                                    });
                                });
                            }

                            // Clear cart cookie
                            resolve({
                                statusCode: 200,
                                headers: {
                                    'Set-Cookie': 'cart=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;'
                                },
                                body: JSON.stringify({ message: 'Order processed successfully.' })
                            });
                        });
                    })
                    .catch(err => {
                        console.error(err);
                        db.rollback(() => {
                            resolve({
                                statusCode: 500,
                                body: JSON.stringify({ message: 'Internal Server Error' })
                            });
                        });
                    });
            });
        });
    });
};



