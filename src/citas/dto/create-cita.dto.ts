import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateCitaDto {
  @ApiProperty({ example: 'uuid-paciente' })
  @IsUUID()
  pacienteId!: string;

  @ApiProperty({ example: 'uuid-doctor' })
  @IsUUID()
  doctorId!: string;

  @ApiProperty({ example: '2026-03-01T10:00:00.000Z' })
  @IsDateString()
  fechaInicio!: string;

  @ApiProperty({ example: '2026-03-01T10:30:00.000Z' })
  @IsDateString()
  fechaFin!: string;

  @ApiProperty({ example: 'Consulta general', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 200)
  motivo?: string;
}