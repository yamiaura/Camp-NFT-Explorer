# Camp NFT Collection Explorer

A web application that allows users to explore NFT collections by searching wallet addresses on the Camp Network testnet.

## Features

- Search NFTs by wallet address
- Display NFT collections with detailed metadata
- Interactive media preview modal for NFTs
- Responsive grid layout for NFT display
- Smooth scrolling navigation buttons

## Installation

1. Clone the repository
2. Open `index.html` in your browser
3. No additional dependencies required

## Usage

1. Enter a wallet address in the search field
2. Click the search button or press Enter
3. View NFT collections associated with the address
4. Click on individual NFTs to view detailed information in a modal

## API Integration

The application uses the Camp Network Blockscout API with the following endpoint:
```javascript
const API_BASE_URL = 'https://camp-network-testnet.blockscout.com/api/v2'
```
