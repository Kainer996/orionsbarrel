<?php
/**
 * Database Setup Script for Orion's Barrel Mailing List
 * Run this file once to create the SQLite database and table
 */

$db_file = 'orionsbarrel_mailinglist.db';

try {
    // Create/open the SQLite database
    $db = new PDO('sqlite:' . $db_file);
    
    // Set error mode to exceptions
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create the subscribers table
    $sql = "CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT,
        is_active INTEGER DEFAULT 1
    )";
    
    $db->exec($sql);
    
    // Create an index on email for faster lookups
    $db->exec("CREATE INDEX IF NOT EXISTS idx_email ON subscribers(email)");
    
    // Create an index on subscribed_at for faster date queries
    $db->exec("CREATE INDEX IF NOT EXISTS idx_subscribed_at ON subscribers(subscribed_at)");
    
    echo "✅ Database setup successful!<br><br>";
    echo "Database file: <strong>$db_file</strong><br>";
    echo "Table created: <strong>subscribers</strong><br><br>";
    echo "You can now use the mailing list form on your website.<br>";
    echo "View subscribers at: <a href='view_emails.php'>view_emails.php</a>";
    
} catch (PDOException $e) {
    echo "❌ Error setting up database: " . $e->getMessage();
    exit;
}
?>

