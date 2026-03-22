# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── bookmark-dapp/      # Decentralized Bookmark Manager dApp (React + Vite)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Decentralized Bookmark Manager dApp

### What It Does

A blockchain-based bookmark manager where users connect their MetaMask wallet and save bookmarks on-chain via a Solidity smart contract deployed to Rootstock Testnet (Chain ID: 31).

### Key Files

- `artifacts/bookmark-dapp/contracts/BookmarkManager.sol` — Solidity smart contract
- `artifacts/bookmark-dapp/src/lib/contract.ts` — ABI, chain config, contract helpers
- `artifacts/bookmark-dapp/src/hooks/useWallet.ts` — MetaMask wallet connection hook
- `artifacts/bookmark-dapp/src/hooks/useBookmarks.ts` — Bookmark CRUD operations via ethers.js
- `artifacts/bookmark-dapp/src/pages/Home.tsx` — Main UI page
- `artifacts/bookmark-dapp/DEPLOY_CONTRACT.md` — Guide to deploy the contract with Hardhat

### Environment Variables

- `VITE_RPC_URL` — Alchemy RPC URL for Rootstock Testnet (already set)
- `VITE_CONTRACT_ADDRESS` — Deployed BookmarkManager contract address (must be set after deployment)

### Contract Deployment

See `artifacts/bookmark-dapp/DEPLOY_CONTRACT.md` for a step-by-step Hardhat deployment guide. After deployment, set `VITE_CONTRACT_ADDRESS` in Replit Secrets.

### Features

- Wallet connection (MetaMask) with automatic Rootstock Testnet network switching
- Add bookmarks (title, URL, optional tag) stored on-chain
- View all bookmarks for the connected wallet
- Delete bookmarks (soft delete via on-chain transaction)
- Tag-based filtering
- Refresh button to re-fetch from chain

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
