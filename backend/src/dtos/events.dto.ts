import { IsString, IsOptional, IsNumber, IsDateString, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class EventListQueryDTO {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['all', 'active', 'draft', 'archived', 'live'])
  tab?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  owner?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  registrationStatus?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  attendanceMin?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  attendanceMax?: number;

  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @IsOptional()
  @IsString()
  @IsIn(['start_date', 'attendance', 'status', 'name'])
  sortBy?: string = 'start_date';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: string = 'desc';
}

export class BulkActionDTO {
  @IsString({ each: true })
  eventIds!: string[];
}

export class EventMetricsQueryDTO {
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @IsOptional()
  @IsString()
  @IsIn(['all', 'active', 'draft', 'archived', 'live'])
  tab?: string;
}
