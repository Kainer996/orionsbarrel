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

// Prepare data to save
$timestamp = date('Y-m-d H:i:s');
$data = [
    'name' => $name,
    'email' => $email,
    'timestamp' => $timestamp,
    'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
];

// File to store email addresses
$filename = 'mailing_list.json';

// Read existing data
$existing_data = [];
if (file_exists($filename)) {
    $json_content = file_get_contents($filename);
    if ($json_content !== false) {
        $existing_data = json_decode($json_content, true) ?? [];
    }
}

// Check if email already exists
foreach ($existing_data as $entry) {
    if (isset($entry['email']) && strtolower($entry['email']) === strtolower($email)) {
        sendJsonResponse(false, 'This email is already subscribed to our mailing list');
    }
}

// Add new entry
$existing_data[] = $data;

// Save to file
$json_data = json_encode($existing_data, JSON_PRETTY_PRINT);
if (file_put_contents($filename, $json_data, LOCK_EX) === false) {
    sendJsonResponse(false, 'Sorry, there was an error saving your information. Please try again later.');
}

// Also save to a backup CSV file for easy viewing
$csv_filename = 'mailing_list.csv';
$csv_exists = file_exists($csv_filename);

$csv_handle = fopen($csv_filename, 'a');
if ($csv_handle) {
    // Add header if file is new
    if (!$csv_exists) {
        fputcsv($csv_handle, ['Name', 'Email', 'Timestamp', 'IP Address']);
    }
    
    // Add the new entry
    fputcsv($csv_handle, [$name, $email, $timestamp, $data['ip_address']]);
    fclose($csv_handle);
}

// Send success response
sendJsonResponse(true, 'Welcome to the crew! You\'ve been added to our stellar mailing list.');
?>

