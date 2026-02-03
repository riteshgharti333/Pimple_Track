import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePimpleDto } from './dto/create-pimple.dto';
import { DatabaseService } from 'src/database.service';

@Injectable()
export class PimplesService {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreatePimpleDto) {
    const result = await this.db.query`
      INSERT INTO pimples
      (date, location, type, color, size, status, pain, notes)
      VALUES (
        ${data.date},
        ${data.location},
        ${data.type},
        ${data.color},
        ${data.size},
        ${data.status},
        ${data.pain},
        ${data.notes}
      )
      RETURNING *
    `;
    return result[0];
  }

  async findAll() {
    return this.db.query`
      SELECT * FROM pimples
      ORDER BY created_at DESC
    `;
  }

  // 🔹 GET single
  async findOne(id: string) {
    const result = await this.db.query`
      SELECT * FROM pimples WHERE id = ${id}
    `;

    if (result.length === 0) {
      throw new NotFoundException('Pimple not found');
    }

    return result[0];
  }

  // 🔹 UPDATE
  async update(id: string, data: Partial<CreatePimpleDto>) {
    const result = await this.db.query`
      UPDATE pimples
      SET
        date = COALESCE(${data.date}, date),
        location = COALESCE(${data.location}, location),
        type = COALESCE(${data.type}, type),
        color = COALESCE(${data.color}, color),
        size = COALESCE(${data.size}, size),
        status = COALESCE(${data.status}, status),
        pain = COALESCE(${data.pain}, pain),
        notes = COALESCE(${data.notes}, notes),
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      throw new NotFoundException('Pimple not found');
    }

    return result[0];
  }

  // 🔹 DELETE
  async remove(id: string) {
    const result = await this.db.query`
      DELETE FROM pimples WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      throw new NotFoundException('Pimple not found');
    }

    return result[0];
  }
}
