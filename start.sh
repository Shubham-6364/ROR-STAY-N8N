#!/bin/bash

# Fixed Test Server Script
# CSS and JS files are now in the correct location

echo "🚀 ROR-STAY-N8N-LITE - Fixed Version"
echo "===================================="
echo ""
echo "✅ CSS and JavaScript files are now in the correct location"
echo ""

# Check if n8n config needs updating
if grep -q "localhost:5678" public/js/config.js; then
    echo "⚠️  n8n config is set to localhost:5678"
    read -p "Do you want to update it to your remote n8n server? (y/n): " UPDATE_CONFIG
    
    if [ "$UPDATE_CONFIG" = "y" ] || [ "$UPDATE_CONFIG" = "Y" ]; then
        read -p "Enter your n8n server URL (e.g., https://n8n.yourdomain.com): " N8N_URL
        N8N_URL=${N8N_URL%/}
        
        cat > public/js/config.js << EOF
/**
 * n8n Webhook Configuration
 */

const N8N_CONFIG = {
    baseURL: '$N8N_URL',
    webhooks: {
        contactSubmit: 'https://n8n.codersdiary.shop/webhook/contact-submit',
        getListings: 'https://n8n.codersdiary.shop/webhook/get-listings',
        addListing: 'https://n8n.codersdiary.shop/webhook/add-listing',
        uploadImage: 'https://n8n.codersdiary.shop/webhook/upload-image',
    },
    timeout: 30000,
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = N8N_CONFIG;
}
EOF
        echo "✅ Configuration updated!"
    fi
fi

echo ""
echo "🌐 Starting web server..."
echo ""
echo "📱 Open in your browser: http://localhost:8000"
echo "📝 Admin panel: http://localhost:8000/admin.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd public
python3 -m http.server 8000
