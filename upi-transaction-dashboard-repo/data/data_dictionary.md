# Data Dictionary — UPI Transaction Dataset 2024

> **Source:** Kaggle — publicly available dataset  
> **Cleaned & transformed using:** Power Query in Power BI Desktop  
> **Full dataset:** 2,50,000 rows · 17 columns  
> **Sample uploaded:** First 1,000 rows (cleaned)

---

## Column Descriptions (All 17 Columns)

| # | Column Name | Data Type | Description | Example Value |
|---|---|---|---|---|
| 1 | **transaction_id** | Text | Unique identifier for each UPI transaction | TXN0000000001 |
| 2 | **timestamp** | DateTime | Combined date and time of transaction | 2024-10-08 15:17:28 |
| 3 | **transaction_type** | Text | P2P = Person to Person · P2M = Person to Merchant | P2P |
| 4 | **merchant_category** | Text | Category of receiving merchant | Grocery · Food · Entertainment · Fuel · Shopping · Healthcare · Utilities · Transport · Bill Payment · Recharge · Other |
| 5 | **amount (INR)** | Number | Transaction value in Indian Rupees | 868 |
| 6 | **transaction_status** | Text | Outcome of the transaction | SUCCESS / FAILED |
| 7 | **sender_age_group** | Text | Age bracket of the person sending money | 18-25 · 26-35 · 36-45 · 46-55 · 56+ |
| 8 | **receiver_age_group** | Text | Age bracket of the person receiving money | 18-25 · 26-35 · 36-45 · 46-55 · 56+ |
| 9 | **sender_state** | Text | Indian state where transaction originated | Delhi · Maharashtra · Karnataka · Gujarat · Rajasthan · Telangana · Uttar Pradesh · Tamil Nadu |
| 10 | **sender_bank** | Text | Bank of the person sending money | SBI · HDFC · ICICI · Axis · Yes Bank · Kotak · IndusInd · PNB |
| 11 | **receiver_bank** | Text | Bank of the person receiving money | SBI · HDFC · ICICI · Axis · Yes Bank · Kotak · IndusInd · PNB |
| 12 | **device_type** | Text | Device used to initiate transaction | Android · iOS |
| 13 | **network_type** | Text | Telecom network used | 3G · 4G · 5G · WiFi · Web |
| 14 | **fraud_flag** | Number | Fraud indicator — 0 = Normal · 1 = Fraud | 0 |
| 15 | **hour_of_day** | Number | Hour when transaction occurred (0–23) | 15 |
| 16 | **day_of_week** | Text | Day of week when transaction occurred | Monday · Tuesday · Wednesday · Thursday · Friday · Saturday · Sunday |
| 17 | **is_weekend** | Number | Weekend indicator — 0 = Weekday · 1 = Weekend | 0 |

---

## Important Notes on Column Names

> The raw Kaggle dataset uses lowercase column names with underscores.  
> After Power Query transformation, columns were renamed and reformatted for consistency in Power BI.  
> For example: `timestamp` was split into separate `Date` and `Time` columns during cleaning.

---

## Key DAX Measures Created in Power BI

These are **not raw columns** — calculated inside Power BI Desktop from scratch:

| Measure Name | Logic | Used In |
|---|---|---|
| **Total Transactions** | COUNT of all transaction_id rows | KPI card |
| **Successful Transactions** | COUNT where transaction_status = "SUCCESS" | KPI card |
| **Failed Transactions** | COUNT where transaction_status = "FAILED" | KPI card |
| **Success Rate %** | Successful ÷ Total Transactions | KPI card |
| **Failed Rate %** | Failed ÷ Total Transactions | KPI card |
| **Fraud Flagged** | COUNT where fraud_flag = 1 | KPI card |
| **Fraud Rate %** | Fraud Count ÷ Total Transactions | Risk metric |
| **Average Transaction Value** | SUM(amount INR) ÷ COUNT rows | KPI card |
| **MoM Growth %** | Current month vs previous month via DATEADD | Trend line |
| **Peak Transaction Month** | MAXX + TOPN — highest volume month | KPI callout |
| **Highest Value Month** | MAXX on monthly SUM(amount INR) | KPI callout |
| **Lowest Transaction Month** | TOPN with ASC sort on monthly amount | KPI callout |

---

## Data Cleaning Steps — Power Query (16 Applied Steps)

Exact transformation steps applied to the raw CSV, in order:

| Step # | Step Name | What It Did |
|---|---|---|
| 1 | **Source** | Connected to raw CSV file — `upi_transactions_2024.csv` |
| 2 | **Promoted Headers** | Used first row as column headers |
| 3 | **Changed Type** | Set correct data types for all 17 columns |
| 4 | **Removed Columns** | Dropped columns not needed for analysis |
| 5 | **Split Column by Delimiter** | Split `timestamp` into separate `Date` and `Time` columns |
| 6 | **Changed Type1** | Re-applied correct data types after timestamp split |
| 7 | **Renamed Columns** | Renamed columns to clean, consistent naming convention |
| 8 | **Changed Type2** | Final data type corrections after renaming |
| 9 | **Added Conditional Column** | Created `Is_Success` binary flag from transaction_status |
| 10 | **Filtered Rows** | Removed invalid, null, or test transactions |
| 11 | **Reordered Columns** | Arranged columns in logical order for analysis |
| 12 | **Renamed Columns1** | Secondary rename pass for consistency |
| 13 | **Added Conditional Column1** | Created `Transaction_Authenticity` column from fraud_flag |
| 14 | **Capitalized Each Word** | Standardised text casing across categorical columns |
| 15 | **Reordered Columns1** | Final column order arrangement |
| 16 | **Filtered Rows1** | Final filter — removed remaining edge cases |

---

## Dataset Summary

| Metric | Value |
|---|---|
| Total Rows | 2,50,000 |
| Total Columns | 17 |
| Date Range | FY2024 (January – December 2024) |
| Transaction Types | P2P · P2M |
| Merchant Categories | 11 categories |
| States Covered | Delhi · Maharashtra · Karnataka · Gujarat · Rajasthan · Telangana · UP · Tamil Nadu + more |
| Banks Covered | SBI · HDFC · ICICI · Axis · Yes Bank · Kotak · IndusInd · PNB |
| Devices | Android · iOS |
| Networks | 3G · 4G · 5G · WiFi · Web |
| Fraud Flagged | 480 transactions |
| Overall Success Rate | 87.4% |
| Avg Transaction Value | ₹1,310 |
| Peak Transaction Month | May 2024 |
| Highest Value Month | July 2024 |
| Top Spending Age Group | 26–35 (₹116M total value) |

---

*Prepared by Simaran Shaikh*  
*github.com/Simaran-Shaikh-04 · linkedin.com/in/simaranshaikh*
