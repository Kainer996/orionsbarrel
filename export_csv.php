<?php
/**
 * Export subscribers to CSV
 */

$db_file = 'orionsbarrel_mailinglist.db';

try {
    if (!file_exists($db_file)) {
        die('Database not found. Please run db_setup.php first.');
    }
    
    // Connect to SQLite database
    $db = new PDO('sqlite:' . $db_file);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get all active subscribers
    $stmt = $db->query("SELECT * FROM subscribers WHERE is_active = 1 ORDER BY subscribed_at DESC");
    $subscribers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($subscribers)) {
        die('No subscribers to export.');
    }
    
    // Set headers for CSV download
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=orionsbarrel_subscribers_' . date('Y-m-d') . '.csv');
    
    // Create output stream
    $output = fopen('php://output', 'w');
    
    // Add BOM for Excel compatibility
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
    
    // Add CSV headers
    fputcsv($output, ['ID', 'Name', 'Email', 'Subscribed Date', 'IP Address', 'User Agent', 'Status']);
    
    // Add data rows
    foreach ($subscribers as $subscriber) {
        fputcsv($output, [
            $subscriber['id'],
            $subscriber['name'],
            $subscriber['email'],
            $subscriber['subscribed_at'],
            $subscriber['ip_address'] ?? 'unknown',
            $subscriber['user_agent'] ?? 'unknown',
            $subscriber['is_active'] ? 'Active' : 'Inactive'
        ]);
    }
    
    fclose($output);
    exit;
    
} catch (PDOException $e) {
    die('Database error: ' . $e->getMessage());
}
?>

