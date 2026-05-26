# k6 Load & Stress Testing Suite

This directory contains a professional-grade, multi-level load and stress testing suite built using **k6** (Grafana). It is designed to simulate realistic traveler behaviors, test server-side rendering (SSR), and inspect database/API write capacity.

---

## ⚡ Getting Started

### 1. Install k6
k6 is a compiled binary. Install it on your host system:

* **Windows (via Winget)**:
  ```powershell
  winget install grafana.k6
  ```
* **macOS (via Homebrew)**:
  ```bash
  brew install k6
  ```
* **Linux (Debian/Ubuntu)**:
  ```bash
  sudo gpg -k
  sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5DCC117B3C11D1D45A771A412503461EE2396B0
  echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
  sudo apt-get update
  sudo apt-get install k6
  ```

---

## 🚀 Running the Tests

To test your local application, first start your dev server or production build:
```bash
# Start your local server
npm run dev
```

Then, run any of the following load testing profiles in a separate terminal from your project root:

### 1. Light Load Test (50–100 VUs)
* **Goal**: Verifies routing stability, quick page transfers, and baseline SLO checks.
* **Run command**:
  ```bash
  npm run test:load:light
  ```

### 2. Medium Load Test (500 VUs)
* **Goal**: Ramps up to 500 concurrent virtual users to evaluate performance under peak production levels.
* **Run command**:
  ```bash
  npm run test:load:medium
  ```

### 3. Heavy Stress Test (1200+ VUs)
* **Goal**: Hard stress test to identify database connection pools, memory exhaustions, and CPU limits.
* **Run command**:
  ```bash
  npm run test:load:stress
  ```

### 4. Spike Test (Sudden Bursts)
* **Goal**: Sharp surge up to 800 users in 20 seconds, inspecting scale queuing, cold starts, and recovery rates.
* **Run command**:
  ```bash
  npm run test:load:spike
  ```

### 5. Endurance Test (Soak Testing)
* **Goal**: Moderate load (150 users) held constant for 5+ minutes to check for memory leaks or query performance decay.
* **Run command**:
  ```bash
  npm run test:load:endurance
  ```

---

## 📊 Viewing HTML Reports

Upon completion of any load test, the suite automatically compiles the performance telemetry into a highly detailed and interactive **HTML Summary Report**:

* **File Generated**: `summary.html` in your project root.
* **How to view**: Simply double-click `summary.html` to open it in any web browser.
* **Metrics Tracked**:
  * Response duration percentiles (p50 median, p90, p95, p99 peak latencies).
  * Request throughput and data transfer speeds.
  * Status code verification rates and assertion error checks.
  * SLO threshold validation.

---

## ⚙️ Custom Configurations
If you are running the test against a staging or production URL (e.g., hosted on Vercel), override the default URL using the `BASE_URL` environment variable:
```bash
# Example running stress test against production
npx cross-env BASE_URL=https://my-travel-site.vercel.app npm run test:load:light
```
