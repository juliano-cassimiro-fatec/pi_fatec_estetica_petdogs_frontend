
export function getAgeFromBirthDate(birthDateString?: string): number {
  if (!birthDateString) return 0;
  
  
  const dateOnly = birthDateString.split("T")[0];
  const [year, month, day] = dateOnly.split("-").map(Number);
  
  const today = new Date();
  const hasHadBirthdayThisYear =
    today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
    
  const age = today.getFullYear() - year - (hasHadBirthdayThisYear ? 0 : 1);
  return age > 0 ? age : 0;
}
