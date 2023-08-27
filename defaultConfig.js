
module.exports = {
  psqlConnectionString: "postgres://spacedrepetitionreader:PASSWORD@localhost/spacedrepetitionreader",
  port: 8000,
  pageTitle: "Spaced Repetition Reader",
  siteUrl: "http://localhost:8000",

  enableEmail: false,
  emailSubjectPrefix: "[SRR] ",
  emailFromAddress: "Spaced Repetition Reader <noreply@spacedrepetitionreader.com>",
  mailgunApiKey: null,
  
  oauth: {
    google: {
      clientId: "",
      clientSecret: "",
    }
  },
  public: {
    enableGoogleOAuth: false,
  }
};

