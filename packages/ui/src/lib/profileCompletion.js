function photosOf(value) {
  if (Array.isArray(value)) return value;
  return typeof value === "string" && value ? [value] : [];
}

function hasText(value) {
  return typeof value === "string" && Boolean(value.trim());
}

export function isInvestorProfileComplete(userOrProfile) {
  const profile = userOrProfile?.profile || userOrProfile || {};
  const fullName = profile.full_name || profile.fullName || userOrProfile?.name;
  const notes = profile.notes;
  const nidPhotos = photosOf(profile.nid_photos || profile.nidPhotos);
  const hasCompanyInfo = Boolean(
    hasText(profile.company_name) ||
      hasText(profile.companyName) ||
      hasText(profile.industry) ||
      hasText(profile.position) ||
      hasText(profile.website) ||
      hasText(profile.mission),
  );
  const companyComplete =
    (!hasCompanyInfo && !profile.hasCompanyInfo) ||
    Boolean(
      hasText(profile.company_name || profile.companyName) &&
        hasText(profile.position),
    );

  return Boolean(
    hasText(fullName) &&
      hasText(notes) &&
      nidPhotos[0] &&
      nidPhotos[1] &&
      companyComplete,
  );
}

export function getInvestorDestination(user) {
  return isInvestorProfileComplete(user) ? "/dashboard" : "/profile";
}
