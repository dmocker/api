import { Injectable } from '@nestjs/common'
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { getMetadataArgsStorage } from 'typeorm'
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({
  path: path.resolve(__dirname, '..', '..', '..', '..', '..', '..', '.env')
})

@Injectable()
export class TypeormService implements TypeOrmOptionsFactory {
  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    console.log(process.env)
    return {
      type: 'mongodb',
      url: process.env.DB_URI,
      entities: getMetadataArgsStorage().tables.map((tbl) => tbl.target),
      synchronize: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      logging: true
    }
  }
}
