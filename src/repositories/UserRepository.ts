import AlteredConnector from "@/connectors/AlteredConnector";

export type User = {
  email: string;
  id: string;
};

interface RawUser {
  id: string;
  email: string;
}

function formatUser(rawUser: RawUser) {
  const { id, email } = rawUser;
  return { id, email };
}

export default class UserRepository {
  static async getCurrentUser() {
    const rawUser: RawUser = await AlteredConnector.getInstance()
      .client.get("me")
      .json();
    return formatUser(rawUser);
  }
}
