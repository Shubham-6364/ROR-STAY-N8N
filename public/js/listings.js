/**
 * Listings Display and Filter
 * Fetches property listings from n8n webhook → Google Sheets
 */

let allListings = [];
let filteredListings = [];
let currentPage = 1;
const itemsPerPage = 9;

// Load listings on page load
document.addEventListener('DOMContentLoaded', async function () {
    await loadListings();
    setupFilters();
});

/**
 * Load all listings from n8n
 */
async function loadListings() {
    const listingsGrid = document.getElementById('listingsGrid');
    const loadingDiv = document.getElementById('loading');

    try {
        loadingDiv.style.display = 'block';

        // Fetch from n8n webhook
        const response = await fetch(N8N_CONFIG.webhooks.getListings);

        if (!response.ok) {
            throw new Error('Failed to load listings');
        }

        const data = await response.json();

        // Normalize data: Map Google Sheets column names to JavaScript properties
        // Google Sheets uses "BHK", "Furnished Status", "Property Type", "Image URLs"
        // We need: bhk, furnished, propertyType, imageURLs
        allListings = (Array.isArray(data) ? data : []).map(listing => ({
            ...listing,
            // Map column names to camelCase properties
            // Convert BHK to string since filter dropdown values are strings
            bhk: listing.bhk ? String(listing.bhk) : (listing.BHK ? String(listing.BHK) : null),
            furnished: listing.furnished || listing.Furnished || listing['Furnished Status'] || null,
            area: listing.area ? String(listing.area) : (listing.Area ? String(listing.Area) : null),
            propertyType: listing.propertyType || listing['Property Type'] || null,
            imageURLs: listing.imageURLs || (listing['Image URLs'] ? listing['Image URLs'].split(',').map(url => url.trim()) : []),
            id: listing.id || listing.ID || null,
            title: listing.title || listing.Title || null,
            description: listing.description || listing.Description || null,
            price: listing.price || listing.Price || null,
            location: listing.location || listing.Location || null,
            features: listing.features || listing.Features || null,
            status: listing.status || listing.Status || null,
            verified: listing.verified || listing.Verified || false,
        }));



        filteredListings = [...allListings];

        displayListings();

    } catch (error) {
        console.error('Error loading listings:', error);
        listingsGrid.innerHTML = '<p class="error">Failed to load properties. Please refresh.</p>';
    } finally {
        loadingDiv.style.display = 'none';
    }
}

/**
 * Display listings in grid
 */
function displayListings() {
    const listingsGrid = document.getElementById('listingsGrid');

    if (filteredListings.length === 0) {
        listingsGrid.innerHTML = `
            <div class="empty-state">
                <h3>No properties found</h3>
                <p>Try adjusting your filters to see more results</p>
            </div>
        `;
        document.getElementById('paginationControls').innerHTML = '';
        return;
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedListings = filteredListings.slice(startIndex, endIndex);

    listingsGrid.innerHTML = paginatedListings.map((listing, listingIndex) => {
        const title = listing.title || 'Property';
        const location = listing.location || 'Location not specified';
        const price = Number(listing.price || 0).toLocaleString('en-IN');
        const propertyType = listing.propertyType || 'N/A';
        const description = listing.description || '';
        const images = listing.imageURLs || [];

        // Get values from n8n columns (bhk and furnished are separate columns now)
        const bhk = listing.bhk;
        const bhkDisplay = bhk ? `${bhk} BHK` : null;
        const area = listing.area || extractArea(description);
        const furnished = listing.furnished;
        const features = listing.features ? listing.features.split(',').map(f => f.trim()).filter(f => f) : [];

        const imagesHTML = images.length > 0 ? `
            <div class="listing-image-carousel" data-listing="${listingIndex}">
                ${images.map((img, idx) => `
                    <img src="${img}" alt="${title}" loading="lazy"
                         class="carousel-image ${idx === 0 ? 'active' : ''}" data-index="${idx}">
                `).join('')}
                ${images.length > 1 ? `
                    <button class="carousel-btn carousel-prev" onclick="changeImage(${listingIndex}, -1)">‹</button>
                    <button class="carousel-btn carousel-next" onclick="changeImage(${listingIndex}, 1)">›</button>
                    <div class="carousel-dots">
                        ${images.map((_, idx) => `
                            <span class="carousel-dot ${idx === 0 ? 'active' : ''}" 
                                  onclick="goToImage(${listingIndex}, ${idx})"></span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        ` : `<img src="https://via.placeholder.com/400x300?text=No+Image" alt="No image" loading="lazy">`;

        return `
            <div class="listing-card">
                ${listing.verified ? '<span class="listing-badge">✓ VERIFIED</span>' : ''}
                <button class="btn-icon-only btn-inquire-icon" onclick="contactProperty('${listing.id}', '${title}')" title="Inquire about this property" aria-label="Inquire">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                </button>
                <div class="listing-image">
                    ${imagesHTML}
                    ${propertyType ? `<div class="listing-badges"><span class="listing-tag">${propertyType}</span></div>` : ''}
                </div>
                <div class="listing-content">
                    <p style="font-size: 0.75rem; color: var(--gray-500); margin-bottom: 0.5rem;">ID: ${listing.id}</p>
                    <h3 class="listing-title">${title}</h3>
                    <div class="listing-price-inline">₹${price}<span>/month</span></div>
                    <p class="listing-location">📍 ${location}</p>
                    ${area ? `
                        <div class="listing-features">
                            <div class="listing-feature-item">📐 <span>${area} sq.ft</span></div>
                        </div>
                    ` : ''}
                    
                    ${features.length > 0 ? `
                        <div class="listing-amenities">
                            ${features.map(feature => `<span class="amenity-badge">${feature}</span>`).join('')}
                        </div>
                    ` : ''}
                    
                    ${description ? `<p class="listing-description">${description.substring(0, 100)}${description.length > 100 ? '...' : ''}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');

    renderPagination();
}

function changeImage(listingIndex, direction) {
    const carousel = document.querySelector(`[data-listing="${listingIndex}"]`);
    if (!carousel) return;
    const images = carousel.querySelectorAll('.carousel-image');
    const dots = carousel.querySelectorAll('.carousel-dot');
    let currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
    images[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + direction + images.length) % images.length;
    images[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');
}

function goToImage(listingIndex, index) {
    const carousel = document.querySelector(`[data-listing="${listingIndex}"]`);
    if (!carousel) return;
    const images = carousel.querySelectorAll('.carousel-image');
    const dots = carousel.querySelectorAll('.carousel-dot');
    images.forEach(img => img.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    images[index].classList.add('active');
    dots[index].classList.add('active');
}

// Helper functions to extract info from description
function extractBHK(text) {
    const match = text?.match(/(\d+)\s*BHK/i);
    return match ? `${match[1]} BHK` : null;
}

function extractArea(text) {
    const match = text?.match(/(\d+)\s*(sq\.?\s*ft|sqft|square\s*feet)/i);
    return match ? match[1] : null;
}

function extractFurnished(text) {
    if (text?.match(/fully\s*furnished/i)) return 'Fully Furnished';
    if (text?.match(/semi\s*furnished/i)) return 'Semi Furnished';
    if (text?.match(/unfurnished/i)) return 'Unfurnished';
    return null;
}

/**
 * Setup filter controls
 */
function setupFilters() {
    const filterLocation = document.getElementById('filterLocation');
    const filterPriceRange = document.getElementById('filterPriceRange');
    const filterPropertyType = document.getElementById('filterPropertyType');
    const filterBHK = document.getElementById('filterBHK');
    const filterFurnished = document.getElementById('filterFurnished');

    if (filterLocation) filterLocation.addEventListener('change', applyFilters);
    if (filterPriceRange) filterPriceRange.addEventListener('change', applyFilters);
    if (filterPropertyType) filterPropertyType.addEventListener('change', applyFilters);
    if (filterBHK) filterBHK.addEventListener('change', applyFilters);
    if (filterFurnished) filterFurnished.addEventListener('change', applyFilters);
}

/**
 * Apply filters to listings
 */
function applyFilters() {
    const location = document.getElementById('filterLocation')?.value || '';
    const priceRange = document.getElementById('filterPriceRange')?.value || '';
    const propertyType = document.getElementById('filterPropertyType')?.value || '';
    const bhk = document.getElementById('filterBHK')?.value || '';
    const furnished = document.getElementById('filterFurnished')?.value || '';


    filteredListings = allListings.filter(listing => {
        // Location filter
        if (location && listing.location?.toLowerCase() !== location.toLowerCase()) {
            return false;
        }

        // Property type filter
        if (propertyType && listing.propertyType !== propertyType) {
            return false;
        }

        // BHK filter (bhk value in listing is "1", "2", "3", "4")
        if (bhk && listing.bhk !== bhk) {
            return false;
        }

        // Furnished filter (furnished value is "Fully Furnished", "Semi Furnished", "Unfurnished")
        if (furnished && listing.furnished !== furnished) {
            return false;
        }

        // Price range filter
        if (priceRange) {
            const price = Number(listing.price) || 0;
            const [min, max] = priceRange.split('-').map(Number);
            if (max && (price < min || price > max)) return false;
            if (!max && price < min) return false;
        }

        return true;
    });

    currentPage = 1;
    displayListings();
}

/**
 * Clear all filters
 */
function clearFilters() {
    document.getElementById('filterLocation').value = '';
    document.getElementById('filterPriceRange').value = '';
    document.getElementById('filterPropertyType').value = '';
    const bhkFilter = document.getElementById('filterBHK');
    const furnishedFilter = document.getElementById('filterFurnished');

    if (bhkFilter) bhkFilter.value = '';
    if (furnishedFilter) furnishedFilter.value = '';

    filteredListings = [...allListings];
    currentPage = 1;
    displayListings();
}

/**
 * View property details
 */
function viewDetails(listingId) {
    // Find the listing
    const listing = allListings.find(l => l.id === listingId);
    if (!listing) return;

    // Scroll to contact form with property details
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        const requirementsField = document.getElementById('requirements');
        if (requirementsField) {
            requirementsField.value = `I would like more details about: ${listing.title} (₹${Number(listing.price || 0).toLocaleString('en-IN')}/month)`;
        }
    }
}

/**
 * Contact property owner
 */
function contactProperty(listingId, title) {
    // Scroll to contact form
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        // Pre-fill message
        const requirementsField = document.getElementById('requirements');
        if (requirementsField) {
            requirementsField.value = `I'm interested in: ${title} (ID: ${listingId}). Please share more details.`;
        }
    }
}

/**
 * Get total number of pages
 */
function getTotalPages() {
    return Math.ceil(filteredListings.length / itemsPerPage);
}

/**
 * Navigate to specific page
 */
function goToPage(pageNumber) {
    const totalPages = getTotalPages();
    if (pageNumber < 1 || pageNumber > totalPages) return;

    currentPage = pageNumber;
    displayListings();

    // Scroll to top of listings
    document.getElementById('listings').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Render pagination controls
 */
function renderPagination() {
    const paginationContainer = document.getElementById('paginationControls');
    const totalPages = getTotalPages();

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '<div class="pagination-controls">';

    // Previous button
    paginationHTML += `
        <button class="pagination-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Previous
        </button>
    `;

    // Page numbers
    paginationHTML += '<div class="pagination-numbers">';

    // Show max 7 page numbers
    let startPage = Math.max(1, currentPage - 3);
    let endPage = Math.min(totalPages, currentPage + 3);

    // Adjust if at the beginning or end
    if (currentPage <= 3) {
        endPage = Math.min(7, totalPages);
    }
    if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 6);
    }

    // First page
    if (startPage > 1) {
        paginationHTML += `<button class="page-number" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += '<span class="pagination-ellipsis">...</span>';
        }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="page-number ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">
                ${i}
            </button>
        `;
    }

    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += '<span class="pagination-ellipsis">...</span>';
        }
        paginationHTML += `<button class="page-number" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    paginationHTML += '</div>';

    // Next button
    paginationHTML += `
        <button class="pagination-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            Next
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        </button>
    `;

    paginationHTML += '</div>';

    paginationContainer.innerHTML = paginationHTML;
}
