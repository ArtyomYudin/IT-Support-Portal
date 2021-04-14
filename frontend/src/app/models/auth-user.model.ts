export class AuthUser {
  public id!: number | null;

  public email!: string | null;

  public firstName!: string | null;

  public lastName!: string | null;

  public accessRole!: string | null;

  public token?: string | null;
}
