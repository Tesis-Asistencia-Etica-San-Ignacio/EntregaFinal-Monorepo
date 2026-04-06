import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../infrastructure/config";

// permite los roles que le pases en el array "roles"
export const validateRoleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    let token = req.cookies.accessToken; 

    if (!token) {
      console.log("Token no proporcionado");
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      
      req.user = decoded;

      // Extraer rol (type) y verificar contra el array de roles permitidos
      const userRole = decoded.type;
      if (!roles.includes(userRole)) {
        return res.status(403).json({ message: "Acceso denegado" });
      }

      req.user = {
        id: decoded.id as string,
        type: userRole,
      };

      next();
    } catch (error) {
      console.error("Error al verificar token:", error);
      return res.status(401).json({ message: "Token inválido o expirado" });
    }
  };
};

