# 💰 MoneyMate – Personal Budget Tracker

### 👩‍💻 Team Members
- **Sajeda Albarghati**
- **Tasneem Touati**

---

## 🧩 Project Overview
**MoneyMate** is a personal finance application that helps users track their income and expenses, manage spending by category, and monitor their total balance over time.  

It is designed to be lightweight, intuitive, and focused on **core algorithmic logic** — ensuring accurate balance calculations, clean data handling, and simple user interaction.  
The system can run as a **console-based Python application**, with optional data persistence using JSON or CSV.

---

## 🎯 Objectives
1. **Financial Awareness:** Help users understand and monitor their financial activity.  
2. **Data Handling Practice:** Implement robust logic for storing, validating, and displaying transactions.  
3. **Algorithmic Thinking:** Focus on balance computation and category-based expense summaries.  
4. **Software Design & Testing:** Practice modular code, UML modeling, and automated testing.  
5. **Responsible AI Usage:** Use AI for requirements, UML, documentation, and refactoring — always human-reviewed.

---

## ⚙️ Key Features
### 🟢 Income Management
Add income entries with amount, source, and date.

### 🔴 Expense Management
Record expense entries with amount, category, and description.

### 📊 Category Breakdown
Group and display expenses by category (e.g., Food, Transport, Bills, Entertainment).

### 💵 Balance Summary
Compute and display total income, total expenses, and net balance.

### 💾 Data Persistence (Optional)
Save transactions to a JSON or CSV file and reload them for future sessions.

---

## 🧠 System Design Overview
MoneyMate follows a **three-layer architecture**:

| Layer | Description |
|-------|--------------|
| **Presentation Layer** | Console interface to interact with the user (input/output). |
| **Logic Layer** | Core functions for calculations, validation, and summaries. |
| **Data Layer** | Handles optional file storage and data retrieval. |

### UML Diagrams (stored in `/design`)
- **Use Case Diagram:** User interactions (add income, add expense, view summary, save/load).  
- **Class Diagram:** Defines `Transaction`, `BudgetManager`, and data classes.  
- **Sequence Diagram:** “Add transaction” flow (input → validation → store → update summary).  
- **Component Diagram:** Interaction between CLI, logic, and data modules.

---

## 🧰 Technologies & Tools

| Category | Tool |
|-----------|------|
| **Language** | Python |
| **Data Storage** | JSON / CSV |
| **Testing** | `pytest` |
| **UML Diagrams** | PlantUML / Mermaid |
| **Docs Generation** | Markdown + AI (ChatGPT, Swimm) |
| **Version Control** | Git + GitHub |
| **CI/CD** | GitHub Actions |

---

## 🧮 Core Logic
Each transaction contains:
- **type:** `"income"` or `"expense"`
- **amount:** positive float
- **category:** for expenses only
- **date:** timestamp
- **description:** optional text

The **balance** is computed as:


README.md	Overview and setup instructions
