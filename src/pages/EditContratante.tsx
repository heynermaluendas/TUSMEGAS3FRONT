import React, { useState, useEffect,useMemo } from 'react';
import { Table, Button, Modal, Input, Form, message,Popconfirm,Select  } from 'antd';
import axios from 'axios';
import config from '../config';
import UsuariosSinId from "./Welcome";

const { Option } = Select;

const mesesDelAno = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const { Search } = Input;

const ContratantesEdit = () => {
    
    const [contratantes, setContratantes] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [formEdit] = Form.useForm();
    const [formAgregar] = Form.useForm();
    const [editingRecord, setEditingRecord] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [usuariosMikrotik, setUsuariosMikrotik] = useState([]);
    const [visible, setVisible] = useState(false);
    // const [form] = Form.useForm();
    const columns = useMemo(() => [
       
      {
        title: 'Contratante',
        dataIndex: 'contratante',
        key: 'contratante',
        sorter: (a, b) => a.contratante.localeCompare(b.contratante), // Ordenar por el nombre
        render: text => <span style={{ fontSize: '10px' }}>{text?.toUpperCase()}</span>,
      },
      {
        title: 'Mes debe',
        dataIndex: 'mes_actual',
        key: 'mes_actual',
        render: text => <span style={{ fontSize: '10px' }}>{text?.toUpperCase()}</span>,
      },
        {
          title: 'Precio',
          dataIndex: 'precio_mes_actual',
          key: 'precio_mes_actual',
          render: text => <span style={{ fontSize: '12px' }}>{text}</span>,
    
        },
     
        {
          title: 'Plan ',
          dataIndex: 'plan_contratado_mes_actual',
          key: 'plan_contratado_mes_actual',
          render: text => <span style={{ fontSize: '12px' }}>{text}</span>,
    
        },
        {
          title: 'id',
          dataIndex: 'plan_contratado_mes_atrasado',
          key: 'plan_contratado_mes_atrasado',
          render: text => <span style={{ fontSize: '12px' }}>{text}</span>,
    
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_, record) => (
              <>
                <Popconfirm
                  title="¿Estás seguro de que quieres editar este contratante?"
                  onConfirm={() => showModal(record)}
                  okText="Sí"
                  cancelText="No"
                >
                  <Button type="link" style={{ marginRight: 0, fontSize: 12 }}>
                    Editar
                  </Button>
                </Popconfirm>
                
                <Popconfirm
                  title="¿Estás seguro de que quieres eliminar este contratante?"
                  onConfirm={() => eliminarContratante(record.nit_o_cc)}
                  okText="Sí"
                  cancelText="No"
                >
                  <Button type="link" style={{ marginRight: 0, fontSize: 12 }} danger>
                    Eliminar
                  </Button>
                </Popconfirm>
              </>
            ),
          },
       
      ], [usuariosMikrotik]);

useEffect(() => {
    axios.get(`${config.BaseUrl}/mikrotik/usuarios/`)
      .then(response => {
        const usuarios = response.data.usuarios.reduce((acc, currentArray) => {
          return acc.concat(currentArray);
        }, []);
        console.log(usuarios)
        setUsuariosMikrotik(usuarios);
      })
      .catch(error => {
        console.error('Error al obtener usuarios:', error);
      });
  }, []);

  useEffect(() => {
    axios.get(`${config.BaseUrl}/contratantes/`)
      .then(response => {
        setContratantes(response.data);
      })
      .catch(error => {
        console.error('Error al cargar los contratantes:', error);
      });
  }, []);
  
  const desbloquearUsuario = async (values) => {
    try {
      const { user_id, comment } = values;  // Ahora recibe comment del record
      const data = {
        user_id,
        comment,  // Enviamos el valor dinámico
      };
      await axios.post(`${config.BaseUrl}/probardesbloquear_usuario/`, data);
      message.success('Usuario desbloqueado');
      
    } catch (error) {
      message.error('Error al desbloquear el usuario');
      console.error('Error:', error);
    }
  };
  

  const showModal = (record) => {
    setEditingRecord(record);
    formEdit.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  

  const handleOk = async (values) => {
    try {
      await axios.post(`${config.BaseUrl}/modificar_contratante/${editingRecord.nit_o_cc}/`, values);
      message.success('Contratante actualizado');
      setIsModalVisible(false);
      const response = await axios.get(`${config.BaseUrl}/contratantes/`);
      setContratantes(response.data);
      const planContratadoMesAtrasado = formEdit.getFieldValue('plan_contratado_mes_atrasado');
      const planContratadoMesActual = formEdit.getFieldValue('plan_contratado_mes_actual');

      // Formateamos el valor de 'plan_contratado_mes_actual' solo al guardar
      const formattedValue = planContratadoMesActual.replace(/\s*MB\s*/i, "M");
      const formattedComment = formattedValue + "/" + formattedValue;

      const values1 = {
        user_id: planContratadoMesAtrasado,
        comment: formattedComment
      };

      // Llamamos a la función que enviará la solicitud al servidor
      // await desbloquearUsuario(values1);

    } catch (error) {
      message.error('Error al actualizar el contratante');
      console.error('Error:', error);
    }
  };
  const handleOkAgregar = async () => {
    try {
      const values = await formAgregar.validateFields(); // Validar el formulario
      await axios.post(`${config.BaseUrl}/agregar_contratante/`, values);
      message.success("Contratante agregado exitosamente");
      setVisible(false);
      formAgregar.resetFields(); // Limpiar el formulario
      const response = await axios.get(`${config.BaseUrl}/contratantes/`);
      setContratantes(response.data);
    } catch (error) {
      message.error("Error al agregar el contratante");
      console.error("Error:", error);
    }
  };

  const eliminarContratante = async (nit_o_cc) => {
    try {
      await axios.delete(`${config.BaseUrl}/eliminar_contratante/${nit_o_cc}/`);
      message.success('Contratante eliminado');
      const response = await axios.get(`${config.BaseUrl}/contratantes/`);
      setContratantes(response.data);
    } catch (error) {
      message.error('Error al eliminar el contratante');
      console.error('Error:', error);
    }
  };

  const contratantesFiltrados = contratantes.filter(
    (contratante) =>
      contratante.contratante.toLowerCase().includes(busqueda.toLowerCase()) ||
      contratante.nit_o_cc.includes(busqueda)
  );

  return ( 
    <div>
      <div style={{ marginBottom: '10px',  }}>
      <UsuariosSinId />
      </div>
        <div style={{ display: 'flex', justifyContent: 'space-between',width:"100%" ,textAlign: "center"}}>
            <div style={{ marginRight: '2px', textAlign: 'left' ,width:"60%"}}>
            <Search
              placeholder="Buscar por nombre o NIT/CC"
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ marginBottom: "20px", width: "100%" }}
            />
            </div>
            <div style={{ textAlign: 'right',width:"40%", }}>
            <Button type="primary" onClick={() => setVisible(true)}>
              Agregar Contratante
            </Button>
            </div>
      </div>
      <Table
        columns={columns}
        dataSource={contratantesFiltrados}
        rowKey="nit_o_cc"
        size="small"
        pagination={false}
      />

      <Modal
        title="Editar Contratante"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={formEdit}
          onFinish={handleOk}
          layout="vertical"
        >
          <Form.Item label="Tipo de Factura" name="tipo_factura">
  <Select placeholder="Seleccione un tipo">
    <Select.Option value="normal">Normal</Select.Option>
    <Select.Option value="electronica">Electrónica</Select.Option>
  </Select>
</Form.Item>
          <Form.Item label="Contratante" name="contratante">
            <Input />
          </Form.Item>
          <Form.Item label="N Cuenta" name="mes_atrasado">
            <Input />
          </Form.Item>
          <Form.Item label="Mes Actual" name="mes_actual">
            <Select placeholder="Seleccione un mes">
              {mesesDelAno.map((mes) => (
                <Option key={mes} value={mes}>{mes}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Precio Mes Actual" name="precio_mes_actual">
            <Input type="number" />
          </Form.Item>
          
          <Form.Item label="id" name="plan_contratado_mes_atrasado">
            <Input />
          </Form.Item>
          <Form.Item label="Plan Contratado" name="plan_contratado_mes_actual">
        <Input />
      </Form.Item>
        
          <Form.Item label="NIT o CC" name="nit_o_cc">
            <Input />
          </Form.Item>
          <Form.Item label="Dirección" name="direccion">
            <Input />
          </Form.Item>
          <Form.Item label="Municipio" name="municipio">
            <Input />
          </Form.Item>
          <Form.Item label="Teléfono" name="telefono">
            <Input />
          </Form.Item>
          <Form.Item label="Correo" name="correo">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Guardar
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Nuevo Contratante"
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={handleOkAgregar}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={formAgregar} layout="vertical">
        <Form.Item label="Tipo de Factura" name="tipo_factura">
  <Select placeholder="Seleccione un tipo">
    <Select.Option value="normal">Normal</Select.Option>
    <Select.Option value="electronica">Electrónica</Select.Option>
  </Select>
</Form.Item>
          <Form.Item name="contratante" label="Contratante" rules={[{ required: true, message: "Campo obligatorio" }]}>
            <Input />
          </Form.Item>

          

          <Form.Item label="Mes Actual" name="mes_actual">
            <Select placeholder="Seleccione un mes">
              {mesesDelAno.map((mes) => (
                <Option key={mes} value={mes}>{mes}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="precio_mes_actual" label="Precio Mes Actual">
            <Input type="number" />
          </Form.Item>

         

          <Form.Item name="plan_contratado_mes_atrasado" label="id">
            <Input />
          </Form.Item>

          <Form.Item name="plan_contratado_mes_actual" label="Plan Contratado">
            <Input />
          </Form.Item>

          <Form.Item name="nit_o_cc" label="NIT o Cédula" rules={[{ required: true, message: "Campo obligatorio" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="direccion" label="Dirección">
            <Input />
          </Form.Item>

          <Form.Item name="municipio" label="Municipio">
            <Input />
          </Form.Item>

          <Form.Item name="telefono" label="Teléfono">
            <Input />
          </Form.Item>

          <Form.Item name="correo" label="Correo">
            <Input type="email" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContratantesEdit;
