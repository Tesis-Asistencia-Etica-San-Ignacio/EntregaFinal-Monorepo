import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/ui/button";
import { DynamicForm, DynamicFormHandles } from "@/components/molecules/Dynamic-form";
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/atoms/ui/tabs";
import type { FormField } from "@/types/formTypes";
import { CreateUserInput, LoginInput } from "../../types";
import { useNotify } from "@/hooks/useNotify";

import logoLight from "@/assets/LogoHUSI.png";
import logoDark from "@/assets/Logo_HUSI_Blanco.png";

interface AuthFormProps {
    loginFields: FormField[];
    registryFields: FormField[];
    onLogin: (values: LoginInput) => Promise<void>;
    onRegister: (values: CreateUserInput) => Promise<void>;
    className?: string;
}

export default function AuthForm({
    loginFields,
    registryFields,
    onLogin,
    onRegister,
    className,
}: AuthFormProps) {
    const loginFormRef = useRef<DynamicFormHandles>(null);
    const registryFormRef = useRef<DynamicFormHandles>(null);
    const { notifySuccess, notifyError } = useNotify();

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginFormRef.current) return;

        loginFormRef.current.handleSubmit(async (data) => {
            try {
                await onLogin(data as LoginInput);
                notifySuccess({
                    title: "¡Bienvenido!",
                    description: "Has iniciado sesión correctamente.",
                    icon: "✅",
                    closeButton: true,
                });
            } catch (err: any) {
                notifyError({
                    title: "Error al iniciar sesión",
                    description: "Revise sus credenciales.",
                    icon: "🚫",
                    closeButton: true,
                });
            }
        })();
    };

    const handleRegistrySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!registryFormRef.current) return;

        registryFormRef.current.handleSubmit(async (data) => {
            try {
                await onRegister(data as CreateUserInput);
                notifySuccess({
                    title: "Cuenta creada",
                    description: "Te has registrado exitosamente.",
                    icon: "✅",
                    closeButton: true,
                });
            } catch (err: any) {
                notifyError({
                    title: "Error al registrarse",
                    description: err.response?.data?.message ?? "No se pudo completar el registro.",
                    icon: "🚫",
                    closeButton: true,
                });
            }
        })();
    };

    return (
        <div className={cn("flex flex-col h-full min-h-0", className)}>
            <div className="self-center">
                <img
                    src={logoLight}
                    alt="Logo HUSI"
                    className="block dark:hidden h-auto w-auto max-h-[300px] max-w-[300px] rounded-xl"
                />
                <img
                    src={logoDark}
                    alt="Logo HUSI"
                    className="hidden dark:block h-auto w-auto max-h-[300px] max-w-[300px] rounded-xl m-5"
                />
            </div>

            <Tabs defaultValue="login" className="flex flex-col flex-1 min-h-0">
                <TabsList className="flex items-center justify-center gap-2 rounded-full self-center px-3 py-7">
                    <TabsTrigger value="login" className="px-4 py-2 text-sm font-medium rounded-full cursor-pointer">
                        Iniciar Sesión
                    </TabsTrigger>
                    <TabsTrigger value="registry" className="px-4 py-2 text-sm font-medium rounded-full cursor-pointer">
                        Registro
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="flex flex-col flex-1 min-h-0 space-y-4">
                    <h1 className="text-2xl font-bold text-center">Iniciar Sesión</h1>
                    <form onSubmit={handleLoginSubmit} className="flex flex-col flex-1 min-h-0">
                        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto gap-4">
                            <DynamicForm ref={loginFormRef} formDataConfig={loginFields} />
                            <Button type="submit" className="w-full mb-4">
                                Iniciar Sesión
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                <TabsContent value="registry" className="flex flex-col flex-1 min-h-0 space-y-4">
                    <h1 className="text-2xl font-bold text-center">Crea una Cuenta</h1>
                    <form onSubmit={handleRegistrySubmit} className="flex flex-col flex-1 min-h-0">
                        <div className="flex-1 min-h-0 overflow-y-auto gap-4">
                            <DynamicForm ref={registryFormRef} formDataConfig={registryFields} />
                        </div>
                        <Button type="submit" className="w-full mb-4">
                            Registrarse
                        </Button>
                    </form>
                </TabsContent>
            </Tabs>
        </div>
    );
}
