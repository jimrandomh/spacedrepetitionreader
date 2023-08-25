
export function getPublicConfig(): SpacedRepetitionPublicConfig {
  if (isClient) {
    return (window as any).publicConfig;
  } else if (isServer) {
    //eslint-disable-next-line @typescript-eslint/no-var-requires
    const serverConfigModule = require("../server/util/getConfig");
    return serverConfigModule.getConfig().public;
  } else {
    throw new Error("No public-config available in this context");
  }
}
