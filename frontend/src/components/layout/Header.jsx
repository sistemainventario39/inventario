import React, { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import Axios from "axios";
import { FiCpu, FiUser } from "react-icons/fi";
import { Menu, X, UserIcon, LogOutIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../controllers/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { availableIcons } from "../../utils/avatars";

const listItems = [
  { icon: UserIcon, property: "Profile", path: "/perfil" },
  {
    icon: LogOutIcon,
    property: "Sign Out",
  },
];

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [avatarId, setAvatarId] = useState(1);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const loadAvatar = () => {
      const saved = user?.avatar_id || localStorage.getItem("selectedAvatarId");
      if (saved) {
        setAvatarId(Number(saved));
      }
    };
    loadAvatar();

    window.addEventListener("avatarUpdated", loadAvatar);
    return () => window.removeEventListener("avatarUpdated", loadAvatar);
  }, [user]);

  const ActiveAvatar = availableIcons.find(icon => icon.id === avatarId);
  const ActiveIconComponent = ActiveAvatar ? ActiveAvatar.icon : FiUser;
  const activeIconColor = ActiveAvatar ? ActiveAvatar.color : "text-gray-400";

  const handleLogout = async () => {
    try {
      await Axios.post(
        "/api/logout",
        {},
        { withCredentials: true },
      );
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };
  const getNavClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
      isActive
        ? "text-primary-600 border-primary-600"
        : "text-gray-500 border-transparent hover:text-primary-600 hover:border-primary-200"
    }`;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img
                src="/logo_cantv.png"
                alt="CANTV Logo"
                className="h-10 w-auto"
              />
              {/* <span className="font-bold text-xl text-gray-900 tracking-tight ml-2">CANTV Inventario</span> */}
            </Link>

            {/* Navegación Principal */}
            <nav className="hidden md:flex space-x-4">
              <NavLink to="/dashboard" className={getNavClass}>
                Inicio
              </NavLink>
              <NavLink to="/busqueda" className={getNavClass}>
                Búsqueda
              </NavLink>
              <NavLink to="/registro" className={getNavClass}>
                Registro de Equipo
              </NavLink>
              {user?.rol === "Superadministrador" && (
                <NavLink to="/registro-usuarios" className={getNavClass}>
                  Gestión de Usuarios
                </NavLink>
              )}
              {user?.rol === "Superadministrador" && (
                <NavLink to="/ubicacion" className={getNavClass}>
                  Ubicación
                </NavLink>
              )}
              <NavLink to="/bitacora" className={getNavClass}>
                Bitácora
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center">
            {/* Menú móvil */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Perfil */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="overflow-hidden rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  <ActiveIconComponent className={`h-5 w-5 ${activeIconColor}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-40 min-w-[120px]"
                align="center"
                sideOffset={5}
              >
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {listItems.map((item, index) => (
                    <DropdownMenuItem
                      key={index}
                      onSelect={() => {
                        if (item.property === "Sign Out") {
                          handleLogout();
                        } else if (item.property === "Profile") {
                          navigate("/perfil");
                        }
                      }}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span className="text-popover-foreground">
                        {item.property}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Panel móvil */}
        <div
          className={
            "md:hidden overflow-hidden transition-[max-height] duration-300 " +
            (mobileOpen ? "max-h-96" : "max-h-0")
          }
        >
          <nav className="pb-4 pt-2 flex flex-col gap-1">
            {[
              { to: "/dashboard", label: "Inicio" },
              { to: "/busqueda", label: "Búsqueda" },
              { to: "/registro", label: "Registro de Equipo" },
              { to: "/registro-usuarios", label: "Registro de Usuarios" },
              { to: "/ubicacion", label: "Ubicación" },
              { to: "/bitacora", label: "Bitácora" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    "px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-100",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
