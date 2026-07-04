import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { FiDatabase, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

const API_BASE = "http://localhost:3001/api";
const COLORS = ["#10b981", "#ef4444"]; // Verde (Bueno), Rojo (Dañado)

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    total: 0,
    bueno: 0,
    danado: 0,
  });
  const [hardwareData, setHardwareData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${API_BASE}/estadisticas`, {
          withCredentials: true,
        });

        setMetrics(response.data.metrics);
        setHardwareData(response.data.hardwareData);
        setStatusData(response.data.statusData);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
        toast.error("Error al cargar las estadísticas. Verifica tu conexión.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-primary-600 font-medium">
            Cargando estadísticas...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
          <p className="text-gray-500 text-sm mt-1">
            Resumen general del inventario tecnológico.
          </p>
        </div>

        {/* Tarjetas de Métricas (Ajustadas a 3 columnas para los 2 estados) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Total Componentes
              </p>
              <h3 className="text-3xl font-bold text-gray-900">
                {metrics.total}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <FiDatabase className="w-6 h-6 text-primary-600" />
            </div>
          </div>

          {/* Estado: Bueno */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Componentes Buenos
              </p>
              <h3 className="text-3xl font-bold text-green-600">
                {metrics.bueno}
              </h3>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>

          {/* Estado: Dañado */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Componentes Dañados
              </p>
              <h3 className="text-3xl font-bold text-red-600">
                {metrics.danado}
              </h3>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <FiAlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Sección de Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfica de Barras */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Equipos por Categoría
            </h3>
            <div className="h-72">
              {hardwareData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={hardwareData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280" }}
                    />
                    <Tooltip
                      cursor={{ fill: "#f3f4f6" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="total"
                      name="Total Inventario"
                      fill="#93c5fd"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="disponibles"
                      name="Buenos / Operativos"
                      fill="#1e40af"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No hay datos registrados aún
                </div>
              )}
            </div>
          </div>

          {/* Gráfica de Dona (Ahora con 2 Estados) */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Estado General del Inventario
            </h3>
            <div className="h-72">
              {statusData.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No hay estados registrados aún
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
