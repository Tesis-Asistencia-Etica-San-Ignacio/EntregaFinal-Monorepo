import { Button } from "@/components/atoms/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/atoms/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/atoms/ui/radio-group"
import ContentSection from "@/components/molecules/ContentSection"
import SidebarLayoutPreview from "@/components/molecules/SidebarLayoutPreview"
import ThemeApp from "@/components/molecules/ThemeApp"

interface AppearanceTemplateProps {
  title: string
  desc: string
  form: any
  onSubmit: (data: any) => void
}

export default function AppearanceTemplate({
  title,
  desc,
  form,
  onSubmit,
}: AppearanceTemplateProps) {
  return (
    <ContentSection title={title} desc={desc}>
      <div className="lg:max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <section className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-base font-medium">Tema</h4>
                <p className="text-sm text-muted-foreground">
                  Seleccione el tema para la aplicación.
                </p>
              </div>

              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid max-w-md grid-cols-2 gap-8 pt-2"
                      >
                        <FormItem>
                          <FormLabel className="[&:has([data-state=checked])>div]:border-primary flex flex-col items-center justify-center cursor-pointer">
                            <FormControl>
                              <RadioGroupItem value="light" className="sr-only" />
                            </FormControl>
                            <ThemeApp variant="light" />
                            <span className="block text-sm font-medium">
                              Claro
                            </span>
                          </FormLabel>
                        </FormItem>

                        <FormItem>
                          <FormLabel className="[&:has([data-state=checked])>div]:border-primary flex flex-col items-center justify-center cursor-pointer">
                            <FormControl>
                              <RadioGroupItem value="dark" className="sr-only" />
                            </FormControl>
                            <ThemeApp variant="dark" />
                            <span className="block text-sm font-medium">
                              Oscuro
                            </span>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section className="space-y-4 border-t pt-6">
              <div className="space-y-1">
                <h4 className="text-base font-medium">Layout</h4>
                <p className="text-sm text-muted-foreground">
                  Seleccione el comportamiento de la barra lateral al contraerse.
                </p>
              </div>

              <FormField
                control={form.control}
                name="sidebarLayout"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid max-w-xl gap-3 sm:grid-cols-2"
                      >
                        <FormItem>
                          <FormLabel className="flex cursor-pointer flex-col gap-2.5 rounded-lg border bg-card p-3 transition-colors  [&:has([data-state=checked])]:border-primary ">
                            <FormControl>
                              <RadioGroupItem value="icon" className="sr-only" />
                            </FormControl>
                            <SidebarLayoutPreview
                              variant="icon"
                              selected={field.value === "icon"}
                            />
                            <div className="space-y-1">
                              <span className="block text-sm font-medium">
                                Compacta
                              </span>
                              <span className="block text-xs leading-5 text-muted-foreground">
                                Mantiene una columna de acceso rápido mediante
                                iconos.
                              </span>
                            </div>
                          </FormLabel>
                        </FormItem>

                        <FormItem>
                          <FormLabel className="flex cursor-pointer flex-col gap-2.5 rounded-lg border bg-card p-3 transition-colors [&:has([data-state=checked])]:border-primary">
                            <FormControl>
                              <RadioGroupItem
                                value="offcanvas"
                                className="sr-only"
                              />
                            </FormControl>
                            <SidebarLayoutPreview
                              variant="offcanvas"
                              selected={field.value === "offcanvas"}
                            />
                            <div className="space-y-1">
                              <span className="block text-sm font-medium">
                                Oculta
                              </span>
                              <span className="block text-xs leading-5 text-muted-foreground">
                                Retrae la barra lateral para habilitar el uso total de la
                                pantalla.
                              </span>
                            </div>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <Button type="submit">Actualizar preferencias</Button>
          </form>
        </Form>
      </div>
    </ContentSection>
  )
}
