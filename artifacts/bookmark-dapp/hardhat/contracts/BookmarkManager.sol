// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BookmarkManager {
    struct Bookmark {
        uint256 id;
        string title;
        string url;
        string tag;
        uint256 createdAt;
        bool deleted;
    }

    mapping(address => Bookmark[]) private userBookmarks;
    mapping(address => uint256) private nextId;

    event BookmarkAdded(address indexed user, uint256 id, string title, string url, string tag);
    event BookmarkDeleted(address indexed user, uint256 id);

    function addBookmark(
        string calldata title,
        string calldata url,
        string calldata tag
    ) external {
        require(bytes(title).length > 0, "Title required");
        require(bytes(url).length > 0, "URL required");

        uint256 id = nextId[msg.sender]++;
        userBookmarks[msg.sender].push(Bookmark({
            id: id,
            title: title,
            url: url,
            tag: tag,
            createdAt: block.timestamp,
            deleted: false
        }));

        emit BookmarkAdded(msg.sender, id, title, url, tag);
    }

    function getBookmarks() external view returns (Bookmark[] memory) {
        Bookmark[] storage all = userBookmarks[msg.sender];
        uint256 count = 0;
        for (uint256 i = 0; i < all.length; i++) {
            if (!all[i].deleted) count++;
        }

        Bookmark[] memory result = new Bookmark[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < all.length; i++) {
            if (!all[i].deleted) {
                result[idx++] = all[i];
            }
        }
        return result;
    }

    function deleteBookmark(uint256 id) external {
        Bookmark[] storage bookmarks = userBookmarks[msg.sender];
        for (uint256 i = 0; i < bookmarks.length; i++) {
            if (bookmarks[i].id == id && !bookmarks[i].deleted) {
                bookmarks[i].deleted = true;
                emit BookmarkDeleted(msg.sender, id);
                return;
            }
        }
        revert("Bookmark not found");
    }

    function getBookmarkCount() external view returns (uint256) {
        Bookmark[] storage all = userBookmarks[msg.sender];
        uint256 count = 0;
        for (uint256 i = 0; i < all.length; i++) {
            if (!all[i].deleted) count++;
        }
        return count;
    }
}
