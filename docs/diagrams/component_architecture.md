# Component Diagram – Architecture (Mermaid)

```mermaid
flowchart LR
  subgraph Browser[Frontend (Browser)]
    UI[SPA UI\nHTML/CSS/JS]
    Charts[Chart.js]
  end

  subgraph Server[Backend API (Flask)]
    Routes[Blueprints: auth, profile, transactions, goals, moods, wallets]
    ORM[SQLAlchemy ORM]
  end

  subgraph Storage[Database]
    DB[(SQLite)]
  end

  UI-->Routes
  Charts-->UI
  Routes-->ORM
  ORM-->DB
```
