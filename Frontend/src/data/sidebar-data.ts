import { Upload, FileStack, ChartLine, Settings, User, Palette, BrainCircuit, FilePlus2 } from "lucide-react";
import type { SidebarData } from "../types/sideBar";

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: "Menú",
      items: [
        { title: "Crear nuevo caso", url: "/crear-nuevo-caso", icon: FilePlus2, roles: ["INVESTIGADOR"] },
        { title: "Subir archivos", url: "/subir-archivos", icon: Upload, roles: ["EVALUADOR"] },
        { title: "Historial", url: "/historial-archivos-evaluados", icon: FileStack, roles: ["EVALUADOR"] },
        { title: "Historial", url: "/historial-casos", icon: FileStack, roles: ["INVESTIGADOR"] },
        { title: "Estadísticas", url: "/estadisticas", icon: ChartLine, roles: ["EVALUADOR"] }
      ]
    },
    {
      title: "Otros",
      items: [
        {
          title: "Ajustes",
          icon: Settings,
          items: [
            { title: "Cuenta", url: "/ajustes/cuenta", icon: User },
            { title: "Inteligencia artificial", url: "/ajustes/ia", icon: BrainCircuit, roles: ["EVALUADOR"] },
            { title: "Apariencia", url: "/ajustes/apariencia", icon: Palette },
          ]
        }
      ]
    }
  ]
};
