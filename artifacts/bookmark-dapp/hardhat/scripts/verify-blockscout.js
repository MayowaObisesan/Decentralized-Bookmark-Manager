const https = require("https");

const CONTRACT_ADDRESS = "0x8CAE925968731223b257E5819F40509A2bAA1066";
// Blockscout v2 API endpoint for flattened source verification
const BLOCKSCOUT_HOST = "rootstock-testnet.blockscout.com";
const PATH = `/api/v2/smart-contracts/${CONTRACT_ADDRESS}/verification/via/flattened-code`;

const SOURCE_CODE = `// SPDX-License-Identifier: MIT
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
}`;

const payload = JSON.stringify({
  compiler_version: "v0.8.20+commit.a1b79de6",
  source_code: SOURCE_CODE,
  is_optimization_enabled: true,
  optimization_runs: 200,
  evm_version: "paris",
  contract_name: "BookmarkManager",
  autodetect_constructor_args: true,
});

const options = {
  hostname: BLOCKSCOUT_HOST,
  path: PATH,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  },
};

console.log("Submitting verification via Blockscout v2 API...");
console.log("Contract:", CONTRACT_ADDRESS);
console.log("URL: https://" + BLOCKSCOUT_HOST + PATH);

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    console.log("\nHTTP Status:", res.statusCode);
    try {
      const json = JSON.parse(data);
      console.log("Response:", JSON.stringify(json, null, 2));

      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log("\n✅ Verification submitted successfully!");
        console.log(
          "View on explorer: https://rootstock-testnet.blockscout.com/address/" +
            CONTRACT_ADDRESS +
            "?tab=contract"
        );
      } else {
        console.log("\n❌ Verification issue. See response above.");
      }
    } catch (e) {
      console.log("Raw response:", data);
    }
  });
});

req.on("error", (e) => console.error("Request error:", e.message));
req.write(payload);
req.end();
