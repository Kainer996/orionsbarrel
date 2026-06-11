# Orion's Barrel - Mailing List System

## Overview
I've successfully converted the table reservation form into a mailing list signup form that saves email addresses to your server. Here's what was implemented:

## What Changed

### 1. Form Conversion
- **Before**: Table reservation form with fields for name, email, party size, date, and notes
- **After**: Mailing list signup form with just name and email fields
- Updated all navigation links and CTAs throughout the site to point to the mailing list instead of booking

### 2. Backend Processing
- **File**: `save_email.php` - Handles form submissions
- **Features**:
  - Validates name and email fields
  - Prevents duplicate email addresses
  - Saves data to both JSON and CSV formats
  - Returns JSON responses for AJAX handling
  - Includes timestamp and IP address logging

### 3. Frontend Enhancement
- **File**: `script.js` - Added AJAX form submission
- **Features**:
  - Submits form without page reload
  - Shows success/error messages
  - Loading state with button text change
  - Form reset on successful submission

### 4. Admin Interface
- **File**: `view_emails.php` - View and manage subscribers
- **Features**:
  - Display all subscribers in a table
  - Statistics (total, today, this week)
  - Export to CSV functionality
  - Responsive design

## Files Created/Modified

### New Files:
- `save_email.php` - Backend form processor
- `view_emails.php` - Admin interface to view subscribers
- `mailing_list.json` - JSON storage (created automatically)
- `mailing_list.csv` - CSV export (created automatically)

### Modified Files:
- `index.html` - Form conversion and navigation updates
- `script.js` - Added AJAX form handling

## How to Use

### For Visitors:
1. Navigate to your website
2. Scroll to the "Join our stellar mailing list" section
3. Fill in name and email
4. Click "Join the Crew"
5. See success/error message

### For Admin:
1. Visit `view_emails.php` in your browser
2. View all subscribers and statistics
3. Download CSV export if needed

## Data Storage

The system stores subscriber data in two formats:

### JSON Format (`mailing_list.json`):
```json
[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "timestamp": "2024-01-15 14:30:25",
    "ip_address": "192.168.1.1"
  }
]
```

### CSV Format (`mailing_list.csv`):
```
Name,Email,Timestamp,IP Address
John Doe,john@example.com,2024-01-15 14:30:25,192.168.1.1
```

## Security Features

- **Email Validation**: Server-side validation ensures valid email format
- **Duplicate Prevention**: Prevents the same email from being added twice
- **Input Sanitization**: All inputs are sanitized to prevent XSS attacks
- **File Locking**: Uses file locking to prevent data corruption during writes

## Server Requirements

- PHP 7.0 or higher
- Write permissions for the web directory (to create JSON/CSV files)
- Web server (Apache, Nginx, etc.)

## Customization

### Change Storage Location:
Edit the `$filename` variable in `save_email.php`:
```php
$filename = 'path/to/your/mailing_list.json';
```

### Add More Fields:
1. Add fields to the HTML form
2. Update the PHP validation and processing
3. Modify the admin interface to display new fields

### Email Integration:
To send welcome emails or newsletters, you could integrate with:
- PHPMailer for direct sending
- Email services like SendGrid, Mailchimp, etc.
- Read the CSV/JSON files to import into your preferred email platform

## Troubleshooting

### Form Not Submitting:
- Check that `save_email.php` is accessible
- Verify file permissions for writing
- Check browser console for JavaScript errors

### Data Not Saving:
- Ensure the web directory has write permissions
- Check PHP error logs
- Verify PHP version compatibility

### Admin Page Not Loading:
- Ensure the JSON file exists (submit a test email first)
- Check file permissions
- Verify PHP is enabled on your server

## Next Steps

1. **Test the form** by submitting a few test emails
2. **Access the admin panel** at `view_emails.php`
3. **Set up regular backups** of the mailing list files
4. **Consider email marketing integration** for sending newsletters
5. **Add unsubscribe functionality** if needed for compliance

The mailing list system is now ready to collect and store email addresses from your website visitors!

