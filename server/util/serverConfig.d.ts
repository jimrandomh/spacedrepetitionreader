
type SpacedRepetitionPublicConfig = {
  pageTitle: string
  enableGoogleOAuth?: boolean
}

type SpacedRepetitionServerConfig = {
  public: SpacedRepetitionPublicConfig

  psqlConnectionString: string
  port: number
  siteUrl: string

  enableEmail: boolean
  emailSubjectPrefix: string
  emailFromAddress: string
  mailgunApiKey: string|null
  analyticsJs?: string|null

  oauth?: {
    google?: {
      clientId: string
      clientSecret: string
    }
  }
};

