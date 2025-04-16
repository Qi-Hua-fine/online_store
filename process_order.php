<?php
$host = 'localhost';
$dbname = 'online_store';
$username = 'root';
$password = 'fangkeshen123'; // 替换为你设置的 MySQL root 密码

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $name = $_POST['name'];
        $email = $_POST['email'];
        $address = $_POST['address'];

        // 获取购物车中的商品
        $cartItems = json_decode($_COOKIE['cart'], true) ?? [];

        // 插入订单信息到数据库
        $stmt = $pdo->prepare("INSERT INTO orders (customer_name, customer_email, customer_address) VALUES (?, ?, ?)");
        $stmt->execute([$name, $email, $address]);
        $orderId = $pdo->lastInsertId();

        // 插入订单详情到数据库
        foreach ($cartItems as $item) {
            $stmt = $pdo->prepare("INSERT INTO order_details (order_id, product_id, quantity, price) VALUES (?, ?, 1, ?)");
            $stmt->execute([$orderId, $item['id'], $item['price']]);
        }

        // 清空购物车
        setcookie('cart', '', time() - 3600, '/');

        echo "Order processed successfully.";
    } else {
        echo "Invalid request method.";
    }
} catch (PDOException $e) {
    die('Database connection failed: ' . $e->getMessage());
}
?>



