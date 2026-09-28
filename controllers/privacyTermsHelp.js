export const privacyRouter=(req, res) => {
  res.render("legal/privacy.ejs", {
    privacyPageTitle: "Privacy Policy | Nexstay",
    privacyLastUpdated: "21 September 2026",
    supportEmailAddress: process.env.SUPPORT_EMAIL,
    siteName: "Nexstay"
  });
}

export const termsRouter = (req, res) => {
  res.render("legal/privacy", {
    pageType: "terms",
    pageTitle: "Terms of Service | Nexstay",
    lastUpdated: "21 September 2026",
    supportEmailAddress: process.env.SUPPORT_EMAIL,
    siteName: "Nexstay"
  });
};

export const helpRouter = (req, res) => {
  res.render("legal/privacy", {
    pageType: "help",
    pageTitle: "Help Center | Nexstay",
    lastUpdated: "21 September 2026",
    supportEmailAddress: process.env.SUPPORT_EMAIL,
    siteName: "Nexstay"
  });
};