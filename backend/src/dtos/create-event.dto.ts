import { IsString, IsOptional, IsBoolean, IsDateString, IsInt, IsArray, IsObject, IsIn, ValidateNested, IsEmail, Min } from 'class-validator';
import { Type } from 'class-transformer';

class PartnerDTO {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

class SponsorDTO {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  tier?: string;

  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

class AgendaItemDTO {
  @IsOptional()
  @IsString()
  time?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  speaker?: string;

  @IsOptional()
  @IsString()
  duration?: string;
}

export class CreateEventDTO {
  // Basic Info
  @IsString()
  name!: string;

  @IsString()
  event_code!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  category_id?: number;

  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  event_type?: string;

  @IsDateString()
  start_date!: string;

  @IsDateString()
  end_date!: string;

  @IsOptional()
  @IsBoolean()
  all_day?: boolean;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  url_slug?: string;

  // Registration
  @IsOptional()
  @IsDateString()
  reg_start_at?: string;

  @IsOptional()
  @IsDateString()
  reg_end_at?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsBoolean()
  waitlist_enabled?: boolean;

  // Venue/Mode
  @IsOptional()
  @IsString()
  @IsIn(['in-person', 'virtual', 'hybrid'])
  mode?: string;

  @IsOptional()
  @IsString()
  @IsIn(['zoom', 'google-meet', 'other'])
  virtual_platform?: string;

  @IsOptional()
  @IsString()
  venue_id?: string;

  @IsOptional()
  @IsString()
  venue_name?: string;

  @IsString()
  location!: string;

  @IsOptional()
  @IsString()
  address_line1?: string;

  @IsOptional()
  @IsString()
  address_line2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zip_code?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  meeting_url?: string;

  @IsOptional()
  @IsString()
  accessibility_notes?: string;

  @IsOptional()
  @IsString()
  emergency_contact?: string;

  // Owner
  @IsString()
  owner!: string;

  // Media
  @IsOptional()
  @IsString()
  banner_image_url?: string;

  @IsOptional()
  @IsArray()
  gallery_images?: string[];

  // SEO
  @IsOptional()
  @IsString()
  meta_title?: string;

  @IsOptional()
  @IsString()
  meta_description?: string;

  // Settings
  @IsString()
  status!: string;

  @IsOptional()
  @IsString()
  visibility?: string;

  @IsOptional()
  @IsBoolean()
  is_registration_open?: boolean;

  @IsOptional()
  @IsBoolean()
  is_checkin_active?: boolean;

  @IsOptional()
  @IsString()
  check_in_mode?: string;

  @IsOptional()
  @IsInt()
  data_collection_form_id?: number;

  // People
  @IsOptional()
  @IsArray()
  co_hosts?: string[];

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tag_ids?: number[];

  // JSON Structures
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartnerDTO)
  partners?: PartnerDTO[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SponsorDTO)
  sponsors?: SponsorDTO[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgendaItemDTO)
  agenda?: AgendaItemDTO[];

  // Email Config
  @IsOptional()
  @IsObject()
  email_config?: {
    sender_name?: string;
    sender_email?: string;
    reply_to?: string;
  };

  // Internal
  @IsOptional()
  @IsString()
  internal_notes?: string;

  @IsOptional()
  @IsString()
  @IsIn(['draft', 'published', 'archived'])
  lifecycle_status?: string;
}
