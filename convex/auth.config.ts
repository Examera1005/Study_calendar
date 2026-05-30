// @ts-expect-error process.env is available in Convex auth config runtime
const siteUrl = process.env.CONVEX_SITE_URL;

export default {
  providers: [
    {
      domain: siteUrl,
      applicationID: "convex",
    },
  ],
};
