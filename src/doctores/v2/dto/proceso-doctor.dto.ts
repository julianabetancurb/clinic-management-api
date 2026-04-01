import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, IsOptional, Length, Min, ValidateNested } from 'class-validator';
import { JsonDirectorDto } from './json-director.dto';

export class ProcesoDoctorDto {
  @ApiProperty({ example: '987654321' })
  @IsString()
  @Length(5, 30)
  documento: string;

  @ApiProperty({ example: 'Ana' })
  @IsString()
  @Length(2, 60)
  nombres: string;

  @ApiProperty({ example: 'Gómez' })
  @IsString()
  @Length(2, 60)
  apellidos: string;

  @ApiProperty({ example: 'Medicina General' })
  @IsString()
  @Length(2, 80)
  especialidad: string;

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsInt()
  @Min(5)
  duracionCitaMinutos?: number;

  @ApiProperty({ type: JsonDirectorDto })
  @ValidateNested()
  @Type(() => JsonDirectorDto)
  jsonDirector: JsonDirectorDto;
}