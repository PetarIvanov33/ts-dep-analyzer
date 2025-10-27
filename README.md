# 🧩 TypeScript Dependency Analyzer

A **static and AI-assisted analysis tool** that scans TypeScript projects, builds a dependency graph, detects circular dependencies, and uses **Google Gemini AI** to generate insights, risk assessments, and refactoring recommendations.

---

## 🚀 Features

- 🔍 Scans all `.ts` and `.tsx` files in a target folder  
- 🧠 Detects **circular dependencies** between modules  
- 📊 Builds a **dependency map** showing import relationships  
- 🤖 Integrates with **Gemini AI** to:
  - Analyze architectural risks
  - Identify tightly coupled modules
  - Suggest refactoring strategies  
- 🧾 Generates structured report files (`.dep-report/analysis.json`)  
- 💬 Displays human-readable summaries in the terminal  

---

## 📁 Project Structure

```
ts-dep-analyzer/
├── src/
│   ├── cli.ts               # Entry point for CLI execution
│   ├── analyzer/
│   │   ├── index.ts         # Main orchestration logic
│   │   ├── fileScanner.ts   # Finds all .ts/.tsx files
│   │   ├── parser.ts        # Extracts imports from each file
│   │   ├── graph.ts         # Builds dependency graph and finds cycles
│   │   └── summary.ts       # Prepares structured LLM input
│   └── llm/
│       └── geminiClient.ts  # Connects to Gemini API
├── .dep-report/             # Auto-generated reports
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚙️ Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/PetarIvanov33/ts-dep-analyzer
cd ts-dep-analyzer
npm install
```

---

## 🔑 Environment Setup

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Generate a **Gemini API key**
3. Create a local `.env` file in the project root:

```bash
GEMINI_API_KEY="AIzaSyA5zHwRbbkD8XLpaa6TtpD9Jqh86WZldr0"
```

You can copy the provided `.env.example` file and fill in your key.

---

## ▶️ Usage

Run the analyzer on any TypeScript project directory (for example, the `ai-api/src` folder):

```bash
npm run start -- ../ai-api/src
```

or directly with ts-node:

```bash
ts-node src/cli.ts ../ai-api/src
```

---

## 📄 Example Output

```
=== Import Map ===
arrayUtils.ts → ./mathUtils
arrayUtils.ts → ./stringUtils
arrayUtils.ts → lodash
arrayUtils.ts → ./templateUtils
...

=== Circular Dependencies ===
templateUtils.ts → stringUtils.ts

=== Gemini AI Analysis ===
{
  "version": "1.0",
  "risks": [
    "Cyclical dependencies detected between templateUtils.ts and stringUtils.ts",
    "StatsUtils imports too many modules, violating SRP"
  ],
  "refactor_recommendations": [
    "Break circular dependencies using dependency inversion.",
    "Extract shared logic into separate independent modules."
  ]
}

=== Metrics Summary ===
Files analyzed: 5
Total imports: 13
Average imports per file: 2.60
Circular dependencies: 1

=== AI Summary ===
Top Risks:
- Cyclical dependencies detected...
- Potential for stack overflow or initialization errors.

Recommendations:
- Break the cycle between templateUtils.ts and stringUtils.ts.
- Decouple tightly coupled modules by extracting shared logic.
```

The full JSON report will be saved to:
```bash
.dep-report/analysis.json
```

---

## 🧠 How the Gemini AI Integration Works

The Gemini API receives **metadata only**:
- File names  
- Normalized dependencies  
- Circular dependency paths  
- External package names  

❗ **No source code is ever sent** — this ensures full data privacy and compliance.

Gemini processes this dependency metadata and produces:
- Risk assessments  
- Cycle explanations  
- Module clustering  
- Refactoring recommendations  

---

## 🧰 Technologies Used

- **TypeScript**
- **Node.js**
- **ts-node**
- **fast-glob**
- **Google Gemini AI API**
- **Tarjan’s SCC Algorithm**

---

## 💡 Future Enhancements

- Add visual dependency graphs (Mermaid / D3.js)
- Export reports to HTML or Markdown
- Support `.js` and `.jsx` files
- Add automated unit tests
- Provide risk scoring metrics

---

## 👨‍💻 Author

**Petar Ivanov**  
GitHub: [@PetarIvanov33](https://github.com/PetarIvanov33)

