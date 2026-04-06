import AuthForm from "@/components/organisms/Auth-form";
import { FormField } from "@/types/formTypes";
import { CarouselPlugin, Slide } from "../molecules/Carousel";
import { CreateUserInput, LoginInput } from "../../types";

interface AuthTemplateProps {
  loginFields: FormField[];
  registryFields: FormField[];
  slides: Slide[];
  onLogin: (values: LoginInput) => Promise<void>;
  onRegister: (values: CreateUserInput) => Promise<void>;
}

export default function AuthTemplate({
  loginFields,
  registryFields,
  slides,
  onLogin,
  onRegister,
}: AuthTemplateProps) {
  return (
    <main className="grid h-screen w-screen p-8 gap-8 overflow-x-hidden grid-cols-1 xl:grid-cols-2">
      {/* Oculto en moviles/tablets, visible en xl en adelante */}
      <section className="hidden xl:flex items-center justify-center h-full overflow-hidden rounded-xl">
        <CarouselPlugin slides={slides} />
      </section>

      <section className="flex flex-col h-full min-h-0">
        <AuthForm
          loginFields={loginFields}
          registryFields={registryFields}
          onLogin={onLogin}
          onRegister={onRegister}
        />
      </section>
    </main>
  );
}
