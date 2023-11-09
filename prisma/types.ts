declare global {
  namespace PrismaJson {
    type AuthenticationType = {
      salt: string;
      password: string;
      sessionToken?: string;
    };
  }
}
