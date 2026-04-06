import { useMutation } from '@tanstack/react-query';
import { updatePassword } from '@/services/userService';
import { DEFAULT_QUERY_OPTIONS } from '@/lib/api/constants';
import { useNotify } from '@/hooks/useNotify';
import type { UpdatePasswordInput } from '@/types/userType';

export function useUpdatePassword() {
  const { notifySuccess, notifyError } = useNotify();

  const mutation = useMutation<{ message: string }, Error, UpdatePasswordInput>({
    mutationFn: updatePassword,
    ...DEFAULT_QUERY_OPTIONS,
    onSuccess: () => {
      notifySuccess({
        title: 'Contraseña actualizada',
        description: 'Tu nueva contraseña ha sido guardada.',
        icon: '✅',
        closeButton: true,
      });
    },
    onError: err => {
      notifyError({
        title: 'Error al actualizar contraseña',
        description:
          (err as any)?.response?.data?.message ??
          'No se pudo actualizar tu contraseña.',
        icon: '🚫',
        closeButton: true,
      });
    },
  });

  return {
    updatePassword: (data: UpdatePasswordInput) => mutation.mutateAsync(data),
    loading: mutation.isPending,
    error: mutation.error,
  };
}
