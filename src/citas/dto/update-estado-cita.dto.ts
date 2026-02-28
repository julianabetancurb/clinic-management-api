import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EstadoCita } from '@prisma/client';

export class UpdateEstadoCitaDto {
  @ApiProperty({ enum: EstadoCita, example: EstadoCita.CANCELADA })
  @IsEnum(EstadoCita)
  estado: EstadoCita;
}