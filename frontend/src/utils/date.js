export const getLatestEligibleBirthDate = (minimumAge = 25, today = new Date()) => {
  const cutoff = new Date(today.getFullYear() - minimumAge, today.getMonth(), today.getDate());
  const year = cutoff.getFullYear();
  const month = String(cutoff.getMonth() + 1).padStart(2, "0");
  const day = String(cutoff.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isAtLeastAge = (dateOfBirth, minimumAge = 25) =>
  Boolean(dateOfBirth) && dateOfBirth <= getLatestEligibleBirthDate(minimumAge);
