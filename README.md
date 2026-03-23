# cp-submit.nvim
Submit competitive programming solutions to Codeforces directly from Neovim.
This repo contains two components that work together:
- A Neovim plugin that reads your code and spins up a local server
- A browser extension that picks up the code and submits it

---

## How it works
1. You run `:CPSubmit` in Neovim
2. The plugin reads the current buffer, extracts the problem URL, and starts a temporary local HTTP server
3. The browser is opened via a custom protocol (`ext+cpsubmit://`)
4. The extension fetches the code from the local server, stores it, and redirects to the Codeforces submit page
5. The content script fills in the code and language, then clicks submit

---

## Requirements
- Neovim 0.9+
- Firefox or Chrome 104+
- The problem URL must appear somewhere in your source file

---

## Installation

### Neovim plugin
Using [lazy.nvim](https://github.com/folke/lazy.nvim):

Create a `~/.config/nvim/lua/plugins/cp-submit.lua` file with contents:

```lua
return {
  "Vishanth21/cp-submit.nvim",
  cmd = "CPSubmit",
  keys = {
    { "<leader>cp", "<cmd>CPSubmit<cr>", desc = "Submit CP problem" },
  },
}
```

### Browser extension
The extension is not on any store. Load it manually:

**Firefox:**
Will update after add-on verification.

**Chrome:**
1. Go to `chrome://extensions`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select the `extension/` folder

---

## Usage
The plugin looks for a URL anywhere in the current buffer. The recommended way to ensure it is always present is to use a template file.

A minimal template:

```cpp
/*
 * Problem: $(PROBLEM)
 * URL: $(URL)
 */
#include <bits/stdc++.h>
using namespace std;

void solve() {
}

int main() {
  ios::sync_with_stdio(0);
  cin.tie(0);
  int t;
  cin >> t;
  while (t--) {
    solve();
  }
  return 0;
}
```

When the file is opened, `$(URL)` gets filled in by competitest.nvim automatically. Then `:CPSubmit` reads that URL and handles the rest.

Supported languages: C++ (C++20 GCC 13-64), Python (PyPy 3.10)

---

## Integration with competitest.nvim
[competitest.nvim](https://github.com/xeluxee/competitest.nvim) handles the receiving side — run `:CompetiTest receive problem` while on a Codeforces problem page and it creates a file from your template with `$(URL)` and `$(PROBLEM)` filled in automatically.

From there the workflow is:
1. `:CompetiTest receive problem` — creates the file with the URL embedded
2. Write your solution
3. `:CPSubmit` — submits it

To wire up the template, point competitest at your template file and enable modifier evaluation:

```lua
require("competitest").setup({
  template_file = {
    cpp = "~/.config/nvim/template.cpp",
  },
  evaluate_template_modifiers = true,
})
```

`evaluate_template_modifiers = true` is what causes `$(URL)` to be replaced when the file is created. Without it, the URL will not be present and `:CPSubmit` will fail to find it.

---

## Adding support for more sites
Only Codeforces is supported currently. Feel free to open PRs.

---

## License
MIT