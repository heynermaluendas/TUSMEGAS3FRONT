import React, { useState, useEffect } from "react";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { pdf, Document, Page, Text, View, StyleSheet,Image } from "@react-pdf/renderer";
import { Button, message } from "antd";
import config from '../config';

const DownloadAllPDFs: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${config.BaseUrl}/contratantes/`);
        setUsers(response.data);
        console.log(response.data)
      } catch (error) {
        message.error("Error al cargar los usuarios.");
      }
    };

    fetchUsers();
  }, []);
  
  const handleDownloadAll = async () => {
    if (users.length === 0) {
      message.warning("No hay usuarios disponibles para generar PDFs.");
      return;
    }

    setLoading(true);
    const zip = new JSZip();

    for (const data of users) {
        
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
  
  const generarFilasDeuda = (mesesDeuda: string[], velocidad: string, precio: string) => {
    const totalFilas = 4; 
    const filas = [];
    let totalFactura = 0; 

    for (let i = 0; i < totalFilas; i++) {
      const tieneDeuda = mesesDeuda[i] ? true : false;

      if (tieneDeuda) {
        totalFactura += parseFloat(precio); 
      }
      const alturaFila = tieneDeuda ? "auto" : 12; 


      filas.push(
        <View key={i} style={{ flexDirection: "row", alignItems: "center" , borderBottom: "1px solid black",}}>
          <Text style={{ width: "25%", padding: 2, fontWeight: "bold", borderRight: "1px solid black", textAlign: "center",  height: alturaFila,}}>{mesesDeuda[i] || ""}</Text>
          <Text style={{ width: "25%", padding: 2, fontWeight: "bold", borderRight: "1px solid black", textAlign: "center",  height: alturaFila, }}>{tieneDeuda ? velocidad : ""}</Text>
          <Text style={{ width: "25%", padding: 2, fontWeight: "bold", borderRight: "1px solid black", textAlign: "center",  height: alturaFila, }}>{tieneDeuda ? precio : ""}</Text>
          <Text style={{ width: "25%", padding: 2, fontWeight: "bold",  textAlign: "center",   height: alturaFila,}}>{tieneDeuda ? precio : ""}</Text>
        </View>
      );
    }

    return { filas, totalFactura };
  };


  
  let mesesVencidos = 0;
  let mesesPendientes: string[] = [];
  let mensaje = "";
  let filas = [];
  let totalFactura = 0;

  if (data) {
    console.log(data.contratante)
    const { cantidad, meses, mensajeMes } = calcularMesesVencidos(data.mes_actual);
    console.log(calcularMesesVencidos("marzo"))
    mesesVencidos = cantidad;
    mesesPendientes = meses;
    mensaje = mensajeMes;
    console.log(mesesPendientes)

    const result = generarFilasDeuda(mesesPendientes, data.plan_contratado_mes_actual, data.precio_mes_actual);
    filas = result.filas;
    totalFactura = result.totalFactura;
  }
  const convertirFecha = (fechaIso) => {
    const fecha = new Date(fechaIso);
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); 
    const dia = String(fecha.getDate()).padStart(2, '0'); 
    return `${año} ${mes} ${dia}`;
  };
  
  const obtenerFechaExpedicion = () => {
    const fechaActual = new Date();
    let mes = fechaActual.getMonth(); 
    let año = fechaActual.getFullYear(); 
  
    
    if (fechaActual.getDate() < 25) {
      mes = mes === 0 ? 11 : mes - 1; 
      año = mes === 11 ? año - 1 : año; 
    }
  
    
    const fechaExpedicion = new Date(año, mes, 25);
  
    
    return fechaExpedicion.toISOString();
  };
  function obtenerFechaVencimiento(meses) {
    
    const mesesDelAno = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const primerMes = meses[0];
    const indiceMes = mesesDelAno.indexOf(primerMes);
    const siguienteMes = (indiceMes + 1) % 12; 
    const fechaActual = new Date();
    let ano = fechaActual.getFullYear();
    if (primerMes === 'Diciembre') {
      ano -= 0;
    }
    const mes = (siguienteMes + 1).toString().padStart(2, '0');
    return `${ano} ${mes} 04`;
  }
  const fechaExpedicion = obtenerFechaExpedicion();
  const fechaExpedicion2 = convertirFecha(fechaExpedicion);
  const fechaVencimiento2 = obtenerFechaVencimiento(mesesPendientes);
      const doc = (
    
<Document>
  <Page style={{   padding: 20, backgroundColor: '#f7f7f7', }}>
  <View style={{ flexDirection: "row", marginTop:"50px",fontSize: 8,marginBottom:"10px",justifyContent:"space-around",alignItems:"center"}}>
    <Image style={{ width: "40%", textAlign: "center",alignItems:"flex-start"}}  src={require("./logotusmegas.png")}  />
    <Text style={{ width: "25%", fontWeight: "bold", textAlign: "left", padding: "5px" }}>
  {"NIT: 901446471-6\n\nTELEFONO: 3112204151\n\nCIUDAD: GAMBITA SANTANDER\n\nEMAIL:"}
  <Text style={{ color: "red" }}>{" tusmegassas@gmail.com\n\n"}</Text>
  {"DIRECCION: CALLE 5#5-41"}
</Text>
   
  </View>
    {/* Tabla de Información del Cliente */}
  <View style={{ display: "table", width: "100%", borderCollapse: "collapse", fontSize: 8, border: "1px solid black", marginBottom: 10}} >

    <View style={{ flexDirection: "row", borderBottom: "1px solid black", alignItems: "center",  }} >
      <Text style={{ width: "20%", padding: 2, fontWeight: "bold", backgroundColor: "#BEBEBE", borderRight: "1px solid black", textAlign: "center", }} >
        Cliente:
      </Text>
      <Text style={{ width: "60%", padding: 2, fontWeight: "bold", borderRight: "1px solid black", textAlign: "center", textTransform: "uppercase",}} >
        {data.contratante}
      </Text>
      <Text style={{ width: "20%", padding: 2, fontWeight: "bold", backgroundColor: "#BEBEBE",  textAlign: "center", }} >
        Fecha de Expedición:
      </Text>
    </View>

  <View style={{ flexDirection: "row", borderBottom: "1px solid black", alignItems: "center", }} >
    <Text style={{ width: "20%", padding: 2, fontWeight: "bold", backgroundColor: "#BEBEBE", borderRight: "1px solid black", textAlign: "center", }} >
      NIT / CC:
    </Text>
    <Text style={{ width: "60%", padding: 2, borderRight: "1px solid black", textAlign: "center", }} >
      {data.nit_o_cc}
    </Text>
    <Text style={{ width: "20%", padding: 2, textAlign: "center", backgroundColor: "#BEBEBE",   }} >
    {fechaExpedicion2}
    </Text>
  </View>

  <View style={{ flexDirection: "row", borderBottom: "1px solid black", alignItems: "center", }} >
    <Text style={{ width: "20%", padding: 2, fontWeight: "bold", backgroundColor: "#BEBEBE", borderRight: "1px solid black", textAlign: "center", }} >
      Ncuenta:
    </Text>
    <Text style={{ width: "60%", padding: 2, textAlign: "center" }} >
      {data.mes_atrasado}
    </Text>
    <Text style={{ width: "20%", padding: 2 }}></Text>
  </View>
  <View style={{ flexDirection: "row", borderBottom: "1px solid black", alignItems: "center", }} >
    <Text style={{ width: "20%", padding: 2, fontWeight: "bold", backgroundColor: "#BEBEBE", borderRight: "1px solid black", textAlign: "center", }} >
      Dirección:
    </Text>
    <Text style={{ width: "60%", padding: 2, textAlign: "center" }} >
      {data.direccion}
    </Text>
    <Text style={{ width: "20%", padding: 2 }}></Text>
  </View>

  <View style={{ flexDirection: "row", borderBottom: "1px solid black", alignItems: "center", }} >
    <Text style={{ width: "20%", padding: 2, fontWeight: "bold", backgroundColor: "#BEBEBE", borderRight: "1px solid black", textAlign: "center", }} >
      Municipio:
    </Text>
    <Text style={{ width: "60%", padding: 2, textAlign: "center", textTransform: "uppercase", }}>
      {data.municipio}
    </Text>
    <Text style={{ width: "20%", padding: 2 }}></Text>
  </View>

  <View style={{ flexDirection: "row", borderBottom: "1px solid black", alignItems: "center", }} >
    <Text style={{ width: "20%", padding: 2, fontWeight: "bold", backgroundColor: "#BEBEBE", borderRight: "1px solid black", textAlign: "center", }} >
      Teléfono:
    </Text>
    <Text style={{ width: "60%", padding: 2, borderRight: "1px solid black", textAlign: "center", }} >
      {data.telefono}
    </Text>
    <Text style={{ width: "20%", padding: 2, fontWeight: "bold", backgroundColor: "#BEBEBE", textAlign: "center", }} >
      Fecha de Vencimiento:
    </Text>
  </View>

  <View style={{ flexDirection: "row", alignItems: "center", }} >
    <Text style={{ width: "20%", padding: 2, fontWeight: "bold", backgroundColor: "#BEBEBE", borderRight: "1px solid black", textAlign: "center", }} >
      Correo:
    </Text>
    <Text style={{ width: "60%", padding: 2, borderRight: "1px solid black", textAlign: "center", }} >
      {data.correo}
    </Text>
    <Text style={{ width: "20%", padding: 2, textAlign: "center", backgroundColor: "#BEBEBE", }} >
    {fechaVencimiento2} 
    </Text>
  </View>

</View>
{/* siguiente cuadro  */}
  <View style={{ display: "table", width: "100%", borderCollapse: "collapse", fontSize: 8, borderTop: "1px solid black", borderRight: "1px solid black", borderLeft: "1px solid black",}} >
    <View style={{ flexDirection: "row", borderBottom: "1px solid black", alignItems: "center",  }} >
      <Text style={{ width: "25%", padding: 2, fontWeight: "bold", backgroundColor: "#BEBEBE",  textAlign: "center", borderRight: "1px solid black", }} >
        # MES A CANCELAR
      </Text>
      <Text style={{ width: "25%", padding: 2, fontWeight: "bold", backgroundColor: "#BEBEBE",  textAlign: "center", borderRight: "1px solid black", }} >
        PLAN CONTRATADO
      </Text>
      <Text style={{ width: "25%", padding: 2, fontWeight: "bold", backgroundColor: "#BEBEBE",  textAlign: "center", borderRight: "1px solid black", }} >
        PRECIO UND
      </Text>
      <Text style={{ width: "25%", padding: 2, fontWeight: "bold", backgroundColor: "#BEBEBE",  textAlign: "center", }} >
        VALOR TOTAL
      </Text>
    </View>
    <View>
  {filas} 
</View>
</View>

<View style={{ flexDirection: "row", marginTop:"10px",fontSize: 8}}>
    <Text style={{ width: "50%", fontWeight: "bold", textAlign: "center", paddingRight: 5,alignSelf: "flex-end",}}>
      FORMA DE PAGO: {data.tipo_factura}
    </Text>
    <Text style={{ width: "25%", fontWeight: "bold", textAlign: "center",  border: "2px solid black",padding:"5px"}}>
      TOTAL
    </Text>
    <Text style={{ width: "25%", fontWeight: "bold", textAlign: "center" , border: "1px solid black",padding:"5px"}}>
      {totalFactura.toLocaleString("es-CO")} 
    </Text>
  </View>
<View style={{ flexDirection: "row",fontSize: 8}}>
  
<Text style={{ width: "50%", fontWeight: "bold", textAlign: "center", paddingRight: 5,  }}>
  {"FAVOR REALIZAR EL PAGO EN CUALQUIER PUNTO\nBANCOLOMBIA AL CONVENIO 88913 A NOMBRE\nDE TUS MEGAS SAS COMO REFERENCIA\n# CC DEL CONTRATANTE\nENVIAR SOPORTE DE PAGO VIA WHATSAPP 3112204151"}
</Text>
    <Text style={{ width: "50%", fontWeight: "bold", textAlign: "center",padding:"5px"}}>
    </Text>
  </View>

  </Page>
</Document>

      );

      const blob = await pdf(doc).toBlob(); 
      zip.file(`${data.contratante}.pdf`, blob); 
    }

    
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "facturas.zip");

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Descargar todas las facturas</h2>
      <Button type="primary" onClick={handleDownloadAll} loading={loading}>
        Descargar Todas
      </Button>
    </div>
  );
};

export default DownloadAllPDFs;
