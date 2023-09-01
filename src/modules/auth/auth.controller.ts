// import {
//   Controller,
//   Body,
//   Post,
//   UseGuards,
//   Get,
//   Request,
// } from '@nestjs/common';
// import { ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
// import { AuthGuard } from '@nestjs/passport';
// import { AuthService } from '@modules/auth/auth.service';
// import { SigninDto } from '@modules/auth/dto/signin.dto';
// import { SignupDto } from '@modules/auth/dto/signup.dto';
// import { UsersService } from '@modules/user/user.service';
// import { IRequest } from '@modules/user/user.interface';

// @Controller('api/auth')
// @ApiTags('authentication')
// export class AuthController {
//   constructor(
//     private readonly authService: AuthService,
//     private readonly userService: UsersService,
//   ) {}

//   @Post('signin')
//   @ApiResponse({ status: 201, description: 'Successful Login' })
//   @ApiResponse({ status: 400, description: 'Bad Request' })
//   @ApiResponse({ status: 401, description: 'Unauthorized' })
//   async signin(@Body() signinDto: SigninDto): Promise<any> {
//     const user = await this.authService.validateUser(signinDto);
//     return await this.authService.createToken(user);
//   }

//   @Post('signup')
//   @ApiResponse({ status: 201, description: 'Successful Registration' })
//   @ApiResponse({ status: 400, description: 'Bad Request' })
//   @ApiResponse({ status: 401, description: 'Unauthorized' })
//   async signup(@Body() signupDto: SignupDto): Promise<any> {
//     const user = await this.userService.create(signupDto);
//     return await this.authService.createToken(user);
//   }

//   @ApiBearerAuth()
//   @UseGuards(AuthGuard())
//   @Get('me')
//   @ApiResponse({ status: 200, description: 'Successful Response' })
//   @ApiResponse({ status: 401, description: 'Unauthorized' })
//   async getLoggedInUser(@Request() request: IRequest): Promise<any> {
//     return request.user;
//   }
// }

import {
  Controller,
  Body,
  Post,
  UseGuards,
  Get,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '@modules/auth/auth.service';
import { SigninDto } from '@modules/auth/dto/signin.dto';
import { SignupDto } from '@modules/auth/dto/signup.dto';
import { UsersService } from '@modules/user/user.service';
import { IRequest } from '@modules/user/user.interface';
import { CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { Logger } from '@nestjs/common';

@Controller('api/auth')
@ApiTags('authentication')
export class AuthController {
  private readonly cognitoClient: CognitoIdentityProviderClient;
  private readonly userPool: CognitoUserPool;
  private readonly providerClient: CognitoIdentityProviderClient;
  private readonly lambdaClient: LambdaClient;
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,

  ) {
    this.lambdaClient = new LambdaClient({
      region: 'us-east-2',
    });
    this.providerClient = new CognitoIdentityProviderClient({
      region: 'us-east-2',
    });
  }

  private async invokeCreateUserLambda(data: any): Promise<any> {
    try {


      const payload = new TextEncoder().encode(JSON.stringify(data));
      const command = new InvokeCommand({
        FunctionName: 'UserManagementStack-CreateUserLambda0154A2EB-5ufMqT4E5ntw',
        Payload: payload,
      });
      const response = await this.lambdaClient.send(command);
      console.log('response', response);
      this.logger.log(`Lambda response: ${JSON.stringify(response)}`);
      // Decode the Uint8Array payload response from Lambda back to string
      const lambdaResponseString = new TextDecoder().decode(response.Payload as Uint8Array);
      const lambdaResponse = JSON.parse(lambdaResponseString);
      this.logger.log(`Lambda response: ${JSON.stringify(lambdaResponse)}`);
      return lambdaResponse;
      
    } catch (error) {
      this.logger.error(`Error invoking Lambda: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('signin')
  @ApiResponse({ status: 201, description: 'Successful Login' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async signin(@Body() signinDto: SigninDto): Promise<any> {
    const user = await this.authService.validateUser(signinDto);
    return await this.authService.createToken(user);
  }

  @Post('signup')
  @ApiResponse({ status: 201, description: 'Successful Registration' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async signup(@Body() signupDto: SignupDto): Promise<any> {
    const existingUser = await this.userService.getByEmail(signupDto.email);
    // If user's email exists in the database, throw an error
    if (existingUser) {
      throw new Error(`${signupDto.email} Email already exists in the system.`);
    }

    // If the email does not exist, proceed with invoking the Lambda function
    // Assuming lambdaResponse.email holds the newly created email from Cognito.
    const lambdaResponse = await this.invokeCreateUserLambda(signupDto);
    console.log('lambdaResponse', lambdaResponse);
    this.logger.log(`Lambda response: ${JSON.stringify(lambdaResponse)}`);
    if (lambdaResponse.error) {
      throw new Error(lambdaResponse.errorMessage || 'Error creating user in Cognito.');
    }

    // Now, save this new user data in your own database
    const newUser = await this.userService.create({
      ...signupDto,
      email: lambdaResponse.email // Override with the email received from Lambda, if necessary
    });
    this.logger.log(`New user created: ${JSON.stringify(newUser)}`);
    return await this.authService.createToken(newUser);
}

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('me')
  @ApiResponse({ status: 200, description: 'Successful Response' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLoggedInUser(@Request() request: IRequest): Promise<any> {
    return request.user;
  }
}
