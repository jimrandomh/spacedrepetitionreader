
module.exports = {
  psqlConnectionString: "postgres://spacedrepetitionreader:PASSWORD@localhost/spacedrepetitionreader",
  psqlShadowDbConnectionString: "postgres://spacedrepetitionreader:PASSWORD@localhost/spacedrepetitionreadershadow",
  port: 8000,
  siteUrl: "http://localhost:8000",

  enableEmail: false,
  emailSubjectPrefix: "[SRR] ",
  emailFromAddress: "Spaced Repetition Reader <noreply@spacedrepetitionreader.com>",
  mailgunApiKey: null,
  analyticsJs: null,
  
  oauth: {
    google: {
      clientId: "",
      clientSecret: "",
    }
  },
  public: {
    pageTitle: "Spaced Repetition Reader",
    enableGoogleOAuth: false,
  }
};

