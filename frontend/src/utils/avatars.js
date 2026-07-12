import { FiMail, FiShield, FiEdit2, FiSave, FiX, FiUser } from "react-icons/fi";
import {
FaUser,
FaUserAstronaut,
FaUserTie,
FaUserNinja,
FaUserGraduate,
FaUserSecret,
FaRobot,
} from "react-icons/fa";
import { GiNinjaHead } from "react-icons/gi";
import { BsPersonBadge, BsPersonWorkspace } from "react-icons/bs";

export const availableIcons = [
{ id: 1, icon: FiUser, name: "Usuario Básico", color: "text-gray-400" },
{ id: 2, icon: FaUser, name: "Usuario Clásico", color: "text-blue-400" },
{
    id: 3,
    icon: FaUserAstronaut,
    name: "Astronauta",
    color: "text-purple-400",
},
{ id: 4, icon: FaUserTie, name: "Ejecutivo", color: "text-indigo-400" },
{ id: 5, icon: FaUserNinja, name: "Ninja", color: "text-red-400" },
{ id: 6, icon: FaUserGraduate, name: "Graduado", color: "text-green-400" },
{ id: 7, icon: FaUserSecret, name: "Agente Secreto", color: "text-gray-600" },
{ id: 8, icon: FaRobot, name: "Robot", color: "text-cyan-400" },
{ id: 9, icon: GiNinjaHead, name: "Ninja Head", color: "text-slate-400" },
{
    id: 10,
    icon: BsPersonBadge,
    name: "Identificado",
    color: "text-emerald-400",
},
{
    id: 11,
    icon: BsPersonWorkspace,
    name: "Trabajador",
    color: "text-orange-400",
},
];