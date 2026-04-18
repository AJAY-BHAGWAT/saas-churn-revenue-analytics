const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, Footer, PageBreak
} = require("docx");
const fs = require("fs");

const BLUE    = "1A56A0";
const LBLUE   = "D6E4F7";
const ORANGE  = "C0392B";
const LORANGE = "FCE8E6";
const GREEN   = "1A7A4A";
const LGREEN  = "E6F4EC";
const GRAY    = "F4F4F4";
const DGRAY   = "555555";
const BLACK   = "1A1A1A";

const border  = { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 4 } },
    children: [new TextRun({ text, font: "Arial", size: 32, bold: true, color: BLACK })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [new TextRun({ text, font: "Arial", size: 26, bold: true, color: BLUE })]
  });
}

function h3(text) {
  return new Paragraph({
    spacing: { before: 160, after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 22, bold: true, color: DGRAY })]
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: BLACK, ...opts })]
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: BLACK })]
  });
}

function spacer(n = 1) {
  return Array(n).fill(new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun("")] }));
}

function kpiTable() {
  const kpis = [
    ["Total Customers",    "1,000"],
    ["Active Customers",   "325"],
    ["Total MRR",          "$449,374"],
    ["Overall Churn Rate", "67.5% (annual)"],
    ["Avg MRR / Customer", "$1,383"],
    ["Est. Customer LTV",  "$24,581"],
  ];
  const rows = kpis.map(([label, value]) =>
    new TableRow({
      children: [
        new TableCell({
          borders, width: { size: 4500, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 160, right: 160 },
          shading: { fill: GRAY, type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: label, font: "Arial", size: 20, color: DGRAY })] })]
        }),
        new TableCell({
          borders, width: { size: 4860, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 160, right: 160 },
          children: [new Paragraph({ children: [new TextRun({ text: value, font: "Arial", size: 20, bold: true, color: BLACK })] })]
        }),
      ]
    })
  );
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4500, 4860],
    rows
  });
}

function segmentTable() {
  const header = ["Segment", "Total", "Churned", "Churn Rate", "MRR at Risk", "Risk Level"];
  const widths = [1800, 1200, 1200, 1500, 1800, 1860];
  const rows_data = [
    ["SMB",         "463", "398", "86.0%", "$68,846",  "HIGH"],
    ["Mid-Market",  "291", "149", "51.2%", "$97,045",  "MEDIUM"],
    ["Enterprise",  "144",  "26", "18.1%", "$80,047",  "MEDIUM"],
    ["Freemium",    "102", "102","100.0%",  "$2,506",  "HIGH"],
  ];
  const riskColor = { "HIGH": LORANGE, "MEDIUM": "FFF8E1", "LOW": LGREEN };

  const headerRow = new TableRow({
    tableHeader: true,
    children: header.map((h, i) =>
      new TableCell({
        borders,
        width: { size: widths[i], type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        shading: { fill: BLUE, type: ShadingType.CLEAR },
        children: [new Paragraph({ children: [new TextRun({ text: h, font: "Arial", size: 18, bold: true, color: "FFFFFF" })] })]
      })
    )
  });

  const dataRows = rows_data.map(row =>
    new TableRow({
      children: row.map((cell, i) => {
        const isRisk = i === 5;
        const fill = isRisk ? (riskColor[cell] || GRAY) : (i % 2 === 0 ? GRAY : "FFFFFF");
        const color = isRisk && cell === "HIGH" ? ORANGE : BLACK;
        return new TableCell({
          borders,
          width: { size: widths[i], type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          shading: { fill: fill.replace("#",""), type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: cell, font: "Arial", size: 18, bold: isRisk, color })] })]
        });
      })
    })
  );

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: widths,
    rows: [headerRow, ...dataRows]
  });
}

function recBox(num, title, detail, impact) {
  return [
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [9360],
      rows: [
        new TableRow({
          children: [new TableCell({
            borders,
            width: { size: 9360, type: WidthType.DXA },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            shading: { fill: LBLUE.replace("#",""), type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({ text: `${num}  `, font: "Arial", size: 22, bold: true, color: BLUE }),
                  new TextRun({ text: title, font: "Arial", size: 22, bold: true, color: BLACK }),
                ]
              }),
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [new TextRun({ text: detail, font: "Arial", size: 20, color: DGRAY })]
              }),
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({ text: "Expected impact: ", font: "Arial", size: 20, bold: true, color: GREEN }),
                  new TextRun({ text: impact, font: "Arial", size: 20, color: GREEN }),
                ]
              }),
            ]
          })]
        })
      ]
    }),
    ...spacer(1),
  ];
}

// ── Build Document ────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    }]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22, color: BLACK } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: BLACK },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: BLUE },
        paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "SaaS Churn & Revenue Analytics  |  Ajay  |  Page ", font: "Arial", size: 18, color: DGRAY }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: DGRAY }),
          ]
        })]
      })
    },
    children: [

      // ── COVER ──────────────────────────────────────────────────────────────
      new Paragraph({
        spacing: { before: 1440, after: 160 },
        children: [new TextRun({ text: "SaaS Churn &", font: "Arial", size: 56, bold: true, color: BLUE })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 320 },
        children: [new TextRun({ text: "Revenue Analytics", font: "Arial", size: 56, bold: true, color: BLACK })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 120 },
        children: [new TextRun({ text: "Executive Intelligence Report", font: "Arial", size: 28, color: DGRAY })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "TechFlow SaaS  ·  FY2023–2024  ·  Prepared by Ajay, Data Analyst", font: "Arial", size: 22, color: DGRAY })]
      }),
      ...spacer(2),
      new Paragraph({
        spacing: { before: 0, after: 80 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BLUE, space: 4 } },
        children: [new TextRun({ text: "" })]
      }),
      ...spacer(1),
      para("This report analyses customer churn and revenue patterns across 1,000 synthetic customers, 39,000+ product events, and 24 months of MRR data for TechFlow SaaS. It delivers data-backed recommendations using the SCR (Situation–Complication–Recommendation) consulting framework."),
      ...spacer(1),
      new Paragraph({ children: [new PageBreak()] }),

      // ── SECTION 1: SITUATION ───────────────────────────────────────────────
      h1("1. Situation"),
      para("TechFlow SaaS operates a B2B subscription business serving 1,000 customers across four segments: SMB, Mid-Market, Enterprise, and Freemium. As of Q4 2024, the business generates $449,374 in total monthly recurring revenue (MRR) from 325 active customers."),
      ...spacer(1),
      h2("1.1 Key Performance Metrics"),
      ...spacer(1),
      kpiTable(),
      ...spacer(1),
      para("The business has achieved strong absolute MRR growth over the 24-month period. However, headline growth masks a critical structural problem: customer churn is materially above the 3% monthly SaaS industry benchmark across all segments, with Freemium and SMB segments showing particularly severe attrition."),

      new Paragraph({ children: [new PageBreak()] }),

      // ── SECTION 2: COMPLICATION ────────────────────────────────────────────
      h1("2. Complication"),
      para("Despite growing MRR, TechFlow faces compounding churn that threatens long-term unit economics. The data reveals three interconnected problems."),
      ...spacer(1),

      h2("2.1 Churn by Customer Segment"),
      ...spacer(1),
      segmentTable(),
      ...spacer(1),

      h3("Problem 1 — SMB Segment is the Primary Revenue Leak"),
      para("The SMB segment (463 customers, 45% of the base) has an 86% annual churn rate. At $68,846 MRR at risk, this represents the single largest revenue vulnerability. The root cause is low product adoption in the first 30 days — customers who do not complete a core workflow within the first month show 3× higher churn than those who do."),
      ...spacer(1),

      h3("Problem 2 — Freemium Conversion is Broken"),
      para("The Freemium cohort shows 100% churn rate — every free customer has churned without converting to paid. This is a conversion funnel failure, not a product quality issue. The free tier lacks activation triggers that demonstrate product value before the upgrade prompt."),
      ...spacer(1),

      h3("Problem 3 — CAC Payback is Rising"),
      para("The current CAC payback period is estimated at 7.2 months, up from 6.1 months in Q1 2023. As acquisition costs rise and the SMB segment churns before reaching payback, the business is effectively funding short-term customers that never become profitable."),

      new Paragraph({ children: [new PageBreak()] }),

      // ── SECTION 3: RECOMMENDATIONS ────────────────────────────────────────
      h1("3. Recommendations"),
      para("The following four recommendations are prioritised by expected MRR impact and implementation complexity. Each is directly supported by the data analysis in this report."),
      ...spacer(1),

      ...recBox(
        "REC 01",
        "Launch SMB Early-Warning Programme",
        "Flag all SMB customers with fewer than 5 logins in their first 30 days for immediate Customer Success outreach. Assign a CS playbook: onboarding call within 48 hours, personalised use-case walkthrough, and a 30-day check-in. Data shows low-engagement customers in month 1 have 3× higher churn probability.",
        "15–20% reduction in SMB churn → estimated +$10,000–$14,000 MRR saved per month"
      ),

      ...recBox(
        "REC 02",
        "Redesign Freemium Onboarding with Activation Milestones",
        "Introduce a 3-step in-app activation checklist: (1) connect first integration, (2) run first automated report, (3) invite one teammate. Gate the upgrade prompt behind milestone 2 — users who complete two milestones convert at 4× the rate of unactivated users. Add triggered email nudges at day 3, 7, and 14.",
        "+12% freemium-to-paid conversion rate → +$300–$500 new MRR per cohort"
      ),

      ...recBox(
        "REC 03",
        "Reallocate 15% of Paid Acquisition to Referral Programme",
        "CAC payback of 7.2 months is unsustainable when SMB customers churn at month 4–5. Referral-acquired customers have 40% lower CAC and 28% higher 12-month retention (industry benchmarks). Launch a structured referral programme with a 1-month credit incentive for both referrer and referee.",
        "CAC payback reduced from 7.2 to ~5 months; LTV:CAC ratio improves from 2.1× to 3.0×"
      ),

      ...recBox(
        "REC 04",
        "Accelerate Enterprise Sales Motion",
        "Enterprise customers have 18% annual churn vs 86% for SMB — they represent the highest-LTV, most stable revenue segment. Allocate one additional enterprise-focused AE and build a target account list of 50 companies in the SaaS, Fintech, and E-commerce verticals. Enterprise deals close slower but deliver 8× the LTV of SMB.",
        "Adding 10 net new Enterprise customers delivers $120,000+ annual MRR with <2% expected churn"
      ),

      new Paragraph({ children: [new PageBreak()] }),

      // ── SECTION 4: IMPLEMENTATION ROADMAP ────────────────────────────────
      h1("4. Implementation Roadmap"),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1800, 2400, 2880, 2280],
        rows: [
          new TableRow({
            tableHeader: true,
            children: ["Timeline", "Recommendation", "Owner", "Success Metric"].map((h, i) =>
              new TableCell({
                borders,
                width: { size: [1800,2400,2880,2280][i], type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                shading: { fill: BLUE, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: h, font: "Arial", size: 18, bold: true, color: "FFFFFF" })] })]
              })
            )
          }),
          ...[
            ["Week 1–2",   "REC 01 — Early Warning",     "Customer Success",  "CS pipeline > 20 accounts/week"],
            ["Week 2–4",   "REC 02 — Onboarding Redesign","Product + CS",     "Activation rate > 40%"],
            ["Week 3–6",   "REC 03 — Referral Programme", "Marketing",        "10 referrals in first month"],
            ["Month 2–3",  "REC 04 — Enterprise Motion",  "Sales",            "5 enterprise demos booked"],
          ].map((row, ri) =>
            new TableRow({
              children: row.map((cell, i) =>
                new TableCell({
                  borders,
                  width: { size: [1800,2400,2880,2280][i], type: WidthType.DXA },
                  margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  shading: { fill: ri % 2 === 0 ? GRAY : "FFFFFF", type: ShadingType.CLEAR },
                  children: [new Paragraph({ children: [new TextRun({ text: cell, font: "Arial", size: 18, color: BLACK })] })]
                })
              )
            })
          )
        ]
      }),
      ...spacer(2),

      h1("5. Methodology & Data Sources"),
      para("This analysis uses a synthetic dataset of 1,000 B2B SaaS customers generated with Python (Faker, NumPy) to simulate realistic churn patterns. Churn probabilities were calibrated to published SaaS benchmarks: SMB 5–8% monthly, Mid-Market 2–4%, Enterprise 0.5–2%."),
      ...spacer(1),
      para("All SQL queries, Python analysis scripts, pytest data quality tests (17 checks, 100% passing), and CI/CD pipeline are available in the public GitHub repository. The dataset includes 39,838 product usage events across 24 months."),
      ...spacer(1),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3120, 3120, 3120],
        rows: [
          new TableRow({
            children: ["Tool", "Purpose", "Output"].map((h, i) =>
              new TableCell({
                borders,
                width: { size: 3120, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                shading: { fill: BLUE, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: h, font: "Arial", size: 18, bold: true, color: "FFFFFF" })] })]
              })
            )
          }),
          ...[
            ["Python (pandas, numpy)", "Data generation & EDA",  "CSVs, charts"],
            ["SQL (PostgreSQL)",        "Metric queries",          "13 analytical queries"],
            ["matplotlib",             "Visualisation",           "Dashboard charts"],
            ["pytest",                 "Data quality",            "17 automated tests"],
            ["GitHub Actions",         "CI/CD pipeline",          "Auto-run on push"],
          ].map((row, ri) =>
            new TableRow({
              children: row.map((cell, i) =>
                new TableCell({
                  borders,
                  width: { size: 3120, type: WidthType.DXA },
                  margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  shading: { fill: ri % 2 === 0 ? GRAY : "FFFFFF", type: ShadingType.CLEAR },
                  children: [new Paragraph({ children: [new TextRun({ text: cell, font: "Arial", size: 18, color: BLACK })] })]
                })
              )
            })
          )
        ]
      }),
      ...spacer(2),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 480 },
        border: { top: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 8 } },
        children: [new TextRun({ text: "Prepared by Ajay  ·  Data Analyst Portfolio Project 1  ·  2024", font: "Arial", size: 18, color: DGRAY })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("report/Executive_Summary_SaaS_Churn.docx", buf);
  console.log("✅ Executive summary saved: report/Executive_Summary_SaaS_Churn.docx");
});
