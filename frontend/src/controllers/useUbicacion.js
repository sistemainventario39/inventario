import { useState, useEffect } from "react";
import axios from "axios";


export function useUbicaciones({ regionActual, estadoActual }) {
  const [regionList, setRegionList] = useState([]);
  const [estadoList, setEstadoList] = useState([]);
  const [ciudadesList, setCiudadesList] = useState([]);

  useEffect(() => {
    const obtenerRegiones = async () => {
      try {
        const response = await axios.get(`/api/region`);
        setRegionList(response.data);
      } catch (error) {
        console.error("Error obteniendo regiones:", error);
      }
    };
    obtenerRegiones();
  }, []);

  useEffect(() => {
    const obtenerEstados = async () => {
      if (!regionActual) {
        setEstadoList([]);
        return;
      }
      try {
        const response = await axios.get(
          `/api/region/${regionActual}/estados`,
        );
        setEstadoList(response.data);
      } catch (error) {
        console.error("Error obteniendo estados:", error);
        setEstadoList([]);
      }
    };
    obtenerEstados();
  }, [regionActual]);

  useEffect(() => {
    const obtenerCiudades = async () => {
      if (!estadoActual) {
        setCiudadesList([]);
        return;
      }
      try {
        const response = await axios.get(
          `/api/estados/${estadoActual}/ciudades`,
        );
        setCiudadesList(response.data);
      } catch (error) {
        console.error("Error obteniendo ciudades:", error);
        setCiudadesList([]);
      }
    };
    obtenerCiudades();
  }, [estadoActual]);

  return {
    regionList,
    estadoList,
    ciudadesList,
  };
}

export const ALA_OPCIONES = ["Este", "Oeste", "Norte", "Sur"];
