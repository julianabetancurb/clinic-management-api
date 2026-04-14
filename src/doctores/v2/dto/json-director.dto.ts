import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class JsonDirectorDto {
  @ApiProperty({ example: 'Carlos López' })
  @IsString()
  @Length(2, 60)
  nombre!: string;
}
