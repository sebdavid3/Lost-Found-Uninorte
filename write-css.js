const fs = require('fs');
const content = `@import "tailwindcss";

@theme {
  --color-brand-black: #000000;
  --color-brand-near-black: #17171c;
  --color-brand-green: #003c33;
  --color-brand-navy: #071829;
  --color-brand-blue: #1863dc;
  --color-brand-coral: #ff7759;

  --color-status-pending: #f59e0b;
  --color-status-approved: #10b981;
  --color-status-rejected: #ef4444;

  --color-surface-stone: #eeece7;
  --color-surface-green-wash: #edfce9;
  --color-surface-blue-wash: #f1f5ff;

  --color-ink: #212121;
  --color-muted: #93939f;

  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-pill: 24px;

  --font-display: "Space Grotesk", "Inter", sans-serif;
  --font-body: "Inter", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
`;
fs.writeFileSync('frontend/src/index.css', content);
console.log('Successfully wrote frontend/src/index.css');
