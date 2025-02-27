// src/services/ant-design-pro/api.ts
import { request } from '@umijs/max';

let mockedCurrentUser: API.CurrentUser | null = null;
let socket: WebSocket | null = null;
import config from '@/config';


export async function currentUser() {
  try {
    const storedUser = localStorage.getItem('currentUser');
    console.log(storedUser)

    if (!storedUser) {
      throw new Error('El usuario no está autenticado.');
    }

    // Parsear los datos del usuario desde localStorage
    const user = JSON.parse(storedUser);

    if (!user) {
      throw new Error('El usuario no está autenticado.');
    }

    // Devuelve los datos del usuario con valores por defecto para algunos campos
    return {
      data: {
        name: `${user.first_name} `,
        avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png', // Avatar por defecto
        userid: user.id.toString(),
        email: user.email,
        signature: '海纳百川，有容乃大', // Firma por defecto
        title: '交互专家', // Título por defecto
        group: '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED', // Grupo por defecto
        tags: [
          { key: '0', label: '很有想法的' },
          { key: '1', label: '专注设计' },
          { key: '2', label: '辣~' },
          { key: '3', label: '大长腿' },
          { key: '4', label: '川妹子' },
          { key: '5', label: '海纳百川' },
        ],
        notifyCount: 12,
        unreadCount: 11,
        country: 'China',
        access:`${user.access}`, // Puedes personalizar este valor según la lógica de acceso
        geographic: {
          province: {
            label: '浙江省',
            key: '330000',
          },
          city: {
            label: '杭州市',
            key: '330100',
          },
        },
        address: '西湖区工专路 77 号',
        phone: '0752-268888888',
      },
    };
  } catch (error) {
    console.error('Error al obtener el usuario actual:', error);
    throw error;
  }
}


export async function outLogin() {
  mockedCurrentUser = null;
  localStorage.removeItem('currentUser');

  if (socket) {
    socket.close();
    socket = null;
  }

  return { data: {}, success: true };
}

// export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
//   return request<API.LoginResult>('/api/login/account', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     data: body,
//     ...(options || {}),
//   });
// }


export async function login(body: API.LoginParams, options?: { [key: string]: any }): Promise<API.LoginResult> {
  try {
    const response = await fetch(`${config.BaseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cedula: body.username,
        password: body.password,
        type: 'account', // Aquí se incluye el campo "type"
      }),
    });
    console.log(response)

    const data = await response.json();

    if (response.ok) {
      // Almacena el token y la información del usuario
      const { token, user } = data;

      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      console.log(user)

      return {
        status: 'ok',
        type: 'account',
        currentAuthority: 'admin', // Ajusta según la lógica de tu aplicación
       
      };
    } else {
      // Si la respuesta no es ok
      return {
        status: 'error',
        type: 'account',
        currentAuthority: 'guest',
      };
    }
  } catch (error) {
    console.error('Error en la solicitud de login:', error);
    throw error;
  }
}

 

