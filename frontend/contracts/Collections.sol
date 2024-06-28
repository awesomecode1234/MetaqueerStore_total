// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFT721OpenCollection is ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _tokenIds;
    address payable public commissionReceiver;
    uint256 public commissionPercentage;

    enum State { Active, Inactive }

    struct MarketItem {
        uint256 tokenId;
        uint256 price;
        State state;
        bool sold;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event TokenCreated(uint256 indexed tokenId, address indexed owner, string tokenURI, uint256 price);
    event MarketItemListed(uint256 indexed tokenId, uint256 price, State state);
    event MarketItemPurchased(uint256 indexed tokenId, address indexed buyer, uint256 price);

    constructor(address payable _commissionReceiver, uint256 _commissionPercentage) ERC721("NFTCollection", "NFTC") {
        commissionReceiver = _commissionReceiver;
        commissionPercentage = _commissionPercentage;
    }

    function createToken(string memory tokenURI, uint256 price) public payable returns (uint256) {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        idToMarketItem[newTokenId] = MarketItem({
            tokenId: newTokenId,
            price: price,
            state: State.Inactive,
            sold: false
        });

        emit TokenCreated(newTokenId, msg.sender, tokenURI, price);
        return newTokenId;
    }
}
