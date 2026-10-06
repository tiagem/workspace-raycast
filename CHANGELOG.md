# Changelog

## [2.1.0] - {PR_MERGE_DATE}

### Added

- Full feature parity with workspace-vicinae: tags with per-project assignment and filtering, usage statistics, project discovery (scan depth, ignore patterns, marker detection, nested projects), README preview, stash count, and backup versioning.
- Settings import accepts both Raycast (`bundleId`) and Vicinae (`id`) app backups.

### Improved

- Upgraded to Raycast API 2.x for Raycast 2.0 (Node 22 runtime, React 19): platform-aware common shortcuts, updated icons, and TypeScript 6 compatible configuration.
- Terminal action falls back to the system Terminal when no terminal app is configured.

### Added

- Initial workspace project management with folder addition and filtering.
- Git status tracking (pull/push indicators, current branch).
- Project pinning for quick access to favorite projects.
- Customizable application overrides per folder/project.
- Dedicated copy actions for project names and paths.
- Initial onboarding experience for setup.
- Advanced settings for default application and workspace management.

### Fixed

- Resolved conflict with Raycast reserved shortcut `cmd + p` (changed to `cmd + shift + p` for pinning).
- Prevented flickering "No Workspaces" view during initial loading.

### Improved

- Added navigation titles to nested screens for better user context.
