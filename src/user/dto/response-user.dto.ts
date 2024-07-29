import { Expose } from 'class-transformer';

export class ResponseUserDto {
  @Expose({ name: 'userUuid' })
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string | null;

  @Expose()
  lastLoginAt: Date | null;

  @Expose()
  lastLoginIp: string | null;

  @Expose()
  emailVerifiedAt: Date | null;

  @Expose()
  isActivated: boolean;

  @Expose()
  profilePicture: string | null;
}
