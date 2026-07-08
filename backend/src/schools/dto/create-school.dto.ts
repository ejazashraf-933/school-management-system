import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateSchoolDto {
  @ApiProperty({ example: 'ABC-HIGH', description: 'Unique code for the school' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'ABC High School' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Lahore' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: '+92-300-1234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'info@abchigh.edu' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
