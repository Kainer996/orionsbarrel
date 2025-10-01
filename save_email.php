<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

function sendJsonResponse($success, $message) {
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, 'Only POST requests are allowed');
}

// Get form data
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';

// Basic validation
if (empty($name) || empty($email)) {
    sendJsonResponse(false, 'Please fill in all required fields');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJsonResponse(false, 'Please enter a valid email address');
}

// Sanitize inputs
$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$email = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');

// Database file
$db_file = 'orionsbarrel_mailinglist.db';

try {
    // Connect to SQLite database
    $db = new PDO('sqlite:' . $db_file);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if email already exists
    $stmt = $db->prepare("SELECT COUNT(*) FROM subscribers WHERE LOWER(email) = LOWER(:email)");
    $stmt->execute([':email' => $email]);
    $count = $stmt->fetchColumn();
    
    if ($count > 0) {
        sendJsonResponse(false, 'This email is already subscribed to our mailing list');
    }
    
    // Insert new subscriber
    $stmt = $db->prepare("
        INSERT INTO subscribers (name, email, ip_address, user_agent) 
        VALUES (:name, :email, :ip_address, :user_agent)
    ");
    
    $result = $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ]);
    
    if ($result) {
        sendJsonResponse(true, 'Welcome to the crew! You\'ve been added to our stellar mailing list.');
    } else {
        sendJsonResponse(false, 'Sorry, there was an error saving your information. Please try again later.');
    }
    
} catch (PDOException $e) {
    // Log the error (in production, log to file instead of displaying)
    error_log('Database error: ' . $e->getMessage());
    sendJsonResponse(false, 'Sorry, there was a database error. Please try again later.');
}
?>

