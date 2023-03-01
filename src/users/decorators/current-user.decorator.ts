import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Any thing that we provide to decorator it is as the first argument here

// Param decorators exist outside the DI system, so our decorator
// cant get an incatnce of usersService directly. That is why wee need to create
// inteceptor.

export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.currentUser;
  },
);
