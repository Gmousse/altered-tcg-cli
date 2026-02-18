import UserRepository from "@/repositories/UserRepository";

export default class AccountService {
  static async getCurrentUser() {
    return await UserRepository.getCurrentUser();
  }
}
