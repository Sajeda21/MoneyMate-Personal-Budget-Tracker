# MoneyMate UML Diagrams

This folder contains UML diagrams for the MoneyMate web app. For each diagram, we provide:

- A Markdown file (.md) with the Mermaid source code
- A rendered PNG image (.png)

Diagrams included:
- usecase_diagram: Main user interactions (Register/Login, Add Expense, View Summary, Edit Profile)
- class_diagram: Domain classes (User, Transaction, Category, Report)
- sequence_add_expense: “Add Expense” flow (validate → save → confirmation)
- sequence_view_breakdown: “View Expense Breakdown” (fetch → aggregate → display chart)
- component_architecture: Frontend ↔ Backend API ↔ Database deployment view

Notes:
- These diagrams reflect the current feature set: user accounts, expenses, summaries/reports, and charts.
- They were AI-assisted but manually reviewed and adjusted for accuracy.
