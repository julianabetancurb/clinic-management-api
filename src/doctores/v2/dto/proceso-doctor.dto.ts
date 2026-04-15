import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class ProcesoDoctorDto {
  @ApiProperty({ example: 'Juan Fernando', description: 'Nombre del director' })
  @IsString()
  @Length(2, 60)
  name!: string;

  @ApiProperty({ example: '987654321', description: 'Documento del doctor' })
  @IsString()
  @Length(5, 30)
  documento!: string;

  @ApiPropertyOptional({ example: 'Ana' })
  @IsOptional()
  @IsString()
  @Length(2, 60)
  nombres?: string;

  @ApiPropertyOptional({ example: 'Gomez' })
  @IsOptional()
  @IsString()
  @Length(2, 60)
  apellidos?: string;

  @ApiPropertyOptional({ example: 'Medicina General' })
  @IsOptional()
  @IsString()
  @Length(2, 80)
  especialidad?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(5)
  duracionCitaMinutos?: number;
}
