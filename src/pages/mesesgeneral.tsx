import React, { useState, useEffect } from "react";
import { Form, Select, Button, message } from "antd";
import axios from "axios";
import config from "../config"; // Asegúrate de tener `config.BaseUrl` definido

const { Option } = Select;

const mesesDelAno = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const ActualizarMes = ({ setContratantes }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Función para obtener los contratantes
  const fetchContratantes = async () => {
    try {
      const contratantesResponse = await axios.get(`${config.BaseUrl}/contratantes/`);
      setContratantes(contratantesResponse.data);
    } catch (error) {
      message.error("Error al cargar contratantes");
    }
  };

  useEffect(() => {
    fetchContratantes(); // Cargar contratantes al inicio
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${config.BaseUrl}/api/actualizar_mes_actual/`, values);
      message.success(response.data.message);
      form.resetFields();
      await fetchContratantes(); // 🔄 Recargar contratantes después de actualizar el mes
    } catch (error) {
      message.error(error.response?.data?.error || "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="inline"
      onFinish={handleSubmit}
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 10,
        padding: 20,
        background: "#fff",
        borderRadius: 8,
      }}
    >
      <Form.Item
        label="Mes Anterior"
        name="mes_actual_anterior"
        rules={[{ required: true, message: "Selecciona el mes anterior" }]}
      >
        <Select placeholder="Mes anterior" style={{ width: 130 }}>
          {mesesDelAno.map((mes) => (
            <Option key={mes} value={mes}>
              {mes}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Nuevo Mes"
        name="mes_actual_nuevo"
        rules={[{ required: true, message: "Selecciona el nuevo mes" }]}
      >
        <Select placeholder="Nuevo mes" style={{ width: 130 }}>
          {mesesDelAno.map((mes) => (
            <Option key={mes} value={mes}>
              {mes}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Actualizar
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ActualizarMes;
