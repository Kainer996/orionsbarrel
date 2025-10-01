# Orion's Barrel - Database Mailing List System

## Overview
Your mailing list now uses an SQLite database to store subscriber information. SQLite is a lightweight, file-based database that requires no additional server setup or configuration.

## Quick Start

### 1. Initialize the Database
Run the setup script **once** to create your database:
```
Navigate to: http://yourdomain.com/db_setup.php
```

This creates:
- `orionsbarrel_mailinglist.db` - The SQLite database file
- A `subscribers` table with all necessary fields and indexes

### 2. Files Overview

#### Core Files:
- **`db_setup.php`** - Database initialization script (run once)
- **`save_email.php`** - Handles form submissions and saves to database
- **`view_emails.php`** - Admin panel to view all subscribers
- **`export_csv.php`** - Export subscribers to CSV file
- **`orionsbarrel_mailinglist.db`** - The database file (created automatically)

#### Legacy Files (no longer used):
- `mailing_list.json` - Old JSON storage (can be deleted after migration)
- `mailing_list.csv` - Old CSV storage (can be deleted after migration)

## Database Structure

### Table: `subscribers`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `name` | TEXT | Subscriber's name |
| `email` | TEXT | Subscriber's email (unique) |
| `subscribed_at` | DATETIME | Subscription timestamp |
| `ip_address` | TEXT | IP address of subscriber |
| `user_agent` | TEXT | Browser/device information |
| `is_active` | INTEGER | 1 = active, 0 = unsubscribed |

### Indexes:
- `idx_email` - Fast email lookups for duplicate checking
- `idx_subscribed_at` - Fast date-based queries for statistics

## Features

### ✅ What's New:
1. **Proper Database Storage** - SQLite provides ACID compliance and data integrity
2. **Better Performance** - Indexed queries for fast lookups
3. **Duplicate Prevention** - Database-level unique constraint on email
4. **User Agent Tracking** - Now stores browser/device information
5. **Active/Inactive Status** - Prepare for future unsubscribe functionality
6. **Enhanced Statistics** - Monthly signups tracking added
7. **CSV Export** - Download all subscribers as CSV with one click

### 🔒 Security Features:
- **Prepared Statements** - Prevents SQL injection attacks
- **Input Sanitization** - All user input is cleaned
- **Email Validation** - Server-side validation ensures valid emails
- **Unique Email Constraint** - Database prevents duplicate emails
- **Error Handling** - Graceful error messages without exposing system details

## How to Use

### For Website Visitors:
1. Visit your website
2. Fill out the mailing list form
3. Submit to join the mailing list
4. Receive confirmation message

### For Admin:
1. **View Subscribers**: Navigate to `view_emails.php`
2. **Export Data**: Click "Export to CSV" button
3. **Statistics**: See total, daily, weekly, and monthly signups

## Migration from JSON/CSV

If you have existing subscribers in the old JSON format, you can migrate them:

```php
<?php
// Create a migration script (run once)
$db = new PDO('sqlite:orionsbarrel_mailinglist.db');
$json_data = json_decode(file_get_contents('mailing_list.json'), true);

foreach ($json_data as $subscriber) {
    $stmt = $db->prepare("INSERT OR IGNORE INTO subscribers (name, email, subscribed_at, ip_address) VALUES (?, ?, ?, ?)");
    $stmt->execute([
        $subscriber['name'],
        $subscriber['email'],
        $subscriber['timestamp'],
        $subscriber['ip_address'] ?? 'unknown'
    ]);
}
?>
```

## Backup & Maintenance

### Backup the Database:
Simply copy the `orionsbarrel_mailinglist.db` file to a safe location. This is the entire database.

```bash
# Example backup command
cp orionsbarrel_mailinglist.db backups/mailinglist_$(date +%Y%m%d).db
```

### Restore from Backup:
Replace the current `.db` file with your backup copy.

### Database Size:
SQLite is very efficient. Expect approximately:
- ~1-2 KB per subscriber
- 10,000 subscribers ≈ 10-20 MB

## Advanced Usage

### Query the Database Directly:
You can use SQLite command-line tools or GUI tools like DB Browser for SQLite:

```bash
# Command-line example
sqlite3 orionsbarrel_mailinglist.db
> SELECT COUNT(*) FROM subscribers;
> SELECT * FROM subscribers WHERE DATE(subscribed_at) = DATE('now');
```

### Add an Unsubscribe Feature:
The database is ready for this. Just update `is_active` to 0:

```php
$stmt = $db->prepare("UPDATE subscribers SET is_active = 0 WHERE email = ?");
$stmt->execute([$email]);
```

### Email Marketing Integration:
Export the CSV and import into services like:
- Mailchimp
- SendGrid
- Constant Contact
- Any email marketing platform

## Server Requirements

- **PHP**: 7.0 or higher
- **PDO SQLite Extension**: Usually enabled by default
- **File Permissions**: Write access to create the database file

### Check if SQLite is enabled:
```php
<?php
if (extension_loaded('pdo_sqlite')) {
    echo "SQLite is enabled!";
} else {
    echo "SQLite is not available.";
}
?>
```

## Troubleshooting

### Error: "Database not found"
**Solution**: Run `db_setup.php` to create the database.

### Error: "Unable to open database file"
**Solution**: Check file permissions. The web server needs write access to the directory.

```bash
chmod 755 /path/to/directory
chmod 664 orionsbarrel_mailinglist.db
```

### Error: "Attempt to write a readonly database"
**Solution**: The database file or directory doesn't have write permissions.

### Form Not Submitting:
1. Check browser console for JavaScript errors
2. Verify `save_email.php` is accessible
3. Check PHP error logs

### No Data Showing:
1. Ensure database was initialized with `db_setup.php`
2. Try submitting a test email
3. Check file permissions

## Security Best Practices

1. **Protect Admin Pages**: Add password protection to `view_emails.php` and `export_csv.php`
   
   Example `.htaccess`:
   ```apache
   <Files "view_emails.php">
       AuthType Basic
       AuthName "Admin Area"
       AuthUserFile /path/to/.htpasswd
       Require valid-user
   </Files>
   ```

2. **Regular Backups**: Automate database backups

3. **GDPR Compliance**: 
   - Add privacy policy
   - Implement unsubscribe feature
   - Include data deletion on request

4. **SSL Certificate**: Use HTTPS to encrypt form submissions

5. **Rate Limiting**: Prevent spam by limiting submissions per IP

## Future Enhancements

Possible additions you might want:
- [ ] Email verification (double opt-in)
- [ ] Unsubscribe functionality
- [ ] Admin authentication
- [ ] Export to different formats (JSON, XML)
- [ ] Integration with email services (SendGrid, Mailchimp)
- [ ] Subscription categories/tags
- [ ] Custom fields (phone, location, etc.)
- [ ] Automated welcome emails

## Support

If you encounter issues:
1. Check PHP error logs
2. Verify all files are uploaded correctly
3. Ensure database initialization completed successfully
4. Test with a simple subscriber entry

---

**Your mailing list is now powered by a proper database! 🚀**

All subscriber data is stored securely in SQLite, ready to grow with your business.

