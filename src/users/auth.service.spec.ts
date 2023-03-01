import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUserService: Partial<UsersService>;
  beforeEach(async () => {
    //Create a fake copy of the users service
    //By defininf type of fakeUSerService TS helps us writing a good code
    const users: User[] = [];
    fakeUserService = {
      find: (email: string) => {
        const filteredUSers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUSers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 10000),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    // What the provider below : If ayone asks for UserService give them fakeUserService instead.
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUserService },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creaates a new user with a salted and hjashed password', async () => {
    const user = await service.signup('ajaja@.pl', 'aadf');
    expect(user.password).not.toEqual('aadf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    fakeUserService.find = () =>
      Promise.resolve([{ id: 1, email: 'aa', password: '1a' } as User]);
    await expect(
      service.signup('asaaaaaaaaaaaadf@asdf.com', 'asdf'),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws an error if provided email is not in the database', async () => {
    await expect(service.signin('aadffffsdf@asdf.pl', '11')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws if an invalid password is pro', async () => {
    fakeUserService.find = () =>
      Promise.resolve([{ email: '1@1.pl', password: 'ex' } as User]);
    await expect(service.signin('1@1.pl', 'ex')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('return a user if password is correct', async () => {
    // const user = await service.signup('a@a.pl', 'aaa')
    // console.log(user);

    fakeUserService.find = () =>
      Promise.resolve([
        {
          email: 'a@a.pl',
          password:
            '08e85b60c9993ee2.09bde6491eeaca80b16c53e36d78c7988fb96092688e3aaae9ef265f62240f28',
        } as User,
      ]);
    const user = await service.signin('a@a.pl', 'aaa');
    await expect(user).toBeDefined();
  });
  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('asdf@asdf.com', 'asdf');
    await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if signin is called with an unused email', async () => {
    await expect(
      service.signin('asdflkj@asdlfkj.com', 'passdflkj'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('laskdjf@alskdfj.com', 'password');
    await expect(
      service.signin('laskdjf@alskdfj.com', 'laksdlfkj'),
    ).rejects.toThrow(BadRequestException);
  });
});
