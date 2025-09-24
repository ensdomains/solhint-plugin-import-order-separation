# solhint-plugin-import-order-separation

Solhint plugin that orders Solidity `import` directives and enforces blank lines between groups — combining Solhint’s `imports-order` behavior with Prettier’s `importOrderSeparation` idea.

Use this rule instead of the built‑in `imports-order` rule. It reorders imports and, optionally, inserts a blank line when the group of the current import differs from the previous one.

## Installation

Install as a dev dependency in your project (published name would be this package):

```bash
npm i -D solhint-plugin-import-order-separation
```

## Usage

Add the plugin and rule to your `.solhint.json` (or equivalent):

```json
{
  "plugins": ["import-order-separation"],
  "rules": {
    "import-order-separation/import-order-separation": [
      "error",
      {
        "importOrder": ["^@openzeppelin/", "^@?\\w", "^\\.\\./", "^\\./"]
      }
    ]
  }
}
```

### Options

- importOrder: Array of regex strings. Determines group boundaries for blank‑line separation during fixing. If omitted, a simple default grouping is used: non‑relative (external) imports first, then relative imports.

### Ordering semantics

- Protocol/scoped and URLs first: `@...`, `http://`, `https://`.
- Bare package/folder paths (no leading `./`) before relative paths.
- Relative paths by depth: `./../../` before `./../` before `./` before `./foo`.
- Alphabetical within the same level (case‑insensitive).
- Normalizes leading `../` to `./../` during fixing.

### Notes

- Auto-fix: run Solhint with `--fix` to re‑order imports and insert blank lines between differing groups.
- This rule fully replaces `imports-order`; you don’t need both.
- Invalid regex entries in `importOrder` are ignored.

## Build

Build with TypeScript to `dist/`:

```bash
npm run build
```

Outputs:

- `dist/index.js` — CommonJS module consumed by Solhint
- `dist/index.d.ts` — TypeScript type definitions
