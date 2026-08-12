import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: 'Alice Johnson' })
  name: string;

  @ApiProperty({ example: 'alice@example.com' })
  email: string;

  @ApiPropertyOptional({ example: 'Senior Backend Engineer' })
  bio: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-08-12T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-08-12T10:00:00.000Z' })
  updatedAt: Date;
}
