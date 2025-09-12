# solhint-plugin-import-order-separation

Solhint plugin that enforces a blank line between groups of `import` directives in Solidity files — similar to Prettier’s `importOrderSeparation` option from `prettier-plugin-sort-imports`.

The rule is intentionally simple and dependency‑light. It detects consecutive `ImportDirective` nodes and requires a blank line whenever the group of the current import differs from the previous one.

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
    "import-order-separation/import-order-separation": ["error", {
      "importOrder": ["^@openzeppelin/", "^@?\\w", "^\\.\\./", "^\\./"]
    }]
  }
}
```

### Options

- importOrder: Array of regex strings. The first matching pattern determines a group index; a blank line is required when the group index changes between consecutive imports. If omitted, a simple default grouping is used: non‑relative (external) imports first, then relative imports.

### Notes

- Auto-fix: run Solhint with `--fix` to automatically insert a blank line between differing import groups.
- Invalid regex entries in `importOrder` are ignored.

## Build

Build with TypeScript to `dist/`:

```bash
npm run build
```

Outputs:
- `dist/index.js` — CommonJS module consumed by Solhint
- `dist/index.d.ts` — TypeScript type definitions
