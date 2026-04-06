import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../../domain/repositories/user.repository';
import config from '../../infrastructure/config';
import { GetUserByIdUseCase } from '../../application/useCases/user';
import { JwtTokensDto, LoginDto, RefreshTokenDto } from '../dtos/auth.dto';
import type { UserResponseDto } from '../dtos/user.dto';

export class AuthService {
  private readonly userRepository: IUserRepository;
  private readonly getUserByIdUseCase: GetUserByIdUseCase;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
    this.getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
  }

  public async login(loginDto: LoginDto): Promise<JwtTokensDto> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    if (!user.password) {
      throw new Error('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    const payload = { id: user.id, type: user.type };
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.tokenExpiresIn,
    });
    const refreshToken = jwt.sign(payload, config.jwt.secretRefresh, {
      expiresIn: config.jwt.refreshExpiresTokenIn,
    });

    return {
      accessToken,
      refreshToken,
      userType: user.type,
      id: user.id,
    };
  }

  public async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<JwtTokensDto> {
    const { refreshToken } = refreshTokenDto;

    try {
      const decoded: any = jwt.verify(refreshToken, config.jwt.secretRefresh);
      const { iat, exp, ...payload } = decoded;

      const newAccessToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.tokenExpiresIn,
      });

      return {
        accessToken: newAccessToken,
        refreshToken,
        userType: decoded.type,
        id: decoded.id,
      };
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  public async getSession(token: string): Promise<UserResponseDto> {
    try {
      const decoded: any = jwt.verify(token, config.jwt.secret);
      const user = await this.getUserByIdUseCase.execute(decoded.id);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch {
      throw new Error('Token inválido o expirado');
    }
  }
}
