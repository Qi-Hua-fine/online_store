const mysql = require('mysql');

// Create a connection to the database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

exports.handler = async (event, context) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM products', (error, results) => {
            if (error) {
                console.error(error);
                resolve({
                    statusCode: 500,
                    body: JSON.stringify({ message: 'Internal Server Error' })
                });
            } else {
                let productsHtml = '';
                results.forEach(product => {
                    productsHtml += `
            <div class="product">
              <h2>${product.name}</h2>
              <p>${product.description}</p>
              <p>Price: $${product.price.toFixed(2)}</p>
              <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Add to Cart</button>
            </div>
          `;
                });
                resolve({
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'text/html'
                    },
                    body: productsHtml
                });
            }
        });
    });
};



