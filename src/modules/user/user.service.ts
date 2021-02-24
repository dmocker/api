import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User, CreateUserInput, LoginResponse, LoginUserInput } from './user.entity'
import { MongoRepository } from 'typeorm'
import * as jwt from 'jsonwebtoken'
import { AuthenticationError } from 'apollo-server-core'
import { UpdateUserInput } from '../../graphql'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>
  ) {}

  async findAll(offet: number, limit: number): Promise<User[]> {
    return await this.userRepository.find({
      order: { createdAt: 'DESC' },
      skip: offet,
      take: limit,
      cache: true
    })
  }

  async findById(_id: string): Promise<User> {
    return await this.userRepository.findOne({ _id })
  }

  async create(input: CreateUserInput): Promise<User> {
    const { username, password, email } = input
    const message = 'Email has already been token.'
    const existedUser = await this.userRepository.findOne({ email })

    if (existedUser) {
      throw new Error(message)
    }

    const user = new User()
    user.username = username
    user.password = password
    user.email = email

    return await this.userRepository.save(user)
  }

  async update(_id: string, input: UpdateUserInput): Promise<boolean> {
    const { username, password, email } = input
    const user = await this.userRepository.findOne({ _id })
    user.username = username
    user.password = password
    user.email = email

    return (await this.userRepository.save(user)) ? true : false
  }

  async delete(_id: string): Promise<boolean> {
    const user = new User()
    user._id = _id
    return (await this.userRepository.remove(user)) ? true : false
  }

  async deleteAll(): Promise<boolean> {
    return (await this.userRepository.deleteMany({})) ? true : false
  }

  async login(input: LoginUserInput): Promise<LoginResponse> {
    const { username, password } = input
    const message = 'Incorrect email or password, please try again.'
    const user = await this.userRepository.findOne({ username })

    if (!user || !(await user.matchesPassword(password))) {
      throw new AuthenticationError(message)
    }

    const token = await jwt.sign(
      {
        issuer: 'mocker',
        subject: user._id,
        audience: user.username
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: 60 * 1000 * 10 // 10 minutes
      }
    )

    return { token }
  }

  async findOneByToken(token: string): Promise<User> {
    const message = 'The token you provided wa invalid.'
    let currentUser
    try {
      const decodeToken = await jwt.verify(token, process.env.TOKEN_SECRET)
      currentUser = await this.userRepository.findOne({ _id: decodeToken.subject })
    } catch (error) {
      throw new AuthenticationError(message)
    }

    return currentUser
  }

  async setRole(_id: string, role: string): Promise<boolean> {
    return (await this.userRepository.updateOne({ _id }, { $set: { role } })) ? true : false
  }
}
