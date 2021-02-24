import { Resolver, Query, Mutation, Args, Subscription, Context } from '@nestjs/graphql'
import { UserService } from './user.service'
import { User, CreateUserInput, LoginResponse, LoginUserInput } from './user.entity'
import { UpdateUserInput } from '../../graphql'
import { PubSub } from 'graphql-subscriptions'
@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => String)
  async hello() {
    return 'world'
  }

  @Query(() => User)
  async me(
    @Context('currentUser')
    currentUser: User
  ) {
    return currentUser
  }

  @Query(() => [User])
  async users(
    @Args('offset') offset: number,
    @Args('limit')
    limit: number
  ) {
    return await this.userService.findAll(offset, limit)
  }

  @Query(() => User)
  async user(
    @Args('_id')
    _id: string
  ) {
    return await this.userService.findById(_id)
  }

  @Mutation(() => User, { name: 'register' })
  async createUser(
    @Args('input')
    input: CreateUserInput,
    @Context('pubSub')
    pubSub: PubSub
  ) {
    const createdUser = await this.userService.create(input)
    pubSub.publish('userCreated', { userCreated: createdUser })

    return createdUser
  }

  @Mutation(() => Boolean)
  async updateUser(
    @Args('_id')
    _id: string,
    @Args('input')
    input: UpdateUserInput
  ) {
    return await this.userService.update(_id, input)
  }

  @Mutation(() => Boolean)
  async deleteUser(
    @Args('_id')
    _id: string
  ) {
    return await this.userService.delete(_id)
  }

  @Mutation(() => Boolean)
  async deleteUsers() {
    return await this.userService.deleteAll()
  }

  @Mutation(() => LoginResponse)
  async login(
    @Args('input')
    input: LoginUserInput
  ) {
    return await this.userService.login(input)
  }

  @Mutation(() => Boolean)
  async setRole(
    @Args('_id')
    _id: string,
    @Args('role')
    role: string
  ) {
    return await this.userService.setRole(_id, role)
  }

  @Subscription()
  userCreated(
    @Context('pubSub')
    pubSub: PubSub
  ) {
    return pubSub.asyncIterator('userCreated')
  }
}
