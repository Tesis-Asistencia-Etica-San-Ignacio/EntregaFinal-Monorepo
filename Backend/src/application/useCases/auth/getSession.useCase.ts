import { AuthService } from '../../services/auth.service';
import { UserResponseDto } from '../../dtos/user.dto';

export class GetSessionUseCase {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    public async execute(token: string): Promise<UserResponseDto> {
        return this.authService.getSession(token);
    }
}
