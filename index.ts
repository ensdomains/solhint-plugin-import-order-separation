// Solhint plugin: import-order-separation
// Recreates the idea of `importOrderSeparation` from prettier-plugin-sort-imports
// for Solidity imports using Solhint's class-based rules API.

type ImportDirectiveNode = {
  type: string;
  loc?: { start: { line: number }; end: { line: number } };
  path?: { type: string; value: string } | string;
};

// Grouping helper: first matching regex wins
function selectGroupIndex(importPath: string, patterns?: string[]): number {
  if (Array.isArray(patterns) && patterns.length > 0) {
    for (let i = 0; i < patterns.length; i++) {
      const raw = patterns[i];
      if (typeof raw !== "string") continue;
      try {
        const re = new RegExp(raw);
        if (re.test(importPath)) return i;
      } catch {
        // Ignore invalid regex; continue
      }
    }
    // Non-matching imports go last
    return patterns.length;
  }
  // Default grouping similar to JS: external vs relative
  return importPath.startsWith(".") ? 1 : 0;
}

function sourcePath(node: ImportDirectiveNode): string | undefined {
  const anyNode = node as any;
  const p = anyNode.path;
  if (typeof p === "string") return p;
  if (p && typeof p.value === "string") return p.value;
  if (p && typeof p.name === "string") return p.name;
  return undefined;
}

// Rule implemented as a class per Solhint's plugin guide
class ImportOrderSeparationRule {
  public ruleId = "import-order-separation";
  public meta = { fixable: true } as const;
  private reporter: {
    // Solhint's reporter accepts an optional fixer function
    error: (
      node: any,
      ruleId: string,
      message: string,
      fix?: (fixer: {
        insertTextBeforeRange: (range: [number, number], text: string) => any;
      }) => any
    ) => void;
  };
  private importOrder?: string[];
  private imports: ImportDirectiveNode[] = [];
  private violations: Array<{ node: any; insertPos: number }> = [];

  constructor(reporter: any, config: any) {
    this.reporter = reporter;
    // Accept both object config or array-like [severity, options]
    let options = config;
    if (Array.isArray(config)) {
      options = config[1];
    }
    if (options && Array.isArray(options.importOrder)) {
      this.importOrder = options.importOrder;
    }
  }

  // Visitor: collect imports
  ImportDirective(node: ImportDirectiveNode) {
    if (node && node.type === "ImportDirective") {
      this.imports.push(node);
    }
  }

  // Visitor exit: analyze spacing between groups
  ["SourceUnit:exit"]() {
    if (this.imports.length < 2) {
      this.imports = [];
      return;
    }

    this.imports.sort(
      (a, b) => (a.loc?.start.line ?? 0) - (b.loc?.start.line ?? 0)
    );

    let prevGroup: number | undefined;
    let prevEndLine: number | undefined;

    // Track violations to report bottom-to-top for safe fixing
    this.violations = [];

    for (let i = 0; i < this.imports.length; i++) {
      const node = this.imports[i] as any;
      const p = sourcePath(node);
      if (!p || !node.loc) continue;
      const group = selectGroupIndex(p, this.importOrder);

      if (
        prevGroup !== undefined &&
        group !== prevGroup &&
        prevEndLine !== undefined
      ) {
        const currentStart = node.loc.start.line;
        if (currentStart < prevEndLine + 2) {
          // Prefer inserting a newline before the current import start.
          const range = Array.isArray(node.range)
            ? (node.range as [number, number])
            : undefined;
          if (range) {
            this.violations.push({ node, insertPos: range[0] });
          } else {
            // Fallback: report without fix if range is unavailable
            this.reporter.error(
              node,
              this.ruleId,
              "Expected a blank line between import groups"
            );
          }
        }
      }

      prevGroup = group;
      prevEndLine = node.loc.end.line;
    }

    // Report fixes from bottom to top to avoid range shifting issues
    for (let i = this.violations.length - 1; i >= 0; i--) {
      const v = this.violations[i];
      if (!v) continue;
      this.reporter.error(
        v.node,
        this.ruleId,
        "Expected a blank line between import groups",
        () => ({
          range: [v.insertPos, v.insertPos - 1],
          text: "\n",
        })
      );
    }

    // Reset for next file
    this.imports = [];
    this.violations = [];
  }
}

module.exports = [ImportOrderSeparationRule];
