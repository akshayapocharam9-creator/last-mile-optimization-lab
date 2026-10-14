# Last-Mile Optimization Lab
## Deadline-Constrained Delivery Routing Heuristics & Dynamic Programming

[![DAA Project](https://img.shields.io/badge/Course-Design%20%26%20Analysis%20of%20Algorithms-blue)](https://woxsen.edu.in)
[![Institution](https://img.shields.io/badge/Institution-Woxsen%20University-purple)](https://woxsen.edu.in)
[![Team](https://img.shields.io/badge/Team-Team%207-emerald)](https://github.com/akshayapocharam9-creator)
[![License](https://img.shields.io/badge/License-MIT-slate)](LICENSE)

An interactive logistics optimization platform and pedagogical benchmark suite developed for the **Design and Analysis of Algorithms (DAA)** curriculum at the **School of Technology, Woxsen University**.

---

## 📌 Executive Summary & Academic Problem

Last-mile courier logistics balances two conflicting objectives:
1. **Customer SLA Satisfaction (Timeliness):** Parcels must reach destinations on or before strict delivery deadlines.
2. **Operational Fleet Efficiency (Cost):** Total vehicle travel distance and fleet fuel consumption must be minimized.

Standard Traveling Salesperson Problems (TSP) minimize distance alone. In contract-bound logistics, delivering even 1 minute late incurs contractual penalties. We formalize this problem using a **Lexicographic Optimization Objective**:

$$\text{Lex-Max} \quad \langle f_1(X), -f_2(X) \rangle$$

Where:
- **Primary Objective $f_1(X)$:** Maximize total on-time deliveries:
  $$f_1(X) = \sum_{i=1}^{N} \mathbb{I}(\text{arr}_i \le \text{deadline}_i)$$
- **Secondary Objective $f_2(X)$:** Minimize total tour distance:
  $$f_2(X) = \sum_{k=1}^{K} \sum_{j=1}^{M_k} \|\mathbf{x}_j^{(k)} - \mathbf{x}_{j-1}^{(k)}\|$$

### Kinematic & Dwell Constraints
- **Central Depot:** Fixed coordinate origin at $(50, 50)$.
- **Departure:** Fleet vehicles depart depot at $t_0 = 0.0\text{ min}$.
- **Customer Service Dwell Time:** Exactly $2.0\text{ minutes}$ constant service stop per customer.
- **Arrival & Departure Mechanics:**
  $$\text{arr}_i = \text{dept}_{i-1} + \frac{d(\mathbf{x}_{i-1}, \mathbf{x}_i)}{v}$$
  $$\text{dept}_i = \text{arr}_i + 2.0\text{ min}$$
- **Depot Return:** Vehicles return to the central depot after the final customer stop.

---

## ⚡ Algorithmic Suite & Complexity Taxonomy

| Algorithm | Paradigm | Time Complexity | Space Complexity | Operational Strategy |
| :--- | :--- | :---: | :---: | :--- |
| **Nearest Neighbour (NN)** | Greedy Spatial | $O(N^2)$ | $O(N)$ | Greedily selects closest unserved customer. Minimizes local distance but suffers from temporal blindness. |
| **Earliest Deadline First (EDF)** | Greedy Temporal | $O(N \log N)$ | $O(N)$ | Dispatches strictly in ascending order of customer deadlines. Ignores spatial geometry, creating severe zigzagging. |
| **Insertion Heuristic (INS)** | Constructive Heuristic | $O(N^3)$ | $O(N)$ | Considers customers in deadline order; inserts into the tour at position minimizing incremental detour while preserving feasibility. |
| **Insertion + 2-Opt (INS+2-opt)** | Local Search Optimization | $O(N^3)$ | $O(N)$ | Performs iterative pairwise subsegment reversals on INS route with a strict **Feasibility-Preserving Invariant**. |
| **Held-Karp Exact DP** | Dynamic Programming | $O(N^2 \cdot 2^N)$ | $O(N \cdot 2^N)$ | Bitmask dynamic programming over state $(S, u)$. Guarantees provable global mathematical optimality for $N \le 14$. |

---

## 📊 Reported Experimental Results (DAA Presentation Archive)

### 1. Foundational 5-Customer Benchmark ($N=5, K=1$)
| Algorithm | On-Time Deliveries | Success Rate | Route Distance | Optimality Status |
| :--- | :---: | :---: | :---: | :--- |
| **Nearest Neighbour** | 4 / 5 | 80.0% | 34.0 | Infeasible (Customer #5 late due to spatial trap) |
| **Earliest Deadline First** | 4 / 5 | 80.0% | 47.7 | Sub-optimal detour (+40.3% distance vs NN) |
| **Insertion Heuristic (INS)** | **5 / 5** | **100.0%** | **38.8** | **Feasible (Optimal balance)** |
| **INS + 2-Opt** | **5 / 5** | **100.0%** | **38.8** | **Feasible (Confirmed 2-opt optimal)** |
| **Held-Karp Exact DP** | **5 / 5** | **100.0%** | **38.8** | **Provable Global Optimum** |

### 2. Scalability Scaling Matrix Across Customer Volumes
| Customer Scale ($N$) | Nearest Neighbour | Earliest Deadline First | Insertion (INS) | INS + 2-Opt (Best) |
| :---: | :---: | :---: | :---: | :---: |
| **$N = 20$** | 67.7% | 12.3% | 79.7% | **80.0%** |
| **$N = 50$** | 75.3% | 38.3% | 92.9% | **92.9%** |
| **$N = 100$** | 81.1% | 84.7% | 97.5% | **97.5%** |
| **$N = 200$** | 84.4% | 97.0% | 100.0% | **100.0%** |

### 3. Key Findings Highlighted
- **Tightness Resilience (0.35 Slack):** Under tight deadline constraints, EDF collapses to $23.7\%$, while INS + 2-opt achieves $87.0\%$ on-time delivery.
- **Fleet Size Scaling:** Success rises from $63.1\%$ at $K=4$ vehicles to $100.0\%$ at $K=15$ vehicles.
- **Route Distance Reductions at Scale ($N=200$):** INS + 2-opt routes are $\approx 22\%$ shorter than NN and $\approx 40\%$ shorter than EDF.
- **Held-Karp Boundary:** Executes in $183.8\text{ ms}$ at $N=14$. Exponential state space ($O(N^2 \cdot 2^N)$) necessitates heuristics for real-world fleets.

---

## 🛠️ Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Pages CI/CD pipeline
├── src/
│   ├── algorithms/
│   │   ├── clustering.ts       # Polar angle sweep partitioning for multi-vehicle fleets
│   │   ├── earliestDeadlineFirst.ts # EDF implementation
│   │   ├── evaluator.ts        # Shared mathematical evaluator & kinematics
│   │   ├── generator.ts        # Mulberry32 PRNG reproducible scenario generator
│   │   ├── heldKarp.ts         # Bitmask dynamic programming exact solver
│   │   ├── insertionHeuristic.ts # Lexicographic insertion heuristic
│   │   ├── nearestNeighbour.ts # NN implementation
│   │   ├── runner.ts           # Unified algorithm executor
│   │   └── twoOpt.ts           # Feasibility-preserving 2-opt local search
│   ├── components/
│   │   ├── AboutView.tsx       # Institutional info & mathematical formulation
│   │   ├── AnalyticsView.tsx   # KPI cards & multi-series sensitivity charts
│   │   ├── ChartComponents.tsx # High-performance SVG interactive charts
│   │   ├── ComparisonView.tsx  # Side-by-side multi-algorithm comparison matrix
│   │   ├── CustomerDetailModal.tsx # Customer node telemetry inspector
│   │   ├── ExplorerView.tsx    # Algorithm educational cards & decision traces
│   │   ├── Navbar.tsx          # Top navigation header with academic credentials
│   │   ├── PresentationView.tsx # 8-stage guided presenter workflow with cue cards
│   │   ├── ReportedResultsView.tsx # Presentation archive & ground-truth tables
│   │   ├── ScalabilityView.tsx # Live in-browser benchmark suite
│   │   ├── SchematicMap.tsx    # Interactive Canvas/SVG schematic coordinate map
│   │   ├── Sidebar.tsx         # Navigation sidebar with active indicators
│   │   └── SimulationView.tsx  # Live delivery simulation & playback controls
│   ├── data/
│   │   └── reportedResults.ts  # Historical presentation experimental data
│   ├── test/
│   │   └── runVerification.ts  # 21-point automated verification test suite
│   ├── types/
│   │   └── index.ts            # TypeScript definitions & data contracts
│   ├── App.tsx                 # Root application router
│   ├── index.css               # Design system with Tailwind CSS v4
│   └── main.tsx                # Client entry point
├── index.html                  # HTML template with metadata
├── package.json                # Project dependencies & scripts
├── tsconfig.app.json           # Application TypeScript configuration
├── vercel.json                 # Vercel deployment configuration
└── vite.config.ts              # Vite & Tailwind configuration
```

---

## 🚀 Local Development & Testing

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation
```bash
# Clone the repository
git clone https://github.com/akshayapocharam9-creator/last-mile-optimization-lab.git
cd last-mile-optimization-lab

# Install dependencies
npm install
```

### Running the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Running Automated Verification Tests
```bash
npm test
```
Executes all 21 mathematical, kinematic, multi-vehicle, and algorithmic unit tests.

### Production Build
```bash
npm run build
```
Creates an optimized production bundle in `dist/`.

---

## 🏛️ Academic Credentials

- **Institution:** Woxsen University, School of Technology
- **Course:** Design and Analysis of Algorithms (DAA)
- **Team:** Team 7
- **Lead Author:** Laxmi Pocharam (`akshayapocharam9-creator`)
