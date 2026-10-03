# Skill: macOS AppleScript Native Bridge
**ID**: SKILL-OS-012
**Verified On**: Local Sandbox (Verification passed)

```applescript
-- Read-only calendar agenda fetch
tell application "Calendar"
    set todayEvents to (every event of calendar "Work" whose start date >= (current date) and start date < ((current date) + 1 * days))
    -- Process events safely without modification
end tell
```
