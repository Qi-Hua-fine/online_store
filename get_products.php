<?php
$host = 'localhost';
$dbname = 'online_store';
$username = 'root';
$password = 'fangkeshen123'; // 替换为你设置的 MySQL root 密码

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $stmt = $pdo->query('SELECT * FROM products');
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($products as $product) {
        echo '<div class="product">';
        echo '<h2>' . htmlspecialchars($product['name']) . '</h2>';
        echo '<p>' . htmlspecialchars($product['description']) . '</p>';
        echo '<p>Price: $' . number_format($product['price'], 2) . '</p>';
        echo '<button onclick="addToCart(' . $product['id'] . ', \'' . addslashes($product['name']) . '\', ' . $product['price'] . ')">Add to Cart</button>';
        echo '</div>';
    }
} catch (PDOException $e) {
    die('Database connection failed: ' . $e->getMessage());
}
?>
