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
        }
        .export-btn:hover {
            background: #2da0ef;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Orion's Barrel - Mailing List Subscribers</h1>
        
        <?php
        $filename = 'mailing_list.json';
        $subscribers = [];
        
        if (file_exists($filename)) {
            $json_content = file_get_contents($filename);
            if ($json_content !== false) {
                $subscribers = json_decode($json_content, true) ?? [];
            }
        }
        
        $total_count = count($subscribers);
        $today_count = 0;
        $this_week_count = 0;
        
        $today = date('Y-m-d');
        $week_ago = date('Y-m-d', strtotime('-7 days'));
        
        foreach ($subscribers as $subscriber) {
            $sub_date = date('Y-m-d', strtotime($subscriber['timestamp']));
            if ($sub_date === $today) {
                $today_count++;
            }
            if ($sub_date >= $week_ago) {
                $this_week_count++;
            }
        }
        ?>
        
        <div class="stats">
            <strong>Statistics:</strong><br>
            Total Subscribers: <?php echo $total_count; ?><br>
            New Today: <?php echo $today_count; ?><br>
            New This Week: <?php echo $this_week_count; ?>
        </div>
        
        <?php if (file_exists('mailing_list.csv')): ?>
            <a href="mailing_list.csv" download class="export-btn">📁 Download CSV</a>
        <?php endif; ?>
        
        <?php if ($total_count > 0): ?>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Subscribed</th>
                        <th>IP Address</th>
                    </tr>
                </thead>
                <tbody>
                    <?php 
                    // Sort by timestamp (newest first)
                    usort($subscribers, function($a, $b) {
                        return strtotime($b['timestamp']) - strtotime($a['timestamp']);
                    });
                    
                    foreach ($subscribers as $index => $subscriber): 
                    ?>
                        <tr>
                            <td><?php echo $index + 1; ?></td>
                            <td><?php echo htmlspecialchars($subscriber['name']); ?></td>
                            <td><?php echo htmlspecialchars($subscriber['email']); ?></td>
                            <td><?php echo date('M j, Y g:i A', strtotime($subscriber['timestamp'])); ?></td>
                            <td><?php echo htmlspecialchars($subscriber['ip_address'] ?? 'unknown'); ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php else: ?>
            <div class="no-data">
                <p>No subscribers yet. Share your mailing list form to start collecting email addresses!</p>
            </div>
        <?php endif; ?>
        
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
            <strong>Note:</strong> This page shows all mailing list subscribers. Keep this information secure and comply with privacy regulations.
        </p>
    </div>
</body>
</html>

