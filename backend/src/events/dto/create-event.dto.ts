import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsArray, IsUrl } from 'class-validator';

enum EventStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  subheading?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsDateString()
  @IsOptional()
  startDateTime?: string;

  @IsDateString()
  @IsOptional()
  endDateTime?: string;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @IsUrl()
  @IsOptional()
  bannerImageUrl?: string;

  @IsDateString()
  @IsOptional()
  vanishDate?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles?: string[];
}
