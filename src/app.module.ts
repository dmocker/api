import { Module, CacheModule } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'

import { TypeOrmModule } from '@nestjs/typeorm'
import { TypeormModule } from './config/typeorm/typeorm.module'
import { TypeormService } from './config/typeorm/typeorm.service'

import { GraphQLModule } from '@nestjs/graphql'
import { GraphqlModule } from './config/graphql/graphql.module'
import { GraphqlService } from './config/graphql/graphql.service'

import { CacheService } from './config/cache/cache.service'

import { UserModule } from './modules/user/user.module'
@Module({
  imports: [
    GraphQLModule.forRootAsync({
      useClass: GraphqlService
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeormService
    }),
    CacheModule.registerAsync({
      useClass: CacheService
    }),

    UserModule,
    GraphqlModule,
    TypeormModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
