import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateStoreInputDto {
  @IsString()
  @MinLength(1)
  clientId: string;

  @IsString()
  @MinLength(1)
  apiKey: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;
}
