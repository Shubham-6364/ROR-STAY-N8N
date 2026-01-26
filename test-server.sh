#!/bin/bash

# Quick Test Script for ROR-STAY-N8N-LITE
# This script helps you test the frontend with your remote n8n server

echo "🚀 ROR-STAY-N8N-LITE Quick Test"
echo "================================"
echo ""

# Get n8n server URL from user
#read -p "Enter your n8n server URL (e.g., http://your-server-ip:5678 or https://n8n.yourdomain.com): " N8N_URL

# Remove trailing slash if present
N8N_URL=n8n.codersdiary.shop

echo ""
echo "📝 Updating configuration..."

# Update config.js
cat > js/config.js << EOF
/**
 * n8n Webhook Configuration
 * 
 * Updated for remote n8n server
 */

const N8N_CONFIG = {
    // Base URL for your n8n instance
    baseURL: '$N8N_URL',

    // Webhook endpoints
    webhooks: {
        // Contact form submission
        contactSubmit: 'https://n8n.codersdiary.shop/webhook/contact-submit',

        // Get all property listings
        getListings: 'https://n8n.codersdiary.shop/webhook/get-listings',

        // Add new property listing (with images)
        addListing: 'https://n8n.codersdiary.shop/webhook/add-listing',

        // Upload image to Google Drive
        uploadImage: 'https://n8n.codersdiary.shop/webhook/upload-image',
    },

    // Configuration
    timeout: 30000, // 30 seconds for image uploads
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = N8N_CONFIG;
}
EOF

echo "✅ Configuration updated!"
echo ""
echo "🧪 Testing n8n connectivity..."
echo ""

# Test if n8n is accessible
if curl -s --head --max-time 5 "$N8N_URL" > /dev/null; then
    echo "✅ n8n server is accessible at $N8N_URL"
else
    echo "⚠️  Warning: Cannot reach n8n server at $N8N_URL"
    echo "   Make sure:"
    echo "   1. n8n is running"
    echo "   2. Firewall allows connections"
    echo "   3. URL is correct"
fi

echo ""
echo "🌐 Starting local web server..."
echo ""
echo "Open in your browser: http://ror1.codersdiary.shop"
echo "Press Ctrl+C to stop the server"
echo ""

cd public
python3 -m http.server 8000
