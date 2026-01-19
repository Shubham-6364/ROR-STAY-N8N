# 🏠 ROR STAY - Property Rental Platform

A **100% serverless** property rental platform built with vanilla HTML/CSS/JavaScript and n8n workflows. Zero backend code - all data operations handled through n8n webhooks.

![Status](https://img.shields.io/badge/status-production--ready-success)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

- 🏘️ **Property Listings** - Browse available properties with filters (location, price, type)
- 📝 **Contact Form** - Submit inquiries that save to Google Sheets
- 🖼️ **Image Upload** - Upload property images to Google Drive
- ⚙️ **Admin Panel** - Add new listings with 1-5 images
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 🌐 **Serverless** - No backend server, 100% n8n workflows
- 🎯 **Jaipur Focused** - Custom location dropdowns for Jaipur market

---

## 🏗️ Architecture

```
Frontend (HTML/CSS/JS)
    ↓
n8n Webhooks (Serverless Backend)
    ↓
Google Sheets (Database) + Google Drive (Images)
```

---

## 📋 Prerequisites

- **Domain**: `ror.codersdiary.shop` (A record pointing to your server IP)
- **Server**: AWS Ubuntu 20.04+ with root/sudo access
- **n8n Instance**: Running at `https://n8n.codersdiary.shop`
- **Google Account**: For Sheets and Drive integration

---

## 🚀 Local Development

### Quick Start

```bash
# Clone repository
git clone <your-repo-url>
cd ROR-STAY-N8N-LITE

# Start local dev server
cd public
python3 -m http.server 8000

# Access at http://localhost:8000
```

### Configure n8n Webhooks

1. Update `public/js/config.js` with your n8n URLs
2. Import workflows from `workflows/` folder into n8n
3. Activate all workflows in n8n

---

## 🌐 Production Deployment (AWS Ubuntu)

### Step 1: Server Preparation

```bash
# SSH into your AWS Ubuntu server
ssh ubuntu@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Nginx
sudo apt install nginx -y

# Install certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### Step 2: Clone Project

```bash
# Navigate to web root
cd /var/www

# Clone repository
sudo git clone <your-repo-url> ror-stay
cd ror-stay

# Set proper permissions
sudo chown -R www-data:www-data /var/www/ror-stay
sudo chmod -R 755 /var/www/ror-stay
```

### Step 3: Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/ror-stay
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name ror.codersdiary.shop;

    root /var/www/ror-stay/public;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ =404;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
}
```

Enable the site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/ror-stay /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 4: Configure Domain DNS

**Your DNS is already configured** (A record points to server IP):
```
A    ror.codersdiary.shop    →    YOUR_SERVER_IP
```

Verify DNS propagation:
```bash
dig ror.codersdiary.shop +short
# Should show your server IP
```

### Step 5: Setup SSL Certificate (HTTPS)

```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d ror.codersdiary.shop

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)

# Auto-renewal is configured automatically
# Test renewal:
sudo certbot renew --dry-run
```

After SSL setup, Nginx will auto-update to:
```nginx
server {
    listen 443 ssl;
    server_name ror.codersdiary.shop;
    
    ssl_certificate /etc/letsencrypt/live/ror.codersdiary.shop/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ror.codersdiary.shop/privkey.pem;
    
    # ... rest of config
}

server {
    listen 80;
    server_name ror.codersdiary.shop;
    return 301 https://$server_name$request_uri;
}
```

### Step 6: Verify Deployment

```bash
# Check Nginx status
sudo systemctl status nginx

# Check if port 80 is listening
sudo netstat -tulpn | grep :80

# Test from browser
curl http://ror.codersdiary.shop
curl https://ror.codersdiary.shop
```

Access your site:
- **HTTP**: http://ror.codersdiary.shop (redirects to HTTPS)
- **HTTPS**: https://ror.codersdiary.shop ✅
- **Admin**: https://ror.codersdiary.shop/admin.html

---

## ⚙️ n8n Workflow Setup

### Import Workflows

1. **Open n8n**: https://n8n.codersdiary.shop
2. **Import workflows** from `workflows/` folder:
   - `contact-form-example.json`
   - `add-listing-workflow.json`
   - `upload-image-workflow.json`

3. **Configure Google credentials** in each workflow
4. **Update Google Sheet IDs** and Drive folder IDs
5. **Activate all workflows** (toggle ON)

### Webhook URLs

Production webhooks (used in `public/js/config.js`):
```
https://n8n.codersdiary.shop/webhook/contact-submit
https://n8n.codersdiary.shop/webhook/get-listings
https://n8n.codersdiary.shop/webhook/add-listing
https://n8n.codersdiary.shop/webhook/upload-image
```

---

## 📁 Project Structure

```
ROR-STAY-N8N-LITE/
├── public/                 # Frontend (served by Nginx)
│   ├── index.html         # Main page
│   ├── admin.html         # Admin panel
│   ├── css/
│   │   └── styles.css     # All styles
│   └── js/
│       ├── config.js      # n8n webhook URLs ⚙️
│       ├── contact.js     # Contact form handler
│       ├── listings.js    # Listings display & filters
│       └── admin.js       # Admin panel logic
├── workflows/             # n8n workflow JSONs
│   ├── contact-form-example.json
│   ├── add-listing-workflow.json
│   ├── upload-image-workflow.json
│   └── IMPORT-GUIDE.md
├── docs/                  # Documentation
│   ├── SETUP.md
│   ├── N8N-WORKFLOWS.md
│   └── ADD-LISTING-COMPLETE.md
├── README.md             # This file
├── start.sh              # Local dev server script
└── .gitignore
```

---

## 🔧 Configuration

### Update Webhook URLs

If deploying to a different domain, update `public/js/config.js`:

```javascript
const N8N_CONFIG = {
    baseURL: 'https://n8n.codersdiary.shop',
    webhooks: {
        contactSubmit: 'https://n8n.codersdiary.shop/webhook/contact-submit',
        getListings: 'https://n8n.codersdiary.shop/webhook/get-listings',
        addListing: 'https://n8n.codersdiary.shop/webhook/add-listing',
        uploadImage: 'https://n8n.codersdiary.shop/webhook/upload-image'
    },
    timeout: 30000
};
```

After updating, redeploy:
```bash
cd /var/www/ror-stay
sudo git pull
# Clear browser cache with Ctrl+Shift+R
```

---

## 🔒 Security

### Firewall Setup

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

### File Permissions

```bash
# Set correct ownership
sudo chown -R www-data:www-data /var/www/ror-stay

# Set proper permissions
sudo find /var/www/ror-stay -type d -exec chmod 755 {} \;
sudo find /var/www/ror-stay -type f -exec chmod 644 {} \;
```

---

## 🐛 Troubleshooting

### Issue: Site not loading

```bash
# Check Nginx status
sudo systemctl status nginx

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Issue: 403 Forbidden

```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/ror-stay
sudo chmod -R 755 /var/www/ror-stay
```

### Issue: SSL certificate issues

```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Issue: Images not loading

- Verify Google Drive folder has "Anyone with link" access
- Check image URLs use `/thumbnail` API: `https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000`
- Clear browser cache (Ctrl+Shift+R)

### Issue: Forms not submitting

- Check n8n workflows are **Active** (toggle ON)
- Verify webhook URLs in `config.js` match n8n production URLs
- Check browser console for CORS errors
- Ensure n8n webhooks have CORS headers configured

---

## 📊 Monitoring

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### n8n Execution Logs

Check workflow executions in n8n dashboard:
1. Open https://n8n.codersdiary.shop
2. Go to **Executions** tab
3. View recent workflow runs

---

## 🔄 Updates & Maintenance

### Update Code

```bash
cd /var/www/ror-stay
sudo git pull origin main
sudo systemctl restart nginx
```

### SSL Certificate Auto-Renewal

Certbot automatically renews certificates. Verify:
```bash
sudo certbot renew --dry-run
```

### Backup

```bash
# Backup website files
sudo tar -czf ror-stay-backup-$(date +%Y%m%d).tar.gz /var/www/ror-stay

# Backup Nginx config
sudo cp /etc/nginx/sites-available/ror-stay /var/www/ror-stay/nginx-backup.conf
```

---

## 📚 Additional Documentation

- **Setup Guide**: `docs/SETUP.md`
- **n8n Workflows**: `docs/N8N-WORKFLOWS.md`
- **Google Setup**: `docs/google-setup.md`
- **Workflow Import**: `workflows/IMPORT-GUIDE.md`

---

## 🎯 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: n8n workflows (serverless)
- **Database**: Google Sheets
- **File Storage**: Google Drive
- **Web Server**: Nginx
- **SSL**: Let's Encrypt (Certbot)
- **Hosting**: AWS Ubuntu

---

## 📝 License

MIT License - feel free to use for your own projects!

---

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

---

## 📧 Support

For issues or questions, please check the documentation in `docs/` folder.

---

**Built with ❤️ using n8n and Vanilla JS**
