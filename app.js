const API_BASE_URL = 'https://camp-network-testnet.blockscout.com/api/v2';
let currentAddress = '';

// DOM Elements
const walletInput = document.getElementById('walletAddress');
const searchButton = document.getElementById('searchButton');
const resultsDiv = document.getElementById('results');
const modal = document.getElementById('mediaModal');
const closeModalBtn = document.getElementById('closeModal');
const topButton = document.getElementById('topButton');
const bottomButton = document.getElementById('bottomButton');
const header = document.querySelector('.header');

// Event Listeners
searchButton.addEventListener('click', searchNFTs);
walletInput.addEventListener('keypress', handleEnterKey);
closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', handleOutsideModalClick);

// Scroll Handlers
window.onscroll = function() {
    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPosition = window.pageYOffset;
    
    // Show/hide top button
    if (scrollPosition > 200) {
        topButton.classList.add('visible');
    } else {
        topButton.classList.remove('visible');
    }
    
    // Show/hide bottom button
    if (scrollPosition < (scrollTotal - 200)) {
        bottomButton.classList.add('visible');
    } else {
        bottomButton.classList.remove('visible');
    }
    
    // Add shadow to header when scrolling
    if (scrollPosition > 0) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
};

topButton.onclick = function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

bottomButton.onclick = function() {
    window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
    });
};

async function searchNFTs() {
    const address = walletInput.value.trim();
    
    if (!address) {
        showError('Please enter a wallet address');
        return;
    }

    currentAddress = address;
    showLoading();

    try {
        const response = await fetch(
            `${API_BASE_URL}/addresses/${address}/nft/collections?type=ERC-721,ERC-404,ERC-1155`
        );
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            showError('No NFTs found for this address');
            return;
        }

        displayCollections(data.items);
    } catch (error) {
        showError(`Error: ${error.message}`);
    }
}

function displayCollections(collections) {
    let html = '';

    collections.forEach(collection => {
        const totalNFTs = collection.amount;
        const displayedNFTs = collection.token_instances.length;
        
        html += `
            <div class="collection-card">
                <div class="collection-header">
                    <div>
                        <h3>${collection.token.name || 'Unnamed Collection'}</h3>
                        <div class="collection-info">
                            <p>Total NFTs: ${totalNFTs}</p>
                            <p>Token Type: ${collection.token.type}</p>
                        </div>
                    </div>
                </div>
                <div class="nft-grid">
                    ${displayNFTs(collection.token_instances, collection.token)}
                </div>
                ${totalNFTs > displayedNFTs ? `
                    <div class="view-all-container">
                        <a href="https://camp-network-testnet.blockscout.com/token/${collection.token.address}?tab=inventory&holder_address_hash=${currentAddress}" 
                           class="view-all-btn" 
                           target="_blank">
                            View All NFTs on Blockscout
                        </a>
                    </div>
                ` : ''}
            </div>
        `;
    });

    resultsDiv.innerHTML = html;
}

function displayNFTs(nfts, collectionToken) {
    return nfts.map(nft => {
        const hasVideo = nft.animation_url;
        const hasImage = nft.image_url;
        const mediaUrl = hasVideo || hasImage;
        const name = nft.metadata?.name || `Token ID: ${nft.id}`;
        
        const nftData = {
            ...nft,
            collection: {
                name: collectionToken.name || 'Unnamed Collection',
                symbol: collectionToken.symbol,
                type: collectionToken.type,
                address: collectionToken.address
            }
        };
        
        return `
            <div class="nft-item" onclick='showMediaPreview(${JSON.stringify({
                url: mediaUrl,
                type: hasVideo ? 'video' : 'image',
                nftData: nftData
            }).replace(/'/g, "&apos;")})'>
                <div class="media-container">
                    ${createMediaElement(hasVideo, nft.animation_url, hasImage, nft.image_url, name)}
                </div>
                <h4>${name}</h4>
                ${createDescription(nft.metadata?.description)}
            </div>
        `;
    }).join('');
}

function createMediaElement(hasVideo, videoUrl, hasImage, imageUrl, name) {
    if (hasVideo) {
        return `
            <video class="media-content" muted loop>
                <source src="${videoUrl}" type="video/mp4">
            </video>`;
    }
    return `
        <img src="${hasImage ? imageUrl : 'placeholder.png'}" 
             class="media-content"
             alt="${name}"
             onerror="this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='">`;
}

function createDescription(description) {
    if (!description) return '';
    return `<p class="nft-description">${description}</p>`;
}

function showMediaPreview({ url, type, nftData }) {
    const modalContent = document.getElementById('modalContent');
    const metadata = nftData.metadata || {};
    
    modalContent.innerHTML = `
        <span class="close-modal" onclick="closeModal()">×</span>
        <div class="modal-header">
            <h3>${metadata.name || `Token ID: ${nftData.id}`}</h3>
            <p class="collection-info">
                ${nftData.collection.name} 
                ${nftData.collection.symbol ? `(${nftData.collection.symbol})` : ''}
            </p>
        </div>

        <div class="modal-media">
            ${type === 'video' ?
                `<video controls autoplay loop style="max-width: 100%; max-height: 50vh;">
                    <source src="${url}" type="video/mp4">
                </video>` :
                `<img src="${url}" alt="${metadata.name || ''}" style="max-width: 100%; max-height: 50vh;">`
            }
        </div>

        <div class="modal-details">
            <div class="details-section">
                <h4>Details</h4>
                <p><strong>Token ID:</strong> ${nftData.id}</p>
                <p><strong>Token Type:</strong> ${nftData.collection.type}</p>
                <p><strong>Contract Address:</strong></p>
                <a href="https://camp-network-testnet.blockscout.com/token/${nftData.collection.address}" 
                   target="_blank"
                   class="contract-address">
                    ${nftData.collection.address}
                </a>
            </div>

            ${metadata.description ? `
                <div class="details-section">
                    <h4>Description</h4>
                    <p>${metadata.description}</p>
                </div>
            ` : ''}

            ${metadata.attributes && metadata.attributes.length > 0 ? `
                <div class="details-section">
                    <h4>Attributes</h4>
                    <div class="attributes-grid">
                        ${displayAttributes(metadata.attributes)}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    modal.style.display = 'flex';
}

function displayAttributes(attributes) {
    if (!Array.isArray(attributes)) return '';
    return attributes.map(attr => `
        <div class="attribute-item">
            <span class="attribute-type">${attr.trait_type}</span>
            <span class="attribute-value">${attr.value}</span>
            ${attr.rarity ? `<span class="attribute-rarity">${attr.rarity}% have this trait</span>` : ''}
        </div>
    `).join('');
}

function closeModal() {
    modal.style.display = 'none';
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        searchNFTs();
    }
}

function handleOutsideModalClick(event) {
    if (event.target === modal) {
        closeModal();
    }
}

function showError(message) {
    resultsDiv.innerHTML = `<div class="error">${message}</div>`;
}

function showLoading() {
    resultsDiv.innerHTML = '<div class="loading">Loading your NFT collections...</div>';
}
