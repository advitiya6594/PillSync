export default {
  metadata: { version: "0.1", note: "Illustrative mini dataset. Not comprehensive. Not medical advice." },
  cyp3a4_inducers: [
    { name: "rifampin", level: "high", note: "Can reduce combined and progestin-only pill effectiveness." },
    { name: "carbamazepine", level: "high", note: "Enzyme induction can lower hormone levels." },
    { name: "phenytoin", level: "high", note: "Enzyme induction can lower hormone levels." },
    { name: "phenobarbital", level: "high", note: "Enzyme induction can lower hormone levels." },
    { name: "topiramate", level: "moderate", note: "Dose-dependent induction; may reduce effectiveness." },
    { name: "primidone", level: "high", note: "Enzyme induction." },
    { name: "St. John's Wort", level: "high", note: "Herbal inducer that can reduce pill effectiveness." }
  ],
  antibiotics: [
    { name: "rifampin", level: "high", note: "Known to reduce effectiveness." },
    { name: "rifabutin", level: "moderate", note: "May reduce effectiveness." }
  ],
  misc: [
    { name: "activated_charcoal", level: "context", note: "May adsorb hormones if taken near pill time." }
  ],
  sideEffects: {
    combined: {
      common: ["nausea","breast tenderness","spotting","mood changes","headache","acne improvements"],
      placebo_week: ["withdrawal bleeding","cramps","fatigue"]
    },
    progestin_only: {
      common: ["irregular bleeding","acne","breast tenderness","mood changes"]
    }
  }
};

