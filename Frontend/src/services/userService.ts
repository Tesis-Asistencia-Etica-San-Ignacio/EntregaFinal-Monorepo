import { userApi, noCredsInstance } from '../lib/api/userApi';
import {
    CreateUserInput,
    UpdateUserInput,
    UpdatePasswordInput,
    User,
} from '../types';

export const createUser = async (
    newUser: CreateUserInput,
): Promise<User> => {
    const { data } = await noCredsInstance.post<User>(
        '/user/investigador',
        newUser,
    );
    return data;
};

export const updateUser = async (
    updates: UpdateUserInput,
): Promise<User> => {
    const { data } = await userApi.patch<User>('/user/', updates);
    return data;
};
export const updatePassword = async (
    payload: UpdatePasswordInput,
): Promise<{ message: string }> => {
    const { data } = await userApi.post<{ message: string }>('/user/update-password', payload);
    return data;
};
