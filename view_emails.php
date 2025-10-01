<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orion's Barrel - Mailing List</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #3dd6a2;
            padding-bottom: 10px;
        }
        .stats {
            background: #e8f4f8;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        .stat-item {
            background: white;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #3dd6a2;
        }
        .stat-label {
            color: #666;
            font-size: 14px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #3dd6a2;
            color: white;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        .no-data {
            text-align: center;
            color: #666;
            padding: 40px;
        }
        .export-btn {
            background: #47b0ff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-bottom: 20px;
            text-decoration: none;
            display: inline-block;
        }
        .export-btn:hover {
            background: #2da0ef;
        }
        .active-badge {
            background: #3dd6a2;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
        }
        .error-message {
            background: #ffebee;
            border: 1px solid #ef5350;
            color: #c62828;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Orion's Barrel - Mailing List Subscribers</h1>
        
        <?php
        $db_file = 'orionsbarrel_mailinglist.db';
        $subscribers = [];
        $total_count = 0;
        $today_count = 0;
        $this_week_count = 0;
        $this_month_count = 0;
        $db_error = false;
        
        try {
            if (!file_exists($db_file)) {
                throw new Exception('Database not found. Please run <a href="db_setup.php">db_setup.php</a> first to initialize the database.');
            }
            
            // Connect to SQLite database
            $db = new PDO('sqlite:' . $db_file);
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Get total count
            $stmt = $db->query("SELECT COUNT(*) FROM subscribers WHERE is_active = 1");
            $total_count = $stmt->fetchColumn();
            
            // Get today's count
            $stmt = $db->query("SELECT COUNT(*) FROM subscribers WHERE DATE(subscribed_at) = DATE('now') AND is_active = 1");
            $today_count = $stmt->fetchColumn();
            
            // Get this week's count
            $stmt = $db->query("SELECT COUNT(*) FROM subscribers WHERE DATE(subscribed_at) >= DATE('now', '-7 days') AND is_active = 1");
            $this_week_count = $stmt->fetchColumn();
            
            // Get this month's count
            $stmt = $db->query("SELECT COUNT(*) FROM subscribers WHERE DATE(subscribed_at) >= DATE('now', 'start of month') AND is_active = 1");
            $this_month_count = $stmt->fetchColumn();
            
            // Get all subscribers (newest first)
            $stmt = $db->query("SELECT * FROM subscribers WHERE is_active = 1 ORDER BY subscribed_at DESC");
            $subscribers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            $db_error = $e->getMessage();
        }
        ?>
        
        <?php if ($db_error): ?>
            <div class="error-message">
                <strong>⚠️ Database Error:</strong> <?php echo $db_error; ?>
            </div>
        <?php else: ?>
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-number"><?php echo $total_count; ?></div>
                    <div class="stat-label">Total Subscribers</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number"><?php echo $today_count; ?></div>
                    <div class="stat-label">New Today</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number"><?php echo $this_week_count; ?></div>
                    <div class="stat-label">New This Week</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number"><?php echo $this_month_count; ?></div>
                    <div class="stat-label">New This Month</div>
                </div>
            </div>
            
            <a href="export_csv.php" class="export-btn">📁 Export to CSV</a>
            
            <?php if ($total_count > 0): ?>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Subscribed</th>
                            <th>IP Address</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($subscribers as $index => $subscriber): ?>
                            <tr>
                                <td><?php echo $index + 1; ?></td>
                                <td><?php echo htmlspecialchars($subscriber['name']); ?></td>
                                <td><?php echo htmlspecialchars($subscriber['email']); ?></td>
                                <td><?php echo date('M j, Y g:i A', strtotime($subscriber['subscribed_at'])); ?></td>
                                <td><?php echo htmlspecialchars($subscriber['ip_address'] ?? 'unknown'); ?></td>
                                <td><span class="active-badge">Active</span></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php else: ?>
                <div class="no-data">
                    <p>No subscribers yet. Share your mailing list form to start collecting email addresses!</p>
                </div>
            <?php endif; ?>
        <?php endif; ?>
        
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
            <strong>Note:</strong> This page shows all mailing list subscribers. Keep this information secure and comply with privacy regulations.
        </p>
    </div>
</body>
</html>

