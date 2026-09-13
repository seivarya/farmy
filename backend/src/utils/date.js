const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isValidDateOnly = (value) => {
  if (typeof value !== "string" || !DATE_ONLY_PATTERN.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

const isAtLeastAge = (value, minimumAge, asOf = new Date()) => {
  if (!isValidDateOnly(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const cutoff = new Date(Date.UTC(
    asOf.getUTCFullYear() - minimumAge,
    asOf.getUTCMonth(),
    asOf.getUTCDate()
  ));
  const birthDate = new Date(Date.UTC(year, month - 1, day));
  return birthDate <= cutoff;
};

module.exports = { isAtLeastAge, isValidDateOnly };
