import site from "../_data/site.json";
import pricing from "../_data/pricing.json";

/**
 * Derived site data.
 *
 * Every string that used to be duplicated across pages is computed here
 * from a single source in site.json. The hand-written markup stated the
 * office hours three different ways and the service area two — editing
 * one and missing the others was inevitable, and a stray "Arizona"
 * survived in the terms for exactly that reason.
 *
 * Nothing below should ever be hand-typed into a component.
 */

const DAY_ABBR = {
  Sunday: "Sun",
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
};

/** "09:00" -> "9 AM", "17:30" -> "5:30 PM" */
function to12Hour(time24) {
  const [hStr, mStr] = String(time24).split(":");
  const h = Number(hStr);
  const m = Number(mStr || 0);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0
    ? `${hour} ${period}`
    : `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

/** Contiguous day runs collapse to a range: Tue–Thu. */
function formatDayRange(days, abbreviated) {
  if (!days || days.length === 0) return "";
  const label = (d) => (abbreviated ? DAY_ABBR[d] || d : d);
  if (days.length === 1) return label(days[0]);
  return `${label(days[0])}–${label(days[days.length - 1])}`;
}

/** ["Florida","Virginia","Washington"] -> "Florida, Virginia, and Washington" */
function joinWithAnd(items, conjunction = "and") {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, ${conjunction} ${items[items.length - 1]}`;
}

const stateNames = site.states.map((s) => s.name);
const stateAbbrs = site.states.map((s) => s.abbr);
const opens = to12Hour(site.hours.opens);
const closes = to12Hour(site.hours.closes);

export const derived = {
  // --- Hours: one fact, several renderings ---------------------------
  hoursShort: `${formatDayRange(site.hours.days, true)} · ${opens}–${closes}`,
  hoursLong: `${formatDayRange(site.hours.days, false)} · ${opens} – ${closes}`,
  hoursDays: formatDayRange(site.hours.days, false),
  hoursRange: `${opens} – ${closes}`,

  // --- States: one list, several renderings --------------------------
  statesShort: stateAbbrs.join(" · "),
  statesLong: joinWithAnd(stateNames),
  statesLongOr: joinWithAnd(stateNames, "or"),
  statesAmp:
    stateNames.length > 1
      ? `${stateNames.slice(0, -1).join(", ")} & ${stateNames[stateNames.length - 1]}`
      : stateNames[0],
  stateNames,
  stateAbbrs,

  // --- Provider -------------------------------------------------------
  providerFull: `${site.provider.name}, ${site.provider.credentials}`,
  providerShort: `${site.provider.shortName}, ${site.provider.credentials}`,

  // --- Cancellation policy, assembled from pricing.json ---------------
  cancellationPolicy: `A $${pricing.cancellation.fee} fee may apply to appointments canceled with less than ${pricing.cancellation.noticeHours} hours' notice.`,

  currentYear: String(new Date().getFullYear()),
};

/**
 * schema.org MedicalBusiness.
 *
 * Built from the same fields that render the visible page, so structured
 * data cannot drift from the copy.
 */
export function jsonLd(origin) {
  const base = (origin || site.origin).replace(/\/+$/, "");

  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      name: site.legalName,
      description: site.description,
      image: `${base}${site.logoRaster}`,
      url: `${base}/`,
      email: site.email,
      priceRange: "$$",
      medicalSpecialty: ["PrimaryCare", "Geriatric"],
      areaServed: site.states.map((s) => ({ "@type": "State", name: s.name })),
      founder: {
        "@type": "Person",
        name: site.provider.name,
        honorificSuffix: site.provider.credentials,
        jobTitle: site.provider.jobTitle,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: site.hours.days,
          opens: site.hours.opens,
          closes: site.hours.closes,
        },
      ],
    },
    null,
    2,
  );
}

export { site, pricing };
