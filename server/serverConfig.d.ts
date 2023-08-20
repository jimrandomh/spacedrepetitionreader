
type SpacedRepetitionServerConfig = {
  psqlConnectionString: string
  port: number
  siteUrl: string

  enableEmail: boolean
  emailSubjectPrefix: string
  emailFromAddress: string|null
  mailgunApiKey: string|null
};

