import { useState, useEffect } from "react";
import { Table, Spin, Alert, Input, Button,notification ,message } from "antd";
import axios from "axios";
import config from "../config"; 

const palabrasFiltradas = ["VACIO", "RESPALDO","REPALDO","POWER", "QUEUE", "ANTENA","PLAN","LAP","17.",]; // Palabras a ocultar por defecto

const UsuariosSinId = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filtroActivo, setFiltroActivo] = useState(true); // Estado para activar/desactivar el filtro

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseUsuarios = await axios.get(`${config.BaseUrl}/mikrotik/usuarios/`);
        const responseContratantes = await axios.get(`${config.BaseUrl}/contratantes/`);

        const usuariosData = Array.isArray(responseUsuarios.data.usuarios) ? responseUsuarios.data.usuarios : [];
        const contratantesData = Array.isArray(responseContratantes.data) ? responseContratantes.data : responseContratantes.data.data || [];

        const idsContratantes = new Set(contratantesData.map((c) => c.plan_contratado_mes_atrasado).filter(Boolean));

        const usuariosSinId = usuariosData.filter((usuario) => !idsContratantes.has(usuario[".id"]));

        setUsuarios(usuariosSinId);
        aplicarFiltro(usuariosSinId, searchText, filtroActivo); // Aplicar filtro al cargar
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError(`Error al cargar los datos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const aplicarFiltro = (data, busqueda, filtrar) => {
    let resultado = data.filter((usuario) =>
      usuario[".id"].toLowerCase().includes(busqueda.toLowerCase()) || usuario.name.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (filtrar) {
      resultado = resultado.filter((usuario) =>
        !palabrasFiltradas.some((palabra) => usuario.name.toUpperCase().includes(palabra) || usuario[".id"].toUpperCase().includes(palabra))
      );
    }

    setFilteredUsuarios(resultado);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    aplicarFiltro(usuarios, value, filtroActivo);
  };

  const toggleFiltro = () => {
    setFiltroActivo(!filtroActivo);
    aplicarFiltro(usuarios, searchText, !filtroActivo);
  };
  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id).then(() => {
      message.success("Copiado al portapapeles");
    }).catch(() => {
      message.error("Error al copiar");
    });
  };
  

  const columns = [
    {
      title: "ID MikroTik",
      dataIndex: ".id",
      key: ".id",
      render: (id) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span>{id}</span>
          <Button
            size="small"
            style={{ marginLeft: "30%"  }}
            onClick={() => copyToClipboard(id)}
            type="primary"
          >
            copiar
          </Button>
        </div>
      ),
    },
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

      <Button onClick={toggleFiltro} style={{ marginBottom: 10 }}>
        {filtroActivo ? "Desactivar Filtro" : "Activar Filtro"}
      </Button>

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
