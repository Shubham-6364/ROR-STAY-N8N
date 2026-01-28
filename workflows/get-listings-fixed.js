// CORRECTED n8n "Get Listings from Google Sheets" workflow code
// This code should be in your n8n workflow's Code node

const listings = items.map(item => {
    const data = item.json;

    // Parse comma-separated image URLs
    let imageURLs = [];
    if (data['Image URLs']) {
        imageURLs = data['Image URLs'].split(',').map(url => url.trim());
    }

    return {
        id: data['ID'] || '',
        title: data['Title'] || '',
        description: data['Description'] || '',
        price: Number(data['Price']) || 0,
        location: data['Location'] || '',
        propertyType: data['Property Type'] || '',
        BHK: data['BHK'] || '',           // FIXED: Removed the dot before bracket
        Furnished: data['Furnished Status'] || '',  // FIXED: Use correct column name and syntax
        Area: data['Area'] || '',         // Added Area field
        features: data['Features'] || '',
        imageURLs: imageURLs,
        status: data['Status'] || 'available',
        verified: data['Verified'] || false,  // Added verified field
        timestamp: data['Timestamp'] || ''
    };
});

return listings.map(listing => ({ json: listing }));
