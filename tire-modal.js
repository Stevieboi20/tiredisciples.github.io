// ===================================
// Tire Inventory Modal
// ===================================

// Tire data with all photos
const tireData = {
    1: {
        title: "Continental CrossContact LX 20",
        size: "275/60R20",
        tread: "70%",
        age: "22 weeks",
        price: "$170.00",
        condition: "USED",
        photos: [
            "https://images2.imgbox.com/0f/90/X3eK8pp7_o.jpg",
            "https://images2.imgbox.com/ab/b9/NEHkTOUr_o.jpg",
            "https://images2.imgbox.com/cf/d0/b7AyLgve_o.jpg"
        ]
    }
};

function openTireModal(tireId) {
    const tire = tireData[tireId];
    if (!tire) return;
    
    const modal = document.getElementById('tire-modal');
    const modalTitle = document.getElementById('modal-tire-title');
    const modalDetails = document.getElementById('modal-tire-details');
    const modalGallery = document.getElementById('modal-gallery');
    
    // Set title
    modalTitle.textContent = tire.title;
    
    // Set details
    modalDetails.innerHTML = `
        <div class="modal-detail-grid">
            <div class="modal-detail-item">
                <span class="detail-label">Condition:</span>
                <span class="detail-value">${tire.condition}</span>
            </div>
            <div class="modal-detail-item">
                <span class="detail-label">Size:</span>
                <span class="detail-value">${tire.size}</span>
            </div>
            <div class="modal-detail-item">
                <span class="detail-label">Tread:</span>
                <span class="detail-value">${tire.tread}</span>
            </div>
            <div class="modal-detail-item">
                <span class="detail-label">Age:</span>
                <span class="detail-value">${tire.age}</span>
            </div>
            <div class="modal-detail-item">
                <span class="detail-label">Price:</span>
                <span class="detail-value tire-modal-price">${tire.price}</span>
            </div>
        </div>
    `;
    
    // Set gallery
    modalGallery.innerHTML = '';
    tire.photos.forEach((photo, index) => {
        const img = document.createElement('img');
        img.src = photo;
        img.alt = `${tire.title} - Photo ${index + 1}`;
        img.className = 'modal-gallery-image';
        modalGallery.appendChild(img);
    });
    
    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeTireModal() {
    const modal = document.getElementById('tire-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('tire-modal');
    if (e.target === modal) {
        closeTireModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeTireModal();
    }
});
