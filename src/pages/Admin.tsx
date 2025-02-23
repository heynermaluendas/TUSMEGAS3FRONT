import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message, Popconfirm,Select } from "antd";
import axios from "axios";
import config from '../config';

const Admin: React.FC = () => {
  const [users, setUsers] = useState([]); // Lista de usuarios
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado del modal
  const [editingUser, setEditingUser] = useState(null); // Usuario en edición
  const [form] = Form.useForm();


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${config.BaseUrl}/obtener_usuarios/`); // Endpoint para obtener usuarios
      setUsers(response.data);
    } catch (error) {
      message.error("Error al cargar los usuarios.");
    }
  };

  const handleDelete = async (cedula: string) => {
    try {
      await axios.delete(`${config.BaseUrl}/eliminar_usuario/${cedula}/`);
      message.success("Usuario eliminado exitosamente.");
      fetchUsers();
    } catch (error) {
      message.error("Error al eliminar el usuario.");
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      console.log(values);
      if (editingUser) {
        // Editar usuario existente
        await axios.post(
          `${config.BaseUrl}/modificar_usuario/${editingUser.cedula}/`,
          values
        );
        message.success("Usuario modificado exitosamente.");
      } else {
        // Crear un nuevo usuario
        await axios.post(`${config.BaseUrl}/register/`, values);
        message.success("Usuario agregado exitosamente.");
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      message.error("Error al guardar el usuario.");
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  const columns = [
    {
      title: "Cédula",
      dataIndex: "cedula",
      key: "cedula",
    },
    {
      title: "Nombre",
      dataIndex: "first_name",
      key: "first_name",
    },
    {
      title: "Apellido",
      dataIndex: "last_name",
      key: "last_name",
    },
    {
      title: "Correo",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Acceso",
      dataIndex: "access",
      key: "access",
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: any, record: any) => (
        <>
          <Button
            type="link"
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
          >
            Modificar
          </Button>
          <Popconfirm
            title="¿Estás seguro de eliminar este usuario?"
            onConfirm={() => handleDelete(record.cedula)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="link" danger>
              Eliminar
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Agregar Usuario
      </Button>
      <Table dataSource={users} columns={columns} rowKey="cedula" />

      <Modal
        title={editingUser ? "Modificar Usuario" : "Agregar Usuario"}
        visible={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="cedula"
            label="Cédula"
            rules={[{ required: true, message: "Por favor, ingresa la cédula." }]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>
          <Form.Item
            name="first_name"
            label="Nombre"
            rules={[{ required: true, message: "Por favor, ingresa el nombre." }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="last_name"
            label="Apellido"
            rules={[{ required: true, message: "Por favor, ingresa el apellido." }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Correo"
            rules={[
              { required: true, message: "Por favor, ingresa el correo." },
              { type: "email", message: "Por favor, ingresa un correo válido." },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="access"
            label="Acceso"
            rules={[{ required: true, message: "Por favor, selecciona el nivel de acceso." }]}
          >
            <Select placeholder="Selecciona un nivel de acceso">
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="editor">Editor</Select.Option>
              <Select.Option value="user">User</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="Contraseña"
            rules={[
              { required: true, message: "Por favor, ingresa una contraseña." },
              { min: 6, message: "La contraseña debe tener al menos 6 caracteres." },
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Admin;
