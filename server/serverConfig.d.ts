
type SpacedRepetitionServerConfig = {
  psqlConnectionString: string
  port: number
  siteUrl: string

  enableEmail: boolean
  emailSubjectPrefix: string
  emailFromAddress: string
  mailgunApiKey: string|null
};

