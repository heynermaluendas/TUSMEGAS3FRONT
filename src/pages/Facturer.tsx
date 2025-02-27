import React, { useState, useEffect,useMemo } from 'react';
import { Table, Button,  Input,message,Popconfirm,Row, Col,} from 'antd';
import axios from 'axios';
import config from '../config';
import "./index.css";
import debounce from "lodash.debounce";
import ActualizarMes from './mesesgeneral';

const { Search } = Input;

const ContratantesTable = () => {
    
    const [contratantes, setContratantes] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [usuariosMikrotik, setUsuariosMikrotik] = useState([]);

    const getMaxLimit = (planId) => {
      const user = usuariosMikrotik.find(user => user[".id"] === planId);
      return user ? user['max-limit'] : 'No encontrado';
    };
    
      const calcularMesesVencidos = (mesAtrasado: string) => {
        const meses = [
          "enero", "febrero", "marzo", "abril", "mayo", "junio",
          "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ];
      
        
        const mesNormalizado = mesAtrasado.toLowerCase(); 
        const mesActual = new Date().toLocaleString('es-ES', { month: 'long' }).toLowerCase(); 
      
        
        if (!mesAtrasado || typeof mesAtrasado !== 'string') {
          return { error: "Mes inválido", cantidad: 0 };
        }
      
        
        const indiceMesAtrasado = meses.indexOf(mesNormalizado);
        if (indiceMesAtrasado === -1) {
          return { error: "Mes no válido", cantidad: 0 };
        }
      
        
        const mesesAntes = [
          meses[(meses.indexOf(mesActual) + 11) % 12], 
          meses[(meses.indexOf(mesActual) + 10) % 12], 
          meses[(meses.indexOf(mesActual) + 9) % 12],  
        ];
      
        const mesesPosteriores = [
          meses[meses.indexOf(mesActual)], 
          meses[(meses.indexOf(mesActual) + 1) % 12], 
          meses[(meses.indexOf(mesActual) + 2) % 12], 
        ];
      
        
        if (mesesAntes.includes(mesNormalizado)) {
          let mesesVencidos = [];
          
          if (mesAtrasado.toLowerCase() === "enero") {
            mesesVencidos = ["enero", "febrero"];
          } else if (mesAtrasado.toLowerCase() === "diciembre") {
            mesesVencidos = ["diciembre", "enero", "febrero"];
          } else {
            const indiceAtrasado = meses.indexOf(mesAtrasado.toLowerCase());
            const diferencia = meses.indexOf(mesActual) - indiceAtrasado;
            for (let i = 0; i < diferencia; i++) {
              const mesVencido = meses[(indiceAtrasado + i) % 12];
              mesesVencidos.push(mesVencido.charAt(0).toUpperCase() + mesVencido.slice(1));
            }
          }
      
          return {
            cantidad: mesesVencidos.length,
            meses: mesesVencidos,
            mensaje: mesesVencidos.length === 1
              ? "1 mes vencido"
              : `${mesesVencidos.length} meses vencidos`
          };
        }
      
        
        if (mesesPosteriores.includes(mesNormalizado)) {
          return {
            cantidad: 1,
            meses: [mesAtrasado.charAt(0).toUpperCase() + mesAtrasado.slice(1)],
            mensaje: `${mesAtrasado.charAt(0).toUpperCase() + mesAtrasado.slice(1)} está adelantado`
          };
        }
      
        
        return { error: "Mes fuera de rango", cantidad: 0 };
      };
      
    const columns = useMemo(() => [
       
        {
            title: 'Contratante',
            dataIndex: 'contratante',
            key: 'contratante',
            sorter: (a, b) => a.contratante.localeCompare(b.contratante), 
            render: text => <span style={{ fontSize: '10px' }}>{text?.toUpperCase()}</span>,
          },
          {
            title: "Mes debe",
            dataIndex: "mes_actual", // Nombre de la propiedad en tu API
            key: "mes_actual",
            render: (text) => {
              const resultado = calcularMesesVencidos(text);
              return <span style={{ fontSize: "10px" }}>{resultado.meses.join(", ")}</span>;
    
            },
            
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
            title: 'Acciones',
            key: 'actions2',
            render: (_, record) => (
              <>
                 <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Popconfirm
        title="¿Estás seguro de que quieres modificar el mes?"
        onConfirm={() => modificarMes(record.nit_o_cc, record.mes_actual)}
        okText="Sí"
        cancelText="No"
      >
        <Button
          type="primary"
          size="small"
          style={{ fontSize: 12 }}
        >
          Mes
        </Button>
      </Popconfirm>
    </div>
              </>
            ),
          },
          {
            title: 'Control de Servicio',
            key: 'service_control',
            render: (_, record) => {
                const maxLimit = getMaxLimit(record.plan_contratado_mes_atrasado);
                const maxLimitValue = maxLimit 
            ? `${parseInt(maxLimit.split('/')[0], 10) / 1_000_000} Mb`
            : 'No encontrado';

              return (
                <>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    <div style={{ marginRight: '2px', textAlign: 'left' }}>
                    <span style={{ color: parseFloat(maxLimitValue) === 0.001 ? 'red' : 'inherit' }}>
                        {maxLimitValue}
                    </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <Popconfirm
                            title="¿Deseas bloquear a este usuario?"
                            onConfirm={() => {
                            const values = { user_id: record.plan_contratado_mes_atrasado };  
                            console.log('Intentando bloquear:', values);  
                            bloquearUsuario(values);
                            }}
                            okText="Sí"
                            cancelText="No"
                        >
                            <Button type="primary" size="small" danger style={{ marginRight: '2px', fontSize: 12 }}>
                            Bloquear
                            </Button>
                        </Popconfirm>
                        
                        <Popconfirm
                            title="¿Deseas desbloquear a este usuario?"
                            onConfirm={() => {
                                
                                const formattedComment = record.plan_contratado_mes_actual.replace(/\s*MB\s*/i, "M") + "/" + record.plan_contratado_mes_actual.replace(/\s*MB\s*/i, "M");
                                
                                const values = { 
                                user_id: record.plan_contratado_mes_atrasado, 
                                comment: formattedComment  
                                };
                                
                                console.log('Intentando desbloquear:', values);
                                desbloquearUsuario(values);
                            }}
                            okText="Sí"
                            cancelText="No"
                            >
                            <Button type="primary" size="small" style={{ fontSize: 12 }}>
                                Desbloquear
                            </Button>
                            </Popconfirm>


                    </div>
                </div>
                </>
              );
            },
          }
      ], [usuariosMikrotik,contratantes]);

      const fetchUsuariosMikrotik = async () => {
        try {
          const response = await axios.get(`${config.BaseUrl}/mikrotik/usuarios/`);
          const usuarios = response.data.usuarios.reduce((acc, currentArray) => acc.concat(currentArray), []);
          setUsuariosMikrotik(usuarios);
        } catch (error) {
          console.error('Error al obtener usuarios:', error);
        }
      };
      
      useEffect(() => {
        fetchUsuariosMikrotik();  
      }, []);

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
        console.log(response.data)
      })
      .catch(error => {
        console.error('Error al cargar los contratantes:', error);
      });
  }, []);


  const bloquearUsuario = async (values) => {
    try {
      console.log('Valores recibidos:', values); 
      const { user_id } = values; 
      const data = { user_id };
      await axios.post(`${config.BaseUrl}/bloquear_usuario/`, data);
      message.success('Usuario bloqueado');
      await fetchUsuariosMikrotik();
    } catch (error) {
      message.error('Error al bloquear el usuario');
      console.error('Error:', error.response?.data || error);
    }
  };

 const desbloquearUsuario = async (values) => {
  try {
    const { user_id, comment } = values;  
    const data = {
      user_id,
      comment,  
    };
    await axios.post(`${config.BaseUrl}/desbloquear_usuario/`, data);
    message.success('Usuario desbloqueado');
    await fetchUsuariosMikrotik();
  } catch (error) {
    message.error('Error al desbloquear el usuario');
    console.error('Error:', error);
  }
};


  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  
  const getNextMonth = (currentMonth) => {
    const currentMonthString = String(currentMonth).toLowerCase().trim();
    console.log(currentMonthString);
    const currentMonthIndex = months.indexOf(currentMonthString);
    if (currentMonthIndex === -1) {
      console.error('Mes no válido');
      return null;
    }
    const nextMonthIndex = (currentMonthIndex + 1) % months.length;
    return months[nextMonthIndex];
  };
  
  const modificarMes = async (nit_o_cc, currentMonth) => {
    const nextMonth = getNextMonth(currentMonth);
    if (nextMonth === null) {
      return; 
    }
    try {
      const response = await axios.post(`${config.BaseUrl}/modificar_contratante/${nit_o_cc}/`, {
        mes_actual: nextMonth,
      });
      console.log('Mes actualizado a:', nextMonth);
      const contratantesResponse = await axios.get(`${config.BaseUrl}/contratantes/`);
      setContratantes(contratantesResponse.data); 
      return response.data;
    } catch (error) {
      console.error('Error al modificar el mes:', error);
    }
  };
  const handleSearch = useMemo(
    () =>
      debounce((value) => {
        setBusqueda(value);
      }, 300),
    []
  );

  const contratantesFiltrados = useMemo(() => {
    return contratantes.filter(
      (contratante) =>
        contratante.contratante.toLowerCase().includes(busqueda.toLowerCase()) ||
        contratante.nit_o_cc.includes(busqueda)
    );
  }, [busqueda, contratantes]); // Solo recalcula si cambia la búsqueda o los datos

  

  return ( 
    <div className='.ant-pro-layout .ant-pro-layout-content'>
    
    <ActualizarMes setContratantes={setContratantes}/>
    <Search
        placeholder="Buscar por nombre o NIT/CC"
        onChange={(e) => handleSearch(e.target.value)}
        style={{ margin: "20px", width: "100%" }}
      />
      <Table
        columns={columns}
        dataSource={contratantesFiltrados}
        rowKey="nit_o_cc"
        size="small"
        pagination={false}
      />

    </div>
  );
};

export default ContratantesTable;
