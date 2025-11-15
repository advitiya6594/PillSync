import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const CHAT_MODEL = process.env.AI_MODEL_CHAT || "gpt-4o-mini";

const PHASES = [
  "Menstrual (Days 1-7)",
  "Follicular (Days 8-13)",
  "Ovulation (Days 14-16)",
  "Luteal (Days 17-28)",
  "Menstrual (Active Period - Currently bleeding)"
];

/**
 * Predicts the menstrual cycle phase using OpenAI based on:
 * - Period start/end dates (or ongoing status)
 * - Birth control pill type and start date
 * - Days since period start
 * - Current date
 */
export async function predictCyclePhase({
  periodStartDate,
  periodEndDate,
  periodOngoing,
  pillType,
  pillStartDate,
  packDay,
  isActivePill,
  suppression
}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const today = new Date();
  const periodStart = new Date(periodStartDate);
  const daysSincePeriodStart = Math.floor(
    (today.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate cycle day (assuming 28-day cycle)
  const cycleDay = (daysSincePeriodStart % 28) || 28;
  
  let periodInfo = "";
  if (periodOngoing) {
    periodInfo = `Currently experiencing menstruation (started on ${periodStartDate})`;
  } else if (periodEndDate) {
    const periodEnd = new Date(periodEndDate);
    const periodDuration = Math.floor(
      (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    periodInfo = `Last period: ${periodStartDate} to ${periodEndDate} (${periodDuration} days). Today is ${daysSincePeriodStart} days since period start.`;
  } else {
    periodInfo = `Period started on ${periodStartDate}. Today is ${daysSincePeriodStart} days since period start.`;
  }

  const pillInfo = `Taking ${pillType} birth control pill. Pack started on ${pillStartDate}. Currently on pack day ${packDay} of 28. ${isActivePill ? 'Taking active hormone pills.' : 'Taking placebo/break pills.'} Hormone suppression level: ${suppression}.`;

  const systemPrompt = `You are a knowledgeable healthcare AI assistant helping to determine menstrual cycle phase. 
You analyze period dates, birth control pill schedules, and cycle day information to predict the most likely current phase of the menstrual cycle.

The menstrual cycle has 4 main phases:
1. **Menstrual Phase (Days 1-7)**: Bleeding occurs. Estrogen and progesterone are low.
2. **Follicular Phase (Days 8-13)**: After bleeding stops, follicles develop. Estrogen rises.
3. **Ovulation Phase (Days 14-16)**: Egg is released. Peak fertility. Estrogen peaks, LH surge.
4. **Luteal Phase (Days 17-28)**: Corpus luteum forms. Progesterone rises, estrogen second peak. If no pregnancy, hormones drop and cycle restarts.

When birth control pills are involved:
- Combined pills suppress ovulation, so traditional cycle phases may be different
- Active pills provide hormones continuously
- Placebo/break pills allow withdrawal bleeding (not a true period)
- Progestin-only pills work differently and may allow ovulation

Based on the provided information, predict which phase the user is most likely in RIGHT NOW. Consider:
- Days since period start (if known)
- Whether period is currently ongoing
- Birth control pill type and schedule
- Pack day and active/placebo status

Respond with ONLY a JSON object in this exact format:
{
  "phase": "One of: Menstrual (Days 1-7), Follicular (Days 8-13), Ovulation (Days 14-16), Luteal (Days 17-28), or Menstrual (Active Period - Currently bleeding)",
  "confidence": "high" | "medium" | "low",
  "reasoning": "Brief 1-2 sentence explanation of why this phase was predicted",
  "cycleDay": <number 1-28>,
  "note": "Any important notes about birth control effects on cycle"
}`;

  const userPrompt = `Period Information:
${periodInfo}

Birth Control Information:
${pillInfo}

Current Situation:
- Today's date: ${today.toISOString().split('T')[0]}
- Days since period start: ${daysSincePeriodStart}
- Calculated cycle day: ${cycleDay}

Based on this information, predict the current menstrual cycle phase.`;

  try {
    const response = await client.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent medical predictions
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    const content = response.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const result = JSON.parse(content);
    
    // Validate response structure
    if (!result.phase || !result.confidence) {
      throw new Error("Invalid response format from OpenAI");
    }

    return {
      phase: result.phase,
      confidence: result.confidence,
      reasoning: result.reasoning || "",
      cycleDay: result.cycleDay || cycleDay,
      note: result.note || "",
      aiPredicted: true
    };
  } catch (error) {
    console.error("[cyclePredictor] OpenAI call failed:", error.message);
    throw error;
  }
}

