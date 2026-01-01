import { IsString, IsObject, IsOptional } from 'class-validator';

export class CreateSavedViewDTO {
  @IsString()
  name!: string;

  @IsString()
  module!: string;

  @IsObject()
  configuration!: any;

  @IsOptional()
  @IsString()
  user_id?: string;
}

export class RenameSavedViewDTO {
  @IsString()
  name!: string;
}
