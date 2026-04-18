import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSidebar } from "@/components/atoms/ui/sidebar"
import { useSidebarLayout } from "@/context/SidebarLayoutContext"
import { useTheme } from "@/context/ThemeContext"
import AppearanceTemplate from "@/components/templates/settings/AppearanceTemplate"

const appearanceSchema = z.object({
  theme: z.enum(["light", "dark"]),
  sidebarLayout: z.enum(["icon", "offcanvas"]),
})

type AppearanceFormValues = z.infer<typeof appearanceSchema>

export default function AppearanceScreen() {
  const { theme, setTheme } = useTheme()
  const { sidebarLayout, setSidebarLayout } = useSidebarLayout()
  const { setOpen } = useSidebar()

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: {
      theme: theme as "light" | "dark",
      sidebarLayout,
    },
  })

  useEffect(() => {
    form.reset({
      theme: theme as "light" | "dark",
      sidebarLayout,
    })
  }, [form, sidebarLayout, theme])

  function onSubmit(data: AppearanceFormValues) {
    setTheme(data.theme)
    if (data.sidebarLayout !== sidebarLayout) {
      setSidebarLayout(data.sidebarLayout)
      setOpen(false)
    }
  }

  return (
    <AppearanceTemplate
      title="Apariencia"
      desc="Personaliza la apariencia de la aplicación. Cambia automáticamente entre los temas diurno y nocturno."
      form={form}
      onSubmit={onSubmit}
    />
  )
}
