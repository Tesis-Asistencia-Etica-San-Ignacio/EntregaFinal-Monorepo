import { NextFunction, Request, Response } from 'express';
import { CreateUserDto, CreateUserSchema, UpdatePasswordSchema, UpdateUserDto, UpdateUserIaSettingsDto, UpdateUserIaSettingsSchema, UpdateUserSchema } from '../../application/dtos/user.dto';
import { CreateEvaluatorUseCase, CreateInvestigatorUseCase } from '../../application/useCases/user/createUser.useCase';
import { DeleteUserUseCase } from '../../application/useCases/user/deleteUser.useCase';
import { GetAllUsersUseCase } from '../../application/useCases/user/getAllUsers.useCase';
import { GetUserByIdUseCase } from '../../application/useCases/user/getUserById.useCase';
import { UpdatePasswordUseCase } from '../../application/useCases/user/updatePassword.useCase';
import { UpdateUserUseCase } from '../../application/useCases/user/updateUser.useCase';
import { isValidObjectId, validateRequestBody } from '../../shared/utils';

export class UserController {
  constructor(
    private readonly createEvaluatorUseCase: CreateEvaluatorUseCase,
    private readonly createInvestigatorUseCase: CreateInvestigatorUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly updatePasswordUseCase: UpdatePasswordUseCase
  ) {}

  public getAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const users = await this.getAllUsersUseCase.execute();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  public getById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid user id' });
        return;
      }

      const user = await this.getUserByIdUseCase.execute(id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  public createEvaluator = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validation = validateRequestBody(CreateUserSchema, req.body);
      if (!validation.success) {
        res.status(400).json({ message: validation.message });
        return;
      }

      const dto: CreateUserDto = {
        name: validation.data.name,
        last_name: validation.data.last_name,
        email: validation.data.email,
        password: validation.data.password,
        type: validation.data.type,
        modelo: validation.data.modelo,
        provider: validation.data.provider,
      };

      const newUser = await this.createEvaluatorUseCase.execute(dto);
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  };

  public createInvestigator = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validation = validateRequestBody(CreateUserSchema, req.body);
      if (!validation.success) {
        res.status(400).json({ message: validation.message });
        return;
      }

      const dto: CreateUserDto = {
        name: validation.data.name,
        last_name: validation.data.last_name,
        email: validation.data.email,
        password: validation.data.password,
        type: validation.data.type,
        modelo: validation.data.modelo,
        provider: validation.data.provider,
      };

      const newUser = await this.createInvestigatorUseCase.execute(dto);
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  };

  public update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      if (!isValidObjectId(userId)) {
        res.status(401).json({ message: 'Invalid user id' });
        return;
      }

      const profileValidation = validateRequestBody(UpdateUserSchema, req.body);
      const iaSettingsValidation = validateRequestBody(UpdateUserIaSettingsSchema, req.body);

      let safeData: UpdateUserDto | UpdateUserIaSettingsDto;

      if (profileValidation.success) {
        safeData = {
          ...(profileValidation.data.name !== undefined && { name: profileValidation.data.name }),
          ...(profileValidation.data.last_name !== undefined && { last_name: profileValidation.data.last_name }),
          ...(profileValidation.data.email !== undefined && { email: profileValidation.data.email }),
          ...(profileValidation.data.modelo !== undefined && { modelo: profileValidation.data.modelo }),
        };
      } else if (iaSettingsValidation.success) {
        safeData = {
          ...(iaSettingsValidation.data.modelo !== undefined && { modelo: iaSettingsValidation.data.modelo }),
          ...(iaSettingsValidation.data.provider !== undefined && { provider: iaSettingsValidation.data.provider }),
        };
      } else {
        res.status(400).json({ message: 'Invalid request body' });
        return;
      }

      const updatedUser = await this.updateUserUseCase.execute(userId, safeData);
      if (!updatedUser) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  };

  public delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      if (!isValidObjectId(userId)) {
        res.status(401).json({ message: 'Invalid user id' });
        return;
      }

      const wasDeleted = await this.deleteUserUseCase.execute(userId);
      if (!wasDeleted) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  public updatePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      if (!isValidObjectId(userId)) {
        res.status(401).json({ message: 'Invalid user id' });
        return;
      }

      const validation = validateRequestBody(UpdatePasswordSchema, req.body);
      if (!validation.success) {
        res.status(400).json({ message: validation.message });
        return;
      }

      await this.updatePasswordUseCase.execute({
        userId,
        password: validation.data.password,
        newPassword: validation.data.newPassword,
      });

      res.status(200).json({ message: 'ContraseÃ±a actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  };
}
