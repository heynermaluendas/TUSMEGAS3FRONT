import { useState, useEffect } from "react";
import { Table, Spin, Alert, Input } from "antd";
import axios from "axios";
import config from "../config"; // ✅ Importación correcta

const UsuariosSinId = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]); // Para la búsqueda
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Obteniendo datos de MikroTik...");
        const responseUsuarios = await axios.get(`${config.BaseUrl}/mikrotik/usuarios/`);
        console.log("Respuesta MikroTik:", responseUsuarios.data);

        const responseContratantes = await axios.get(`${config.BaseUrl}/contratantes/`);
        console.log("Respuesta Contratantes:", responseContratantes.data);

        // Asegurar que sean arrays válidos
        const usuariosData = Array.isArray(responseUsuarios.data.usuarios) 
          ? responseUsuarios.data.usuarios 
          : [];

        const contratantesData = Array.isArray(responseContratantes.data) 
          ? responseContratantes.data 
          : responseContratantes.data.data || [];

        console.log("Usuarios MikroTik:", usuariosData);
        console.log("Contratantes:", contratantesData);

        // Extraer los IDs de contratantes en un Set para búsqueda rápida
        const idsContratantes = new Set(
          contratantesData
            .map((c) => c.plan_contratado_mes_atrasado) // Extraemos los IDs de contratantes
            .filter(Boolean) // Eliminamos valores vacíos o nulos
        );

        console.log("IDs de Contratantes:", idsContratantes);

        // Filtrar usuarios de MikroTik cuyo ID NO esté en contratantes
        const usuariosSinId = usuariosData.filter((usuario) => !idsContratantes.has(usuario[".id"]));

        setUsuarios(usuariosSinId);
        setFilteredUsuarios(usuariosSinId); // Inicializamos el estado filtrado
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError(`Error al cargar los datos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función de búsqueda
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = usuarios.filter(
      (usuario) =>
        usuario[".id"].toLowerCase().includes(value) || 
        usuario.name.toLowerCase().includes(value)
    );
    setFilteredUsuarios(filtered);
  };

  const columns = [
    { title: "ID MikroTik", dataIndex: ".id", key: ".id" },
    { title: "Usuario", dataIndex: "name", key: "name" },
  ];

  return (
    <div>
      
      <Input
        placeholder="Buscar por ID o Nombre..."
        value={searchText}
        onChange={handleSearch}
        style={{ marginBottom: 10, minWidth: "50%" }}
      />

      {error && <Alert message={error} type="error" />}
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          size="small"
          dataSource={filteredUsuarios}
          columns={columns}
          rowKey=".id"
          components={{
            body: {
              cell: ({ children }) => (
                <td style={{ padding: "4px", fontSize: "12px" }}>{children}</td>
              ),
            },
          }}
        />
      )}
    </div>
  );
};

export default UsuariosSinId;
