// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract NFTMarketplace is OwnableUpgradeable, ReentrancyGuardUpgradeable, ERC721URIStorageUpgradeable 
{
    uint256 private _tokenIds;

    enum State { Active, Inactive }

    struct MarketItem 
    {
        uint256 tokenId;
        string tokenURI;
        address payable seller;
        address payable owner;
        uint256 price;
        State state;
        bool sold;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    function initialize() public initializer 
    {
        __Ownable_init();
        __ReentrancyGuard_init();
    }

    function checkOwner(uint256 tokenId) public view returns (address) 
    {
        return ownerOf(tokenId);
    }

    function createToken(string memory _tokenURI, uint256 _price) public payable
    {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        createMarketItem(newTokenId, _price, _tokenURI);
    }

    function createMarketItem(uint256 tokenId, uint256 price, string memory tokenURI) private 
    {
        idToMarketItem[tokenId] = MarketItem
        (
            tokenId,
            tokenURI,
            payable(msg.sender),
            payable(address(this)),
            price,
            State.Inactive,
            false
        );
        _transfer(msg.sender, address(this), tokenId);
    }

    function getMarketItemsBySeller(address seller) public view returns (MarketItem[] memory)
    {
        uint256 itemCount = 0;
        for (uint256 i = 1; i <= _tokenIds; i++) 
        {
            if (idToMarketItem[i].seller == seller) 
            {
                itemCount++;
            }
         }
        MarketItem[] memory items = new MarketItem[](itemCount);
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= _tokenIds; i++) 
        {
            if (idToMarketItem[i].seller == seller) 
            {
                items[currentIndex] = idToMarketItem[i];
                currentIndex++;
            }
        }
        return items;
    }

    function changeItemStateAndPrice(uint256 tokenId, uint256 price, State state) public payable
    {
        require(idToMarketItem[tokenId].seller == msg.sender, "Caller is not the seller of the item");
        require(idToMarketItem[tokenId].state != state, "Item is already set to this state");
        if (state == State.Active)
        {
            require(price > 0, "Price must be at least 1 wei");
            idToMarketItem[tokenId].price = price;
            idToMarketItem[tokenId].owner = payable(address(this));
            //if (idToMarketItem[tokenId].sold)
            //{
                //_transfer(msg.sender, address(this), tokenId);
            //}
            if (checkOwner(tokenId) != address(this))
            {
                _transfer(msg.sender, address(this), tokenId);
            }
        }
        else
        {
            idToMarketItem[tokenId].price = 0 ether;
            if (idToMarketItem[tokenId].sold)
            {
                _transfer(address(this), msg.sender, tokenId);
                idToMarketItem[tokenId].owner = payable(msg.sender);
            }
        }
        idToMarketItem[tokenId].state = state;
    }

    function getActiveMarketItems() public view returns (MarketItem[] memory)
    {
        uint256 itemCount = 0;
        for (uint256 i = 1; i <= _tokenIds; i++) 
        {
            if (idToMarketItem[i].owner == address(this) && idToMarketItem[i].state == State.Active)
            {
                itemCount++;
            }
         }
        MarketItem[] memory items = new MarketItem[](itemCount);
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= _tokenIds; i++) 
        {
            if (idToMarketItem[i].owner == address(this) && idToMarketItem[i].state == State.Active)
            {
                items[currentIndex] = idToMarketItem[i];
                currentIndex++;
            }
        }
        return items;
    }

    function purchaseMarketItem(uint256 tokenId) public payable 
    {
        uint256 price = idToMarketItem[tokenId].price;
        require(idToMarketItem[tokenId].state == State.Active, "This item is not for sale");
        require(price > 0, "This item is not for sale");
        require(msg.value == price, "Please submit the asking price in order to complete the purchase");
        require(idToMarketItem[tokenId].owner != msg.sender, "You are the owner of this item already");
        require(idToMarketItem[tokenId].seller != msg.sender, "You are the seller of this item already");
        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].seller = payable(msg.sender);
        idToMarketItem[tokenId].state = State.Inactive;
        idToMarketItem[tokenId].price = 0;
        idToMarketItem[tokenId].sold = true;
        _transfer(address(this), msg.sender, tokenId);
        payable(idToMarketItem[tokenId].seller).transfer(msg.value);
    }

    function getActiveMarketItem(uint256 tokenId) public view returns (MarketItem memory) 
    {
        require(idToMarketItem[tokenId].state == State.Active, "This item is not for sale");
        return idToMarketItem[tokenId];
    }

    function transferFrom(address from, address to, uint256 tokenId) public override(ERC721Upgradeable, IERC721Upgradeable) 
    {
        safeTransferFrom(from, to, tokenId);
        idToMarketItem[tokenId].owner = payable(to);
        idToMarketItem[tokenId].seller = payable(to);
        idToMarketItem[tokenId].state = State.Inactive;
        idToMarketItem[tokenId].price = 0;
    }
}