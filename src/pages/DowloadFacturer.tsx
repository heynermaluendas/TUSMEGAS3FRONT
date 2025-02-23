import React, { useState } from "react";
import { Input, Button, message,Flex } from "antd";
import axios from "axios";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from "@react-pdf/renderer";
import config from '../config';
import "./index.css";
const Admin: React.FC = () => {
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [data, setData] = useState<any>(null);  // Especificamos que 'data' puede ser null o cualquier objeto
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!numeroCuenta) {
      message.warning("Por favor ingrese un número de cuenta");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${config.BaseUrl}/contratante/${numeroCuenta}`);
      setData(response.data);
      console.log(response.data);
    } catch (error) {
      message.error("Error al obtener los datos, verifique el número de cuenta");
    } finally {
      setLoading(false);
    }
  };
  const calcularMesesVencidos = (mesAtrasado: string) => {
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
  
    // Convertir el mesAtrasado y el mesActual a minúsculas para comparar correctamente
    const mesNormalizado = mesAtrasado.toLowerCase(); // Convertir a minúsculas
    const mesActual = new Date().toLocaleString('es-ES', { month: 'long' }).toLowerCase(); // Obtener el mes actual en minúsculas
  
    // Validar que el mes pasado sea un valor correcto
    if (!mesAtrasado || typeof mesAtrasado !== 'string') {
      return { error: "Mes inválido", cantidad: 0 };
    }
  
    // Validar que el mes se encuentre en la lista de meses
    const indiceMesAtrasado = meses.indexOf(mesNormalizado);
    if (indiceMesAtrasado === -1) {
      return { error: "Mes no válido", cantidad: 0 };
    }
  
    // Crear las variables para los meses antes y después del mes actual
    const mesesAntes = [
      meses[(meses.indexOf(mesActual) + 11) % 12], // Noviembre
      meses[(meses.indexOf(mesActual) + 10) % 12], // Diciembre
      meses[(meses.indexOf(mesActual) + 9) % 12],  // Enero
    ];
  
    const mesesPosteriores = [
      meses[meses.indexOf(mesActual)], // Mes actual
      meses[(meses.indexOf(mesActual) + 1) % 12], // Mes siguiente
      meses[(meses.indexOf(mesActual) + 2) % 12], // Mes siguiente al siguiente
    ];
  
    // Verificar si el mes pasado está en los meses anteriores
    if (mesesAntes.includes(mesNormalizado)) {
      let mesesVencidos = [];
      // Si es diciembre, enero, o el mes pasado está en meses anteriores
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
  
    // Si el mes está en los meses posteriores
    if (mesesPosteriores.includes(mesNormalizado)) {
      return {
        cantidad: 1,
        meses: [mesAtrasado.charAt(0).toUpperCase() + mesAtrasado.slice(1)],
        mensaje: `${mesAtrasado.charAt(0).toUpperCase() + mesAtrasado.slice(1)} está adelantado`
      };
    }
  
    // Si el mes no está en ningún rango de meses
    return { error: "Mes fuera de rango", cantidad: 0 };
  };
  
  
  
  
  
  const generarFilasDeuda = (mesesDeuda: string[], velocidad: string, precio: string) => {
    const totalFilas = 4; // Mostrar siempre 4 filas
    const filas = [];
    let totalFactura = 0; // Acumulador de total

    for (let i = 0; i < totalFilas; i++) {
      const tieneDeuda = mesesDeuda[i] ? true : false;

      if (tieneDeuda) {
        totalFactura += parseFloat(precio); // Sumar el precio del mes adeudado
      }
      const alturaFila = tieneDeuda ? "auto" : 12; // Si no hay deuda, la fila tiene una altura de 30


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


  // Solo calcular los meses vencidos y generar las filas cuando 'data' esté disponible
  let mesesVencidos = 0;
  let mesesPendientes: string[] = [];
  let mensaje = "";
  let filas = [];
  let totalFactura = 0;

  if (data) {
    console.log(data.mes_actual)
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
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // El mes comienza desde 0
    const dia = String(fecha.getDate()).padStart(2, '0'); // Asegura que el día tenga dos dígitos
    return `${año} ${mes} ${dia}`;
  };
  
  const obtenerFechaExpedicion = () => {
    const fechaActual = new Date();
    let mes = fechaActual.getMonth(); // Obtener el mes actual (0-11)
    let año = fechaActual.getFullYear(); // Obtener el año actual
  
    // Si la fecha actual es antes del 25, usar el mes anterior
    if (fechaActual.getDate() < 25) {
      mes = mes === 0 ? 11 : mes - 1; // Si estamos en enero, retrocedemos al mes 12 (diciembre)
      año = mes === 11 ? año - 1 : año; // Si retrocedemos al mes diciembre, restamos un año
    }
  
    // Crear la fecha del último 25 del mes anterior
    const fechaExpedicion = new Date(año, mes, 25);
  
    // Devolver la fecha en formato ISO
    return fechaExpedicion.toISOString();
  };
  function obtenerFechaVencimiento(meses) {
    // Crear un array de meses en formato numérico
    const mesesDelAno = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    // Obtener el primer mes del array de entrada
    const primerMes = meses[0];
    
    // Buscar el índice del primer mes en el array de meses
    const indiceMes = mesesDelAno.indexOf(primerMes);
    
    // Calcular el siguiente mes
    const siguienteMes = (indiceMes + 1) % 12; // % 12 para que vuelva al inicio si es diciembre
    
    // Obtener el año del primer mes (si es diciembre, el año no se cambia)
    const fechaActual = new Date();
    let ano = fechaActual.getFullYear();
    
    // Si el primer mes es diciembre, el año será el del mes anterior
    if (primerMes === 'Diciembre') {
      ano -= 0;
    }
    
    // Obtener el mes con el formato adecuado (con dos dígitos)
    const mes = (siguienteMes + 1).toString().padStart(2, '0');
    
    // Devolver la fecha de vencimiento en formato aaddmm
    return `${ano} ${mes} 04`;
  }
  
  
  
  
  
  const fechaExpedicion = obtenerFechaExpedicion();
  const fechaExpedicion2 = convertirFecha(fechaExpedicion);
  const fechaVencimiento2 = obtenerFechaVencimiento(mesesPendientes);

  
  
  const PDFContent = () => (
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
      {data.NCuenta}
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


  )
  return (
    <div className="fondo" style={{ backgroundImage: `url(${require("./fondo.jpg")})` }} >
    <div style={{ width: "100%", height: 90, position: "absolute", top: 0,  left: 0,  backgroundColor: "white", borderRadius: "0px", padding: 10, boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",  }} >
      <img src={require("./logotusmegas.png")} alt="Imagen" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "20px" }} />
    </div>

      <div  style={{backgroundColor: "rgba(255, 255, 255, 0.5)",borderRadius: "20px",backdropFilter: "blur(5px)",height: "100%",}}>

        <div style={{display: "flex",flexDirection:"column", padding: 20, textAlign: "center",justifyContent: "center", alignItems: "center"}}>
          <div style={{ display: "flex",flexDirection:"row", alignItems: "center", gap: 20,justifyContent: "center",maxWidth:"720px" }}>
            <div className="container">
              <img src={require("./img3.png")} alt="Factura" />
              <div className="text-container">
                <h2>Consulte y Pague su Factura</h2>
                <p>Para realizar la consulta, ingrese el número de la cuenta.</p>
                <div>
                  <h4>¿Cuál es el número de la factura?</h4>
                  <Button type="primary" size="small" style={{ fontSize: "14px", padding: "6px 12px" }}>Ver Guía</Button>
                </div>
              </div>
            </div>
          </div>
          <div  className="text-container" style={{ marginTop:"50px" }}>
            <h3>Número de cuenta:</h3>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
            <Input
              placeholder="Ingrese número de cuenta"
              value={numeroCuenta}
              onChange={(e) => setNumeroCuenta(e.target.value)}
              style={{ width: 300 }}
            />
            <Button type="primary" onClick={fetchData} loading={loading}
            style={{ fontSize: "14px", padding: "6px 12px" }}>
              Buscar
            </Button>
          </div>
          <div  className="text-container">
            <p>Puede realizar el pago de su factura en línea por Bancolombia o imprimirla y pagarla en un punto de servicio.</p>
          </div>

          {data && (
            <div className="text-tabla" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
              
              {/* Contenedor de la tabla centrada */}
              <div style={{ display: "flex", justifyContent: "center", flexGrow: 1 }}>
                <table style={{ maxWidth: "700px", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ border: "1px solid #ddd", padding: "4px" ,backgroundColor:"#E5E5E5"}}>N° Cuenta</td>
                      <td style={{ border: "1px solid #ddd", padding: "4px",backgroundColor:"#E5E5E5" }}>{data.NCuenta}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #ddd", padding: "4px" }}>Contratante</td>
                      <td style={{ border: "1px solid #ddd", padding: "4px" }}>{data.contratante}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #ddd", padding: "4px" ,backgroundColor:"#E5E5E5"}}>Dirección</td>
                      <td style={{ border: "1px solid #ddd", padding: "4px" ,backgroundColor:"#E5E5E5"}}>{data.direccion}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #ddd", padding: "4px" }}>Periodo Facturado</td>
                      <td style={{ border: "1px solid #ddd", padding: "4px" }}>{mesesPendientes.join(", ")}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #ddd", padding: "4px" ,backgroundColor:"#E5E5E5"}}>Total a Pagar</td>
                      <td style={{ border: "1px solid #ddd", padding: "4px" ,backgroundColor:"#E5E5E5"}}>{totalFactura.toLocaleString("es-CO")}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #ddd", padding: "4px" }}>fecha de vencimiento</td>
                      <td style={{ border: "1px solid #ddd", padding: "4px" }}>{fechaVencimiento2}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Contenedor del botón de descarga */}
              <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
            <PDFDownloadLink
              document={<PDFContent />}
              fileName={`factura_${numeroCuenta}.pdf`}
            >
              {({ loading }) => (
                <Button type="primary" loading={loading}>
                  Descargar Factura
                </Button>
              )}
            </PDFDownloadLink>
          </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Admin;
