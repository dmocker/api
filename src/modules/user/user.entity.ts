import {
  Entity,
  ObjectIdColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  BeforeRemove
} from 'typeorm'

import * as uuid from 'uuid'
import * as bcrypt from 'bcrypt'
import { IsString, IsNotEmpty, Length, MinLength, IsEmail, IsBoolean } from 'class-validator'

export class LoginUserInput {
  @IsString()
  @MinLength(4, { message: 'Your username must be at least 4 characters.' })
  @IsNotEmpty()
  username: string

  @Length(6, 32, { message: 'Your password muse be between 6 and 32 characters.' })
  @IsString()
  @IsNotEmpty()
  password: string
}

export class CreateUserInput {
  @IsString()
  @MinLength(4, { message: ' Your username must be at least 4 characters.' })
  @IsNotEmpty()
  username: string

  @Length(6, 32, { message: 'Your password muse be between 6 and 32 characters.' })
  @IsString()
  @IsNotEmpty({ message: 'Your password can not be blank.' })
  password: string

  @IsEmail(undefined, { message: 'Invalid email message' })
  @IsNotEmpty({ message: 'Your email can not be blank.' })
  email: string
}

export class LoginResponse {
  @IsString()
  token: string
}

@Entity()
export class User {
  @ObjectIdColumn()
  _id: string

  @Column()
  @IsString()
  @IsNotEmpty()
  username: string

  @Column()
  @IsString()
  @IsNotEmpty()
  password: string

  @Column()
  @IsString()
  @IsNotEmpty()
  @Index({ unique: true })
  email: string

  @Column()
  @IsString()
  @IsNotEmpty()
  role: string

  @Column()
  @IsBoolean()
  @IsNotEmpty()
  status: boolean

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: string

  @CreateDateColumn({ type: 'timestamp' })
  updatedAt: string

  @BeforeInsert()
  async beforeRegister() {
    this._id = await uuid.v1()
    this.role = 'MEMBER'
    this.status = true
    this.password = await bcrypt.hash(this.password, 10)
  }

  @BeforeUpdate()
  async beforeUpdate() {
    this.password = await bcrypt.hash(this.password, 10)
  }

  @BeforeRemove()
  async beforeBlock() {
    this.status = false
  }

  async matchesPassword(password) {
    return await bcrypt.compare(password, this.password)
  }
}
