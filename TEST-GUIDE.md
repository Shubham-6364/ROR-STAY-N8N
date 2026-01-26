# Quick Test Guide

## ✅ You're Ready to Test!

Since you have **n8n already deployed on another server**, you can test the frontend right now!

## 🚀 Option 1: Automated Test (Easiest)

Run the test script:
```bash
cd /home/azureuser/ROR-STAY-N8N-LITE
./test-server.sh
```

It will:
1. Ask for your n8n server URL
2. Update the config automatically
3. Test connectivity to n8n
4. Start the local web server

## 🔧 Option 2: Manual Configuration

### Step 1: Update Config
Edit `js/config.js`:
```bash
nano js/config.js
```

Replace `http://localhost:5678` with your **n8n server URL**:
- If HTTP: `http://your-server-ip:5678`
- If HTTPS: `https://n8n.yourdomain.com`

**Example:**
```javascript
const N8N_CONFIG = {
    baseURL: 'https://n8n.example.com',  // ← Your n8n URL
    webhooks: {
        contactSubmit: 'https://n8n.example.com/webhook/contact-submit',
        getListings: 'https://n8n.example.com/webhook/get-listings',
        addListing: 'https://n8n.example.com/webhook/add-listing',
        uploadImage: 'https://n8n.example.com/webhook/upload-image',
    },
    timeout: 30000,
};
```

### Step 2: Start Server
```bash
cd /home/azureuser/ROR-STAY-N8N-LITE/public
python3 -m http.server 8000
```

### Step 3: Open Browser
Visit: **http://localhost:8000**

## 🧪 What to Test

### Test 1: Contact Form
1. Scroll to "Get In Touch" → "Submit Your Query"
2. Fill in all fields:
   - Name, Phone, Email
   - **Location**: Select from dropdown (Jagatpura, etc.)
   - **Property Type**: Flat, Apartment, etc.
   - **Members**: 2
   - **Budget**: 15000
3. Click "Submit Query"
4. Check your Google Sheets for the new row!

### Test 2: Property Listings
1. Go to "Available Properties" section
2. If you have data in Google Sheets, properties should load
3. Test filters

### Test 3: Admin Panel
1. Visit: **http://localhost:8000/admin.html**
2. Try adding a property with images
3. Check Google Sheets and Google Drive

## ⚠️ Important: CORS Setup

If your n8n is on a **different domain**, you need to enable CORS:

**In n8n environment variables:**
```bash
N8N_CORS_ALLOW_ORIGIN=*
# or specifically:
N8N_CORS_ALLOW_ORIGIN=http://localhost:8000
```

**Or in your webhooks**, add response headers:
```json
{
  "headers": {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  }
}
```

## 🔍 Troubleshooting

### Form doesn't submit
- Open browser console (F12)
- Check for CORS errors
- Verify n8n webhook URLs are correct
- Make sure n8n workflows are **activated**

### Listings don't load
- Check n8n "Get Listings" workflow is active
- Verify Google Sheets has data
- Check browser console for errors

### Images won't upload
- Verify Google Drive folder exists
- Check file size (keep under 5MB)
- Ensure n8n has Google Drive credentials

## ✅ Success Checklist

- [ ] Config updated with n8n server URL
- [ ] Local server running on port 8000
- [ ] Browser opens at http://localhost:8000
- [ ] Homepage loads properly
- [ ] Contact form visible with new fields
- [ ] Form submits successfully
- [ ] Data appears in Google Sheets

## 🎯 Next Steps After Testing

If everything works:
1. Deploy to production hosting (Netlify, Vercel, etc.)
2. Update config.js with production n8n URL
3. Test from production domain
4. Update CORS settings for production domain

---

**You're all set to test!** 🚀

Just provide your n8n server URL and we'll get it running!
