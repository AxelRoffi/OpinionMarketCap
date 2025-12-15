# Contracts Directory Structure

## Active Contracts (Currently Deployed)
The `active/` directory contains contracts currently deployed and in use:
- **OpinionCoreNoMod.sol** - Main contract on Base mainnet
- **FeeManager.sol** - Handles fee distribution
- **PoolManager.sol** - Manages prediction pools
- Supporting interfaces, libraries, and structs

## Core Directory (Development Versions)
The `core/` directory contains the current development versions:
- **OpinionCore.sol** - Full-featured version (too large for mainnet)
- **MonitoringManager.sol** - Advanced monitoring features
- **SecurityManager.sol** - Enhanced security features

## Archive Directory
The `_archive/` directory contains:
- `old_versions/` - Deprecated contract versions
- `backup_versions/` - Backup files (.bak)

## Important Notes
- Mainnet deployment uses `OpinionCoreNoMod` due to contract size limits
- Future V2 deployment will use modular architecture to overcome size constraints
- Always test on Base Sepolia before mainnet deployment