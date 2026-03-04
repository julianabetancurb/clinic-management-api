import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CreatePacienteDto {
  @ApiProperty({ example: '1234567890' })
  @IsString()
  @Length(5, 30)
  documento: string;

  @ApiProperty({ example: 'Juliana' })
  @IsString()
  @Length(2, 60)
  nombres: string;

  @ApiProperty({ example: 'Betancur' })
  @IsString()
  @Length(2, 60)
  apellidos: string;

  @ApiProperty({ example: '+57 3001234567', required: false })
  @IsOptional()
  @IsString()
  @Length(7, 30)
  telefono?: string;

  @ApiProperty({ example: 'juliana@mail.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;
  
}